import type { Config } from 'tailwindcss';

export default {
    content: ['./src/pages/**/*.{js,ts,jsx,tsx,mdx}', './src/components/**/*.{js,ts,jsx,tsx,mdx}', './src/app/**/*.{js,ts,jsx,tsx,mdx}'],
    theme: {
        extend: {
            screens: {
                small: '350px',
                phone: '420px',
                mobile: '500px',
                medium: '600px',
                mablet: '720px',
                tablet: '800px',
                lablet: '920px',
                laptop: '1080px',
                desktop: '1280px',
                monitor: '1600px',
            },
            colors: {
                'main-red': '#f17474',
                'main-purple': '#d97bfe',
                'main-green': '#53df5f',
                'main-blue': '#537ddf',
            },
        },
    },
    plugins: [],
} satisfies Config;
