import typography from '@tailwindcss/typography';
import containerQueries from '@tailwindcss/container-queries';
import animate from 'tailwindcss-animate';

/** @type {import('tailwindcss').Config} */
export default {
    darkMode: ['class'],
    content: ['index.html', 'src/**/*.{js,ts,jsx,tsx,html,css}'],
    theme: {
        container: {
            center: true,
            padding: '2rem',
            screens: {
                '2xl': '1400px'
            }
        },
        extend: {
            colors: {
                border: 'hsl(var(--border))',
                input: 'hsl(var(--input))',
                ring: 'hsl(var(--ring) / <alpha-value>)',
                background: 'hsl(var(--background))',
                foreground: 'hsl(var(--foreground))',
                primary: {
                    DEFAULT: 'hsl(var(--primary) / <alpha-value>)',
                    foreground: 'hsl(var(--primary-foreground))'
                },
                secondary: {
                    DEFAULT: 'hsl(var(--secondary) / <alpha-value>)',
                    foreground: 'hsl(var(--secondary-foreground))'
                },
                destructive: {
                    DEFAULT: 'hsl(var(--destructive) / <alpha-value>)',
                    foreground: 'hsl(var(--destructive-foreground))'
                },
                muted: {
                    DEFAULT: 'hsl(var(--muted) / <alpha-value>)',
                    foreground: 'hsl(var(--muted-foreground) / <alpha-value>)'
                },
                accent: {
                    DEFAULT: 'hsl(var(--accent) / <alpha-value>)',
                    foreground: 'hsl(var(--accent-foreground))'
                },
                popover: {
                    DEFAULT: 'hsl(var(--popover))',
                    foreground: 'hsl(var(--popover-foreground))'
                },
                card: {
                    DEFAULT: 'hsl(var(--card))',
                    foreground: 'hsl(var(--card-foreground))'
                },
                chart: {
                    1: 'hsl(var(--chart-1))',
                    2: 'hsl(var(--chart-2))',
                    3: 'hsl(var(--chart-3))',
                    4: 'hsl(var(--chart-4))',
                    5: 'hsl(var(--chart-5))'
                }
            },
            borderRadius: {
                lg: 'var(--radius)',
                md: 'calc(var(--radius) - 2px)',
                sm: 'calc(var(--radius) - 4px)'
            },
            boxShadow: {
                'quantum-red': '0 0 28px oklch(0.55 0.25 25 / 0.7), 0 0 56px oklch(0.55 0.25 25 / 0.5)',
                'quantum-gold': '0 0 28px oklch(0.65 0.15 70 / 0.7), 0 0 56px oklch(0.65 0.15 70 / 0.5)',
                'quantum-purple': '0 0 28px oklch(0.45 0.18 310 / 0.7), 0 0 56px oklch(0.45 0.18 310 / 0.5)',
                'holographic': '0 18px 55px oklch(0.55 0.25 25 / 0.4), 0 0 110px oklch(0.65 0.15 70 / 0.3)',
                'blazing': '0 0 40px oklch(0.55 0.25 25 / 0.8), 0 0 80px oklch(0.65 0.15 70 / 0.6)'
            },
            keyframes: {
                'accordion-down': {
                    from: { height: '0' },
                    to: { height: 'var(--radix-accordion-content-height)' }
                },
                'accordion-up': {
                    from: { height: 'var(--radix-accordion-content-height)' },
                    to: { height: '0' }
                },
                'quantum-pulse': {
                    '0%, 100%': { 
                        opacity: '1',
                        transform: 'scale(1)'
                    },
                    '50%': { 
                        opacity: '0.88',
                        transform: 'scale(1.08)'
                    }
                },
                'blazing-glow': {
                    '0%, 100%': {
                        boxShadow: '0 0 40px oklch(0.55 0.25 25 / 0.8), 0 0 80px oklch(0.65 0.15 70 / 0.6)'
                    },
                    '50%': {
                        boxShadow: '0 0 70px oklch(0.55 0.25 25 / 1), 0 0 140px oklch(0.65 0.15 70 / 0.8)'
                    }
                },
                'float': {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-14px)' }
                }
            },
            animation: {
                'accordion-down': 'accordion-down 0.2s ease-out',
                'accordion-up': 'accordion-up 0.2s ease-out',
                'quantum-pulse': 'quantum-pulse 2.3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                'blazing-glow': 'blazing-glow 2.5s ease-in-out infinite',
                'float': 'float 3.2s ease-in-out infinite'
            }
        }
    },
    plugins: [typography, containerQueries, animate]
};

