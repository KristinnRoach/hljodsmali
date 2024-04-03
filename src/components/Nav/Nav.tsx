import Link from 'next/link';
// import '../../styles/globals.scss';
import styles from './Nav.module.scss';

export default function Nav({ children }: { children: React.ReactNode }) {
  return (
    <nav className={styles.nav}>
      <Link href="/">Home</Link>
      <Link href="/login">Log in</Link>
      <Link href="/login">Sign up</Link>
    </nav>
  );
}
