import { useEffect, useCallback, useRef } from 'react';
import { checkLastVisitedSite } from '../utils/faviconService';

/**
 * Custom hook for managing favicon updates with optimized event handling
 * @param {Function} onFaviconUpdate - Callback when favicon needs to be updated
 * @param {Array} shortcuts - Current shortcuts array
 */
export const useFaviconUpdates = (onFaviconUpdate, shortcuts) => {
  const shortcutsRef = useRef(shortcuts);
  
  // Keep shortcuts reference updated
  useEffect(() => {
    shortcutsRef.current = shortcuts;
  }, [shortcuts]);

  // Memoized favicon check function
  const checkForFaviconUpdates = useCallback(async () => {
    try {
      const result = await checkLastVisitedSite();
      if (result && result.url && result.faviconUrl) {
        // Find matching shortcut and update its favicon
        const matchingShortcut = shortcutsRef.current.find(
          shortcut => shortcut.url === result.url
        );
        
        if (matchingShortcut && matchingShortcut.favicon !== result.faviconUrl) {
          onFaviconUpdate(matchingShortcut.id, result.faviconUrl);
        }
      }
    } catch (error) {
      console.error('Error checking for favicon updates:', error);
    }
  }, [onFaviconUpdate]);

  // Memoized event handlers
  const handleFocus = useCallback(() => {
    checkForFaviconUpdates();
  }, [checkForFaviconUpdates]);

  const handleVisibilityChange = useCallback(() => {
    if (document.visibilityState === 'visible') {
      checkForFaviconUpdates();
    }
  }, [checkForFaviconUpdates]);

  // Setup event listeners and initial check
  useEffect(() => {
    // Initial check
    checkForFaviconUpdates();

    // Add event listeners
    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Cleanup event listeners
    return () => {
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [handleFocus, handleVisibilityChange, checkForFaviconUpdates]);

  return { checkForFaviconUpdates };
};
