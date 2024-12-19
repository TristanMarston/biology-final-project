import { openDB } from 'idb';

const DATABASE_NAME = 'geneFightersDB';
const STORE_NAME = 'guestData';

export type Profile = {
    money: number;
    games: Game[];
    alleles: AlleleObject;
};

export type Game = {
    mode: 'singleplayer' | 'multiplayer';
    won: boolean;
};

export type AlleleObject = {
    health: String[];
    defense: String[];
    strength: String[];
};

type UpdatedData = {
    money?: number;
    alleles?: AlleleObject;
};

// Initialize or open IndexedDB
export const initDB = async () => {
    return openDB(DATABASE_NAME, 1, {
        upgrade(db) {
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME, { keyPath: 'id' });
            }
        },
    });
};

// Add a guest profile for the first-time visitor
export const createGuestProfile = async () => {
    const db = await initDB();

    const existingProfile = await db.get(STORE_NAME, 'guest');
    if (!existingProfile) {
        const defaultProfile = {
            id: 'guest',
            money: 0,
            games: [],
            alleles: {
                health: ['H1', 'H2'],
                strength: ['S1', 'S2'],
                defense: ['D1', 'D2'],
            },
        };

        await db.put(STORE_NAME, defaultProfile);
        return defaultProfile;
    }
    return existingProfile;
};

// Fetch the guest profile
export const fetchGuestProfile = async () => {
    const db = await initDB();
    return db.get(STORE_NAME, 'guest');
};

// Update guest profile with new data
export const updateGuestProfile = async (updatedData: UpdatedData) => {
    const db = await initDB();
    const currentProfile = await db.get(STORE_NAME, 'guest');
    const newProfile = { ...currentProfile, ...updatedData };
    await db.put(STORE_NAME, newProfile);
    return newProfile;
};

export const addAlleleToProfile = async (type: string, newAllele: string) => {
    const validTypes = ['health', 'strength', 'defense'];

    if (!validTypes.includes(type)) {
        throw new Error(`Invalid type: ${type}. Must be one of ${validTypes.join(', ')}`);
    }

    const db = await initDB();
    const guestData = await db.get(STORE_NAME, 'guest');
    if (!guestData) {
        throw new Error('Guest profile not found. Please ensure the profile exists.');
    }

    const alleles = guestData.alleles[type];
    if (!alleles.includes(newAllele)) alleles.push(newAllele);

    // Reorder the alleles (numerical order)
    alleles.sort((a: string, b: string) => {
        const numA = parseInt(a.slice(1));
        const numB = parseInt(b.slice(1));
        return numA - numB;
    });

    guestData.alleles[type] = alleles;
    await db.put(STORE_NAME, guestData);

    return guestData.alleles[type];
};
