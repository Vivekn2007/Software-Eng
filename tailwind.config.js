// tailwind.config.js
module.exports = {
  content: [
    "./views/**/*.{html,ejs}",   // scan your EJS templates
    "./public/**/*.{js,css}",    // scan your JS/CSS files
  ],
  theme: {
    extend: {
      fontFamily: {
        times: ['"Times New Roman"', 'serif'],
      },
      colors: {
        brandBlue: "#061E29",
        brandGray: "#F3F4F4",
      },
      keyframes: {
        slideLeft: {
          "0%": { transform: "translateX(-100%)", opacity: "0" },
          "100%": { transform: "translateX(0)", opacity: "1" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
      },
      animation: {
        slideLeft: "slideLeft 0.3s linear",
        fadeIn: "fadeIn 0.5s ease-in",
      },
    },
  },
  plugins: [],
};
