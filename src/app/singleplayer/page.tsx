'use client';

import { Audiowide } from 'next/font/google';
import { Toaster } from 'react-hot-toast';
import ParentRollingContainer from './_components/ParentRollingContainer';
import { GameProvider, SelectedParentAlleles, useGameContext } from './context';
import UtilityBar from '../_components/UtilityBar';
import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';
import Fight from './_components/Fight';
import CharacterFightContainer from './_components/ChildFightContainer';
import GameModal from './_components/_fight_components/GameModal';
import GameOverScreen from './_components/_fight_components/GameOverScreen';
import HelpModal, { Tab } from '../_components/_modals/HelpModal';

const audiowide = Audiowide({ weight: '400', subsets: ['latin'] });

export type Overlay = {
    text: string;
    toggled: boolean;
};

export type Stage = 'parent-rolling' | 'child-animation' | 'game-started' | 'initial-animation';

const page = () => {
    const [overlay, setOverlay] = useState<Overlay>({ text: '', toggled: false });
    const [stage, setStage] = useState<Stage>('parent-rolling');
    const [gameOpen, setGameOpen] = useState(true);
    const [gameOverScreenActive, setGameOverScreenActive] = useState(false);
    const [helpModalOpen, setHelpModalOpen] = useState<{ open: boolean; tab: Tab }>({ open: false, tab: 'overview' });

    return (
        <GameProvider>
            <Toaster />
            <div className='flex w-screen h-screen justify-center items-start -z-10 image-blur'>
                <div className='flex flex-col z-10 items-center w-full justify-start py-8 px-4 gap-6 width-laptop:gap-10'>
                    <div className={`border-[12px] rounded-[56px] py-3 px-8 border-white drop-shadow-2xl animated-gradient w-auto`}>
                        <h1 className={`${audiowide.className} text-center text-[84px] width-laptop:text-8xl text-white drop-shadow-lg leading-none`}>SINGLEPLAYER</h1>
                    </div>
                    {stage === 'parent-rolling' ? (
                        <ParentRollingContainer setOverlay={setOverlay} setStage={setStage} setHelpModalOpen={setHelpModalOpen} />
                    ) : (
                        <CharacterFightContainer stage={stage} setStage={setStage} setGameOverScreenActive={setGameOverScreenActive} setHelpModalOpen={setHelpModalOpen} />
                    )}
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
                    <AnimatePresence>
                        {gameOverScreenActive && (
                            <motion.div
                                key='overlay'
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.5 }}
                                className={`absolute inset-0 bg-black bg-opacity-80 flex items-center justify-center p-12`}
                            >
                                <GameOverScreen />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
            <HelpModal isOpen={helpModalOpen.open} setIsOpen={setHelpModalOpen} initialTab={helpModalOpen.tab} />
        </GameProvider>
    );
};

export default page;
