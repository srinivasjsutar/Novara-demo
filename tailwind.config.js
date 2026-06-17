/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./pages/**/*.{js,jsx,ts,tsx}",   // ← Vike route files live here
  ],
  theme: {
    extend: {
      fontFamily: {
        poppins: ["Poppins"],
        urbanist: ["Urbanist"],
        brushelva: ["Brushelva", "cursive"],
      },
    },
  },
  plugins: [],
};