import { useState, useCallback } from 'react';

/**
 * Custom hook for managing modal state with optimized operations
 * @param {*} initialEditingItem - Initial item being edited (optional)
 * @returns {Object} Modal state and operations
 */
export const useModal = (initialEditingItem = null) => {
  const [isVisible, setIsVisible] = useState(false);
  const [editingItem, setEditingItem] = useState(initialEditingItem);

  // Open modal with optional editing item
  const openModal = useCallback((item = null) => {
    setEditingItem(item);
    setIsVisible(true);
  }, []);

  // Close modal and reset editing item
  const closeModal = useCallback(() => {
    setIsVisible(false);
    setEditingItem(null);
  }, []);

  // Toggle modal visibility
  const toggleModal = useCallback(() => {
    setIsVisible(prev => !prev);
    if (isVisible) {
      setEditingItem(null);
    }
  }, [isVisible]);

  // Set editing item without opening modal
  const setEditingItemOnly = useCallback((item) => {
    setEditingItem(item);
  }, []);

  return {
    isVisible,
    editingItem,
    openModal,
    closeModal,
    toggleModal,
    setEditingItem: setEditingItemOnly,
  };
};
