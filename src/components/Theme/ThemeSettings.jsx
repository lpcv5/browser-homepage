import React from "react";
import { useTheme } from "../../contexts/ThemeContext";

const ThemeSettings = () => {
  const { updateBackground } = useTheme();

  return (
    <div className="absolute top-6 right-6 flex gap-3">
      <button
        className="bg-white/20 backdrop-blur-lg p-2 rounded-full text-white hover:bg-white/30 transition"
        onClick={updateBackground}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="23 4 23 10 17 10"></polyline>
          <polyline points="1 20 1 14 7 14"></polyline>
          <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
        </svg>
      </button>
    </div>
  );
};

export default ThemeSettings;
