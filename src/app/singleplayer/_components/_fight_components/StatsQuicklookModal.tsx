import { AnimatePresence, motion } from 'framer-motion';
import StatsDisplay from '../ChildStatsDisplay';
import { Audiowide } from 'next/font/google';

const audiowide = Audiowide({ weight: '400', subsets: ['latin'] });

const StatsQuicklookModal = ({
    isOpen,
    setIsOpen,
    character,
}: {
    isOpen: boolean;
    setIsOpen: React.Dispatch<
        React.SetStateAction<{
            open: boolean;
            character: 'cpu' | 'player';
        }>
    >;
    character: 'cpu' | 'player';
}) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() =>
                            setIsOpen((prev) => {
                                return { ...prev, open: false };
                            })
                        }
                        className='bg-slate-900/20 backdrop-blur p-8 fixed inset-0 z-50 grid place-items-center overflow-y-scroll cursor-pointer'
                    >
                        <motion.div
                            initial={{ scale: 0, rotate: '12.5deg' }}
                            animate={{ scale: 1, rotate: '0deg' }}
                            exit={{ scale: 0, rotate: '0deg' }}
                            onClick={(e) => e.stopPropagation()}
                            className='text-white w-full max-w-[95vw] width-ipad:max-w-[90vw] width-laptop:max-w-[85vw] width-desktop:max-w-[75vw] shadow-xl cursor-default relative overflow-hidden flex flex-col gap-3'
                        >
                            <StatsDisplay character={character} from='modal' />
                            <button
                                onClick={() =>
                                    setIsOpen((prev) => {
                                        return { ...prev, open: false };
                                    })
                                }
                                className={`${audiowide.className} flex justify-center text-2xl text-white animated-gradient border-[12px] rounded-[56px] py-3 px-8 border-white drop-shadow-2xl w-full h-full hover:brightness-125 transition-all`}
                            >
                                CLOSE STATS
                            </button>
                        </motion.div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default StatsQuicklookModal;
