import React, { useState, useEffect, useCallback, memo } from "react";
import { useContextMenu } from "../../contexts/ContextMenuContext";
import {
  getFavicon,
  trackVisitedSite,
  generateLetterIconDataUrl,
} from "../../utils/faviconService";

const ShortcutItem = memo(({ shortcut }) => {
  const { showContextMenu } = useContextMenu();
  const [favicon, setFavicon] = useState(shortcut.favicon);
  const [isLoading, setIsLoading] = useState(false);
  const [loadAttempted, setLoadAttempted] = useState(false);

  // 立即生成字母图标作为初始状态
  useEffect(() => {
    if (!favicon && !shortcut.favicon) {
      const letter = shortcut.name.charAt(0).toUpperCase();
      // 使用URL的哈希值生成一致的颜色
      const colors = [
        "#4285f4",
        "#ea4335",
        "#fbbc05",
        "#34a853",
        "#673ab7",
        "#ff6d00",
        "#2196f3",
      ];
      const colorIndex =
        shortcut.url
          .split("")
          .reduce((sum, char) => sum + char.charCodeAt(0), 0) % colors.length;

      const letterIcon = generateLetterIconDataUrl(letter, colors[colorIndex]);
      if (letterIcon) {
        setFavicon(letterIcon);
      }
    }
  }, [shortcut.name, shortcut.url, favicon, shortcut.favicon]);

  // 异步获取网站图标
  useEffect(() => {
    const loadFavicon = async () => {
      // 如果已经尝试加载过，且当前有图标，则跳过
      if (loadAttempted && favicon) return;

      // 如果当前图标是从shortcut.favicon获取的，也跳过
      if (
        favicon === shortcut.favicon &&
        shortcut.favicon &&
        !shortcut.favicon.startsWith("data:image/png;base64,")
      )
        return;

      if (!isLoading) {
        setIsLoading(true);
        try {
          const faviconUrl = await getFavicon(shortcut.url);

          // 只有当获取到的图标不是数据URL（即不是生成的字母图标）时才更新
          // 或者当前没有图标时
          if (
            faviconUrl &&
            (!faviconUrl.startsWith("data:image/png;base64,") || !favicon)
          ) {
            setFavicon(faviconUrl);

            // Favicon updates are now handled by the useFaviconUpdates hook
          }
        } catch (error) {
          console.error("加载图标失败:", error);
        } finally {
          setIsLoading(false);
          setLoadAttempted(true);
        }
      }
    };

    // 延迟加载以优先显示界面
    const timer = setTimeout(loadFavicon, 100);
    return () => clearTimeout(timer);
  }, [
    shortcut.url,
    favicon,
    isLoading,
    loadAttempted,
    shortcut.id,
    shortcut.favicon,
  ]);

  // 当shortcut.favicon更新时，更新本地状态
  useEffect(() => {
    if (shortcut.favicon && shortcut.favicon !== favicon) {
      setFavicon(shortcut.favicon);
    }
  }, [shortcut.favicon, favicon]);

  const handleContextMenu = useCallback((e) => {
    showContextMenu(e, shortcut);
  }, [showContextMenu, shortcut]);

  // 处理点击事件
  const handleClick = useCallback(() => {
    // 记录用户点击的快捷方式
    trackVisitedSite(shortcut.url);
  }, [shortcut.url]);

  return (
    <a
      href={shortcut.url}
      className="flex flex-col items-center transition-all duration-300 ease-in-out hover:-translate-y-1"
      target="_blank"
      rel="noopener noreferrer"
      onContextMenu={handleContextMenu}
      onClick={handleClick}
    >
      <div className="w-12 h-12 rounded-full mb-2 overflow-hidden relative">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-700/50 z-10">
            <div className="animate-pulse w-6 h-6 bg-white/30 rounded-full"></div>
          </div>
        )}

        {favicon ? (
          <img
            src={favicon}
            alt={shortcut.name}
            className="w-full h-full object-cover"
            onError={() => {
              // 只在非数据URL的情况下重置
              if (!favicon.startsWith("data:")) {
                setFavicon(null);
                setLoadAttempted(false); // 允许重新尝试
                // Favicon error handling - updates managed by hook
              }
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-700/50 text-white text-xl font-bold">
            {shortcut.name.charAt(0).toUpperCase()}
          </div>
        )}
      </div>
      <span className="text-white text-sm font-medium text-center">
        {shortcut.name}
      </span>
    </a>
  );
});

export default ShortcutItem;
