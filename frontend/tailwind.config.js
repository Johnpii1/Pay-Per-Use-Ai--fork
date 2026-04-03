/** @type {import('tailwindcss').Config} */
export default {
    content: ["./index.html", "./src/**/*.{js,jsx}"],
    theme: {
        extend: {
            colors: {
                algo: {
                    blue: '#00BFFF',
                    dark: '#0a0a1a',
                    card: '#111827',
                    border: '#1f2937',
                }
            },
            fontFamily: {
                mono: ['JetBrains Mono', 'Courier New', 'monospace']
            }
        }
    },
    plugins: []
}
