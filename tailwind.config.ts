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
        base: "#5b8c5a",
        "base-light": "#89b046",
        "base-lime": "#cfdc30",
        dark: "#0d1f22",
        beige: "#fff1db",
        aris: "#91b884",
      },
      fontFamily: {
        baloo: ['"Baloo 2"', "sans-serif"],
      },
      screens: {
        xs: "480px",
      },
    },
  },
  plugins: [],
};
export default config;
