/** @type {import('tailwindcss').Config} */
export default {
    content: ["./index.html", "./src/**/*.{js,jsx}"],
    theme: {
        extend: {
            colors: {
                brand: {
                    purple: '#7c3aed',
                    violet: '#6366f1',
                    indigo: '#818cf8',
                    light: '#a78bfa',
                },
                neo: {
                    ink: '#111111',
                    cream: '#fff7df',
                    yellow: '#fff06a',
                    pink: '#ff5ea8',
                    blue: '#5f4bff',
                    green: '#a7f3d0',
                    muted: '#4b5563',
                },
                surface: {
                    DEFAULT: '#000000',
                    card: 'rgba(255, 255, 255, 0.03)',
                    elevated: 'rgba(255, 255, 255, 0.06)',
                }
            },
            fontFamily: {
                sans: ['Space Grotesk', 'Inter', 'system-ui', 'sans-serif'],
                serif: ['Playfair Display', 'Georgia', 'serif'],
                mono: ['JetBrains Mono', 'Courier New', 'monospace']
            },
            backgroundImage: {
                'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
            },
            borderWidth: {
                3: '3px',
            },
            boxShadow: {
                brutal: '9px 9px 0 #111111',
                'brutal-sm': '5px 5px 0 #111111',
                'brutal-lg': '14px 14px 0 #111111',
            }
        }
    },
    plugins: []
}
