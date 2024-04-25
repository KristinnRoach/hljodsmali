'use client';

import { useState } from 'react';
import pb from '../lib/pb';

export default function useLogin() {
  const [isLoading, setIsLoading] = useState(false);

  async function login({ username, password }) {
    setIsLoading(true);

    try {
      await pb.collection('users').authWithPassword(username, password);
    } catch (e) {
      console.log('error', e);
    }
    setIsLoading(false);
  }

  return { login, isLoading };
}
