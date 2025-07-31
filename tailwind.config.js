/** @type {import('tailwindcss').Config} */
module.exports = {
  presets: [require("nativewind/preset")],
  content: [
    "./App.{js,jsx,ts,tsx}",
    "./app/**/*.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
    "./src/screens/**/*.{js,jsx,ts,tsx}",
    "./src/components/**/*.{js,jsx,ts,tsx}",
    "./src/context/**/*.{js,jsx,ts,tsx}",
    "./src/hooks/**/*.{js,jsx,ts,tsx}",
    "./src/utils/**/*.{js,jsx,ts,tsx}",
    "./src/assets/**/*.{js,jsx,ts,tsx}",
    "./src/constants/**/*.{js,jsx,ts,tsx}",
    "./src/routes/**/*.{js,jsx,ts,tsx}",
    "./src/services/**/*.{js,jsx,ts,tsx}",
    "./src/types/**/*.{js,jsx,ts,tsx}",
    "./src/utils/**/*.{js,jsx,ts,tsx}",
    "./src/assets/**/*.{js,jsx,ts,tsx}",
    "./src/constants/**/*.{js,jsx,ts,tsx}",
    "./src/routes/**/*.{js,jsx,ts,tsx}",
    "./src/screens/customer/**/*.{js,jsx,ts,tsx}",
    "./src/screens/admin/**/*.{js,jsx,ts,tsx}",
    "./src/screens/professional/**/*.{js,jsx,ts,tsx}",
    "./src/screens/auth/**/*.{js,jsx,ts,tsx}",
    "./src/screens/common/**/*.{js,jsx,ts,tsx}",
    "./src/screens/splash/**/*.{js,jsx,ts,tsx}",
    "./src/screens/onboarding/**/*.{js,jsx,ts,tsx}",
    

  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
