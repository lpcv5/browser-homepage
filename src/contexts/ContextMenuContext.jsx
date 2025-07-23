import React, { createContext, useState, useContext, useEffect } from "react";

const ContextMenuContext = createContext();

export const useContextMenu = () => useContext(ContextMenuContext);

export const ContextMenuProvider = ({ children }) => {
  const [contextMenu, setContextMenu] = useState({
    visible: false,
    position: { x: 0, y: 0 },
    data: null,
  });

  const showContextMenu = (e, data) => {
    e.preventDefault();
    setContextMenu({
      visible: true,
      position: { x: e.clientX, y: e.clientY },
      data,
    });
  };

  const hideContextMenu = () => {
    setContextMenu({
      visible: false,
      position: { x: 0, y: 0 },
      data: null,
    });
  };

  useEffect(() => {
    document.addEventListener("click", hideContextMenu);
    return () => {
      document.removeEventListener("click", hideContextMenu);
    };
  }, []);

  return (
    <ContextMenuContext.Provider
      value={{ contextMenu, showContextMenu, hideContextMenu }}
    >
      {children}
    </ContextMenuContext.Provider>
  );
};

export const ContextMenu = ({ children }) => {
  const { contextMenu, hideContextMenu } = useContextMenu();

  if (!contextMenu.visible) return null;

  return (
    <div
      className="absolute z-[1000] bg-white rounded-lg shadow-[0_4px_12px_rgba(0,0,0,0.15)] py-2 min-w-[150px] animate-[fadeIn_0.15s_ease]"
      style={{ top: contextMenu.position.y, left: contextMenu.position.x }}
      onClick={(e) => e.stopPropagation()}
    >
      {typeof children === "function"
        ? children(contextMenu.data, hideContextMenu)
        : children}
    </div>
  );
};
