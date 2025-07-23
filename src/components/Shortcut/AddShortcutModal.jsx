import React, { useState, useEffect } from "react";
import { getFavicon } from "../../utils/faviconService";

const AddShortcutModal = ({ visible, onClose, onAdd, editingShortcut }) => {
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [favicon, setFavicon] = useState(null);

  useEffect(() => {
    if (editingShortcut) {
      setName(editingShortcut.name || "");
      setUrl(editingShortcut.url || "");
      setFavicon(editingShortcut.favicon || null);
    } else {
      setName("");
      setUrl("");
      setFavicon(null);
    }
  }, [editingShortcut, visible]);

  // 当URL改变时尝试获取favicon
  useEffect(() => {
    if (!url) return;

    // 检查URL是否有效
    try {
      // 确保URL格式正确
      let formattedUrl = url;
      if (!/^https?:\/\//i.test(url)) {
        formattedUrl = "https://" + url;
      }

      new URL(formattedUrl); // 验证URL格式

      // 异步获取favicon
      const loadFavicon = async () => {
        try {
          const faviconUrl = await getFavicon(formattedUrl);
          setFavicon(faviconUrl);
        } catch (error) {
          console.error("获取图标失败:", error);
          setFavicon(null);
        }
      };

      loadFavicon();
    } catch (error) {
      // URL格式无效，不获取favicon
      console.error("无效的URL:", url);
    }
  }, [url]);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!name.trim() || !url.trim()) return;

    // 确保 URL 有 http:// 或 https:// 前缀
    let formattedUrl = url;
    if (!/^https?:\/\//i.test(url)) {
      formattedUrl = "https://" + url;
    }

    onAdd({
      id: editingShortcut ? editingShortcut.id : Date.now(),
      name: name.trim(),
      url: formattedUrl,
      favicon: favicon,
    });

    setName("");
    setUrl("");
    setFavicon(null);
    onClose();
  };

  if (!visible) return null;

  // 显示favicon预览
  const renderFaviconPreview = () => {
    if (!url) return null;

    return (
      <div className="mb-4 flex items-center">
        <span className="text-sm font-medium text-gray-700 mr-3">
          图标预览:
        </span>
        {favicon ? (
          <img
            src={favicon}
            alt="Site icon"
            className="w-10 h-10 rounded-full object-cover"
            onError={() => setFavicon(null)}
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
            <span className="text-gray-600 font-bold">
              {name ? name.charAt(0).toUpperCase() : "?"}
            </span>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-md p-6 relative">
        <button
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
          onClick={onClose}
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
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
        <h3 className="text-xl font-bold mb-4">
          {editingShortcut ? "编辑快捷方式" : "添加快捷方式"}
        </h3>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label
              htmlFor="shortcut-name"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              名称
            </label>
            <input
              type="text"
              id="shortcut-name"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="mb-4">
            <label
              htmlFor="shortcut-url"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              URL
            </label>
            <input
              type="url"
              id="shortcut-url"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              placeholder="https://"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
          </div>

          {renderFaviconPreview()}

          <div className="flex justify-end">
            <button
              type="button"
              className="mr-2 px-4 py-2 text-gray-600 hover:text-gray-800"
              onClick={onClose}
            >
              取消
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              {editingShortcut ? "保存" : "添加"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddShortcutModal;
