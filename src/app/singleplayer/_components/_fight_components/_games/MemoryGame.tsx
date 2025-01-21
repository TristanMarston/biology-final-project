import { Game, useGameContext } from '@/app/singleplayer/context';
import { AnimatePresence, motion } from 'framer-motion';
import { Audiowide, Orbitron } from 'next/font/google';
import { Clock, Crown, Frown, Grid2X2, Grid2x2Check, Grid2x2X, Heart, HeartCrack, Target } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

type GameStage = 'instructions' | 'game-active' | 'game-ended';
type RoundStage = 'hidden' | 'shown' | 'guessing';

type Position = { x: number; y: number };

type MemoryRound = {
    size: number;
    numSquares: number;
    correctIndices: Position[];
    stage: RoundStage;
};

type MemoryGame = {
    stage: GameStage;
    roundNum: number;
    currentRound: MemoryRound | null;
    livesLeft: number;
    gameWon: boolean;
};

const audiowide = Audiowide({ weight: '400', subsets: ['latin'] });
const orbitronBold = Orbitron({ weight: '800', subsets: ['latin'] });
const orbitronSemibold = Orbitron({ weight: '500', subsets: ['latin'] });
const orbitronLight = Orbitron({ weight: '400', subsets: ['latin'] });

const MemoryGame = ({ setIsOpen }: { setIsOpen: React.Dispatch<React.SetStateAction<boolean>> }) => {
    const context = useGameContext();
    if (context === undefined) throw new Error('useContext(GameContext) must be used within a GameContext.Provider');

    const { game, setGame } = context;
    const peekTime = 1500;
    const threshold = 7;
    const startingLives = 5;
    const gameData = [
        { size: 3, numSquares: 3 },
        { size: 4, numSquares: 5 },
        { size: 5, numSquares: 6 },
        { size: 5, numSquares: 7 },
        { size: 6, numSquares: 8 },
        { size: 6, numSquares: 8 },
        { size: 7, numSquares: 9 },
    ];
    const [memoryGame, setMemoryGame] = useState<MemoryGame>({ stage: 'instructions', roundNum: 1, currentRound: null, livesLeft: startingLives, gameWon: false });
    const [flippedBoxes, setFlippedBoxes] = useState<Position[]>([]);

    useEffect(() => {
        if (memoryGame.stage === 'game-active') {
            if (memoryGame.currentRound?.stage === 'hidden') {
                setTimeout(() => {
                    setMemoryGame((prev) => {
                        setFlippedBoxes(prev.currentRound ? prev.currentRound.correctIndices : []);

                        return {
                            ...prev,
                            currentRound: {
                                ...prev.currentRound,
                                stage: 'shown',
                            },
                        } as MemoryGame;
                    });
                    setTimeout(() => {
                        setMemoryGame((prev) => {
                            setFlippedBoxes([]);

                            return {
                                ...prev,
                                currentRound: {
                                    ...prev.currentRound,
                                    stage: 'guessing',
                                },
                            } as MemoryGame;
                        });
                    }, peekTime);
                }, 250);
            }
        }

        if (memoryGame.stage === 'game-ended') {
            const gameWon = memoryGame.roundNum >= threshold;

            setGame((prev: Game) => {
                return {
                    ...prev,
                    game: gameWon
                        ? {
                              ...prev.game,
                              stage: 'not-started',
                              gamesLeft: prev.game.gamesLeft.filter((game) => game !== 'memory-game'),
                              gamesWon: [...prev.game.gamesWon, { name: 'memory-game', roundNum: prev.game.number }],
                          }
                        : {
                              ...prev.game,
                              stage: 'not-started',
                              gamesLeft: prev.game.gamesLeft.filter((game) => game !== 'memory-game'),
                              gamesLost: [...prev.game.gamesLost, { name: 'memory-game', roundNum: prev.game.number }],
                          },
                };
            });
        }
    }, [memoryGame]);

    const generateGameData = (roundNum: number): { size: number; numSquares: number; correctIndices: Position[] } => {
        const { size, numSquares } = gameData[roundNum - 1];
        const correctIndices: Position[] = [];

        for (let i = 0; i < numSquares; i++) {
            while (true) {
                const randomX = Math.floor(Math.random() * size);
                const randomY = Math.floor(Math.random() * size);
                let unique = true;
                for (let j = 0; j < correctIndices.length; j++) {
                    if (correctIndices[j].x === randomX && correctIndices[j].y === randomY) unique = false;
                }
                if (unique) {
                    correctIndices.push({ x: randomX, y: randomY });
                    break;
                }
            }
        }

        return { size, numSquares, correctIndices };
    };

    const flipVariants = (position: Position) => {
        const correct = memoryGame.currentRound ? memoryGame.currentRound.correctIndices.find((map) => map.x === position.x && map.y === position.y) !== undefined : true;

        return {
            hidden: { rotateY: 0, backgroundColor: '#ffffff' },
            flipped: { rotateY: 180, backgroundColor: `${correct ? '#4ade80' : '#f87171'}` },
        };
    };

    const boxClicked = (position: Position) => {
        if (memoryGame.currentRound) {
            let newBoxes = [...flippedBoxes];
            if (newBoxes.find((map) => map.x === position.x && map.y === position.y) === undefined) newBoxes.push(position);
            else return;
            setFlippedBoxes(newBoxes);

            if (memoryGame.currentRound.correctIndices.find((map) => map.x === position.x && map.y === position.y) === undefined) {
                setTimeout(() => {
                    setMemoryGame((prev) => {
                        return {
                            ...prev,
                            livesLeft: prev.livesLeft - 1,
                            stage: prev.livesLeft - 1 === 0 ? 'game-ended' : 'game-active',
                        };
                    });
                    return;
                }, 500);
            }

            let correctIndices = 0;
            for (let i = 0; i < newBoxes.length; i++) {
                for (let j = 0; j < memoryGame.currentRound.correctIndices.length; j++) {
                    if (newBoxes[i].x === memoryGame.currentRound.correctIndices[j].x && newBoxes[i].y === memoryGame.currentRound.correctIndices[j].y) correctIndices++;
                }
            }

            if (correctIndices === memoryGame.currentRound.correctIndices.length) {
                setTimeout(() => {
                    setFlippedBoxes([]);
                    setTimeout(() => {
                        setMemoryGame((prev) => {
                            if (prev.roundNum + 1 > threshold) {
                                return {
                                    ...prev,
                                    stage: 'game-ended',
                                    gameWon: true,
                                };
                            }
                            const { size, numSquares, correctIndices } = generateGameData(prev.roundNum + 1);

                            return {
                                ...prev,
                                stage: 'game-active',
                                roundNum: prev.roundNum + 1,
                                currentRound: {
                                    size,
                                    numSquares,
                                    correctIndices,
                                    stage: 'hidden',
                                },
                            } as MemoryGame;
                        });
                    }, 500);
                }, 1000);
            }
        }
    };

    return (
        <>
            <div className='w-full h-full flex flex-col gap-3'>
                <span className='flex justify-between items-start'>
                    <h3 className={`${audiowide.className} text-3xl width-laptop:text-4xl font-bold text-left mb-5 uppercase`}>{game.game.selectedGame?.replaceAll('-', ' ')}</h3>
                    {memoryGame.stage !== 'instructions' && (
                        <div className={`flex gap-2 items-center`}>
                            <span className={`${orbitronBold.className} text-[18px] width-laptop:text-xl`}>ROUND {memoryGame.roundNum} / 7</span>
                            <span className='w-2.5 h-2.5 rounded-full bg-white'></span>
                            <span className='flex gap-2'>
                                {Array.from({ length: memoryGame.livesLeft }).map((_, index) => (
                                    <Heart key={index} className='w-6 h-6 width-laptop:w-8 width-laptop:h-8 text-white' />
                                ))}
                                {Array.from({ length: startingLives - memoryGame.livesLeft }).map((_, index) => (
                                    <HeartCrack key={index} className='w-6 h-6 width-laptop:w-8 width-laptop:h-8 text-white' />
                                ))}
                            </span>
                        </div>
                    )}
                </span>
                <AnimatePresence>
                    {memoryGame.stage === 'instructions' && (
                        <div className='w-full h-full flex flex-col gap-6 items-center justify-center'>
                            <span className='flex'>
                                <Grid2X2 className='mt-4 mr-8 text-white w-20 h-20 width-laptop:w-24 width-laptop:h-24 bg-[rgba(255,255,255,.4)] rounded-[42.5%] p-4' strokeWidth={2} />
                                <Grid2X2 className='mt-7 mr-2 text-white w-20 h-20 width-laptop:w-24 width-laptop:h-24 bg-[rgba(255,255,255,.4)] rounded-[42.5%] p-4' strokeWidth={2} />
                                <Grid2x2Check
                                    className='-mt-3 mr-6 text-white w-20 h-20 width-laptop:w-24 width-laptop:h-24 bg-[rgba(255,255,255,.4)] rounded-[42.5%] p-4'
                                    strokeWidth={2}
                                />
                                <Grid2x2Check
                                    className='mt-7 mr-4 text-white w-20 h-20 width-laptop:w-24 width-laptop:h-24 bg-[rgba(255,255,255,.4)] rounded-[42.5%] p-4'
                                    strokeWidth={2}
                                />
                                <Grid2x2X className='mt-3 mr-4 text-white w-20 h-20 width-laptop:w-24 width-laptop:h-24 bg-[rgba(255,255,255,.4)] rounded-[42.5%] p-4' strokeWidth={2} />
                                <Grid2x2X className='-mt-2 text-white w-20 h-20 width-laptop:w-24 width-laptop:h-24 bg-[rgba(255,255,255,.4)] rounded-[42.5%] p-4' strokeWidth={2} />
                            </span>
                            <span className={`${orbitronSemibold.className} w-[60%] text-center text-base width-laptop:text-lg flex flex-col gap-1.5`}>
                                <span>In this minigame, you will have to remember the pattern of squares on a grid increasing in size.</span>
                                <span>
                                    You will have to complete <span className={orbitronBold.className}>{threshold} rounds</span>, and you must make less than {startingLives} errors or
                                    else the CPU will take your attack!
                                </span>
                            </span>
                            <button
                                onClick={() =>
                                    setMemoryGame((prevGame) => {
                                        const { size, numSquares, correctIndices } = generateGameData(1);
                                        return {
                                            ...prevGame,
                                            stage: 'game-active',
                                            currentRound: {
                                                size,
                                                numSquares,
                                                correctIndices,
                                                stage: 'hidden',
                                            },
                                        } as MemoryGame;
                                    })
                                }
                                className={`${orbitronBold.className} px-10 py-4 text-xl width-laptop:px-12 width-laptop:text-2xl rounded-lg border-4 border-[#5b8ad0] shadow-[0px_10px_0px_5px_#5b8ad0] hover:shadow-none hover:translate-y-[10px] transition-all duration-125`}
                            >
                                BEGIN!
                            </button>
                        </div>
                    )}
                    {memoryGame.stage === 'game-active' && (
                        <div className='w-full h-full flex items-center justify-center'>
                            <div className='h-full'>
                                {memoryGame.currentRound !== null && (
                                    <div
                                        className={`h-full gap-3 width-laptop:gap-4`}
                                        style={{
                                            display: 'grid',
                                            gridTemplateRows: `repeat(${memoryGame.currentRound.size}, 1fr)`,
                                        }}
                                    >
                                        {Array.from({ length: memoryGame.currentRound.size }).map((_, row) => (
                                            <div className='flex gap-4' key={row}>
                                                {Array.from({ length: memoryGame.currentRound ? memoryGame.currentRound.size : 4 }).map((_, col) => (
                                                    <motion.div
                                                        key={col}
                                                        className='rounded-xl shadow-xl w-full h-full cursor-pointer aspect-square'
                                                        onClick={() => {
                                                            if (memoryGame.currentRound?.stage === 'guessing') {
                                                                boxClicked({ x: col, y: row });
                                                            }
                                                        }}
                                                        variants={flipVariants({ x: col, y: row })}
                                                        initial='hidden'
                                                        animate={flippedBoxes.find((map) => map.x === col && map.y === row) !== undefined ? 'flipped' : 'hidden'}
                                                        transition={{ duration: 0.5 }}
                                                    />
                                                ))}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                    {memoryGame.stage === 'game-ended' && (
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ duration: 0.5, ease: 'easeInOut' }}
                            className='w-full h-full flex flex-col items-center justify-center gap-4 select-none'
                        >
                            {memoryGame.gameWon ? (
                                <Crown className='w-36 h-36 width-laptop:w-72 width-laptop:h-72 text-white' strokeWidth={3} />
                            ) : (
                                <Frown className='w-36 h-36 width-laptop:w-72 width-laptop:h-72 text-white' strokeWidth={3} />
                            )}
                            <span className={`${orbitronSemibold.className} w-[65%] text-center text-base width-laptop:text-lg flex flex-col gap-1.5`}>
                                <span className='text-lg width-laptop:text-xl'>You {memoryGame.gameWon ? 'won' : 'lost'}!</span>
                                <span>You managed to complete {memoryGame.gameWon ? 'all of the seven rounds!' : `${memoryGame.roundNum - 1} of the 7 rounds.`}</span>
                                <span>
                                    {memoryGame.gameWon
                                        ? `Click the "ATTACK" button below to launch an attack on the CPU!`
                                        : `You had to complete all 7 rounds to win. Click the "CONCEDE" button below to accept the attack of the CPU on you.`}
                                </span>
                            </span>
                            <button
                                onClick={() => setIsOpen(false)}
                                className={`${orbitronBold.className} px-10 py-4 text-xl width-laptop:px-12 width-laptop:text-2xl rounded-lg border-4 border-[#5b8ad0] shadow-[0px_10px_0px_5px_#5b8ad0] hover:shadow-none hover:translate-y-[10px] transition-all duration-125`}
                            >
                                {memoryGame.gameWon ? 'ATTACK!' : 'CONCEDE'}
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </>
    );
};

export default MemoryGame;
