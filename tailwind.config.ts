import type { Config } from 'tailwindcss';

export default {
    content: ['./src/pages/**/*.{js,ts,jsx,tsx,mdx}', './src/components/**/*.{js,ts,jsx,tsx,mdx}', './src/app/**/*.{js,ts,jsx,tsx,mdx}'],
    theme: {
        extend: {
            colors: {
                gradient1: '#5fff6c', 
                gradient2: '#d97bfe', 
                gradient3: '#5f9fff', 
            },
            backgroundImage: {
                'moving-gradient': 'linear-gradient(90deg, var(--tw-gradient-stops))',
            },
            animation: {
                'gradient-move': 'gradientBG 3s ease infinite',
            },
            keyframes: {
                gradientBG: {
                    '0%': { 'background-position': '0% 50%' },
                    '50%': { 'background-position': '100% 50%' },
                    '100%': { 'background-position': '0% 50%' },
                },
            },
        },
    },
    plugins: [],
} satisfies Config;
