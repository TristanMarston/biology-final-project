import { AnimatePresence, m, motion } from 'framer-motion';
import { availableGames, PastMinigame, useGameContext } from '../context';
import { Audiowide, Orbitron } from 'next/font/google';
import { useEffect, useState } from 'react';
import GameRollingModal from './_fight_components/GameRollingModal';
import GameModal from './_fight_components/GameModal';

const audiowide = Audiowide({ weight: '400', subsets: ['latin'] });

const Fight = ({
    executeAttack,
    setGameOverScreenActive,
}: {
    executeAttack: (attacker: 'cpu' | 'player') => void;
    setGameOverScreenActive: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
    const context = useGameContext();
    if (context === undefined) throw new Error('useContext(GameContext) must be used within a GameContext.Provider');

    const { game, setGame, setStatsQuicklookModalOpen } = context;
    const [previousGame, setPreviousGame] = useState<{
        number: number;
        gameRound: number;
        gameRoundHistory: { won: number; lost: number }[];
        gamesWon: PastMinigame[];
        gamesLost: PastMinigame[];
        gamesLeft: string[];
        selectedGame: string | null;
        stage: 'not-started' | 'selecting-game' | 'game-selected' | 'game-playing';
        gameWon: 'player' | 'cpu' | 'playing';
    }>(game.game);
    const [gameRollingModalOpen, setGameRollingModalOpen] = useState(false);
    const [gameModalOpen, setGameModalOpen] = useState(false);

    useEffect(() => {
        if (game.game.stage === 'selecting-game' && previousGame.stage !== 'selecting-game') {
            setGameRollingModalOpen(true);
        }

        if (game.game.stage === 'game-selected' && previousGame.stage !== 'game-selected') {
            setGameRollingModalOpen(false);
            setGameModalOpen(true);
        }

        if (game.game.gameWon !== 'playing') {
            setGameOverScreenActive(true);
        }

        setPreviousGame(game.game);
    }, [game]);

    useEffect(() => {
        if (game.game.selectedGame) {
            // fix this
            let startingIndices = { won: 0, lost: 0 };
            game.game.gameRoundHistory.forEach(({ won, lost }) => {
                startingIndices.won += won;
                startingIndices.lost += lost;
            });

            let gamesWon = game.game.gamesWon.slice(startingIndices.won, game.game.gamesWon.length).map((map) => map.name);
            let gamesLost = game.game.gamesLost.slice(startingIndices.lost, game.game.gamesLost.length).map((map) => map.name);

            if (gamesWon.includes(game.game.selectedGame)) {
                executeAttack('player');
            } else if (gamesLost.includes(game.game.selectedGame)) {
                executeAttack('cpu');
            }
        }
    }, [gameModalOpen]);

    return (
        <>
            <AnimatePresence>
                <motion.button
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1, ease: 'easeInOut' }}
                    onClick={() => {
                        if (game.game.stage === 'not-started') {
                            setGame((prevGame) => {
                                return {
                                    ...prevGame,
                                    game: {
                                        ...prevGame.game,
                                        stage: 'selecting-game',
                                    },
                                };
                            });
                        }
                    }}
                    className={`${audiowide.className} w-full text-2xl text-white animated-gradient p-3 border-[6px] border-white rounded-xl uppercase hover:scale-105 transition-all cursor-pointer text-nowrap`}
                >
                    BEGIN GAME #{game.game.number}
                </motion.button>
            </AnimatePresence>
            <AnimatePresence>
                <motion.div className='w-[15vw]' initial={{ x: '150%' }} animate={{ x: 0 }} transition={{ duration: 1, ease: 'easeInOut' }}>
                    <div
                        style={{
                            backgroundImage: `url('/gene-fighters-character-dark.png')`,
                            backgroundSize: 'contain',
                            backgroundPosition: 'center',
                            backgroundRepeat: 'no-repeat',
                            height: '50vh',
                            width: '15vw',
                        }}
                        className='h-full drop-shadow-2xl mt-[15vh]'
                    />

                    <div className='flex flex-col gap-2'>
                        <button
                            onClick={() => setStatsQuicklookModalOpen({ open: true, character: 'cpu' })}
                            className={`${audiowide.className} w-full text-lg text-white animated-gradient p-3 border-[6px] border-white rounded-xl uppercase hover:scale-105 transition-all cursor-pointer text-nowrap`}
                        >
                            STATS
                        </button>
                    </div>
                </motion.div>
            </AnimatePresence>
            <GameRollingModal isOpen={gameRollingModalOpen} setIsOpen={setGameRollingModalOpen} />
            <GameModal isOpen={gameModalOpen} setIsOpen={setGameModalOpen} />
        </>
    );
};

export default Fight;
