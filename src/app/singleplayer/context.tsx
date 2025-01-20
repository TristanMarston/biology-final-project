import { fetchGuestProfile, Profile } from '@/utils/indexedDB';
import { Audiowide } from 'next/font/google';
import React, { createContext, useContext, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { ShopStats } from '../context';

const audiowide = Audiowide({ weight: '400', subsets: ['latin'] });

export type SelectedAlleles = {
    health: string;
    strength: string;
    defense: string;
};

export type SelectedParentAlleles = {
    first: SelectedAlleles;
    second: SelectedAlleles;
};

export type PastMinigame = {
    name: string;
    roundNum: number;
};

export type Game = {
    player: {
        healthRemaining: number;
        health: number;
        strength: number;
        defense: number;
        currentTurn: boolean;
    };
    cpu: {
        healthRemaining: number;
        health: number;
        strength: number;
        defense: number;
        currentTurn: boolean;
    };
    game: {
        number: number;
        gameRound: number;
        gameRoundHistory: { won: number; lost: number }[];
        gamesWon: PastMinigame[];
        gamesLost: PastMinigame[];
        gamesLeft: string[];
        selectedGame: string | null;
        stage: 'not-started' | 'selecting-game' | 'game-selected' | 'game-playing';
        gameWon: 'player' | 'cpu' | 'playing';
    };
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

export const availableGames = ['target-clicker', 'trivia-challenge', 'reaction-speed-test', 'math-challenge', 'word-unscramble', 'memory-game'];
// export const availableGames = ['math-challenge', 'word-unscramble'];

type Context = {
    profile: Profile | null;
    setProfile: React.Dispatch<React.SetStateAction<Profile | null>>;
    statsAndShopModalOpen: boolean;
    setStatsAndShopModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
    selectedParentAlleles: SelectedParentAlleles;
    setSelectedParentAlleles: React.Dispatch<React.SetStateAction<SelectedParentAlleles>>;
    selectedCPUParentAlleles: SelectedParentAlleles;
    setSelectedCPUParentAlleles: React.Dispatch<React.SetStateAction<SelectedParentAlleles>>;
    game: Game;
    setGame: React.Dispatch<React.SetStateAction<Game>>;
    statsQuicklookModalOpen: {
        open: boolean;
        character: 'cpu' | 'player';
    };
    setStatsQuicklookModalOpen: React.Dispatch<
        React.SetStateAction<{
            open: boolean;
            character: 'cpu' | 'player';
        }>
    >;
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
    const [selectedParentAlleles, setSelectedParentAlleles] = useState<SelectedParentAlleles>({
        first: { health: '', strength: '', defense: '' },
        second: { health: '', strength: '', defense: '' },
        // first: { health: 'H1', strength: 'S2', defense: 'D2' },
        // second: { health: 'H2', strength: 'S1', defense: 'D2' },
    });
    const [selectedCPUParentAlleles, setSelectedCPUParentAlleles] = useState<SelectedParentAlleles>({
        first: { health: '', strength: '', defense: '' },
        second: { health: '', strength: '', defense: '' },
        // first: { health: 'H1', strength: 'S2', defense: 'D2' },
        // second: { health: 'H2', strength: 'S1', defense: 'D2' },
    });
    const [game, setGame] = useState<Game>({
        player: {
            healthRemaining: 0,
            health: 0,
            strength: 0,
            defense: 0,
            currentTurn: true,
        },
        cpu: {
            healthRemaining: 0,
            health: 0,
            strength: 0,
            defense: 0,
            currentTurn: false,
        },
        game: {
            number: 1,
            gameRound: 1,
            gameRoundHistory: [],
            gamesWon: [],
            gamesLost: [],
            gamesLeft: availableGames,
            selectedGame: null,
            stage: 'not-started',
            gameWon: 'playing',
        },
    });
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
    const [statsQuicklookModalOpen, setStatsQuicklookModalOpen] = useState<{
        open: boolean;
        character: 'cpu' | 'player';
    }>({ open: false, character: 'player' });

    useEffect(() => {
        const loadProfile = async () => {
            const data = await fetchGuestProfile();
            setProfile(data);
        };

        loadProfile();
    }, []);

    useEffect(() => {
        if ((game.player.healthRemaining <= 0 || game.cpu.healthRemaining <= 0) && game.game.gameWon === 'playing' && game.game.gamesWon.length + game.game.gamesLost.length > 0) {
            setGame((prev) => {
                return {
                    ...prev,
                    game: {
                        ...prev.game,
                        gameWon: game.player.healthRemaining <= 0 ? 'cpu' : game.cpu.healthRemaining <= 0 ? 'player' : 'playing',
                    },
                };
            });
        }
    }, [game]);

    return (
        <GameContext.Provider
            value={{
                profile,
                setProfile,
                statsAndShopModalOpen,
                setStatsAndShopModalOpen,
                selectedParentAlleles,
                setSelectedParentAlleles,
                selectedCPUParentAlleles,
                setSelectedCPUParentAlleles,
                game,
                setGame,
                statsQuicklookModalOpen,
                setStatsQuicklookModalOpen,
                shopStats,
            }}
        >
            {children}
        </GameContext.Provider>
    );
};
