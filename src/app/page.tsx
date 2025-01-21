'use client';

import { Audiowide } from 'next/font/google';
import Link from 'next/link';
import StatsDisplay from './_components/StatsButton';
import { GameProvider, useGameContext } from './context';
import { Toaster } from 'react-hot-toast';
import UtilityBar from './_components/UtilityBar';

const audiowide = Audiowide({ weight: '400', subsets: ['latin'] });

const page = () => {
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
            </div>
        </GameProvider>
    );
};

export default page;
