import { useEffect, useRef, useState } from 'react';
import ParentRoller from './ParentRoller';
import { Audiowide } from 'next/font/google';
import { AnimatePresence, motion } from 'framer-motion';
import { SelectedParentAlleles, useGameContext } from '../context';
import { SkipForward } from 'lucide-react';
import { AlleleObject } from '@/utils/indexedDB';

const audiowide = Audiowide({ weight: '400', subsets: ['latin'] });

export type CurrentStage = {
    allele: 'health' | 'strength' | 'defense';
    started: boolean;
    runRollAnimation: boolean;
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

const ParentRollingContainer = () => {
    const [currentStage, setCurrentStage] = useState<CurrentStage>({ allele: 'health', started: false, runRollAnimation: false });
    const [previousStage, setPreviousStage] = useState<CurrentStage>({ allele: 'health', started: false, runRollAnimation: false });
    const [overlay, setOverlay] = useState({ text: '', toggled: false });
    const [middleColumnVisible, setMiddleColumnVisible] = useState(true);
    const [skipAnimation, setSkipAnimation] = useState({ button: false, toggled: false });
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

    const { profile, setSelectedParentAlleles } = context;

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
            }
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
                <ParentRoller
                    whichParent='first'
                    currentStage={currentStage}
                    setCurrentStage={setCurrentStage}
                    middleColumnVisible={middleColumnVisible}
                    alleleMap={alleleMaps.first}
                    skipAnimation={skipAnimation.toggled}
                />
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
                    skipAnimation={skipAnimation.toggled}
                />
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
