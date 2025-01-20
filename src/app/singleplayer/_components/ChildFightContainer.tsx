import { AnimatePresence, motion } from 'framer-motion';
import { Audiowide, Orbitron } from 'next/font/google';
import { availableGames, Game, useGameContext } from '../context';
import { Stage } from '../page';
import StatsDisplay from './ChildStatsDisplay';
import Fight from './Fight';
import { useEffect, useState } from 'react';
import HealthBar from './_fight_components/HealthBar';
import StatsQuicklookModal from './_fight_components/StatsQuicklookModal';

const audiowide = Audiowide({ weight: '400', subsets: ['latin'] });
const orbitronBold = Orbitron({ weight: '800', subsets: ['latin'] });
const orbitronSemibold = Orbitron({ weight: '500', subsets: ['latin'] });
const orbitronLight = Orbitron({ weight: '400', subsets: ['latin'] });

const CharacterFightContainer = ({
    stage,
    setStage,
    setGameOverScreenActive,
}: {
    stage: Stage;
    setStage: React.Dispatch<React.SetStateAction<Stage>>;
    setGameOverScreenActive: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
    const context = useGameContext();
    if (context === undefined) throw new Error('useContext(GameContext) must be used within a GameContext.Provider');

    const { selectedParentAlleles, shopStats, profile, game, setGame, statsQuicklookModalOpen, setStatsQuicklookModalOpen } = context;

    useEffect(() => {
        if (stage === 'game-started') {
            setTimeout(() => {
                setStage('initial-animation');
            }, 1000);
        }
    }, [stage]);

    const calculateDamage = (attacker: 'cpu' | 'player'): number => {
        const defender = attacker === 'player' ? 'cpu' : 'player';
        return Math.max(game[attacker].strength - game[defender].defense, 25);
    };

    const executeAttack = (attacker: 'cpu' | 'player') => {
        const baseDamage = calculateDamage(attacker);

        setGame((prevGame) => {
            const allGamesPlayed = prevGame.game.gamesLeft.length === 0;
            let alreadyPlayed = { won: 0, lost: 0 };
            prevGame.game.gameRoundHistory.forEach(({ won, lost }) => {
                alreadyPlayed.won += won;
                alreadyPlayed.lost += lost;
            });

            return {
                ...prevGame,
                player:
                    attacker === 'player'
                        ? { ...prevGame.player, currentTurn: false }
                        : { ...prevGame.player, healthRemaining: Math.max(prevGame.player.healthRemaining - baseDamage, 0), currentTurn: true },
                cpu:
                    attacker === 'cpu'
                        ? { ...prevGame.cpu, currentTurn: false }
                        : { ...prevGame.cpu, healthRemaining: Math.max(prevGame.cpu.healthRemaining - baseDamage, 0), currentTurn: true },
                game: {
                    ...prevGame.game,
                    selectedGame: null,
                    gameRound: allGamesPlayed ? prevGame.game.gameRound + 1 : prevGame.game.gameRound,
                    gameRoundHistory: allGamesPlayed
                        ? [...prevGame.game.gameRoundHistory, { won: prevGame.game.gamesWon.length - alreadyPlayed.won, lost: prevGame.game.gamesLost.length - alreadyPlayed.lost }]
                        : [...prevGame.game.gameRoundHistory],
                    gamesLeft: allGamesPlayed ? availableGames : prevGame.game.gamesLeft,
                    number: game.game.gamesWon.length + game.game.gamesLost.length + 1,
                },
            };
        });
    };

    return (
        <>
            <motion.div
                className='flex gap-20 items-center w-full justify-between h-full px-8 max-h-[60vh] relative'
                initial={{ y: 750 }}
                animate={{ y: 0 }}
                transition={{ duration: 1.25, ease: 'easeInOut' }}
            >
                {stage === 'initial-animation' && <HealthBar calculateDamage={calculateDamage} />}

                <div className='w-[15vw]'>
                    <div
                        style={{
                            backgroundImage: `url('/gene-fighters-character.png')`,
                            backgroundSize: 'contain',
                            backgroundPosition: 'center',
                            backgroundRepeat: 'no-repeat',
                            height: '50vh',
                            width: '15vw',
                        }}
                        className=' h-full drop-shadow-2xl scale-x-[-1] mt-[15vh]'
                    />

                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: stage === 'initial-animation' ? 1 : 0 }}
                        transition={{ duration: 1, ease: 'easeInOut' }}
                        className='flex flex-col gap-2'
                    >
                        <button
                            onClick={() => setStatsQuicklookModalOpen({ open: true, character: 'player' })}
                            className={`${audiowide.className} w-full text-lg text-white animated-gradient p-3 border-[6px] border-white rounded-xl uppercase hover:scale-105 transition-all cursor-pointer text-nowrap`}
                        >
                            STATS
                        </button>
                        <button
                            onClick={() => executeAttack('player')}
                            className={`${audiowide.className} w-full text-lg text-white animated-gradient p-3 border-[6px] border-white rounded-xl uppercase hover:scale-105 transition-all cursor-pointer text-nowrap`}
                        >
                            ATTACK
                        </button>
                    </motion.div>
                </div>

                {/* <img src='/gene-fighters-character.png' alt='character' className='w-full max-h-[80vh] drop-shadow-2xl scale-x-[-1]' /> */}

                {stage === 'child-animation' || stage === 'game-started' ? (
                    <AnimatePresence>
                        {stage === 'child-animation' && (
                            <motion.div
                                className='py-3 px-8 w-full h-full flex flex-col gap-3'
                                initial={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0.6, x: '140%' }}
                                transition={{ duration: 1, ease: 'easeInOut' }}
                            >
                                <StatsDisplay character='player' />
                                <button
                                    onClick={() => setStage('game-started')}
                                    className={`${audiowide.className} flex justify-center text-2xl text-white animated-gradient border-[12px] rounded-[56px] py-3 px-8 border-white drop-shadow-2xl w-full h-full hover:scale-105 hover:brightness-125 transition-all`}
                                >
                                    BEGIN BATTLE
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                ) : (
                    stage === 'initial-animation' && <Fight executeAttack={executeAttack} setGameOverScreenActive={setGameOverScreenActive} />
                )}
            </motion.div>
            <StatsQuicklookModal isOpen={statsQuicklookModalOpen.open} setIsOpen={setStatsQuicklookModalOpen} character={statsQuicklookModalOpen.character} />
        </>
    );
};

export default CharacterFightContainer;
