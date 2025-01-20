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

    return (
        <GameProvider>
            <Toaster />
            <div className='flex w-screen h-screen justify-center items-start -z-10 image-blur'>
                <div className='flex flex-col z-10 items-center w-full justify-start py-8 px-2 medium:px-4 gap-3 mobile:gap-5 mablet:gap-8 tablet:gap-10'>
                    <div className={`border-[12px] rounded-[56px] py-3 px-8 border-white drop-shadow-2xl animated-gradient w-full lablet:w-auto`}>
                        <h1
                            className={`${audiowide.className} text-center text-[7vw] phone:text-[7.5vw] mobile:text-[8vw] lablet:text-[84px] desktop:text-8xl text-white drop-shadow-lg leading-none`}
                        >
                            SINGLEPLAYER
                        </h1>
                    </div>
                    {stage === 'parent-rolling' ? (
                        <ParentRollingContainer setOverlay={setOverlay} setStage={setStage} />
                    ) : (
                        <CharacterFightContainer stage={stage} setStage={setStage} setGameOverScreenActive={setGameOverScreenActive} />
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
                {/* <UtilityBar visibility={{ leaderboard: true, shop: false, help: true, user: true, settings: true }} position='top-right' contextFunc={useGameContext} /> */}
            </div>
            {/* <GameModal isOpen={gameOpen} setIsOpen={setGameOpen} /> */}
        </GameProvider>
    );
};

export default page;
