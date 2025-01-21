import { Audiowide, Orbitron } from 'next/font/google';
import { useGameContext } from '../context';
import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

const audiowide = Audiowide({ weight: '400', subsets: ['latin'] });
const orbitronBold = Orbitron({ weight: '800', subsets: ['latin'] });
const orbitronSemibold = Orbitron({ weight: '500', subsets: ['latin'] });
const orbitronLight = Orbitron({ weight: '400', subsets: ['latin'] });

const StatsDisplay = ({ character, from }: { character: 'cpu' | 'player'; from: 'display' | 'modal' }) => {
    const context = useGameContext();
    if (context === undefined) throw new Error('useContext(GameContext) must be used within a GameContext.Provider');

    const { selectedParentAlleles, selectedCPUParentAlleles, shopStats, profile } = context;
    const [hovered, setHovered] = useState<'health' | 'strength' | 'defense' | 'luck' | null>(null);
    const [statsShown, setStatsShown] = useState<'player' | 'cpu'>(character);
    const alleles = { player: selectedParentAlleles, cpu: selectedCPUParentAlleles };

    const mapInfo = {
        health: {
            color: 'red',
            unit: 'HP',
            alleles: { first: alleles[statsShown].first.health, second: alleles[statsShown].second.health },
            quantities: {
                first: shopStats.health.find((map) => map.allele === alleles[statsShown].first.health)?.quantity,
                second: shopStats.health.find((map) => map.allele === alleles[statsShown].second.health)?.quantity,
            },
            highestPossibleStat: shopStats.health.find((map) => map.allele === profile?.alleles.health[profile?.alleles.health.length - 1])?.quantity,
            lowestPossibleStat: shopStats.health.find((map) => map.allele === profile?.alleles.health[0])?.quantity,
        },
        strength: {
            color: 'purple',
            unit: 'DMG',
            alleles: { first: alleles[statsShown].first.strength, second: alleles[statsShown].second.strength },
            quantities: {
                first: shopStats.strength.find((map) => map.allele === alleles[statsShown].first.strength)?.quantity,
                second: shopStats.strength.find((map) => map.allele === alleles[statsShown].second.strength)?.quantity,
            },
            highestPossibleStat: shopStats.strength.find((map) => map.allele === profile?.alleles.strength[profile?.alleles.strength.length - 1])?.quantity,
            lowestPossibleStat: shopStats.strength.find((map) => map.allele === profile?.alleles.strength[0])?.quantity,
        },
        defense: {
            color: 'green',
            unit: 'DEF',
            alleles: { first: alleles[statsShown].first.defense, second: alleles[statsShown].second.defense },
            quantities: {
                first: shopStats.defense.find((map) => map.allele === alleles[statsShown].first.defense)?.quantity,
                second: shopStats.defense.find((map) => map.allele === alleles[statsShown].second.defense)?.quantity,
            },
            highestPossibleStat: shopStats.defense.find((map) => map.allele === profile?.alleles.defense[profile?.alleles.defense.length - 1])?.quantity,
            lowestPossibleStat: shopStats.defense.find((map) => map.allele === profile?.alleles.defense[0])?.quantity,
        },
        luck: {
            color: 'blue',
            unit: '%',
            alleles: { first: '', second: '' },
            quantities: {
                first: 0,
                second: 0,
            },
            highestPossibleStat: 1,
            lowestPossibleStat: 0,
        },
    };

    return (
        <div className='animated-gradient border-[12px] rounded-[56px] py-3 px-8 border-white drop-shadow-2xl w-full h-full flex flex-col gap-3'>
            <h3 className={`${audiowide.className} ${from === 'modal' ? 'text-2xl' : 'text-xl width-ipad:text-[22px] width-laptop:text-2xl'} text-white uppercase flex gap-3`}>
                <span className={`${statsShown === 'player' ? 'text-white' : 'text-gray-300'} cursor-pointer`} onClick={() => setStatsShown('player')}>
                    YOUR CHARACTER
                </span>
                <span className={`${statsShown === 'cpu' ? 'text-white' : 'text-gray-300'} cursor-pointer`} onClick={() => setStatsShown('cpu')}>
                    CPU
                </span>
            </h3>
            {Object.keys(mapInfo).map((type) => {
                const { color, unit, alleles, quantities } = mapInfo[type as 'health' | 'strength' | 'defense' | 'luck'];

                const percentages = {
                    health:
                        ((mapInfo.health.quantities.first ? mapInfo.health.quantities.first : 0) +
                            (mapInfo.health.quantities.second ? mapInfo.health.quantities.second : 0) -
                            (mapInfo.health.lowestPossibleStat !== undefined ? mapInfo.health.lowestPossibleStat * 2 : 0)) /
                        (mapInfo.health.highestPossibleStat !== undefined
                            ? mapInfo.health.highestPossibleStat * 2 - (mapInfo.health.lowestPossibleStat !== undefined ? mapInfo.health.lowestPossibleStat * 2 : 0)
                            : shopStats.health[5].quantity),
                    strength:
                        ((mapInfo.strength.quantities.first ? mapInfo.strength.quantities.first : 0) +
                            (mapInfo.strength.quantities.second ? mapInfo.strength.quantities.second : 0) -
                            (mapInfo.strength.lowestPossibleStat !== undefined ? mapInfo.strength.lowestPossibleStat * 2 : 0)) /
                        (mapInfo.strength.highestPossibleStat !== undefined
                            ? mapInfo.strength.highestPossibleStat * 2 - (mapInfo.strength.lowestPossibleStat !== undefined ? mapInfo.strength.lowestPossibleStat * 2 : 0)
                            : shopStats.strength[5].quantity),
                    defense:
                        ((mapInfo.defense.quantities.first ? mapInfo.defense.quantities.first : 0) +
                            (mapInfo.defense.quantities.second ? mapInfo.defense.quantities.second : 0) -
                            (mapInfo.defense.lowestPossibleStat !== undefined ? mapInfo.defense.lowestPossibleStat * 2 : 0)) /
                        (mapInfo.defense.highestPossibleStat !== undefined
                            ? mapInfo.defense.highestPossibleStat * 2 - (mapInfo.defense.lowestPossibleStat !== undefined ? mapInfo.defense.lowestPossibleStat * 2 : 0)
                            : shopStats.defense[5].quantity),
                    luck: 0,
                };

                percentages.luck = (percentages.health + percentages.strength + percentages.defense) / 3;
                const displayText =
                    type !== 'luck'
                        ? `${(quantities.first ? quantities.first : 0) + (quantities.second ? quantities.second : 0)} ${unit}`
                        : `${(percentages.luck * 10).toFixed(1)} / 10`;

                return (
                    <div className='flex gap-2 pl-4 items-center' key={type}>
                        <h4
                            className={`${orbitronBold.className} ${
                                from === 'modal' ? 'text-xl' : 'text-base width-ipad:text-lg width-laptop:text-xl'
                            } text-main-${color} brightness-150 uppercase w-full max-w-[11vw] width-desktop:max-w-[9.5vw]`}
                        >
                            {type}:{' '}
                        </h4>
                        <AnimatePresence>
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className={`${
                                    from === 'modal' ? 'h-12 border-[6px]' : 'h-10 border-[5px] width-laptop:h-12 width-laptop:border-[6px]'
                                } w-full border-white rounded-full`}
                            >
                                <div
                                    onMouseEnter={() => setHovered(type as 'health' | 'strength' | 'defense' | 'luck' | null)}
                                    onMouseLeave={() => setHovered(null)}
                                    className={`w-full h-full main-dark-${color} rounded-full flex justify-start text-center relative`}
                                >
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${percentages[type as 'health' | 'strength' | 'defense' | 'luck'] * 100}%` }}
                                        transition={{ duration: 1.5, ease: 'easeInOut' }}
                                        className={`${orbitronBold.className} ${
                                            from === 'modal' ? 'h-9' : 'h-[30px] width-laptop:h-9'
                                        } main-${color} absolute left-0 rounded-full text-white grid place-items-center`}
                                    >
                                        <span className={`${from === 'modal' ? 'text-base' : 'text-sm width-laptop:text-base'} text-nowrap`}>
                                            {percentages[type as 'health' | 'strength' | 'defense' | 'luck'] > 0.1 ? displayText : ''}
                                        </span>
                                    </motion.div>
                                    <div className='w-full grid place-items-center'>
                                        <span className={`${orbitronBold.className} ${from === 'modal' ? 'text-base' : 'text-sm width-laptop:text-base'} text-white`}>
                                            {percentages[type as 'health' | 'strength' | 'defense' | 'luck'] <= 0.1 ? displayText : ''}
                                        </span>
                                        <AnimatePresence>
                                            {hovered === type && (
                                                <motion.div
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, y: 10 }}
                                                    transition={{ duration: 0.2 }}
                                                    onMouseEnter={() => setHovered(hovered === type ? null : (type as 'health' | 'strength' | 'defense' | 'luck' | null))}
                                                    className={`${orbitronLight.className} absolute bottom-full mb-2 main-${color} text-white text-sm px-3 py-2 rounded-md shadow-xl text-center`}
                                                >
                                                    {type !== 'luck' && (
                                                        <div>
                                                            <span>
                                                                {alleles.first} & {alleles.second} ={' '}
                                                            </span>
                                                            <span className={orbitronSemibold.className}>
                                                                {quantities.first} {unit} + {quantities.second} {unit} ={' '}
                                                            </span>
                                                            <span className={orbitronBold.className}>
                                                                {(quantities.first ? quantities.first : 0) + (quantities.second ? quantities.second : 0)} {unit}
                                                            </span>
                                                        </div>
                                                    )}
                                                    <div>
                                                        {type !== 'luck' ? (
                                                            <>
                                                                <span>LUCK SCORE = </span>
                                                                <span>{(percentages[type as 'health' | 'strength' | 'defense' | 'luck'] * 10).toFixed(1)} / 10</span>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <span>AVG OF </span>
                                                                <span className={orbitronSemibold.className}>
                                                                    {(percentages.health * 10).toFixed(1)} & {(percentages.strength * 10).toFixed(1)} &{' '}
                                                                    {(percentages.defense * 10).toFixed(1)}
                                                                </span>
                                                                <span className={orbitronBold.className}> = {(percentages.luck * 10).toFixed(1)} / 10</span>
                                                            </>
                                                        )}
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                </div>
                            </motion.div>
                        </AnimatePresence>
                    </div>
                );
            })}
        </div>
    );
};

export default StatsDisplay;
