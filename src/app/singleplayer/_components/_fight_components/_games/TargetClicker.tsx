import { Game, useGameContext } from '@/app/singleplayer/context';
import { AnimatePresence, motion } from 'framer-motion';
import { Audiowide, Orbitron } from 'next/font/google';
import { Clock, Crown, Frown, Target } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

type GameStage = 'instructions' | 'game-active' | 'game-ended';

type TargetGame = {
    stage: GameStage;
    millisecondsLeft: number;
    targetsClicked: number;
    targetPosition: { top: number; left: number };
};

const audiowide = Audiowide({ weight: '400', subsets: ['latin'] });
const orbitronBold = Orbitron({ weight: '800', subsets: ['latin'] });
const orbitronSemibold = Orbitron({ weight: '500', subsets: ['latin'] });
const orbitronLight = Orbitron({ weight: '400', subsets: ['latin'] });

const TargetClicker = ({ setIsOpen }: { setIsOpen: React.Dispatch<React.SetStateAction<boolean>> }) => {
    const context = useGameContext();
    if (context === undefined) throw new Error('useContext(GameContext) must be used within a GameContext.Provider');

    const { game, setGame } = context;
    const [targetGame, setTargetGame] = useState<TargetGame>({ stage: 'instructions', millisecondsLeft: 30000, targetsClicked: 0, targetPosition: { top: 0, left: 0 } });
    const threshold = 40;

    useEffect(() => {
        if (targetGame.stage === 'game-active') {
            if (targetGame.targetPosition.top === 0 && targetGame.targetPosition.left === 0) {
                setTargetGame((prev) => {
                    const container = document.getElementById('target-container-div');
                    if (container) {
                        const containerWidth = container.offsetWidth;
                        const containerHeight = container.offsetHeight;
                        const targetSize = 96;

                        const randomLeft = Math.random() * (containerWidth - targetSize);
                        const randomTop = Math.random() * (containerHeight - targetSize);

                        return {
                            ...prev,
                            targetPosition: { top: randomTop, left: randomLeft },
                        };
                    }

                    return { ...prev };
                });
            }

            const interval = setInterval(() => {
                setTargetGame((prev) => {
                    if (prev.millisecondsLeft <= 0) {
                        clearInterval(interval);
                        return { ...prev, millisecondsLeft: 0, stage: 'game-ended' };
                    }
                    return { ...prev, millisecondsLeft: prev.millisecondsLeft - 100 };
                });
            }, 100);

            return () => clearInterval(interval);
        }

        if (targetGame.stage === 'game-ended') {
            const gameWon = targetGame.targetsClicked >= threshold;
            setGame((prev: Game) => {
                return {
                    ...prev,
                    game: gameWon
                        ? {
                              ...prev.game,
                              stage: 'not-started',
                              gamesLeft: prev.game.gamesLeft.filter((game) => game !== 'target-clicker'),
                              gamesWon: [...prev.game.gamesWon, { name: 'target-clicker', roundNum: prev.game.number }],
                          }
                        : {
                              ...prev.game,
                              stage: 'not-started',
                              gamesLeft: prev.game.gamesLeft.filter((game) => game !== 'target-clicker'),
                              gamesLost: [...prev.game.gamesLost, { name: 'target-clicker', roundNum: prev.game.number }],
                          },
                };
            });
        }
    }, [targetGame]);

    const addOneTargetClick = () => {
        setTargetGame((prev) => {
            const container = document.getElementById('target-container-div');
            if (container) {
                const containerWidth = container.offsetWidth;
                const containerHeight = container.offsetHeight;
                const targetSize = 96;

                const randomLeft = Math.random() * (containerWidth - targetSize);
                const randomTop = Math.random() * (containerHeight - targetSize);

                return {
                    ...prev,
                    targetsClicked: prev.targetsClicked + 1,
                    targetPosition: { top: randomTop, left: randomLeft },
                };
            }

            return {
                ...prev,
                targetsClicked: prev.targetsClicked + 1,
            };
        });
    };

    const formatMillisecondsToDuration = (milliseconds: number): string => {
        const totalSeconds = Math.floor(milliseconds / 1000);

        return `${String(Math.floor(totalSeconds / 60)).padStart(2, '0')}:${String(totalSeconds % 60).padStart(2, '0')}`;
    };

    return (
        <>
            <div className='w-full h-full flex flex-col gap-3'>
                <span className='flex justify-between items-start'>
                    <h3 className={`${audiowide.className} text-4xl font-bold text-left mb-5 uppercase`}>{game.game.selectedGame?.replaceAll('-', ' ')}</h3>
                    {targetGame.stage !== 'instructions' && (
                        <div className={`${orbitronSemibold.className} flex gap-4`}>
                            <span className='flex items-center gap-2'>
                                <Clock className='w-10 h-10' />
                                <span className='text-lg'>{formatMillisecondsToDuration(targetGame.millisecondsLeft)}</span>
                            </span>
                            <span className='flex items-center gap-2'>
                                <Target className='w-10 h-10' />
                                <span className='text-lg'>{targetGame.targetsClicked}</span>
                            </span>
                        </div>
                    )}
                </span>
                <AnimatePresence>
                    {targetGame.stage === 'instructions' && (
                        <div className='w-full h-full flex flex-col gap-6 items-center justify-center'>
                            <span className='flex'>
                                <Target className='mt-4 mr-8 text-white w-24 h-24 bg-[rgba(255,255,255,.4)] rounded-full' strokeWidth={2} />
                                <Target className='mt-7 mr-2 text-white w-24 h-24 bg-[rgba(255,255,255,.4)] rounded-full' strokeWidth={2} />
                                <Target className='-mt-3 mr-6 text-white w-24 h-24 bg-[rgba(255,255,255,.4)] rounded-full' strokeWidth={2} />
                                <Target className='mt-7 mr-4 text-white w-24 h-24 bg-[rgba(255,255,255,.4)] rounded-full' strokeWidth={2} />
                                <Target className='mt-3 mr-4 text-white w-24 h-24 bg-[rgba(255,255,255,.4)] rounded-full' strokeWidth={2} />
                                <Target className='-mt-2 text-white w-24 h-24 bg-[rgba(255,255,255,.4)] rounded-full' strokeWidth={2} />
                            </span>
                            <span className={`${orbitronSemibold.className} w-[60%] text-center text-lg flex flex-col gap-1.5`}>
                                <span>In this minigame, you will have to click targets that appear in random positions on the page.</span>
                                <span>
                                    You will have <span className={orbitronBold.className}>30 seconds</span>, and you must click at least{' '}
                                    <span className={orbitronBold.className}>{threshold} targets</span> in that time, or else the CPU will take your attack!
                                </span>
                            </span>
                            <button
                                onClick={() =>
                                    setTargetGame((prevGame) => {
                                        return {
                                            ...prevGame,
                                            stage: 'game-active',
                                        };
                                    })
                                }
                                className={`${orbitronBold.className} px-12 py-4 text-2xl rounded-lg border-4 border-[#5b8ad0] shadow-[0px_10px_0px_5px_#5b8ad0] hover:shadow-none hover:translate-y-[10px] transition-all duration-125`}
                            >
                                BEGIN!
                            </button>
                        </div>
                    )}
                    {targetGame.stage === 'game-active' && (
                        <div id='target-container-div' className='w-full h-full flex items-center justify-center relative'>
                            <TargetElement position={{ top: targetGame.targetPosition.top, left: targetGame.targetPosition.left }} addOneTargetClick={addOneTargetClick} />
                        </div>
                    )}
                    {targetGame.stage === 'game-ended' && (
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ duration: 0.5, ease: 'easeInOut' }}
                            className='w-full h-full flex flex-col items-center justify-center gap-4 select-none'
                        >
                            {targetGame.targetsClicked >= threshold ? (
                                <Crown className='w-72 h-72 text-white' strokeWidth={3} />
                            ) : (
                                <Frown className='w-72 h-72 text-white' strokeWidth={3} />
                            )}
                            <span className={`${orbitronSemibold.className} w-[60%] text-center text-lg flex flex-col gap-1.5`}>
                                <span className='text-xl'>You {targetGame.targetsClicked >= threshold ? 'won' : 'lost'}!</span>
                                <span>In 30 seconds, you managed to click {targetGame.targetsClicked} targets!</span>
                                <span>
                                    {targetGame.targetsClicked >= threshold
                                        ? `This was above the threshold to win! Click the "ATTACK" button below to launch an attack on the CPU!`
                                        : `This was below the threshold to win. Click the "CONCEDE" button below to accept the attack of the CPU on you.`}
                                </span>
                            </span>
                            <button
                                onClick={() => setIsOpen(false)}
                                className={`${orbitronBold.className} px-12 py-4 text-2xl rounded-lg border-4 border-[#5b8ad0] shadow-[0px_10px_0px_5px_#5b8ad0] hover:shadow-none hover:translate-y-[10px] transition-all duration-125`}
                            >
                                {targetGame.targetsClicked >= threshold ? 'ATTACK!' : 'CONCEDE'}
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </>
    );
};

const TargetElement = ({ position, addOneTargetClick }: { position: { top: number; left: number }; addOneTargetClick: () => void }) => {
    const [width, setWidth] = useState(96);

    useEffect(() => {
        const handleResize = () => {
            const container = document.getElementById('target-container-div');
            setWidth(container !== null ? Math.sqrt(container.offsetWidth * container.offsetHeight * 0.015) : 96);
        };

        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return (
        <Target
            onClick={() => addOneTargetClick()}
            className={`text-white bg-[rgba(255,255,255,.4)] rounded-full cursor-pointer absolute select-none`}
            style={{ top: position.top, left: position.left, width: `${width.toFixed(1)}px`, height: `${width.toFixed(1)}px` }}
            strokeWidth={2}
        />
    );
};

export default TargetClicker;
