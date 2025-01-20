import { Game, useGameContext } from '@/app/singleplayer/context';
import { AnimatePresence, motion } from 'framer-motion';
import { Audiowide, Orbitron } from 'next/font/google';
import { ChevronsUp, Clock, Crown, Frown, Gauge, Target } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

type GameStage = 'instructions' | 'game-active' | 'game-ended';
type TrialStage = 'not-started' | 'waiting' | 'clicked-too-fast' | 'clickable' | 'clicked';

type ReactionTrial = {
    waitingTime: number;
    clickableTime: number;
    currentWaitingTime: number;
    currentClickableTime: number;
    stage: TrialStage;
};

type ReactionSpeedGame = {
    stage: GameStage;
    trialNum: number;
    previousTrials: number[];
    gameWon: boolean;
    currentTrial: ReactionTrial | null;
    averageSpeed: number;
};

const audiowide = Audiowide({ weight: '400', subsets: ['latin'] });
const orbitronBold = Orbitron({ weight: '800', subsets: ['latin'] });
const orbitronSemibold = Orbitron({ weight: '500', subsets: ['latin'] });
const orbitronLight = Orbitron({ weight: '400', subsets: ['latin'] });

const ReactionSpeedTest = ({ setIsOpen }: { setIsOpen: React.Dispatch<React.SetStateAction<boolean>> }) => {
    const context = useGameContext();
    if (context === undefined) throw new Error('useContext(GameContext) must be used within a GameContext.Provider');

    const { game, setGame } = context;
    const [reactionSpeedGame, setReactionSpeedGame] = useState<ReactionSpeedGame>({
        stage: 'instructions',
        trialNum: 0,
        averageSpeed: 0,
        previousTrials: [],
        gameWon: false,
        currentTrial: null,
    });
    const [previousStage, setPreviousStage] = useState<GameStage>('instructions');
    const threshold = 350;

    useEffect(() => {
        if (reactionSpeedGame.stage === 'game-active') {
            if (reactionSpeedGame.currentTrial === null) {
                setReactionSpeedGame((prev) => {
                    const randomWaitingTime = Math.floor(Math.random() * 8001) + 1000;
                    return {
                        ...prev,
                        currentTrial: { waitingTime: randomWaitingTime, clickableTime: 0, currentClickableTime: 0, currentWaitingTime: 0, stage: 'not-started' },
                    };
                });
            } else if (reactionSpeedGame.currentTrial.stage === 'waiting' || reactionSpeedGame.currentTrial.stage === 'clickable') {
                const interval = setInterval(() => {
                    setReactionSpeedGame((prev) => {
                        if (!prev.currentTrial) return { ...prev };

                        if (prev.currentTrial.stage === 'clickable') {
                            return { ...prev, currentTrial: { ...prev.currentTrial, currentClickableTime: prev.currentTrial?.currentClickableTime + 10 } };
                        } else if (prev.currentTrial.stage === 'waiting') {
                            if (prev.currentTrial.currentWaitingTime >= prev.currentTrial.waitingTime) {
                                clearInterval(interval);
                                return { ...prev, currentTrial: { ...prev.currentTrial, stage: 'clickable' } };
                            }
                            return { ...prev, currentTrial: { ...prev.currentTrial, currentWaitingTime: prev.currentTrial?.currentWaitingTime + 10 } };
                        }

                        return { ...prev };
                    });
                }, 10);

                return () => clearInterval(interval);
            }
        }

        if (reactionSpeedGame.previousTrials.length === 5) {
            const gameWon = reactionSpeedGame.averageSpeed <= threshold;

            setTimeout(() => {
                setReactionSpeedGame((prev) => {
                    return {
                        ...prev,
                        currentTrial: null,
                        gameWon: gameWon,
                        stage: 'game-ended',
                    };
                });
            }, 1000);
        }

        if (reactionSpeedGame.stage === 'game-ended' && previousStage !== 'game-ended') {
            const gameWon = reactionSpeedGame.averageSpeed <= threshold;

            setGame((prev: Game) => {
                return {
                    ...prev,
                    game: gameWon
                        ? {
                              ...prev.game,
                              stage: 'not-started',
                              gamesLeft: prev.game.gamesLeft.filter((game) => game !== 'reaction-speed-test'),
                              gamesWon: [...prev.game.gamesWon, { name: 'reaction-speed-test', roundNum: prev.game.number }],
                          }
                        : {
                              ...prev.game,
                              stage: 'not-started',
                              gamesLeft: prev.game.gamesLeft.filter((game) => game !== 'reaction-speed-test'),
                              gamesLost: [...prev.game.gamesLost, { name: 'reaction-speed-test', roundNum: prev.game.number }],
                          },
                };
            });
        }

        setPreviousStage(reactionSpeedGame.stage);
    }, [reactionSpeedGame]);

    return (
        <>
            <div className='w-full h-full flex flex-col gap-3'>
                <span className='flex justify-between items-start'>
                    <h3 className={`${audiowide.className} text-4xl font-bold text-left mb-5 uppercase`}>{game.game.selectedGame?.replaceAll('-', ' ')}</h3>
                    {/* {reactionSpeedGame.stage !== 'instructions' && (
                        <div className={`${orbitronSemibold.className} flex gap-4`}>
                            <span className='flex items-center gap-2'>
                                <Clock className='w-10 h-10' />
                                <span className='text-lg'>{formatMillisecondsToDuration(reactionSpeedGame.millisecondsLeft)}</span>
                            </span>
                            <span className='flex items-center gap-2'>
                                <Target className='w-10 h-10' />
                                <span className='text-lg'>{reactionSpeedGame.targetsClicked}</span>
                            </span>
                        </div>
                    )} */}
                </span>
                <AnimatePresence>
                    {reactionSpeedGame.stage === 'instructions' && (
                        <div className='w-full h-full flex flex-col gap-6 items-center justify-center'>
                            <span className='flex'>
                                <ChevronsUp className='mt-4 mr-8 text-white w-24 h-24 bg-[rgba(255,255,255,.4)] rounded-full' strokeWidth={2} />
                                <ChevronsUp className='mt-7 mr-2 text-white w-24 h-24 bg-[rgba(255,255,255,.4)] rounded-full' strokeWidth={2} />
                                <ChevronsUp className='-mt-3 mr-6 text-white w-24 h-24 bg-[rgba(255,255,255,.4)] rounded-full' strokeWidth={2} />
                                <ChevronsUp className='mt-7 mr-4 text-white w-24 h-24 bg-[rgba(255,255,255,.4)] rounded-full' strokeWidth={2} />
                                <ChevronsUp className='mt-3 mr-4 text-white w-24 h-24 bg-[rgba(255,255,255,.4)] rounded-full' strokeWidth={2} />
                                <ChevronsUp className='-mt-2 text-white w-24 h-24 bg-[rgba(255,255,255,.4)] rounded-full' strokeWidth={2} />
                            </span>
                            <span className={`${orbitronSemibold.className} w-[60%] text-center text-lg flex flex-col gap-1.5`}>
                                <span>In this minigame, you will have to demonstrate your reaction speed!</span>
                                <span>As soon as the red box turns green, click the box as fast as possible!</span>
                                <span>
                                    To win the game, you must have an average reaction speed of <span className={orbitronBold.className}>at most {threshold}ms</span> across 5 trials. If
                                    your average time is above this threshold, you will forfeit your attack to the CPU!
                                </span>
                            </span>
                            <button
                                onClick={() =>
                                    setReactionSpeedGame((prevGame) => {
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
                    {reactionSpeedGame.stage === 'game-active' && (
                        <div className='w-full h-full flex gap-6 items-center justify-center'>
                            <div
                                onClick={() => {
                                    if (reactionSpeedGame.currentTrial !== null && reactionSpeedGame.previousTrials.length < 5) {
                                        if (reactionSpeedGame.currentTrial.stage === 'not-started' || reactionSpeedGame.currentTrial.stage === 'clicked-too-fast') {
                                            setReactionSpeedGame((prev) => {
                                                return {
                                                    ...prev,
                                                    currentTrial: {
                                                        ...prev.currentTrial,
                                                        stage: 'waiting',
                                                    },
                                                } as ReactionSpeedGame;
                                            });
                                        }
                                        if (reactionSpeedGame.currentTrial.stage === 'waiting') {
                                            const randomWaitingTime = Math.floor(Math.random() * 8001) + 1000;

                                            setReactionSpeedGame((prev) => {
                                                return {
                                                    ...prev,
                                                    currentTrial: {
                                                        ...prev.currentTrial,
                                                        stage: 'clicked-too-fast',
                                                        waitingTime: randomWaitingTime,
                                                        clickableTime: 0,
                                                        currentClickableTime: 0,
                                                        currentWaitingTime: 0,
                                                    },
                                                } as ReactionSpeedGame;
                                            });
                                        }
                                        if (reactionSpeedGame.currentTrial.stage === 'clickable') {
                                            const time = reactionSpeedGame.currentTrial.currentClickableTime;

                                            setReactionSpeedGame((prev) => {
                                                const previousTrials = [...prev.previousTrials, time];
                                                const averageSpeed = previousTrials.reduce((a, b) => a + b) / previousTrials.length;

                                                return {
                                                    ...prev,
                                                    previousTrials: previousTrials,
                                                    averageSpeed: averageSpeed,
                                                    currentTrial: {
                                                        ...prev.currentTrial,
                                                        clickableTime: time,
                                                        stage: 'clicked',
                                                    },
                                                } as ReactionSpeedGame;
                                            });
                                        }
                                        if (reactionSpeedGame.currentTrial.stage === 'clicked') {
                                            const randomWaitingTime = Math.floor(Math.random() * 8001) + 1000;

                                            setReactionSpeedGame((prev) => {
                                                return {
                                                    ...prev,
                                                    currentTrial: {
                                                        ...prev.currentTrial,
                                                        stage: 'waiting',
                                                        waitingTime: randomWaitingTime,
                                                        clickableTime: 0,
                                                        currentClickableTime: 0,
                                                        currentWaitingTime: 0,
                                                    },
                                                } as ReactionSpeedGame;
                                            });
                                        }
                                    }
                                }}
                                className={`${orbitronSemibold.className} ${
                                    reactionSpeedGame.currentTrial === null
                                        ? 'bg-transparent cursor-auto'
                                        : reactionSpeedGame.currentTrial.stage === 'waiting'
                                        ? 'bg-red-400 cursor-not-allowed'
                                        : reactionSpeedGame.currentTrial.stage === 'clicked-too-fast'
                                        ? 'bg-red-400 cursor-pointer'
                                        : reactionSpeedGame.currentTrial.stage === 'clickable'
                                        ? 'bg-green-400 cursor-pointer'
                                        : 'bg-transparent cursor-pointer'
                                } border-4 border-white rounded-2xl shadow-2xl w-full h-full flex flex-col items-center justify-center gap-6 text-xl`}
                            >
                                {reactionSpeedGame.currentTrial !== null ? (
                                    reactionSpeedGame.currentTrial.stage === 'not-started' ? (
                                        <>
                                            <h3 className={`${orbitronBold.className} text-7xl`}>Ready?</h3>
                                            <p>Click the screen to begin the first trial!</p>
                                        </>
                                    ) : reactionSpeedGame.currentTrial.stage === 'waiting' ? (
                                        <h3 className={`${orbitronBold.className} text-7xl`}>Wait for it...</h3>
                                    ) : reactionSpeedGame.currentTrial.stage === 'clickable' ? (
                                        <h3 className={`${orbitronBold.className} text-7xl`}>Click!</h3>
                                    ) : reactionSpeedGame.currentTrial.stage === 'clicked' ? (
                                        <>
                                            <h3 className={`${orbitronBold.className} text-7xl`}>{reactionSpeedGame.currentTrial.clickableTime}ms</h3>
                                            <p>Click the screen whenever you&apos;re for the next attempt.</p>
                                        </>
                                    ) : (
                                        reactionSpeedGame.currentTrial.stage === 'clicked-too-fast' && (
                                            <>
                                                <h3 className={`${orbitronBold.className} text-7xl`}>Too soon!</h3>
                                                <p>Click the screen to restart.</p>
                                            </>
                                        )
                                    )
                                ) : (
                                    'Waiting...'
                                )}
                            </div>
                            <div className={`${orbitronBold.className} h-full`}>
                                <h5 className='text-xl text-center'>PREVIOUS</h5>
                                <div className='w-full rounded-full h-1 bg-white' />
                                <div className='flex flex-col gap-2 mt-2'>
                                    {Array.from({ length: 5 }).map((_, index) => {
                                        const time: number | null = index >= reactionSpeedGame.previousTrials.length ? null : reactionSpeedGame.previousTrials[index];

                                        return (
                                            <div className='flex items-center gap-1' key={index}>
                                                <div
                                                    className={`${time === null ? 'bg-gray-400' : time <= threshold ? 'bg-green-400' : 'bg-red-400'} ${
                                                        index === 0 ? 'pl-2.5 pt-0.5' : 'grid place-items-center'
                                                    } w-8 h-8 rounded-full border-2 border-white shadow-md`}
                                                >
                                                    {index + 1}
                                                </div>
                                                <p>
                                                    {time}
                                                    {time !== null && 'ms'}
                                                </p>
                                            </div>
                                        );
                                    })}
                                </div>
                                <div className='w-full rounded-full mt-2 h-1 bg-white' />
                                <h5 className='text-xl text-center'>AVERAGE</h5>
                                <div className='flex items-center gap-1'>
                                    <div
                                        className={`${
                                            reactionSpeedGame.previousTrials.length === 0 ? 'bg-gray-400' : reactionSpeedGame.averageSpeed <= threshold ? 'bg-green-400' : 'bg-red-400'
                                        } w-8 h-8 rounded-full border-2 border-white shadow-md`}
                                    />
                                    <p>
                                        {reactionSpeedGame.averageSpeed !== 0 ? reactionSpeedGame.averageSpeed.toFixed(1).toString().replaceAll('.0', '') : ''}
                                        {reactionSpeedGame.averageSpeed !== 0 && 'ms'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                    {reactionSpeedGame.stage === 'game-ended' && (
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ duration: 0.5, ease: 'easeInOut' }}
                            className='w-full h-full flex flex-col items-center justify-center gap-4 select-none'
                        >
                            {reactionSpeedGame.gameWon ? <Crown className='w-72 h-72 text-white' strokeWidth={3} /> : <Frown className='w-72 h-72 text-white' strokeWidth={3} />}
                            <span className={`${orbitronSemibold.className} w-[60%] text-center text-lg flex flex-col gap-1.5`}>
                                <span className='text-xl'>You {reactionSpeedGame.gameWon ? 'won' : 'lost'}!</span>
                                <span>
                                    Across 5 trials, your average time was{' '}
                                    <span className={orbitronBold.className}>{reactionSpeedGame.averageSpeed.toFixed(1).toString().replaceAll('.0', '')}ms!</span>
                                </span>
                                <span>
                                    {reactionSpeedGame.gameWon
                                        ? `This was above the threshold to win! Click the "ATTACK" button below to launch an attack on the CPU!`
                                        : `This was below the threshold to win. Click the "CONCEDE" button below to accept the attack of the CPU on you.`}
                                </span>
                            </span>
                            <button
                                onClick={() => setIsOpen(false)}
                                className={`${orbitronBold.className} px-12 py-4 text-2xl rounded-lg border-4 border-[#5b8ad0] shadow-[0px_10px_0px_5px_#5b8ad0] hover:shadow-none hover:translate-y-[10px] transition-all duration-125`}
                            >
                                {reactionSpeedGame.gameWon ? 'ATTACK!' : 'CONCEDE'}
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </>
    );
};

export default ReactionSpeedTest;
