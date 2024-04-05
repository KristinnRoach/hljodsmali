import Link from 'next/link';
import { ReactNode } from 'react';

import styles from './Nav.module.scss';

interface NavProps {
  children: ReactNode;
}

export default function Nav({ children }: NavProps) {
  return (
    <nav className={styles.nav}>
      <Link href="/">Home</Link>
      <Link href="/login">Log in</Link>
      <Link href="/sign-up">Sign up</Link>
      <Link href="/samples">My Samples</Link>
    </nav>
  );
}
