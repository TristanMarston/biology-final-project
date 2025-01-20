import { Audiowide, Orbitron } from 'next/font/google';
import { useGameContext } from '../../context';
import { updateGuestProfile } from '@/utils/indexedDB';

const audiowide = Audiowide({ weight: '400', subsets: ['latin'] });
const orbitronBold = Orbitron({ weight: '800', subsets: ['latin'] });
const orbitronSemibold = Orbitron({ weight: '500', subsets: ['latin'] });

type PastGame = { name: string; roundNum: number; won: boolean };

const GameOverScreen = () => {
    const context = useGameContext();
    if (context === undefined) throw new Error('useContext(GameContext) must be used within a GameContext.Provider');

    const { game, profile, setProfile } = context;
    if (game.game.gameWon === 'playing') return;
    const moneyRewards = { win: 100, lose: 25 };
    const gameWon = game.game.gameWon === 'player';

    const pastGamesMap: PastGame[] = [
        ...game.game.gamesLost.map(({ name, roundNum }) => ({ name, roundNum, won: false })),
        ...game.game.gamesWon.map(({ name, roundNum }) => ({ name, roundNum, won: true })),
    ].sort((a, b) => a.roundNum - b.roundNum);

    return (
        <div className='w-3/4 h-full p-6 flex flex-col justify-center gap-6 items-center'>
            <h1 className={`${audiowide.className} text-white text-6xl text-center uppercase`}>{game.game.gameWon} wins!</h1>
            <div style={{ display: 'grid', gridTemplateRows: `repeat(${pastGamesMap.length}, 1fr)`, rowGap: '8px' }}>
                <div>
                    <h4 className={`${orbitronBold.className} text-white text-3xl`}>GAME HISTORY</h4>
                    <div className='w-full rounded-full h-1 bg-white' />
                </div>
                {pastGamesMap.map(({ name, roundNum, won }) => (
                    <span key={name + roundNum} className='flex items-center gap-2'>
                        <div
                            className={`${orbitronBold.className} ${won ? 'bg-green-400' : 'bg-red-400'} ${
                                roundNum === 1 ? 'pl-2.5 pt-0.5' : 'grid place-items-center'
                            } w-8 h-8 rounded-full border-2 border-white shadow-md text-white`}
                        >
                            {roundNum}
                        </div>
                        <span className={`${orbitronSemibold.className} uppercase text-white text-2xl`}>{name.replaceAll('-', ' ')}</span>
                    </span>
                ))}
            </div>
            <button
                onClick={async () => {
                    const updatedProfile = await updateGuestProfile({
                        games: [...(profile?.games || []), { mode: 'singleplayer', won: gameWon }],
                        money: (profile?.money || 0) + (gameWon ? moneyRewards.win : moneyRewards.lose),
                    });
                    setProfile(updatedProfile);
                    window.location.href = '/';
                }}
                className={`${orbitronBold.className} px-12 mt-4 text-lg text-white animated-gradient p-3 border-[6px] border-white rounded-xl uppercase transition-all cursor-pointer text-nowrap hover:brightness-125 hover:scale-105`}
            >
                accept {gameWon ? moneyRewards.win : moneyRewards.lose} coins
            </button>
        </div>
    );
};

export default GameOverScreen;
