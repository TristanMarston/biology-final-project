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
                onClick={() => setStatsAndShopModalOpen(true)}
                className='absolute bottom-4 left-4 border-4 rounded-full animated-gradient py-3 px-6 gap-2 flex justify-center items-center hover:scale-105 transition-all cursor-pointer'
            >
                <h3 className={`${audiowide.className} text-white text-xl`}>STATISTICS</h3>
                <SquareArrowOutUpRight className='text-white' strokeWidth={2.5} />
            </div>
            <StatsShoppingModal isOpen={statsAndShopModalOpen} setIsOpen={setStatsAndShopModalOpen} />
        </>
    );
};

export default StatsDisplay;
