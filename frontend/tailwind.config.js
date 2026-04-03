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
                surface: {
                    DEFAULT: '#000000',
                    card: 'rgba(255, 255, 255, 0.03)',
                    elevated: 'rgba(255, 255, 255, 0.06)',
                }
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
                serif: ['Playfair Display', 'Georgia', 'serif'],
                mono: ['JetBrains Mono', 'Courier New', 'monospace']
            },
            backgroundImage: {
                'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
            }
        }
    },
    plugins: []
}
