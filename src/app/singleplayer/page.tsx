'use client';

import { Audiowide } from 'next/font/google';
import BottomUtilityBar from '../_components/UtilityBar';
import { Toaster } from 'react-hot-toast';
import { GameProvider } from '../context';
import ParentRollingContainer from './_components/ParentRollingContainer';

const audiowide = Audiowide({ weight: '400', subsets: ['latin'] });

const page = () => {
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
                    <ParentRollingContainer />
                </div>
                <BottomUtilityBar visibility={{ leaderboard: true, shop: false, help: true, user: true, settings: true }} position='top-right' />
            </div>
        </GameProvider>
    );
};

export default page;
