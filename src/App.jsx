import React, { useCallback, memo, lazy, Suspense } from "react";
import Clock from "./components/Clock";
import SearchBar from "./components/SearchBar";
import ShortcutGrid from "./components/Shortcut/ShortcutGrid";
import AddShortcutButton from "./components/Shortcut/AddShortcutButton";
import ThemeSettings from "./components/Theme/ThemeSettings";
import { ThemeProvider } from "./contexts/ThemeContext";
import { ContextMenuProvider } from "./contexts/ContextMenuContext";
import { useShortcuts } from "./hooks/useShortcuts";
import { useFaviconUpdates } from "./hooks/useFaviconUpdates";
import { useModal } from "./hooks/useModal";

// Lazy load the modal component for better performance
const AddShortcutModal = lazy(() => import("./components/Shortcut/AddShortcutModal"));

const App = () => {
  // Custom hooks for state management
  const {
    shortcuts,
    addShortcut,
    deleteShortcut,
    updateShortcutFavicon,
    getShortcutById,
  } = useShortcuts();

  const { isVisible: modalVisible, editingItem: editingShortcut, openModal, closeModal } = useModal();

  // Setup favicon updates with optimized event handling
  useFaviconUpdates(updateShortcutFavicon, shortcuts);

  // Memoized event handlers to prevent unnecessary re-renders
  const handleAddShortcut = useCallback((newShortcut) => {
    addShortcut(newShortcut);
    closeModal();
  }, [addShortcut, closeModal]);

  const handleEditShortcut = useCallback((shortcutId) => {
    const shortcut = getShortcutById(shortcutId);
    if (shortcut) {
      openModal(shortcut);
    }
  }, [getShortcutById, openModal]);

  const handleDeleteShortcut = useCallback((shortcutId) => {
    deleteShortcut(shortcutId);
  }, [deleteShortcut]);

  const handleOpenModal = useCallback(() => {
    openModal();
  }, [openModal]);

  return (
    <ThemeProvider>
      <ContextMenuProvider>
        <div className="relative min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 py-12">
          <Clock />
          <SearchBar />
          <ShortcutGrid
            shortcuts={shortcuts}
            onEditShortcut={handleEditShortcut}
            onDeleteShortcut={handleDeleteShortcut}
          />
          <AddShortcutButton onClick={handleOpenModal} />
          <ThemeSettings />
        </div>

        <AddShortcutModal
          visible={modalVisible}
          onClose={closeModal}
          onAdd={handleAddShortcut}
          editingShortcut={editingShortcut}
        />
      </ContextMenuProvider>
    </ThemeProvider>
  );
};

export default App;
