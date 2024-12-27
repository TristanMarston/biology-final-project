import { fetchGuestProfile, Profile } from '@/utils/indexedDB';
import { Audiowide } from 'next/font/google';
import React, { createContext, useContext, useEffect, useState } from 'react';
import toast from 'react-hot-toast';

const audiowide = Audiowide({ weight: '400', subsets: ['latin'] });

export type SelectedAlleles = {
    health: { first?: string; second?: string };
    strength: { first?: string; second?: string };
    defense: { first?: string; second?: string };
};

export type SelectedParentAlleles = {
    first: SelectedAlleles;
    second: SelectedAlleles;
}

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
    selectedParentAlleles: SelectedParentAlleles;
    setSelectedParentAlleles: React.Dispatch<React.SetStateAction<SelectedParentAlleles>>;
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
    const [selectedParentAlleles, setSelectedParentAlleles] = useState<SelectedParentAlleles>({ first: { health: {}, strength: {}, defense: {} }, second: { health: {}, strength: {}, defense: {} } });

    useEffect(() => {
        const loadProfile = async () => {
            const data = await fetchGuestProfile();
            setProfile(data);
        };

        loadProfile();
    }, []);

    return <GameContext.Provider value={{ profile, setProfile, statsAndShopModalOpen, setStatsAndShopModalOpen, selectedParentAlleles, setSelectedParentAlleles }}>{children}</GameContext.Provider>;
};
