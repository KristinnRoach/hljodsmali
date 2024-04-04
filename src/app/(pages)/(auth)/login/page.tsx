import { FC, useState } from 'react';
import PocketBase from 'pocketbase';

interface pageProps {}

const LogIn: FC<pageProps> = ({}) => {
  const pb = new PocketBase('http://localhost:8090');

  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');

  let status = false;

  return <div>login</div>;
};

export default LogIn;
