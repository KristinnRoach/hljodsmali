import { useState } from 'react';
import pb from '../db/pb';

export default function useLogout() {
  const [loggedOut, setLoggedOut] = useState(false); // dummy for triggering rerender

  function logout() {
    pb.authStore.clear();
    setLoggedOut(!loggedOut);
  }

  return logout;
}
