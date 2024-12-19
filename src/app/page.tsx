'use client';

import { Audiowide } from 'next/font/google';
import Link from 'next/link';
import BottomUtilityBar from './_components/BottomUtilityBar';
import StatsDisplay from './_components/StatsButton';
import { GameProvider } from './context';
import { Toaster } from 'react-hot-toast';

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
                <div className='flex flex-col items-center w-full justify-start py-16 px-2 medium:px-4 gap-3 mobile:gap-5 mablet:gap-8 tablet:gap-10'>
                    <div className={`border-[12px] rounded-[56px] py-3 px-8 border-white drop-shadow-2xl animated-gradient w-full lablet:w-auto`}>
                        <h1
                            className={`${audiowide.className} text-center text-[7vw] phone:text-[7.5vw] mobile:text-[8vw] lablet:text-[84px] desktop:text-8xl text-white drop-shadow-lg leading-none`}
                        >
                            GENE FIGHTERS
                        </h1>
                    </div>
                    <Link
                        href='/singleplayer'
                        className={`border-[12px] w-4/5 medium:w-[70%] lablet:w-3/5 laptop:w-1/2 monitor:w-2/5 rounded-[56px] py-3 px-8 border-white drop-shadow-2xl animated-gradient hover:scale-105 transition-all cursor-pointer`}
                    >
                        <h1
                            className={`${audiowide.className} text-[4.5vw] medium:text-[5vw] mablet:text-[44px] lablet:text-5xl desktop:text-6xl text-white drop-shadow-lg text-center leading-none`}
                        >
                            SINGLEPLAYER
                        </h1>
                    </Link>
                    <Link
                        href='/multiplayer'
                        className={`border-[12px] w-4/5 medium:w-[70%] lablet:w-3/5 laptop:w-1/2 monitor:w-2/5 rounded-[56px] py-3 px-8 border-white drop-shadow-2xl animated-gradient hover:scale-105 transition-all cursor-pointer`}
                    >
                        <h1
                            className={`${audiowide.className} text-[4.5vw] medium:text-[5vw] mablet:text-[44px] lablet:text-5xl desktop:text-6xl text-white drop-shadow-lg text-center leading-none`}
                        >
                            MULTIPLAYER
                        </h1>
                    </Link>
                </div>
                <StatsDisplay />
                <BottomUtilityBar visibility={{ leaderboard: true, shop: true, help: true, user: true, settings: true }} />
            </div>
        </GameProvider>
    );
};

export default page;
