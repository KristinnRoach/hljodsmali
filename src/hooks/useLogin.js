import { useState } from 'react';
import pb from '../db/pb';

export default function useLogin() {
  const [isLoading, setIsLoading] = useState(false);

  async function login({ email, password }) {
    setIsLoading(true);

    try {
      const authData = await pb
        .collection('users')
        .authWithPassword(email, password);
    } catch (e) {
      console.log('error', e);
    }
    setIsLoading(false);
  }

  return { login, isLoading };
}
