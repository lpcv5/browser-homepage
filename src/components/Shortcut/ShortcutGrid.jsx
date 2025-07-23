import React, { memo, useCallback } from "react";
import ShortcutItem from "./ShortcutItem";
import { useContextMenu, ContextMenu } from "../../contexts/ContextMenuContext";

const ShortcutGrid = memo(({
  shortcuts,
  onEditShortcut,
  onDeleteShortcut,
}) => {
  return (
    <>
      <div
        className="grid grid-cols-3 sm:grid-cols-6 md:grid-cols-8 gap-6 w-full max-w-4xl"
        id="shortcuts-container"
      >
        {shortcuts.map((shortcut) => (
          <ShortcutItem
            key={shortcut.id}
            shortcut={shortcut}
          />
        ))}
      </div>

      <ContextMenu>
        {(data, hideMenu) => (
          <>
            <div
              className="py-2 px-4 cursor-pointer flex items-center gap-2 text-gray-800 transition-colors duration-200 hover:bg-gray-100"
              onClick={() => {
                if (data) {
                  onEditShortcut(data.id);
                  hideMenu();
                }
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
              </svg>
              编辑
            </div>
            <div
              className="py-2 px-4 cursor-pointer flex items-center gap-2 text-red-600 transition-colors duration-200 hover:bg-gray-100"
              onClick={() => {
                if (data) {
                  onDeleteShortcut(data.id);
                  hideMenu();
                }
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              </svg>
              删除
            </div>
          </>
        )}
      </ContextMenu>
    </>
  );
});

export default ShortcutGrid;
