import React from "react";

const AddShortcutButton = ({ onClick }) => {
  return (
    <button
      className="mt-8 bg-white/20 backdrop-blur-lg text-white py-2 px-6 rounded-full border border-white/30 flex items-center gap-2 hover:bg-white/30 transition"
      onClick={onClick}
    >
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <line x1="12" y1="5" x2="12" y2="19"/>
        <line x1="5" y1="12" x2="19" y2="12"/>
      </svg>
      <span>添加快捷方式</span>
    </button>
  );
};

export default AddShortcutButton;
