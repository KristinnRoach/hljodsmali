const session = null;

export default function AuthOnlyPage() {
  // if (!session) throw new Error('Auth is required to access this resource');

  return <main>this is an auth-only page</main>;
}
