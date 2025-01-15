import { AnimatePresence, motion } from 'framer-motion';
import { Audiowide, Orbitron } from 'next/font/google';
import { Game, useGameContext } from '../context';
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

const CharacterFightContainer = ({ stage, setStage }: { stage: Stage; setStage: React.Dispatch<React.SetStateAction<Stage>> }) => {
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
                        className=' h-full drop-shadow-2xl scale-x-[-1] mt-[50%]'
                    />
                    {stage === 'initial-animation' && (
                        <div className='flex flex-col gap-2'>
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
                        </div>
                    )}
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
                    stage === 'initial-animation' && <Fight executeAttack={executeAttack} />
                )}
            </motion.div>
            <StatsQuicklookModal isOpen={statsQuicklookModalOpen.open} setIsOpen={setStatsQuicklookModalOpen} character={statsQuicklookModalOpen.character} />
        </>
    );
};

export default CharacterFightContainer;
