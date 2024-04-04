'use client';

import { FC, useState } from 'react';
import PocketBase from 'pocketbase';

interface pageProps {}

const SignUp: FC<pageProps> = ({}) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [error, setError] = useState<string>('');

  const createUser = async () => {
    if (password !== passwordConfirm) {
      console.log('Passwords do not match');
      setError('Passwords do not match');
      return;
    }

    if (password.length > 8) {
      setError('Passwords must be at least 8 characters');
      return;
    }

    const pb = new PocketBase('http://127.0.0.1:8090');

    const data = {
      username: username,
      email: email,
      emailVisibility: true,
      password: password,
      passwordConfirm: passwordConfirm,
      name: username,
    };

    try {
      const user = await pb.collection('users').create(data);

      console.log('User created successfully:', user);
    } catch (error) {
      console.error('Error creating user:', error);
    }
  };

  const handleSignUp = (event) => {
    event.preventDefault();
    createUser();
  };

  return (
    <form onSubmit={handleSignUp}>
      <div>
        <label htmlFor="username">Username:</label>
        <input
          type="text"
          id="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
      </div>
      <div>
        <label htmlFor="email">Email:</label>
        <input
          type="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      <div>
        <label htmlFor="password">Password:</label>
        <input
          type="password"
          id="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>
      <div>
        <label htmlFor="passwordConfirm">Confirm Password:</label>
        <input
          type="password"
          id="passwordConfirm"
          value={passwordConfirm}
          onChange={(e) => setPasswordConfirm(e.target.value)}
          required
        />
      </div>
      <button type="submit">Sign Up!</button>
    </form>
  );
};

export default SignUp;
