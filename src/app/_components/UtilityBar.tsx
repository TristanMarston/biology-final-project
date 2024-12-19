import { Trophy, User, Settings, CircleHelp, ShoppingCart } from 'lucide-react';
import { useGameContext } from '../context';

export type IconVisibility = {
    leaderboard: boolean;
    shop: boolean;
    help: boolean;
    user: boolean;
    settings: boolean;
};

const BottomUtilityBar = ({ visibility, position }: { visibility: IconVisibility; position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' }) => {
    const context = useGameContext();
    if (context === undefined) throw new Error('useContext(GameContext) must be used within a GameContext.Provider');

    const { statsAndShopModalOpen, setStatsAndShopModalOpen } = context;
    const { leaderboard, shop, help, user, settings } = visibility;
    const absoluteClasses = position === 'top-left' ? 'top-4 left-4' : position === 'top-right' ? 'top-4 right-4' : position === 'bottom-left' ? 'bottom-4 left-4' : 'bottom-4 right-4';

    return (
        <div className={`absolute ${absoluteClasses} flex border-4 rounded-full animated-gradient [&>*:first-child]:pl-1.5 [&>*:first-child]:pr-0.5 [&>*:first-child]:mablet:pl-2 [&>*:first-child]:mablet:pr-1.5 [&>*:first-child]:rounded-l-full [&>*:last-child]:pr-1.5 [&>*:last-child]:pl-0.5 [&>*:last-child]:mablet:pr-2 [&>*:last-child]:mablet:pl-1.5 [&>*:last-child]:rounded-r-full`}>
            {leaderboard && <Trophy className='text-white w-10 h-10 mablet:w-12 mablet:h-12 py-2 mablet:py-2.5 hover:bg-[rgb(255,255,255,0.2)] transition-colors cursor-pointer' />}
            {shop && (
                <ShoppingCart
                    onClick={() => {
                        setStatsAndShopModalOpen(true);
                    }}
                    className='text-white w-10 h-10 mablet:w-12 mablet:h-12 py-2 mablet:py-2.5 hover:bg-[rgb(255,255,255,0.2)] transition-colors cursor-pointer'
                />
            )}
            {help && <CircleHelp className='text-white w-10 h-10 mablet:w-12 mablet:h-12 py-2 mablet:py-2.5 hover:bg-[rgb(255,255,255,0.2)] transition-colors cursor-pointer' />}
            {user && <User className='text-white w-10 h-10 mablet:w-12 mablet:h-12 py-2 mablet:py-2.5 hover:bg-[rgb(255,255,255,0.2)] transition-colors cursor-pointer' />}
            {settings && <Settings className='text-white w-10 h-10 mablet:w-12 mablet:h-12 py-2 mablet:py-2.5 hover:bg-[rgb(255,255,255,0.2)] transition-colors cursor-pointer' />}
        </div>
    );
};

export default BottomUtilityBar;
