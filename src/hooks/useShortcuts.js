import { useCallback } from 'react';
import { useLocalStorage } from './useLocalStorage';

/**
 * Custom hook for managing shortcuts with optimized operations
 * @returns {Object} Shortcuts state and operations
 */
export const useShortcuts = () => {
  const [shortcuts, setShortcuts] = useLocalStorage('shortcuts', []);

  // Add or update shortcut with memoized callback
  const addShortcut = useCallback((newShortcut) => {
    setShortcuts(prevShortcuts => {
      const existingIndex = prevShortcuts.findIndex(s => s.id === newShortcut.id);
      
      if (existingIndex >= 0) {
        // Update existing shortcut
        const updated = [...prevShortcuts];
        updated[existingIndex] = newShortcut;
        return updated;
      } else {
        // Add new shortcut
        return [...prevShortcuts, newShortcut];
      }
    });
  }, [setShortcuts]);

  // Delete shortcut with memoized callback
  const deleteShortcut = useCallback((shortcutId) => {
    setShortcuts(prevShortcuts => 
      prevShortcuts.filter(s => s.id !== shortcutId)
    );
  }, [setShortcuts]);

  // Update shortcut favicon with memoized callback
  const updateShortcutFavicon = useCallback((shortcutId, faviconUrl) => {
    setShortcuts(prevShortcuts =>
      prevShortcuts.map(s =>
        s.id === shortcutId ? { ...s, favicon: faviconUrl } : s
      )
    );
  }, [setShortcuts]);

  // Get shortcut by ID with memoized callback
  const getShortcutById = useCallback((shortcutId) => {
    return shortcuts.find(s => s.id === shortcutId);
  }, [shortcuts]);

  // Batch update shortcuts (useful for favicon updates)
  const batchUpdateShortcuts = useCallback((updates) => {
    setShortcuts(prevShortcuts => {
      const updatedShortcuts = [...prevShortcuts];
      
      updates.forEach(({ id, updates: shortcutUpdates }) => {
        const index = updatedShortcuts.findIndex(s => s.id === id);
        if (index >= 0) {
          updatedShortcuts[index] = { ...updatedShortcuts[index], ...shortcutUpdates };
        }
      });
      
      return updatedShortcuts;
    });
  }, [setShortcuts]);

  return {
    shortcuts,
    addShortcut,
    deleteShortcut,
    updateShortcutFavicon,
    getShortcutById,
    batchUpdateShortcuts,
  };
};
