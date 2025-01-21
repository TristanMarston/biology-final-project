import type { Config } from 'tailwindcss';

export default {
    content: ['./src/pages/**/*.{js,ts,jsx,tsx,mdx}', './src/components/**/*.{js,ts,jsx,tsx,mdx}', './src/app/**/*.{js,ts,jsx,tsx,mdx}'],
    theme: {
        extend: {
            screens: {
                'width-min': '1000px',
                'width-ipad': '1080px',
                'width-laptop': '1280px',
                'width-desktop': '1440px',
                'width-monitor': '1600px',
                'height-min': { raw: '(min-height: 650px)' },
                'height-ipad': { raw: '(min-height: 690px)' },
                'height-tablet': { raw: '(min-height: 725px)' },
                'height-laptop': { raw: '(min-height: 750px)' },
                'height-desktop': { raw: '(min-height: 800px)' },
                // screens: {
                //     height: {
                //         'min': '(min-height: 650px)',
                //         'ipad': '(min-height: 690px)',
                //         'laptop': '(min-height: 750px)',
                //     },
                // },

                // small: '350px',
                // phone: '420px',
                // mobile: '500px',
                // medium: '600px',
                // mablet: '720px',
                // tablet: '800px',
                // lablet: '920px',
                // laptop: '1080px',
                // desktop: '1280px',
                // monitor: '1600px',
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
