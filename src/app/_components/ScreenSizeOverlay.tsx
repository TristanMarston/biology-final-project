'use client';

import { CircleAlert } from 'lucide-react';
import { Orbitron } from 'next/font/google';
import { useEffect, useState } from 'react';

const orbitronBold = Orbitron({ weight: '800', subsets: ['latin'] });

const ScreenSizeOverlay = () => {
    const [screenSize, setScreenSize] = useState({ width: 1000, height: 650 });

    useEffect(() => {
        const handleResize = () => {
            setScreenSize({ width: window.innerWidth, height: window.innerHeight });
        };

        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const isScreenTooSmall = screenSize.width < 1000 || screenSize.height < 650;

    if (!isScreenTooSmall) return null;

    return (
        <div className={`${orbitronBold.className} fixed inset-0 bg-black flex flex-col items-center justify-center text-white z-50 text-center px-4`}>
            <CircleAlert className='text-white w-[30vw] h-[30vw] mb-4 flex items-end' strokeWidth={3} />
            <h1 className='min-[650px]:text-[3.5vw] text-[4vw] mb-4'>Sorry! Your screen is too small to play the game.</h1>
            <h2 className='min-[650px]:text-[2.5vw] text-[3vw] mb-4'>Your screen size must be at least 1000px wide and 650px tall.</h2>
            <p className='min-[650px]:text-[1.75vw] text-[2vw]'>
                Current screen size: {screenSize.width}px (width) x {screenSize.height}px (height)
            </p>
        </div>
    );
};

export default ScreenSizeOverlay;
