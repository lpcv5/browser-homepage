import React, { useState } from "react";

const SearchBar = () => {
  const [searchEngine, setSearchEngine] = useState("google");
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    let searchUrl;
    switch (searchEngine) {
      case "google":
        searchUrl = `https://www.google.com/search?q=${encodeURIComponent(
          searchQuery
        )}`;
        break;
      case "bing":
        searchUrl = `https://www.bing.com/search?q=${encodeURIComponent(
          searchQuery
        )}`;
        break;
      default:
        searchUrl = `https://www.google.com/search?q=${encodeURIComponent(
          searchQuery
        )}`;
    }

    window.open(searchUrl, "_blank");
  };

  return (
    <div className="w-full max-w-2xl mb-12">
      {/* 搜索引擎选择器 */}
      <div className="flex justify-center mb-3">
        <div className="bg-white/10 backdrop-blur-md rounded-full p-1 flex">
          <button
            className={`flex items-center px-4 py-1.5 rounded-full transition-all duration-200 ease-in-out ${
              searchEngine === "google" ? "bg-white/30" : "hover:bg-white/10"
            }`}
            onClick={() => setSearchEngine("google")}
          >
            <span className="text-white font-medium">Google</span>
          </button>
          <button
            className={`flex items-center px-4 py-1.5 rounded-full transition-all duration-200 ease-in-out ${
              searchEngine === "bing" ? "bg-white/30" : "hover:bg-white/10"
            }`}
            onClick={() => setSearchEngine("bing")}
          >
            <span className="text-white font-medium">Bing</span>
          </button>
        </div>
      </div>

      <form onSubmit={handleSearch} className="relative">
        <input
          type="text"
          className="w-full bg-white/20 backdrop-blur-lg text-white placeholder-white/70 py-4 px-6 rounded-full border border-white/30 focus:outline-none transition-all duration-300 ease-in-out focus:shadow-[0_0_15px_rgba(255,255,255,0.5)]"
          placeholder="输入搜索内容..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <button
          type="submit"
          className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white p-1"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="8"/>
            <line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
        </button>
      </form>
    </div>
  );
};

export default SearchBar;
