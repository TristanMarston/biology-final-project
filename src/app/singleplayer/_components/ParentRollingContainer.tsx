import { useEffect, useState } from 'react';
import ParentRoller from './ParentRoller';
import { Audiowide } from 'next/font/google';
import { AnimatePresence, motion } from 'framer-motion';

const audiowide = Audiowide({ weight: '400', subsets: ['latin'] });

export type CurrentStage = {
    parent: 0 | 1;
    allele: 'health' | 'strength' | 'defense';
    started: boolean;
};

const ParentRollingContainer = () => {
    const [currentStage, setCurrentStage] = useState<CurrentStage>({ parent: 0, allele: 'health', started: false });
    const [previousStage, setPreviousStage] = useState<CurrentStage>({ parent: 0, allele: 'health', started: false });
    const [overlay, setOverlay] = useState({ text: '', toggled: false });
    const [slidingAnimation, setSlidingAnimation] = useState({ collapseMiddle: false, expandSides: false });
    const [middleColumnVisible, setMiddleColumnVisible] = useState(true);

    useEffect(() => {
        if (currentStage.started && !previousStage.started) {
            setOverlay({ text: `PARENT ALLELE SELECTION HAS BEGUN!`, toggled: true });
            setTimeout(() => {
                setOverlay({ text: '', toggled: false });
                setTimeout(() => {
                    setMiddleColumnVisible(false);
                }, 250);
            }, 1500);
        }

        setPreviousStage(currentStage);
    }, [currentStage]);

    return (
        <>
            <motion.div
                layout
                initial={{ width: '100%' }} // Initial width of the container
                animate={{
                    transition: { duration: 0.5 },
                }}
                className={`flex justify-center px-6 gap-2`}
                // className={`grid ${slidingAnimation.expandSides ? 'grid-cols-[1fr_1fr]' : 'grid-cols-[40%_20%_40%]'} w-full justify-center px-6 gap-2 transition-all duration-500`}
            >
                <ParentRoller whichParent='first' currentStage={currentStage} setCurrentStage={setCurrentStage} middleColumnVisible={middleColumnVisible} />
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
                <ParentRoller whichParent='second' currentStage={currentStage} setCurrentStage={setCurrentStage} middleColumnVisible={middleColumnVisible} />
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
