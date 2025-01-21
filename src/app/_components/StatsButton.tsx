import { useState } from 'react';
import { Audiowide } from 'next/font/google';
import { SquareArrowOutUpRight } from 'lucide-react';
import StatsShoppingModal from './_modals/StatsShoppingModal';
import { useGameContext } from '../context';

const audiowide = Audiowide({ weight: '400', subsets: ['latin'] });

const StatsDisplay = () => {
    const context = useGameContext();
    if (context === undefined) throw new Error('useContext(GameContext) must be used within a GameContext.Provider');

    const { statsAndShopModalOpen, setStatsAndShopModalOpen } = context;

    return (
        <>
            <div
                onClick={() => {
                    setStatsAndShopModalOpen(true);
                }}
                className={`border-[12px] w-4/5 width-ipad:w-1/2 width-monitor:w-2/5 rounded-[56px] py-3 px-8 border-white drop-shadow-2xl animated-gradient hover:scale-105 transition-all cursor-pointer`}
            >
                <h1 className={`${audiowide.className} text-[4.5vw] width-laptop:text-6xl text-white drop-shadow-lg text-center leading-none`}>SHOP & STATS</h1>
            </div>
            <StatsShoppingModal isOpen={statsAndShopModalOpen} setIsOpen={setStatsAndShopModalOpen} />
        </>
    );
};

export default StatsDisplay;
