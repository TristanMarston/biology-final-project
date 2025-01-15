import { fetchGuestProfile, Profile } from '@/utils/indexedDB';
import { Audiowide } from 'next/font/google';
import { createContext, useContext, useEffect, useState } from 'react';
import toast from 'react-hot-toast';

const audiowide = Audiowide({ weight: '400', subsets: ['latin'] });

export type ShopStats = {
    health: { allele: string; quantity: number; cost: number }[];
    strength: { allele: string; quantity: number; cost: number }[];
    defense: { allele: string; quantity: number; cost: number }[];
};

export const failToast = (message: string) => {
    toast.error(message, {
        duration: 4000,
        position: 'top-center',
        className: `${audiowide.className} uppercase text-left !text-white border-4 border-white animated-gradient-full-important text-lg w-full`,
    });
};

// this helper function takes in a string message, then displays a toast with a check, representing success
export const successToast = (message: string) => {
    toast.success(message, {
        duration: 4000,
        position: 'top-center',
        className: `${audiowide.className} uppercase text-left !text-white border-4 border-white animated-gradient-full-important text-lg w-full`,
    });
};

type Context = {
    profile: Profile | null;
    setProfile: React.Dispatch<React.SetStateAction<Profile | null>>;
    statsAndShopModalOpen: boolean;
    setStatsAndShopModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
    shopStats: ShopStats;
};

const GameContext = createContext<Context | undefined>(undefined);

export const useGameContext = () => useContext(GameContext);

export const GameProvider = ({ children }: any) => {
    const [profile, setProfile] = useState<Profile | null>({
        money: 0,
        games: [],
        alleles: {
            health: ['H1', 'H2'],
            strength: ['S1', 'S2'],
            defense: ['D1', 'D2'],
        },
    });
    const [statsAndShopModalOpen, setStatsAndShopModalOpen] = useState(false);
    const shopStats = {
        health: [
            { allele: 'H1', quantity: 20, cost: 0 },
            { allele: 'H2', quantity: 30, cost: 0 },
            { allele: 'H3', quantity: 45, cost: 25 },
            { allele: 'H4', quantity: 60, cost: 75 },
            { allele: 'H5', quantity: 75, cost: 125 },
            { allele: 'H6', quantity: 100, cost: 200 },
        ],
        strength: [
            { allele: 'S1', quantity: 25, cost: 0 },
            { allele: 'S2', quantity: 50, cost: 0 },
            { allele: 'S3', quantity: 90, cost: 25 },
            { allele: 'S4', quantity: 115, cost: 75 },
            { allele: 'S5', quantity: 130, cost: 125 },
            { allele: 'S6', quantity: 150, cost: 200 },
        ],
        defense: [
            { allele: 'D1', quantity: 50, cost: 0 },
            { allele: 'D2', quantity: 75, cost: 0 },
            { allele: 'D3', quantity: 110, cost: 25 },
            { allele: 'D4', quantity: 135, cost: 75 },
            { allele: 'D5', quantity: 150, cost: 125 },
            { allele: 'D6', quantity: 160, cost: 200 },
        ],
    };

    useEffect(() => {
        const loadProfile = async () => {
            const data = await fetchGuestProfile();
            setProfile(data);
        };

        loadProfile();
    }, []);

    return <GameContext.Provider value={{ profile, setProfile, statsAndShopModalOpen, setStatsAndShopModalOpen, shopStats }}>{children}</GameContext.Provider>;
};
