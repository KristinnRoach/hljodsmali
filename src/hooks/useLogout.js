'use client';

import { useState } from 'react';
import pb from '../lib/pb';

export default function useLogout() {
  const [loggedOut, setLoggedOut] = useState(false); // dummy for triggering rerender

  function logout() {
    pb.authStore.clear();
    setLoggedOut(!loggedOut);
  }

  return logout;
}
