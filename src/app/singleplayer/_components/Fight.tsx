import { AnimatePresence, motion } from 'framer-motion';
import { useGameContext } from '../context';
import { Audiowide } from 'next/font/google';

const audiowide = Audiowide({ weight: '400', subsets: ['latin'] });

const Fight = ({ executeAttack }: { executeAttack: (attacker: 'cpu' | 'player') => void }) => {
    const context = useGameContext();
    if (context === undefined) throw new Error('useContext(GameContext) must be used within a GameContext.Provider');

    const { game, setGame, setStatsQuicklookModalOpen } = context;

    return (
        <>
            <AnimatePresence>
                <motion.div className='w-[15vw]' initial={{ x: '150%' }} animate={{ x: 0 }} transition={{ duration: 1, ease: 'easeInOut' }}>
                    <div
                        style={{
                            backgroundImage: `url('/gene-fighters-character-dark.png')`,
                            backgroundSize: 'contain',
                            backgroundPosition: 'center',
                            backgroundRepeat: 'no-repeat',
                            height: '50vh',
                            width: '15vw',
                        }}
                        className='h-full drop-shadow-2xl mt-[50%]'
                    />

                    <div className='flex flex-col gap-2'>
                        <button
                            onClick={() => setStatsQuicklookModalOpen({ open: true, character: 'cpu' })}
                            className={`${audiowide.className} w-full text-lg text-white animated-gradient p-3 border-[6px] border-white rounded-xl uppercase hover:scale-105 transition-all cursor-pointer text-nowrap`}
                        >
                            STATS
                        </button>
                        <button
                            onClick={() => executeAttack('cpu')}
                            className={`${audiowide.className} w-full text-lg text-white animated-gradient p-3 border-[6px] border-white rounded-xl uppercase hover:scale-105 transition-all cursor-pointer text-nowrap`}
                        >
                            ATTACK
                        </button>
                    </div>
                </motion.div>
            </AnimatePresence>
        </>
    );
};

export default Fight;
