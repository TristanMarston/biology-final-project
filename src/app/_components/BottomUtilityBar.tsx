import { Trophy, User, Settings, CircleHelp, ShoppingCart } from 'lucide-react';
import { useGameContext } from '../context';

export type IconVisibility = {
    leaderboard: boolean;
    shop: boolean;
    help: boolean;
    user: boolean;
    settings: boolean;
};

const BottomUtilityBar = ({ visibility }: { visibility: IconVisibility }) => {
    const context = useGameContext();
    if (context === undefined) throw new Error('useContext(GameContext) must be used within a GameContext.Provider');

    const { statsAndShopModalOpen, setStatsAndShopModalOpen } = context;

    return (
        <div className='absolute bottom-4 right-4 flex border-4 rounded-full animated-gradient [&>*:first-child]:pl-1.5 [&>*:first-child]:pr-0.5 [&>*:first-child]:mablet:pl-2 [&>*:first-child]:mablet:pr-1.5 [&>*:first-child]:rounded-l-full [&>*:last-child]:pr-1.5 [&>*:last-child]:pl-0.5 [&>*:last-child]:mablet:pr-2 [&>*:last-child]:mablet:pl-1.5 [&>*:last-child]:rounded-r-full'>
            {visibility.leaderboard && (
                <Trophy className='text-white w-10 h-10 mablet:w-12 mablet:h-12 py-2 mablet:py-2.5 hover:bg-[rgb(255,255,255,0.2)] transition-colors cursor-pointer' />
            )}
            {visibility.shop && (
                <ShoppingCart
                    onClick={() => {
                        setStatsAndShopModalOpen(true);
                    }}
                    className='text-white w-10 h-10 mablet:w-12 mablet:h-12 py-2 mablet:py-2.5 hover:bg-[rgb(255,255,255,0.2)] transition-colors cursor-pointer'
                />
            )}
            {visibility.help && (
                <CircleHelp className='text-white w-10 h-10 mablet:w-12 mablet:h-12 py-2 mablet:py-2.5 hover:bg-[rgb(255,255,255,0.2)] transition-colors cursor-pointer' />
            )}
            {visibility.user && <User className='text-white w-10 h-10 mablet:w-12 mablet:h-12 py-2 mablet:py-2.5 hover:bg-[rgb(255,255,255,0.2)] transition-colors cursor-pointer' />}
            {visibility.settings && (
                <Settings className='text-white w-10 h-10 mablet:w-12 mablet:h-12 py-2 mablet:py-2.5 hover:bg-[rgb(255,255,255,0.2)] transition-colors cursor-pointer' />
            )}
        </div>
    );
};

export default BottomUtilityBar;
