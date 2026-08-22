/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx}',
    './components/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        rose: '#A9714F',   // لون طيني/ترابي ناعم — بدل الوردي
        ink: '#3A2E26',    // بني غامق دافئ — بدل الأسود
        soft: '#F4ECE0',   // بيج/كريمي فاتح — بدل الرمادي الفاتح
        cream: '#FBF6EE',  // خلفية الصفحة الرئيسية
      },
      fontFamily: {
        arabic: ['var(--font-arabic)'],
        english: ['var(--font-english)'],
      },
    },
  },
  plugins: [],
};