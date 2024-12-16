import { Settings, Trophy, User } from 'lucide-react';
import { Audiowide } from 'next/font/google';

const audiowide = Audiowide({ weight: '400', subsets: ['latin'] });

const page = () => {
    return (
        <div
            className='flex w-screen h-screen justify-center items-center'
            style={{
                backgroundImage: `
					radial-gradient(circle, rgba(0, 0, 0, 0) 30%, rgba(0, 0, 0, 0.5) 100%), 
					url('/gene-fighters-background.png')
				`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                height: '100vh',
                width: '100vw',
            }}
        >
            <div className='flex flex-col items-center w-full justify-start py-16 px-4 gap-10'>
                <div className={`border-[12px] rounded-[56px] py-3 px-8 border-white drop-shadow-2xl animated-gradient`}>
                    <h1 className={`${audiowide.className} text-8xl text-white drop-shadow-lg`}>GENE FIGHTERS</h1>
                </div>
                <div className={`border-[12px] w-2/5 rounded-[56px] py-3 px-8 border-white drop-shadow-2xl animated-gradient hover:scale-105 transition-all cursor-pointer`}>
                    <h1 className={`${audiowide.className} text-6xl text-white drop-shadow-lg text-center`}>SINGLEPLAYER</h1>
                </div>
                <div className={`border-[12px] w-2/5 rounded-[56px] py-3 px-8 border-white drop-shadow-2xl animated-gradient hover:scale-105 transition-all cursor-pointer`}>
                    <h1 className={`${audiowide.className} text-6xl text-white drop-shadow-lg text-center`}>MULTIPLAYER</h1>
                </div>
            </div>1
            <div className='absolute bottom-4 right-4 flex border-4 rounded-full animated-gradient'>
                <Trophy className='text-white w-16 h-16 rounded-full hover:bg-[rgb(255,255,255,0.2)] py-3.5 pl-[18px] pr-4 cursor-pointer' />
                <User className='text-white w-16 h-16 rounded-full hover:bg-[rgb(255,255,255,0.2)] py-3.5 cursor-pointer' />
                <Settings className='text-white w-16 h-16 rounded-full hover:bg-[rgb(255,255,255,0.2)] py-3.5 pr-[18px] pl-4 cursor-pointer' />
            </div>
        </div>
    );
};

export default page;
