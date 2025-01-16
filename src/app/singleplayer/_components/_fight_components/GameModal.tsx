import { motion, AnimatePresence } from 'framer-motion';
import { Audiowide } from 'next/font/google';
import { useGameContext } from '../../context';

const audiowide = Audiowide({ weight: '400', subsets: ['latin'] });

const GameModal = ({ isOpen, setIsOpen }: { isOpen: boolean; setIsOpen: React.Dispatch<React.SetStateAction<boolean>> }) => {
    const context = useGameContext();
    if (context === undefined) throw new Error('useContext(GameContext) must be used within a GameContext.Provider');

    const { game, setGame } = context;

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className='bg-slate-900/20 backdrop-blur p-8 fixed inset-0 z-50 grid place-items-center overflow-y-scroll'
                    >
                        <motion.div
                            initial={{ scale: 0, rotate: '12.5deg' }}
                            animate={{ scale: 1, rotate: '0deg' }}
                            exit={{ scale: 0, rotate: '0deg' }}
                            onClick={(e) => e.stopPropagation()}
                            className='border-4 border-white gradient-full text-white p-6 rounded-xl w-full max-w-[90vw] min-h-[60vh] shadow-xl cursor-default relative overflow-hidden'
                        >
                            <div className='relative z-10'>
                                <h3 className={`${audiowide.className} text-4xl font-bold text-left mb-5 uppercase`}>{game.game.selectedGame?.replaceAll('-', ' ')}</h3>
                            </div>
                        </motion.div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default GameModal;