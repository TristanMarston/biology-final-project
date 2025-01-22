import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { Audiowide, Nunito, Orbitron } from 'next/font/google';
import { useEffect, useState } from 'react';

const audiowide = Audiowide({ weight: '400', subsets: ['latin'] });
const orbitronBold = Orbitron({ weight: '800', subsets: ['latin'] });
const orbitronLight = Orbitron({ weight: '500', subsets: ['latin'] });

export type Tab = 'overview' | 'allele selection' | 'fighter stats' | 'gameplay';

const tabs: Tab[] = ['overview', 'allele selection', 'fighter stats', 'gameplay'];

const HelpModal = ({ isOpen, setIsOpen, initialTab }: { isOpen: boolean; setIsOpen: React.Dispatch<React.SetStateAction<{ open: boolean; tab: Tab }>>; initialTab: Tab }) => {
    const [selected, setSelected] = useState<Tab>(initialTab);

    useEffect(() => {
        setSelected(initialTab);
    }, [initialTab]);

    return (
        <AnimatePresence>
            {isOpen && (
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
                        className='border-4 border-white gradient-full text-white p-6 rounded-xl w-full max-w-4xl shadow-xl cursor-default relative overflow-hidden'
                    >
                        <div className='relative z-10'>
                            <X
                                className='absolute right-0 top-0 cursor-pointer'
                                onClick={() =>
                                    setIsOpen((prev) => {
                                        return { ...prev, open: false };
                                    })
                                }
                            />
                            <h3 className={`${audiowide.className} text-4xl width-laptop:text-5xl font-bold text-left mb-4`}>HOW TO PLAY</h3>
                            <div className='flex items-center justify-between w-full flex-wrap rounded-full border-white shadow-xl dark:border-foreground animated-gradient-full mb-4'>
                                {tabs.map((tab) => (
                                    <Chip text={tab} selected={selected === tab} setSelected={setSelected} key={tab} />
                                ))}
                            </div>
                            <div className={`${orbitronLight.className} px-3 tracking-wider mb-3`}>
                                <AnimatePresence>
                                    {selected === 'overview' && (
                                        <div className='flex flex-col gap-2'>
                                            <p className='text-base width-laptop:text-lg'>
                                                Gene Fighters is a turn-based strategy game where you can create your own unique fighter by obtaining different alleles. Each allele
                                                provides a particular stat boost, and they get mixed together to create your own unique fighter.
                                            </p>
                                            <p className='text-base width-laptop:text-lg'>
                                                There are three stat types of alleles that determine the statistics of your fighter: health, strength, and defense. There are 6 alleles
                                                for each of these stat types, and each of these correlate to higher statistics.
                                            </p>
                                            <p className='text-base width-laptop:text-lg'>
                                                For your first time playing the game, you will only have the first and second alleles unlocked. You can unlock the rest of the alleles by
                                                playing the game, winning battles, and earning money that you can spend at the shop. You can see the alleles you have unlocked, and the
                                                cost to buy new ones, in the Shop & Stats menu on the homescreen.
                                            </p>
                                            <p className='text-base width-laptop:text-lg'>
                                                Select the &quot;Allele Selection&quot; tab to see more on how your character is created! We recommend starting a singleplayer game to
                                                see for yourself (this menu will still be available!).
                                            </p>
                                        </div>
                                    )}
                                    {selected === 'allele selection' && (
                                        <div className='flex flex-col gap-2'>
                                            <p className='text-base width-laptop:text-lg'>
                                                In this stage of the game, the alleles for your fighter will be randomly selected. You may only use the alleles that you have purchased.
                                            </p>
                                            <p className='text-base width-laptop:text-lg'>
                                                Each &quot;parent&quot; represents a haploid cell (which contains half the genome). The alleles within each haploid cell, provided by
                                                each parent, will combine to give you the stats for your fighter.
                                            </p>
                                            <p className='text-base width-laptop:text-lg'>
                                                The higher the allele number, the better the stats that you will receive. So, for example, H1 (first health allele) will give you 20 HP,
                                                while H6 (sixth health allele) will give you 100 HP.
                                            </p>
                                            <p className='text-base width-laptop:text-lg'>
                                                Select the &quot;Fighter Stats&quot; tab to see more on how the stats are calculated, and what it means (this menu will still be
                                                available)!
                                            </p>
                                        </div>
                                    )}
                                    {selected === 'fighter stats' && (
                                        <div className='flex flex-col gap-2'>
                                            <p className='text-base width-laptop:text-lg'>
                                                After the alleles for the parent of your fighter have been selected, you will be able to see the stats of your fighter. Each stat will
                                                have a bar, and that bar will indicate how &quot;lucky&quot; you got with your fighter. The bigger the bar, the better the stats.
                                            </p>
                                            <p className='text-base width-laptop:text-lg'>
                                                Each stat is calculated by adding the stats provided by each allele from each parent. For example, if parent #1 gave you S3 (third
                                                strength allele) and S4 (fourth strength allele), your fighter&apos;s overall strength stat will be 205 DMG (90 DMG + 115 DMG).
                                            </p>
                                            <p className='text-base width-laptop:text-lg'>
                                                The &quot;luck&quot; bar will not affect the gameplay, it&apos;s just for you to see how lucky you got on the allele roll.
                                            </p>
                                            <p className='text-base width-laptop:text-lg'>
                                                After your fighter has been created, a CPU will go through the same process to create a fighter. The CPU will have the exact same odds as
                                                you when creating the fighter, though it may have better stats than you. It all depends on luck for this part!
                                            </p>
                                            <p className='text-base width-laptop:text-lg'>
                                                Select the &quot;Gameplay&quot; tab to see how the game is actually played (this menu will still be available)!
                                            </p>
                                        </div>
                                    )}
                                    {selected === 'gameplay' && (
                                        <div className='flex flex-col gap-2'>
                                            <p className='text-base width-laptop:text-lg'>
                                                After the stats for your fighter and the CPU&apos;s fighter have been generated, the game will commence! This game works by attacking the
                                                CPU to reduce its health. To win the game, you must reduce the CPU&apos;s health to 0 without losing your health.
                                            </p>
                                            <p className='text-base width-laptop:text-lg'>
                                                In order to launch an attack, you must win a minigame, which is randomly selected. Press the &quot;Begin Game&quot; button on the screen 
                                                roll which minigame you&apos;re going to play. There are 6 minigame options, and each minigame should take roughly 30-60s.
                                            </p>
                                            <p className='text-base width-laptop:text-lg'>
                                                Each minigame will have an objective, and if you fail to meet this objective, then you will forfeit your attack to the CPU. The CPU has
                                                no other means of attacking you. This means that the fate of the game is entirely in your hands! Each minigame will have specific
                                                instructions, so be sure to read them carefully!
                                            </p>
                                            <p className='text-base width-laptop:text-lg'>
                                                The damage you inflict on the CPU is determined by the stats of your fighter. The damage is determined by the strength stat minus the
                                                opponent&apos;s defense stat. For example, if your fighter has 100 DMG and the CPU has 50 DEF, then you will inflict 50 DMG to the CPU.
                                                If the opponent has more defense than you do strength, then you will inflict the minimum 25 DMG.
                                            </p>
                                        </div>
                                    )}
                                </AnimatePresence>
                            </div>
                            <button
                                onClick={() => {
                                    setIsOpen((prev) => {
                                        return { ...prev, open: false };
                                    });
                                }}
                                className={`${orbitronBold.className} w-full text-lg text-white animated-gradient p-3 border-[6px] border-white rounded-xl uppercase cursor-pointer text-nowrap hover:brightness-125 transition-all`}
                            >
                                CLOSE
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

const Chip = ({ text, selected, setSelected }: { text: Tab; selected: boolean; setSelected: React.Dispatch<React.SetStateAction<Tab>> }) => {
    return (
        <button
            onClick={() => setSelected(text)}
            className={`${selected ? 'text-white' : 'text-white'} ${
                orbitronBold.className
            } uppercase tracking-wider text-[15px] transition-all relative py-2 rounded-full w-1/4 max-mablet:text-sm hover:scale-105`}
        >
            <span className='relative z-10'>{text}</span>
            {selected && (
                <motion.span
                    layoutId='pill-tab'
                    transition={{ type: 'spring', duration: 0.5 }}
                    className='absolute inset-0 z-0 rounded-full border-2 border-white w-full dark:bg-foreground'
                ></motion.span>
            )}
        </button>
    );
};

export default HelpModal;
