
import { useState, useEffect } from 'react';

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  };

  const removeValue = () => {
    try {
      window.localStorage.removeItem(key);
      setStoredValue(initialValue);
    } catch (error) {
      console.error(`Error removing localStorage key "${key}":`, error);
    }
  };

  return [storedValue, setValue, removeValue] as const;
}

export const clearAllDocuments = () => {
  const keys = Object.keys(localStorage);
  keys.forEach(key => {
    if (key.startsWith('document_') || key.startsWith('project_docs_')) {
      localStorage.removeItem(key);
    }
  });
};

export const getStorageUsage = () => {
  let totalSize = 0;
  for (let key in localStorage) {
    if (localStorage.hasOwnProperty(key)) {
      totalSize += localStorage[key].length + key.length;
    }
  }
  return {
    used: totalSize,
    usedMB: (totalSize / (1024 * 1024)).toFixed(2),
    available: 10 * 1024 * 1024 - totalSize, // Assuming 10MB limit
    availableMB: ((10 * 1024 * 1024 - totalSize) / (1024 * 1024)).toFixed(2)
  };
};
