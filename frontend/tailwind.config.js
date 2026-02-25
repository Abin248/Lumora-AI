/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: "#22424e",
                secondary: "#10B981",
                dark: "#111827",
            }
        },
    },
    plugins: [],
}
