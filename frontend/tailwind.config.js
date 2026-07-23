/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        paper: "#EEF1EE",
        chart: "#E4E9E3",
        ink: "#1B2A2E",
        inkfaint: "#5B6B6A",
        line: "#C7D0C6",
        teal: {
          DEFAULT: "#2F6F62",
          dark: "#204B42",
          light: "#DCE9E3",
        },
        alert: {
          DEFAULT: "#B23A2E",
          dark: "#7E2A21",
          light: "#F3DEDA",
        },
        amber: "#B8863B",
      },
      fontFamily: {
        display: ["'Zilla Slab'", "Georgia", "serif"],
        body: ["'IBM Plex Sans'", "system-ui", "sans-serif"],
        mono: ["'IBM Plex Mono'", "ui-monospace", "monospace"],
      },
      borderRadius: {
        card: "3px",
      },
    },
  },
  plugins: [],
};
