import { AnimatePresence, motion } from 'framer-motion';
import { Audiowide, Orbitron } from 'next/font/google';
import { useGameContext } from '../../context';
import { useEffect, useState } from 'react';

const audiowide = Audiowide({ weight: '400', subsets: ['latin'] });
const orbitronBold = Orbitron({ weight: '800', subsets: ['latin'] });
const orbitronSemibold = Orbitron({ weight: '500', subsets: ['latin'] });
const orbitronLight = Orbitron({ weight: '400', subsets: ['latin'] });

type GamesMapArray = {
    name: string;
    flash: boolean;
};

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const GameRollingModal = ({ isOpen, setIsOpen }: { isOpen: boolean; setIsOpen: React.Dispatch<React.SetStateAction<boolean>> }) => {
    const context = useGameContext();
    if (context === undefined) throw new Error('useContext(GameContext) must be used within a GameContext.Provider');

    const { game, setGame } = context;
    const [gamesMap, setGamesMap] = useState<GamesMapArray[]>(game.game.gamesLeft.map((map) => ({ name: map, flash: false })) as GamesMapArray[]);
    const [rollButtonEnabled, setRollButtonEnabled] = useState(true);

    const flashChoices = async () => {
        const selectedIndex = Math.floor(Math.random() * gamesMap.length);

        setGame((prevGame) => {
            return {
                ...prevGame,
                game: {
                    ...prevGame.game,
                    selectedGame: gamesMap[selectedIndex].name,
                },
            };
        });

        const cycles = Math.floor(Math.random() * 5) + 3; // random 3 - 4

        for (let i = 0; i < cycles; i++) {
            for (let j = 0; j < (i === cycles - 1 ? selectedIndex + 1 : gamesMap.length); j++) {
                setGamesMap((prev) => prev.map((game, index) => (index === j ? { ...game, flash: true } : game)));
                await sleep(i * 50);
                setGamesMap((prev) => prev.map((game, index) => (index === j ? { ...game, flash: false } : game)));
            }
        }

        for (let i = 1; i <= 5; i++) {
            setGamesMap((prev) => prev.map((game, index) => (index === selectedIndex ? { ...game, flash: true } : game)));
            await sleep(150);
            setGamesMap((prev) => prev.map((game, index) => (index === selectedIndex ? { ...game, flash: false } : game)));
            await sleep(150);
        }

        setGamesMap((prev) => prev.map((game, index) => (index === selectedIndex ? { ...game, flash: true } : game)));
        await sleep(500);

        setGamesMap(game.game.gamesLeft.map((map) => ({ name: map, flash: false })) as GamesMapArray[]);

        setGame((prevGame) => {
            setRollButtonEnabled(true);
            return {
                ...prevGame,
                game: {
                    ...prevGame.game,
                    stage: 'game-selected',
                },
            };
        });
    };

    useEffect(() => {
        setGamesMap(game.game.gamesLeft.map((map) => ({ name: map, flash: false })) as GamesMapArray[]);
    }, [isOpen]);

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className='bg-slate-900/20 backdrop-blur p-8 fixed inset-0 z-50 grid place-items-center overflow-y-scroll'
                    >
                        <motion.div
                            initial={{ scale: 0, rotate: '12.5deg' }}
                            animate={{ scale: 1, rotate: '0deg' }}
                            exit={{ scale: 0, rotate: '0deg' }}
                            onClick={(e) => e.stopPropagation()}
                            className='border-4 border-white gradient-full text-white p-6 rounded-xl w-full max-w-3xl shadow-xl cursor-default relative overflow-hidden'
                        >
                            <div className='relative z-10'>
                                <h3 className={`${audiowide.className} text-4xl font-bold text-left mb-5`}>MINIGAME #{game.game.number} DECISION</h3>
                                <div className='flex flex-col gap-3 mb-3'>
                                    {gamesMap.map(({ name, flash }, index) => (
                                        <div
                                            key={name + index}
                                            className={`${orbitronBold.className} ${
                                                flash ? 'brightness-150' : 'brightness-100'
                                            } transition-all default-gradient-full py-3 text-xl text-center rounded-lg uppercase border-4 border-white`}
                                        >
                                            {name.replaceAll('-', ' ')}
                                        </div>
                                    ))}
                                </div>
                                <div className='w-full flex gap-2'>
                                    <button
                                        onClick={() => {
                                            if (rollButtonEnabled) {
                                                setRollButtonEnabled(false);
                                                flashChoices();
                                            }
                                        }}
                                        className={`${orbitronBold.className} ${
                                            rollButtonEnabled ? 'brightness-100 hover:brightness-125 cursor-pointer' : 'brightness-75 cursor-not-allowed'
                                        } w-full text-lg text-white animated-gradient p-3 border-[6px] border-white rounded-xl uppercase transition-all cursor-pointer text-nowrap`}
                                    >
                                        ROLL!
                                    </button>
                                    {/* <button
                                        // onClick={() => setStatsQuicklookModalOpen({ open: true, character: 'cpu' })}
                                        className={`${orbitronBold.className} w-full text-lg text-white animated-gradient p-3 border-[6px] border-white rounded-xl uppercase hover:brightness-125 transition-all cursor-pointer text-nowrap`}
                                    >
                                        CONFUSED?
                                    </button> */}
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default GameRollingModal;
