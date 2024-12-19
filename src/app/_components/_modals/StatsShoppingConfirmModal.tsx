import { failToast, successToast, useGameContext } from '@/app/context';
import { addAlleleToProfile, updateGuestProfile } from '@/utils/indexedDB';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { Audiowide, Orbitron } from 'next/font/google';
import { Dispatch, SetStateAction } from 'react';

const audiowide = Audiowide({ weight: '400', subsets: ['latin'] });
const orbitronBold = Orbitron({ weight: '800', subsets: ['latin'] });
const orbitronMedium = Orbitron({ weight: '500', subsets: ['latin'] });

const StatsShoppingConfirmModal = ({
    isOpen,
    setIsOpen,
    data,
}: {
    isOpen: boolean;
    setIsOpen: Dispatch<SetStateAction<boolean>>;
    data: { allele: string; cost: number; type: string };
}) => {
    const context = useGameContext();
    if (context === undefined) throw new Error('useContext(GameContext) must be used within a GameContext.Provider');

    const { profile, setProfile } = context;

    const handleUpdateMoney = async (money: number) => {
        let currentMoney = profile !== null && profile !== undefined ? profile.money : 0;

        if (currentMoney + money < 0) return false;
        const updatedProfile = await updateGuestProfile({
            money: currentMoney + money,
        });
        setProfile(updatedProfile);

        return true;
    };

    return (
        <AnimatePresence>
            {isOpen && (
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
                        className='border-4 border-white gradient-full text-white p-6 rounded-xl w-full max-w-xl shadow-xl cursor-default relative overflow-hidden'
                    >
                        <div className='relative z-10'>
                            <X className='absolute right-0 top-0 cursor-pointer' onClick={() => setIsOpen(false)} />
                            <h3 className={`${audiowide.className} text-4xl font-bold text-center mb-3`}>ARE YOU SURE?</h3>
                            <div>
                                <p className={`${orbitronMedium.className} text-lg mb-3`}>
                                    Are you sure you would like to purchase the {data.allele} allele? This will set you back ${data.cost}.
                                </p>
                                <div className={`${orbitronBold.className} flex items-center w-full gap-4`}>
                                    <button
                                        onClick={() => setIsOpen(false)}
                                        className='w-full py-2 text-lg grid place-items-center border-4 rounded-xl shadow-lg hover:scale-105 transition-all'
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={async () => {
                                            addAlleleToProfile(data.type, data.allele)
                                                .then(async () => {
                                                    let paid = await handleUpdateMoney(-data.cost);
                                                    if (paid) {
                                                        successToast(`purchased! -$${data.cost}`);
                                                        setIsOpen(false);
                                                    }
                                                })
                                                .catch((error) => {
                                                    failToast(`unable to purchase. please try again`);
                                                    setIsOpen(false);
                                                });
                                        }}
                                        className='w-full py-2 text-lg grid place-items-center border-4 rounded-xl animated-gradient-fast-full shadow-lg hover:scale-105 transition-all'
                                    >
                                        Buy ${data.cost}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default StatsShoppingConfirmModal;
