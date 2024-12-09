import { useEffect, useState } from 'react';

export function useLocalStorage(key: string) {
  const [value, setValue] = useState(() => {
    // get data from local storage
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  });

  useEffect(() => {
    // store data in local storage
    localStorage.setItem(key, JSON.stringify(value));
  }, [value, key]);

  return [value, setValue];
}
