import { motion } from 'framer-motion';
import { useGameContext } from '../../context';
import { Audiowide, Orbitron } from 'next/font/google';

const audiowide = Audiowide({ weight: '400', subsets: ['latin'] });
const orbitronBold = Orbitron({ weight: '800', subsets: ['latin'] });
const orbitronSemibold = Orbitron({ weight: '500', subsets: ['latin'] });
const orbitronLight = Orbitron({ weight: '400', subsets: ['latin'] });

const HealthBar = ({ calculateDamage }: { calculateDamage: (attacker: 'cpu' | 'player') => number }) => {
    const context = useGameContext();
    if (context === undefined) throw new Error('useContext(GameContext) must be used within a GameContext.Provider');

    const { game, setGame } = context;

    const healthBarText = (character: 'cpu' | 'player') => {
        const healthLostPerHit = calculateDamage(character === 'cpu' ? 'player' : 'cpu');
        const hitsLeft = Math.ceil(game[character].healthRemaining / healthLostPerHit);
        return `${game[character].healthRemaining} HP • ${hitsLeft} ${hitsLeft === 1 ? 'HIT' : 'HITS'} LEFT`;
    };

    return (
        <motion.div
            className='w-[95%] left-1/2 top-[5%] -translate-x-1/2 -translate-y-1/2 h-6 grid grid-cols-2 gap-2 absolute rounded-full'
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.5, ease: 'easeInOut' }}
        >
            <div className='main-dark-red w-full h-6 rounded-full relative border-2 border-white text-center flex justify-center items-center'>
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(game.player.healthRemaining / game.player.health) * 100}%` }}
                    transition={{ duration: 0.5, ease: 'easeInOut' }}
                    className={`bg-main-red h-5 absolute left-0 rounded-full text-white grid place-items-center`}
                ></motion.div>
                <span className={`${orbitronBold.className} text-white relative text-sm`}>{healthBarText('player')}</span>
                <div className={`${orbitronBold.className} absolute bottom-full w-16 right-2 bg-white text-main-red text-sm px-3 py-2 shadow-xl text-center rounded-t-2xl`}>YOU</div>
            </div>
            <div className='main-dark-red w-full h-6 rounded-full relative border-2 border-white text-center flex justify-center items-center'>
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(game.cpu.healthRemaining / game.cpu.health) * 100}%` }}
                    transition={{ duration: 0.5, ease: 'easeInOut' }}
                    className={`bg-main-red h-5 absolute right-0 rounded-full text-white grid place-items-center text-center`}
                ></motion.div>
                <span className={`${orbitronBold.className} text-white relative text-sm`}>{healthBarText('cpu')}</span>
                <div className={`${orbitronBold.className} absolute bottom-full w-16 left-2 bg-white text-main-red text-sm px-3 py-2 shadow-xl text-center rounded-t-2xl`}>CPU</div>
            </div>
        </motion.div>
    );
};

export default HealthBar;
