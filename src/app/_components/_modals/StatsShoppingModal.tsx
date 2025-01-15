import { AnimatePresence, motion } from 'framer-motion';
import { Dispatch, SetStateAction, useState } from 'react';
import { Audiowide, Orbitron } from 'next/font/google';
import { failToast, useGameContext } from '../../context';
import { Lock, LockOpen, X } from 'lucide-react';
import StatsShoppingConfirmModal from './StatsShoppingConfirmModal';
import { updateGuestProfile } from '@/utils/indexedDB';

const audiowide = Audiowide({ weight: '400', subsets: ['latin'] });
const orbitronBold = Orbitron({ weight: '800', subsets: ['latin'] });
const orbitronMedium = Orbitron({ weight: '500', subsets: ['latin'] });
const orbitronLight = Orbitron({ weight: '400', subsets: ['latin'] });

const StatsShoppingModal = ({ isOpen, setIsOpen }: { isOpen: boolean; setIsOpen: Dispatch<SetStateAction<boolean>> }) => {
    const context = useGameContext();
    if (context === undefined) throw new Error('useContext(GameContext) must be used within a GameContext.Provider');

    const { profile, setProfile, shopStats } = context;
    const [confirmModalOpen, setConfirmModalOpen] = useState(false);
    const [confirmModalData, setConfirmModalData] = useState<{ allele: string; cost: number; type: string }>({ allele: '', cost: 0, type: 'health' });

    const alleleArray = [
        {
            type: 'health',
            unit: 'HP',
            alleles: profile?.alleles?.health,
            stats: shopStats.health,
            color: 'red',
            letter: 'H',
        },
        {
            type: 'strength',
            unit: 'DMG',
            alleles: profile?.alleles?.strength,
            stats: shopStats.strength,
            color: 'purple',
            letter: 'S',
        },
        {
            type: 'defense',
            unit: 'DEF',
            alleles: profile?.alleles?.defense,
            stats: shopStats.defense,
            color: 'green',
            letter: 'D',
        },
    ];

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsOpen(false)}
                        className='bg-slate-900/20 backdrop-blur p-8 fixed inset-0 z-50 grid place-items-center overflow-y-scroll cursor-pointer'
                    >
                        <motion.div
                            initial={{ scale: 0, rotate: '12.5deg' }}
                            animate={{ scale: 1, rotate: '0deg' }}
                            exit={{ scale: 0, rotate: '0deg' }}
                            onClick={(e) => e.stopPropagation()}
                            className='border-4 border-white gradient-full text-white p-6 rounded-xl w-full max-w-3xl shadow-xl cursor-default relative overflow-hidden'
                        >
                            <div className='relative z-10'>
                                <X className='absolute right-0 top-0 cursor-pointer' onClick={() => setIsOpen(false)} />
                                <h3 className={`${audiowide.className} text-5xl font-bold text-center`}>STATS & SHOP</h3>
                                <div className={`${audiowide.className} flex justify-between py-6`}>
                                    <p className='p-2 border-2 border-white rounded-md shadow-md'>MONEY: ${profile?.money}</p>
                                    <p className='p-2 border-2 border-white rounded-md shadow-md'>GAMES PLAYED: {profile?.games?.length}</p>
                                    <p className='p-2 border-2 border-white rounded-md shadow-md'>GAMES WON: {profile?.games?.filter((item) => item.won).length}</p>
                                    <p className='p-2 border-2 border-white rounded-md shadow-md'>GAMES LOST: {profile?.games?.filter((item) => !item.won).length}</p>
                                </div>
                                <h4 className={`${audiowide.className} text-2xl mb-2`}>ALLELES</h4>
                                <div className='flex flex-col gap-5 px-10'>
                                    {alleleArray.map(({ type, unit, alleles, stats, color, letter }, index) => (
                                        <div key={type + color}>
                                            <h5 className={`${audiowide.className} text-lg animated-text-gradient-${color}-full mb-2 uppercase`}>{type} ALLELES</h5>
                                            <div className='flex flex-col gap-2'>
                                                <div className={`rounded-xl grid grid-cols-6 animated-gradient-${color}-full border border-white shadow-2xl`}>
                                                    {Array.from({ length: 6 }).map((_, index) => {
                                                        const unlocked = alleles?.indexOf(`${letter}${index + 1}`) !== -1;

                                                        return (
                                                            <div
                                                                key={index + unlocked.toString()}
                                                                className={`${orbitronBold.className} ${!unlocked && 'bg-[rgb(0,0,0,.6)]'} ${
                                                                    index !== 5 ? 'border-r border-white' : 'rounded-r-xl'
                                                                } flex flex-col gap-0.5 justify-center items-center relative aspect-square`}
                                                            >
                                                                <span className={orbitronBold.className}>
                                                                    {letter}
                                                                    {index + 1}
                                                                </span>
                                                                <span className={orbitronMedium.className}>
                                                                    {stats[index].quantity} {unit.toUpperCase()}
                                                                </span>
                                                                <span className={orbitronLight.className}>${stats[index].cost}</span>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                                <div className={`rounded-xl grid grid-cols-6 animated-gradient-${color}-full border border-white shadow-2xl`}>
                                                    {Array.from({ length: 6 }).map((_, index) => {
                                                        const unlocked = alleles?.indexOf(`${letter}${index + 1}`) !== -1;

                                                        return (
                                                            <div
                                                                key={index + unlocked.toString()}
                                                                onClick={() => {
                                                                    const currentMoney = profile !== null && profile !== undefined ? profile.money : 0;

                                                                    console.log('current:', currentMoney);
                                                                    console.log('needed:', stats[index].cost);

                                                                    if (stats[index].cost === 0 || unlocked) {
                                                                        failToast('already obtained!');
                                                                    } else if (currentMoney < stats[index].cost) {
                                                                        failToast(`not enough money! you need $${stats[index].cost - currentMoney} more!`);
                                                                    } else {
                                                                        setConfirmModalOpen(true);
                                                                        setConfirmModalData({ allele: `${letter}${index + 1}`, cost: stats[index].cost, type: type });
                                                                    }
                                                                }}
                                                                className={`${orbitronBold.className} ${
                                                                    !unlocked && 'bg-[rgb(0,0,0,.6)] hover:bg-[rgb(0,0,0,0.4)] cursor-pointer transition-colors'
                                                                } ${index !== 5 ? 'border-r border-white' : 'rounded-r-xl'} flex justify-center items-center gap-1.5 relative py-2`}
                                                            >
                                                                {unlocked ? <LockOpen className='w-4 h-4' strokeWidth={2.5} /> : <Lock className='w-4 h-4' strokeWidth={3} />}
                                                                <span>{unlocked ? `${stats[index].cost === 0 ? 'FREE' : 'PAID'}` : 'BUY'}</span>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <button
                                onClick={async () => {
                                    const updatedProfile = await updateGuestProfile({
                                        money: (profile?.money || 0) + 100,
                                    });
                                    setProfile(updatedProfile);
                                }}
                            >
                                give me $100
                            </button>
                        </motion.div>
                    </motion.div>
                    <StatsShoppingConfirmModal isOpen={confirmModalOpen} setIsOpen={setConfirmModalOpen} data={confirmModalData} />
                </>
            )}
        </AnimatePresence>
    );
};

export default StatsShoppingModal;
