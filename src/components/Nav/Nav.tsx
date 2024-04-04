import Link from 'next/link';
import PocketBase from 'pocketbase';
import { useState, useEffect } from 'react';

import styles from './Nav.module.scss';

// FÆRA POCKETBASE DÓT
const pb = new PocketBase(process.env.DATABASE_URL);

export default function Nav({ children }: { children: React.ReactNode }) {
  const [pocketbase, setPocketbase] = useState(0);

  useEffect(() => {
    pb.authStore.loadFromCookie(document.cookie);
    setPocketbase(pb);
  }, []);

  return (
    <nav className={styles.nav}>
      <Link href="/">Home</Link>
      <Link href="/login">Log in</Link>
      <Link href="/sign-up">Sign up</Link>
      <Link href="/samples">My Samples</Link>
    </nav>
  );
}
