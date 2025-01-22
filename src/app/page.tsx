'use client';

import { Audiowide } from 'next/font/google';
import Link from 'next/link';
import StatsDisplay from './_components/StatsButton';
import { GameProvider, useGameContext } from './context';
import { Toaster } from 'react-hot-toast';
import UtilityBar from './_components/UtilityBar';
import { useState } from 'react';
import HelpModal, { Tab } from './_components/_modals/HelpModal';
import { CircleHelp } from 'lucide-react';

const audiowide = Audiowide({ weight: '400', subsets: ['latin'] });

const page = () => {
    const [helpModalOpen, setHelpModalOpen] = useState<{ open: boolean; tab: Tab }>({ open: false, tab: 'overview' });

    return (
        <GameProvider>
            <Toaster />
            <div
                className='flex w-screen h-screen justify-center items-center'
                style={{
                    backgroundImage: `
					radial-gradient(circle, rgba(0, 0, 0, 0) 30%, rgba(0, 0, 0, 0.5) 100%), 
					url('/gene-fighters-background.png')
				`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                    height: '100vh',
                    width: '100vw',
                }}
            >
                <div className='flex flex-col items-center w-full justify-start py-16 px-2 gap-10'>
                    <div className={`border-[12px] rounded-[56px] py-3 px-8 border-white drop-shadow-2xl animated-gradient width-min:w-[90%] width-ipad:w-auto`}>
                        <h1 className={`${audiowide.className} text-center text-[7vw] width-laptop:text-8xl text-white drop-shadow-lg leading-none`}>GENE FIGHTERS</h1>
                    </div>
                    <Link
                        href='/singleplayer'
                        className={`border-[12px] w-4/5 width-ipad:w-1/2 width-monitor:w-2/5 rounded-[56px] py-3 px-8 border-white drop-shadow-2xl animated-gradient hover:scale-105 transition-all cursor-pointer`}
                    >
                        <h1 className={`${audiowide.className} text-[4.5vw] width-laptop:text-6xl text-white drop-shadow-lg text-center leading-none`}>SINGLEPLAYER</h1>
                    </Link>
                    <StatsDisplay />
                </div>
                <button
                    onClick={() => setHelpModalOpen({ open: true, tab: 'overview' })}
                    className={`${audiowide.className} text-xl py-2 px-4 width-laptop:py-2.5 width-laptop:px-5 width-laptop:text-2xl flex items-center gap-2 text-white animated-gradient  rounded-full border-4 border-white  uppercase absolute bottom-6 right-6 hover:scale-105 transition-all`}
                >
                    <CircleHelp className='w-7 h-7 width-laptop:w-8 width-laptop:h-8' strokeWidth={2.5} />
                    <span>HOW TO PLAY</span>
                </button>
            </div>
            <HelpModal isOpen={helpModalOpen.open} setIsOpen={setHelpModalOpen} initialTab={helpModalOpen.tab} />
        </GameProvider>
    );
};

export default page;
