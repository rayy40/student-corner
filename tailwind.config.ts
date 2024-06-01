import type { Config } from "tailwindcss";

const defaultTheme = require("tailwindcss/defaultTheme");

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-roboto)", ...defaultTheme.fontFamily.sans],
      },
      colors: {
        background: "hsl(0, 0%, 98%)",
        foreground: "hsl(0, 0%, 13%)",
        border: "hsl(0, 0%, 90%)",
        label: "hsl(0, 0%, 65%)",
        input: "hsl(45, 13%, 94%)",
        error: "hsl(0, 79%, 65%)",
        primary: {
          DEFAULT: "hsl(174, 26%, 50%)",
          foreground: "hsl(0, 0%, 96%)",
          hover: "hsl(174, 26%, 55%)",
        },
        secondary: {
          DEFAULT: "hsl(0, 0%, 98%)",
          foreground: "hsl(0, 0%, 30%)",
          hover: "hsl(0, 0%, 94%)",
        },
        tertiary: {
          foreground: "hsl(0, 0%, 50%)",
        },
        muted: {
          DEFAULT: "hsl(240, 2%, 84%)",
          foreground: "hsl(0, 0%, 60%)",
          hover: "hsl(240, 6%, 80%)",
        },
        code: {
          DEFAULT: "hsl(240, 2%, 82%)",
          foreground: "hsl(0, 0%, 24%)",
        },
      },
      borderRadius: {
        lg: "0.5rem",
        md: "calc(0.5rem - 2px)",
        sm: "calc(0.5rem - 4px)",
      },
      boxShadow: {
        input: "inset 0 0 0 1px rgb(15, 15, 15, 0.1)",
        button:
          "0 5px 10px rgba(154,160,185,.05), 0 15px 40px rgba(166,173,201,.2)",
        light: " 0px 1px 2px rgba(15, 15, 15, 0.05)",
        medium: " 0px 0px 5px rgba(15, 15, 15, 0.2)",
      },
      keyframes: {
        pulse: {
          "50%": { opacity: "0.75" },
        },
      },
    },
  },
};
export default config;
