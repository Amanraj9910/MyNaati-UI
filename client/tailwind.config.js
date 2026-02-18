/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                // You can extend the theme here if needed, but we used inline colors in some places
                // The teal color is #009382
                primary: '#009382',
                'primary-hover': '#007a6b',
                'primary-light': 'rgba(0, 147, 130, 0.1)',
            }
        },
    },
    plugins: [],
}
