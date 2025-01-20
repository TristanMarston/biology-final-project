import { motion, AnimatePresence } from 'framer-motion';
import { Audiowide } from 'next/font/google';
import { useGameContext } from '../../context';
import TargetClicker from './_games/TargetClicker';
import TriviaChallenge from './_games/TriviaChallenge';
import ReactionSpeedTest from './_games/ReactionSpeedTest';
import MathChallenge from './_games/MathChallenge';
import WordUnscramble from './_games/WordUnscramble';
import MemoryGame from './_games/MemoryGame';

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
                            className='border-4 border-white gradient-full text-white p-6 rounded-xl w-full max-w-[90vw] h-[75vh] shadow-xl cursor-default relative overflow-hidden'
                        >
                            <div className='h-full'>
                                {game.game.selectedGame === 'target-clicker' && <TargetClicker setIsOpen={setIsOpen} />}
                                {game.game.selectedGame === 'trivia-challenge' && <TriviaChallenge setIsOpen={setIsOpen} />}
                                {game.game.selectedGame === 'reaction-speed-test' && <ReactionSpeedTest setIsOpen={setIsOpen} />}
                                {game.game.selectedGame === 'math-challenge' && <MathChallenge setIsOpen={setIsOpen} />}
                                {game.game.selectedGame === 'word-unscramble' && <WordUnscramble setIsOpen={setIsOpen} />}
                                {game.game.selectedGame === 'memory-game' && <MemoryGame setIsOpen={setIsOpen} />}
                            </div>
                        </motion.div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default GameModal;
