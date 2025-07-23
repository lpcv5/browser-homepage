import React, { createContext, useState, useContext, useEffect } from "react";

const ThemeContext = createContext();

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }) => {
  const [background, setBackground] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // 获取必应每日一图
  const fetchBingDailyImage = async () => {
    try {
      setIsLoading(true);

      // 必应每日一图API URL
      const bingApiUrl =
        "https://www.bing.com/HPImageArchive.aspx?format=js&idx=0&n=1&mkt=zh-CN";

      // 使用代理服务器请求API（避免跨域问题）
      // 在实际项目中，你需要替换这个URL为你自己的代理服务器URL
      // 或者使用服务端渲染时直接获取
      const proxyUrl = "https://cors-proxy.example.com/"; // 替换为实际的代理

      // 直接构建图片URL（由于跨域限制，在前端直接调用API可能会失败）
      // 使用从你的API响应中提供的格式
      const baseUrl = "https://www.bing.com";

      // 在实际环境中，你应该通过API请求获取实际的图片路径
      // const response = await fetch(proxyUrl + bingApiUrl);
      // const data = await response.json();
      // const imageUrl = baseUrl + data.images[0].url;

      // 根据你提供的数据，直接使用这个URL
      const imageUrl =
        baseUrl +
        "/th?id=OHR.VaticanCity_ZH-CN3075109504_1920x1080.jpg&rf=LaDigue_1920x1080.jpg&pid=hp";

      setBackground(`url('${imageUrl}')`);
      setIsLoading(false);
    } catch (error) {
      console.error("获取必应每日一图失败:", error);
      // 失败时使用随机图片作为备选
      getRandomImage();
    }
  };

  // 获取随机图片
  const getRandomImage = () => {
    setIsLoading(true);
    const timestamp = new Date().getTime();
    const randomImageUrl = `https://source.unsplash.com/random/1920x1080?nature,${timestamp}`;

    // 创建一个Image对象来预加载图片
    const img = new Image();
    img.onload = () => {
      setBackground(`url('${randomImageUrl}')`);
      setIsLoading(false);
    };
    img.onerror = () => {
      console.error("加载随机图片失败");
      setIsLoading(false);
    };
    img.src = randomImageUrl;
  };

  // 初始加载时获取必应每日一图
  useEffect(() => {
    fetchBingDailyImage();

    // 可选：每天自动更新一次图片
    const updateInterval = 24 * 60 * 60 * 1000; // 24小时
    const intervalId = setInterval(fetchBingDailyImage, updateInterval);

    return () => clearInterval(intervalId);
  }, []);

  return (
    <ThemeContext.Provider
      value={{ background, isLoading, fetchBingDailyImage, getRandomImage }}
    >
      <div
        id="backdrop"
        className="fixed top-0 left-0 w-full h-full bg-cover bg-center transition-[background-image] duration-500 ease-in-out before:content-[''] before:absolute before:top-0 before:left-0 before:w-full before:h-full before:bg-black/30"
        style={{ backgroundImage: background }}
      ></div>
      {isLoading && (
        <div className="fixed inset-0 flex items-center justify-center z-10">
          <div className="bg-white/20 backdrop-blur-md p-3 rounded-full">
            <svg
              className="animate-spin h-6 w-6 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
          </div>
        </div>
      )}
      {children}
    </ThemeContext.Provider>
  );
};
