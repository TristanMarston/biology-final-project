import { useEffect, useState } from 'react';
import ParentRoller from './ParentRoller';
import { Audiowide } from 'next/font/google';
import { AnimatePresence, motion } from 'framer-motion';
import { SelectedParentAlleles, useGameContext } from '../context';
import { SkipForward } from 'lucide-react';

const audiowide = Audiowide({ weight: '400', subsets: ['latin'] });

export type CurrentStage = {
    parent: 0 | 1;
    allele: 'health' | 'strength' | 'defense';
    started: boolean;
    runRollAnimation: boolean;
};

export type AlleleMap = {
    type: 'health' | 'strength' | 'defense';
    color: 'red' | 'purple' | 'green';
    alleles: { allele: string; flash: boolean }[];
};

const ParentRollingContainer = () => {
    const [currentStage, setCurrentStage] = useState<CurrentStage>({ parent: 0, allele: 'health', started: false, runRollAnimation: false });
    const [previousStage, setPreviousStage] = useState<CurrentStage>({ parent: 0, allele: 'health', started: false, runRollAnimation: false });
    const [overlay, setOverlay] = useState({ text: '', toggled: false });
    const [middleColumnVisible, setMiddleColumnVisible] = useState(true);

    const context = useGameContext();
    if (context === undefined) throw new Error('useContext(GameContext) must be used within a GameContext.Provider');

    const { profile, setProfile, selectedParentAlleles, setSelectedParentAlleles } = context;

    const [alleleMaps, setAlleleMaps] = useState<{ first: AlleleMap[]; second: AlleleMap[] }>({
        first: [
            {
                type: 'health',
                color: 'red',
                alleles: [
                    { allele: 'H1', flash: false },
                    { allele: 'H2', flash: false },
                    { allele: 'H3', flash: false },
                    { allele: 'H4', flash: false },
                    { allele: 'H5', flash: false },
                    { allele: 'H6', flash: false },
                ],
            },
            {
                type: 'strength',
                color: 'purple',
                alleles: [
                    { allele: 'S1', flash: false },
                    { allele: 'S2', flash: false },
                    { allele: 'S3', flash: false },
                    { allele: 'S4', flash: false },
                    { allele: 'S5', flash: false },
                    { allele: 'S6', flash: false },
                ],
            },
            {
                type: 'defense',
                color: 'green',
                alleles: [
                    { allele: 'D1', flash: false },
                    { allele: 'D2', flash: false },
                    { allele: 'D3', flash: false },
                    { allele: 'D4', flash: false },
                    { allele: 'D5', flash: false },
                    { allele: 'D6', flash: false },
                ],
            },
        ],
        second: [
            {
                type: 'health',
                color: 'red',
                alleles: [
                    { allele: 'H1', flash: false },
                    { allele: 'H2', flash: false },
                    { allele: 'H3', flash: false },
                    { allele: 'H4', flash: false },
                    { allele: 'H5', flash: false },
                    { allele: 'H6', flash: false },
                ],
            },
            {
                type: 'strength',
                color: 'purple',
                alleles: [
                    { allele: 'S1', flash: false },
                    { allele: 'S2', flash: false },
                    { allele: 'S3', flash: false },
                    { allele: 'S4', flash: false },
                    { allele: 'S5', flash: false },
                    { allele: 'S6', flash: false },
                ],
            },
            {
                type: 'defense',
                color: 'green',
                alleles: [
                    { allele: 'D1', flash: false },
                    { allele: 'D2', flash: false },
                    { allele: 'D3', flash: false },
                    { allele: 'D4', flash: false },
                    { allele: 'D5', flash: false },
                    { allele: 'D6', flash: false },
                ],
            },
        ],
    });

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

        if (currentStage.runRollAnimation && !previousStage.runRollAnimation) {
            setOverlay({ text: `ROLLING ${currentStage.allele.toUpperCase()} ALLELES!`, toggled: true });
            setTimeout(() => {
                setOverlay({ text: '', toggled: false });
                rollAlleles(currentStage.allele);
            }, 1000);

            setCurrentStage((stage) => {
                return { ...stage, runRollAnimation: false };
            });
        }

        setPreviousStage(currentStage);
    }, [currentStage]);

    const rollAlleles = async (type: 'health' | 'strength' | 'defense') => {
        const possibleAlleles = profile !== null && profile !== undefined ? profile.alleles[type] : [`${type.substring(0, 1).toUpperCase()}1`, `${type.substring(0, 1).toUpperCase()}2`];
        const randomIndices = { first: Math.floor(Math.random() * possibleAlleles.length), second: Math.floor(Math.random() * possibleAlleles.length) };
        const cycles = { first: Math.floor(Math.random() * 5) + 5, second: Math.floor(Math.random() * 5) + 5 };

        const flashAlleles = async (whichParent: 'first' | 'second') => {
            for (let i = 0; i < cycles[whichParent]; i++) {
                for (let j = 0; j < possibleAlleles.length; j++) {
                    setAlleleMaps((maps) => {
                        return {
                            ...maps,
                            [whichParent]: maps[whichParent].map((map) => {
                                if (map.type === type) {
                                    return {
                                        ...map,
                                        alleles: map.alleles.map((allele) => {
                                            if (allele.allele === possibleAlleles[j]) {
                                                return { ...allele, flash: true };
                                            }
                                            return { ...allele, flash: false };
                                        }),
                                    };
                                }
                                return map;
                            }),
                        };
                    });

                    await new Promise((resolve) => setTimeout(resolve, i * 50));

                    setAlleleMaps((maps) => {
                        return {
                            ...maps,
                            [whichParent]: maps[whichParent].map((map) => {
                                if (map.type === type) {
                                    return {
                                        ...map,
                                        alleles: map.alleles.map((allele) => {
                                            return { ...allele, flash: false };
                                        }),
                                    };
                                }
                                return map;
                            }),
                        };
                    });
                }
            }

            for (let i = 0; i < randomIndices[whichParent]; i++) {
                setAlleleMaps((maps) => {
                    return {
                        ...maps,
                        [whichParent]: maps[whichParent].map((map) => {
                            if (map.type === type) {
                                return {
                                    ...map,
                                    alleles: map.alleles.map((allele) => {
                                        if (allele.allele === possibleAlleles[i]) {
                                            return { ...allele, flash: true };
                                        }
                                        return { ...allele, flash: false };
                                    }),
                                };
                            }
                            return map;
                        }),
                    };
                });

                await new Promise((resolve) => setTimeout(resolve, cycles[whichParent] * 50));

                setAlleleMaps((maps) => {
                    return {
                        ...maps,
                        [whichParent]: maps[whichParent].map((map) => {
                            if (map.type === type) {
                                return {
                                    ...map,
                                    alleles: map.alleles.map((allele) => {
                                        return { ...allele, flash: false };
                                    }),
                                };
                            }
                            return map;
                        }),
                    };
                });
            }

            for (let i = 1; i <= 5; i++) {
                setAlleleMaps((maps) => {
                    return {
                        ...maps,
                        [whichParent]: maps[whichParent].map((map) => {
                            if (map.type === type) {
                                return {
                                    ...map,
                                    alleles: map.alleles.map((allele) => {
                                        return { ...allele, flash: false };
                                    }),
                                };
                            }
                            return map;
                        }),
                    };
                });

                await new Promise((resolve) => setTimeout(resolve, 150));

                setAlleleMaps((maps) => {
                    return {
                        ...maps,
                        [whichParent]: maps[whichParent].map((map) => {
                            if (map.type === type) {
                                return {
                                    ...map,
                                    alleles: map.alleles.map((allele) => {
                                        if (allele.allele === possibleAlleles[randomIndices[whichParent]]) {
                                            return { ...allele, flash: true };
                                        }
                                        return { ...allele, flash: false };
                                    }),
                                };
                            }
                            return map;
                        }),
                    };
                });

                await new Promise((resolve) => setTimeout(resolve, 150));
            }

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

        await Promise.all([flashAlleles('first'), flashAlleles('second')]);

        let nextStage: 'health' | 'strength' | 'defense' = type === 'health' ? 'strength' : type === 'strength' ? 'defense' : 'defense';

        if (type !== 'defense') {
            await new Promise((resolve) => setTimeout(resolve, 1500));
            setCurrentStage((stage) => {
                return { ...stage, allele: nextStage, runRollAnimation: true };
            });
        }
    };

    return (
        <>
            <motion.div
                layout
                initial={{ width: '100%' }}
                animate={{
                    transition: { duration: 0.5 },
                }}
                className='flex justify-center px-6 gap-2'
            >
                <ParentRoller whichParent='first' currentStage={currentStage} setCurrentStage={setCurrentStage} middleColumnVisible={middleColumnVisible} alleleMap={alleleMaps.first} />
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
                <ParentRoller
                    whichParent='second'
                    currentStage={currentStage}
                    setCurrentStage={setCurrentStage}
                    middleColumnVisible={middleColumnVisible}
                    alleleMap={alleleMaps.second}
                />
            </motion.div>
            <AnimatePresence>
                {overlay.toggled && (
                    <motion.div
                        key='overlay'
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.5 }}
                        className={`absolute inset-0 bg-black bg-opacity-80 flex items-center justify-center p-12`}
                    >
                        <div className={`${audiowide.className} text-white text-6xl text-center`}>{overlay.text}</div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default ParentRollingContainer;
