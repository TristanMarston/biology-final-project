import React, { useEffect, useRef, useState } from 'react';
import ParentRoller from './ParentRoller';
import { Audiowide } from 'next/font/google';
import { AnimatePresence, motion } from 'framer-motion';
import { SelectedParentAlleles, useGameContext } from '../context';
import { SkipForward } from 'lucide-react';
import { AlleleObject } from '@/utils/indexedDB';
import { Overlay, Stage } from '../page';

const audiowide = Audiowide({ weight: '400', subsets: ['latin'] });

export type CurrentStage = {
    allele: 'health' | 'strength' | 'defense';
    started: boolean;
    runRollAnimation: boolean;
    animationComplete: boolean;
};

export type AlleleMap = {
    type: 'health' | 'strength' | 'defense';
    color: 'red' | 'purple' | 'green';
    alleles: { allele: string; flash: boolean; selected: boolean }[];
};

type ParentAlleleIndices = {
    first: {
        health: number;
        strength: number;
        defense: number;
    };
    second: {
        health: number;
        strength: number;
        defense: number;
    };
};

const INITIAL_ALLELE_MAP = [
    { type: 'health', color: 'red', alleles: ['H1', 'H2', 'H3', 'H4', 'H5', 'H6'] },
    { type: 'strength', color: 'purple', alleles: ['S1', 'S2', 'S3', 'S4', 'S5', 'S6'] },
    { type: 'defense', color: 'green', alleles: ['D1', 'D2', 'D3', 'D4', 'D5', 'D6'] },
].map(({ type, color, alleles }) => ({
    type,
    color,
    alleles: alleles.map((allele) => ({ allele, flash: false, selected: false })),
})) as AlleleMap[];

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const ParentRollingContainer = ({ setOverlay, setStage }: { setOverlay: React.Dispatch<React.SetStateAction<Overlay>>; setStage: React.Dispatch<React.SetStateAction<Stage>> }) => {
    const [currentStage, setCurrentStage] = useState<CurrentStage>({ allele: 'health', started: false, runRollAnimation: false, animationComplete: false });
    const [previousStage, setPreviousStage] = useState<CurrentStage>({ allele: 'health', started: false, runRollAnimation: false, animationComplete: false });
    const [middleColumnVisible, setMiddleColumnVisible] = useState(true);
    const [skipAnimation, setSkipAnimation] = useState({ button: false, toggled: false });
    const [slideAwayAnimation, setSlideAwayAnimation] = useState(false);
    const skipAnimationRef = useRef(skipAnimation);
    const [selectedParentAlleleIndices, setSelectedParentAlleleIndices] = useState<ParentAlleleIndices>({
        first: {
            health: 1,
            strength: 1,
            defense: 1,
        },
        second: {
            health: 1,
            strength: 1,
            defense: 1,
        },
    });
    const [alleleMaps, setAlleleMaps] = useState<{ first: AlleleMap[]; second: AlleleMap[] }>({
        first: INITIAL_ALLELE_MAP,
        second: INITIAL_ALLELE_MAP,
    });

    const context = useGameContext();
    if (context === undefined) throw new Error('useContext(GameContext) must be used within a GameContext.Provider');

    const { profile, shopStats, selectedParentAlleles, setSelectedParentAlleles, setSelectedCPUParentAlleles, game, setGame } = context;

    const updateAlleles = (
        whichParent: 'first' | 'second',
        type: 'health' | 'strength' | 'defense',
        callback: (alleles: { allele: string; flash: boolean; selected: boolean }[]) => { allele: string; flash: boolean; selected: boolean }[]
    ) => {
        setAlleleMaps((maps) => ({
            ...maps,
            [whichParent]: maps[whichParent].map((map) => (map.type === type ? { ...map, alleles: callback(map.alleles) } : map)),
        }));
    };

    const flashSelectedAllele = async (whichParent: 'first' | 'second', type: 'health' | 'strength' | 'defense', possibleAlleles: String[], from: 'skip' | 'animation') => {
        if (from === 'animation' && skipAnimationRef.current.toggled) return;

        for (let i = 1; i <= 5; i++) {
            updateAlleles(whichParent, type, (alleles) => alleles.map((allele) => ({ ...allele, selected: false })));
            await sleep(150);

            updateAlleles(whichParent, type, (alleles) =>
                alleles.map((allele) =>
                    allele.allele === possibleAlleles[selectedParentAlleleIndices[whichParent][type]] ? { ...allele, selected: true } : { ...allele, selected: false }
                )
            );
            await sleep(150);
        }
    };

    const setGameInfo = () => {
        const getQuantity = (alleles: SelectedParentAlleles, type: 'health' | 'strength' | 'defense', whichParent: 'first' | 'second'): number => {
            const quantity = shopStats[type].find((map) => map.allele === alleles[whichParent][type])?.quantity;
            return quantity !== undefined ? quantity : 100;
        };

        const cpuAlleles = (): SelectedParentAlleles => {
            if (profile) {
                return {
                    first: {
                        health: profile.alleles.health[Math.floor(Math.random() * profile.alleles.health.length)] as string,
                        strength: profile.alleles.strength[Math.floor(Math.random() * profile.alleles.strength.length)] as string,
                        defense: profile.alleles.defense[Math.floor(Math.random() * profile.alleles.defense.length)] as string,
                    },
                    second: {
                        health: profile.alleles.health[Math.floor(Math.random() * profile.alleles.health.length)] as string,
                        strength: profile.alleles.strength[Math.floor(Math.random() * profile.alleles.strength.length)] as string,
                        defense: profile.alleles.defense[Math.floor(Math.random() * profile.alleles.defense.length)] as string,
                    },
                };
            }

            return {
                first: {
                    health: 'H3',
                    strength: 'S3',
                    defense: 'D3',
                },
                second: {
                    health: 'H3',
                    strength: 'S3',
                    defense: 'D3',
                },
            };
        };

        const cpu = cpuAlleles();
        setSelectedCPUParentAlleles(cpu);

        setGame((prevGame) => {
            return {
                ...prevGame,
                player: {
                    healthRemaining: getQuantity(selectedParentAlleles, 'health', 'first') + getQuantity(selectedParentAlleles, 'health', 'second'),
                    health: getQuantity(selectedParentAlleles, 'health', 'first') + getQuantity(selectedParentAlleles, 'health', 'second'),
                    strength: getQuantity(selectedParentAlleles, 'strength', 'first') + getQuantity(selectedParentAlleles, 'strength', 'second'),
                    defense: getQuantity(selectedParentAlleles, 'defense', 'first') + getQuantity(selectedParentAlleles, 'defense', 'second'),
                    currentTurn: false,
                },
                cpu: {
                    healthRemaining: getQuantity(cpu, 'health', 'first') + getQuantity(cpu, 'health', 'second'),
                    health: getQuantity(cpu, 'health', 'first') + getQuantity(cpu, 'health', 'second'),
                    strength: getQuantity(cpu, 'strength', 'first') + getQuantity(cpu, 'strength', 'second'),
                    defense: getQuantity(cpu, 'defense', 'first') + getQuantity(cpu, 'defense', 'second'),
                    currentTurn: false,
                },
            };
        });
    };

    useEffect(() => {
        if (profile) {
            const generateRandomIndices = (alleles: AlleleObject) => ({
                health: Math.floor(Math.random() * alleles.health.length),
                strength: Math.floor(Math.random() * alleles.strength.length),
                defense: Math.floor(Math.random() * alleles.defense.length),
            });

            setSelectedParentAlleleIndices({
                first: generateRandomIndices(profile.alleles),
                second: generateRandomIndices(profile.alleles),
            });
        }
    }, [profile]);

    useEffect(() => {
        skipAnimationRef.current = skipAnimation;
    }, [skipAnimation]);

    useEffect(() => {
        const handleSkipAnimation = async () => {
            if (skipAnimation.toggled) {
                const possibleAlleles = profile !== null && profile !== undefined ? profile.alleles : { health: ['H1', 'H2'], strength: ['S1', 'S2'], defense: ['D1', 'D2'] };
                const selectedAlleles: SelectedParentAlleles = {
                    first: {
                        health: possibleAlleles.health[selectedParentAlleleIndices.first.health],
                        strength: possibleAlleles.strength[selectedParentAlleleIndices.first.strength],
                        defense: possibleAlleles.defense[selectedParentAlleleIndices.first.defense],
                    },
                    second: {
                        health: possibleAlleles.health[selectedParentAlleleIndices.second.health],
                        strength: possibleAlleles.strength[selectedParentAlleleIndices.second.strength],
                        defense: possibleAlleles.defense[selectedParentAlleleIndices.second.defense],
                    },
                } as SelectedParentAlleles;

                await Promise.all([
                    flashSelectedAllele('first', 'health', possibleAlleles.health, 'skip'),
                    flashSelectedAllele('first', 'strength', possibleAlleles.strength, 'skip'),
                    flashSelectedAllele('first', 'defense', possibleAlleles.defense, 'skip'),
                    flashSelectedAllele('second', 'health', possibleAlleles.health, 'skip'),
                    flashSelectedAllele('second', 'strength', possibleAlleles.strength, 'skip'),
                    flashSelectedAllele('second', 'defense', possibleAlleles.defense, 'skip'),
                ]);
                setSelectedParentAlleles(selectedAlleles);
                setCurrentStage((stage) => {
                    return { ...stage, animationComplete: true };
                });
            }
        };
        handleSkipAnimation();
    }, [skipAnimation]);

    useEffect(() => {
        if (currentStage.started && !previousStage.started) {
            setOverlay({ text: `PARENT ALLELE SELECTION HAS BEGUN!`, toggled: true });
            setTimeout(() => {
                setOverlay({ text: '', toggled: false });
                setTimeout(() => {
                    setMiddleColumnVisible(false);
                }, 250);
                setTimeout(() => {
                    setCurrentStage((stage) => {
                        return { ...stage, runRollAnimation: true };
                    });
                }, 500);
            }, 1500);
        }

        if (currentStage.runRollAnimation && !previousStage.runRollAnimation && !skipAnimation.toggled) {
            setOverlay({ text: `ROLLING ${currentStage.allele.toUpperCase()} ALLELES!`, toggled: true });
            setTimeout(() => {
                setOverlay({ text: '', toggled: false });
                rollAlleles(currentStage.allele);
            }, 1000);

            if (!skipAnimation.toggled) setSkipAnimation({ button: true, toggled: false });

            setCurrentStage((stage) => {
                return { ...stage, runRollAnimation: false };
            });
        }

        if (currentStage.animationComplete && !previousStage.animationComplete) {
            setGameInfo();

            setTimeout(() => {
                setOverlay({ text: `PARENT ALLELE SELECTION COMPLETE!`, toggled: true });
                setTimeout(() => {
                    setOverlay({ text: ``, toggled: false });
                    setSlideAwayAnimation(true);
                    setTimeout(() => {
                        setStage('child-animation');
                    }, 1500);
                }, 1500);
            }, 1500);
        }

        setPreviousStage(currentStage);
    }, [currentStage]);

    const rollAlleles = async (type: 'health' | 'strength' | 'defense') => {
        const possibleAlleles = profile !== null && profile !== undefined ? profile.alleles[type] : [`${type.substring(0, 1).toUpperCase()}1`, `${type.substring(0, 1).toUpperCase()}2`];
        const randomIndices = { first: selectedParentAlleleIndices.first[type], second: selectedParentAlleleIndices.second[type] };
        const cycles = { first: Math.floor(Math.random() * 5) + 5, second: Math.floor(Math.random() * 5) + 5 };

        const flashAlleles = async (whichParent: 'first' | 'second') => {
            for (let i = 0; i < cycles[whichParent] + 1; i++) {
                for (let j = 0; j < (i === cycles[whichParent] ? randomIndices[whichParent] : possibleAlleles.length); j++) {
                    updateAlleles(whichParent, type, (alleles) =>
                        alleles.map((allele) => (allele.allele === possibleAlleles[j] ? { ...allele, flash: true } : { ...allele, flash: false }))
                    );

                    await sleep(i * 50);

                    updateAlleles(whichParent, type, (alleles) => alleles.map((allele) => ({ ...allele, flash: false })));
                }
            }

            await flashSelectedAllele(whichParent, type, possibleAlleles, 'animation');

            setSelectedParentAlleles((alleles: SelectedParentAlleles) => {
                return {
                    ...alleles,
                    [whichParent]: {
                        ...alleles[whichParent],
                        [type]: possibleAlleles[randomIndices[whichParent]],
                    },
                };
            });
        };

        if (!skipAnimation.toggled) {
            await Promise.all([flashAlleles('first'), flashAlleles('second')]);

            let nextStage: 'health' | 'strength' | 'defense' = type === 'health' ? 'strength' : type === 'strength' ? 'defense' : 'defense';

            if (type !== 'defense') {
                await sleep(1500);
                setCurrentStage((stage) => {
                    return { ...stage, allele: nextStage, runRollAnimation: true };
                });
            } else {
                setCurrentStage((stage) => {
                    return { ...stage, animationComplete: true };
                });
            }
        }
    };

    return (
        <>
            <motion.div layout className='flex justify-center px-6 gap-2 w-full'>
                <ParentRoller whichParent='first' slideAway={slideAwayAnimation} alleleMap={alleleMaps.first} skipAnimation={skipAnimation.toggled} />
                <AnimatePresence>
                    {middleColumnVisible && (
                        <motion.div
                            key='middle-column'
                            initial={{ opacity: 1, width: '20%' }}
                            exit={{ opacity: 0, width: 0 }}
                            transition={{ duration: 0.5 }}
                            className='flex flex-col items-center justify-center gap-4'
                        >
                            <button
                                onClick={() =>
                                    setCurrentStage((stage) => {
                                        return { ...stage, started: true };
                                    })
                                }
                                className={`${audiowide.className} text-lg text-white animated-gradient p-3 border-[6px] border-white rounded-xl uppercase hover:scale-105 transition-all cursor-pointer text-nowrap`}
                            >
                                Ready to begin?
                            </button>
                            <button
                                className={`${audiowide.className} text-lg text-white animated-gradient p-3 border-[6px] border-white rounded-xl uppercase hover:scale-105 transition-all cursor-pointer text-nowrap`}
                            >
                                Confused?
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
                <ParentRoller whichParent='second' slideAway={slideAwayAnimation} alleleMap={alleleMaps.second} skipAnimation={skipAnimation.toggled} />
            </motion.div>
            <AnimatePresence>
                {skipAnimation.button && (
                    <motion.button
                        key='skip-button'
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.5 }}
                        onClick={() => {
                            setSkipAnimation({ button: false, toggled: true });
                        }}
                        className={`${audiowide.className} text-lg text-white animated-gradient p-3 border-[6px] border-white rounded-xl uppercase hover:scale-105 transition-all cursor-pointer flex items-center gap-2`}
                    >
                        <SkipForward strokeWidth={2.5} />
                        <span>Skip Animation</span>
                    </motion.button>
                )}
            </AnimatePresence>
        </>
    );
};

export default ParentRollingContainer;
