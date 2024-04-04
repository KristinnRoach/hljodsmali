import Link from 'next/link';
import PocketBase from 'pocketbase';
import { useState, useEffect } from 'react';

import styles from './Nav.module.scss';

export default function Nav({ children }: { children: React.ReactNode }) {
  return (
    <nav className={styles.nav}>
      <Link href="/">Home</Link>
      <Link href="/login">Log in</Link>
      <Link href="/sign-up">Sign up</Link>
      <Link href="/samples">My Samples</Link>
    </nav>
  );
}
