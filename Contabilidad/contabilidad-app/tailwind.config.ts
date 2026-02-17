import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        murcia: {
          blue: "#0064B5",
          red: "#E30613",
          light: "#F5F5F5",
          dark: "#333333",
        },
      },
      fontFamily: {
        murcia: ["'Murcia'", "Arial", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
