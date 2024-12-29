import { Audiowide, Orbitron } from 'next/font/google';
import { AlleleMap, CurrentStage } from './ParentRollingContainer';
import { motion } from 'framer-motion';
import { useGameContext } from '../context';

const audiowide = Audiowide({ weight: '400', subsets: ['latin'] });
const orbitronBold = Orbitron({ weight: '800', subsets: ['latin'] });
const orbitronSemibold = Orbitron({ weight: '600', subsets: ['latin'] });

type Props = {
    whichParent: 'first' | 'second';
    currentStage: CurrentStage;
    setCurrentStage: React.Dispatch<React.SetStateAction<CurrentStage>>;
    middleColumnVisible: boolean;
    alleleMap: AlleleMap[];
    skipAnimation: boolean;
};

const ParentRoller = ({ whichParent, currentStage, setCurrentStage, middleColumnVisible, alleleMap, skipAnimation }: Props) => {
    const context = useGameContext();
    if (context === undefined) throw new Error('useContext(GameContext) must be used within a GameContext.Provider');

    const { profile, selectedParentAlleles } = context;

    const allelesToString = (type: 'health' | 'strength' | 'defense') => {
        return Object.values(selectedParentAlleles[whichParent][type]).join('');
    };

    return (
        <motion.div
            layout
            animate={{
                width: middleColumnVisible ? '40%' : '40%',
                transition: { duration: 0.5 },
            }}
            className='w-[40%] h-full flex flex-col items-center justify-start rounded-2xl border-[6px] animated-gradient border-white drop-shadow-2xl p-4'
        >
            <h1 className={`${audiowide.className} text-3xl uppercase text-white`}>Parent #{whichParent === 'first' ? '1' : '2'}</h1>
            <div className={`${orbitronSemibold.className} flex flex-col w-full items-start justify-start gap-2`}>
                <h4 className={`${orbitronBold.className} text-white text-xl uppercase`}>
                    <span>ALLELES: </span>
                    <span className='text-main-red brightness-150'>{allelesToString('health')} </span>
                    <span className='text-main-purple brightness-150'>{allelesToString('strength')} </span>
                    <span className='text-main-green brightness-150'>{allelesToString('defense')} </span>
                </h4>
                <div className='flex flex-col gap-4 px-4 w-full'>
                    {alleleMap.map(({ type, color, alleles }, index) => {
                        const percentage = 1 / (profile?.alleles[type]?.length || 2);

                        return (
                            <div key={index + type} className='flex flex-col gap-2'>
                                <h5 className={`uppercase text-main-${color} brightness-150 text-lg`}>{type} ALLELES</h5>
                                <div className='flex gap-2 w-full'>
                                    {alleles.map(({ allele, flash, selected }, i) => {
                                        const unlocked = profile?.alleles[type].includes(allele);

                                        return (
                                            <div key={allele} className='w-full flex flex-col gap-1'>
                                                <div
                                                    className={`${
                                                        (flash && !skipAnimation) || selected ? 'brightness-150 scale-105' : 'brightness-100 scale-100'
                                                    } main-${color} border-[6px] rounded-[12px] border-white text-white uppercase text-md aspect-square w-full transition-all`}
                                                >
                                                    <p className={`${!unlocked ? 'bg-[rgb(0,0,0,.6)]' : ''} w-full h-full rounded-[8px] grid place-items-center text-lg`}>{allele}</p>
                                                </div>
                                                <div
                                                    className={`${
                                                        (flash && !skipAnimation) || selected ? 'brightness-150 scale-105' : 'brightness-100 scale-100'
                                                    } text-white border-[6px] border-white text-[10px] grid place-items-center rounded-[12px] main-${color} h-full`}
                                                >
                                                    <p className={`${!unlocked ? 'bg-[rgb(0,0,0,.6)]' : ''} w-full h-full rounded-[8px] grid place-items-center`}>
                                                        {unlocked ? `${(percentage * 100).toFixed(1)}%` : ''}
                                                    </p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </motion.div>
    );
};

export default ParentRoller;
