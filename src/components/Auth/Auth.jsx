'use client';

import { useForm } from 'react-hook-form';
import useLogout from '../../hooks/useLogout';
import useLogin from '../../hooks/useLogin';
// import { signup, isLoggedIn } from '../../lib/user';

import pb from '../../lib/db/pocketbase';

/* TODO: REFACTOR TO USE SERVER ACTIONS */ // 'use client' only for button?
/* TODO: ADD SIGN UP */

export default function Auth({ className = '' }) {
  const logout = useLogout();
  const { login, isLoading } = useLogin();
  const { register, handleSubmit, reset } = useForm();
  const isLoggedIn = pb.authStore.isValid;

  async function onSubmit(data) {
    login({ username: data.username, password: data.password });
    reset();
  }

  if (isLoggedIn) {
    return (
      <div className={className}>
        <h1>{('Logged In: ', isLoggedIn && pb.authStore.model.username)}</h1>
        <button onClick={logout}>Logout</button>
      </div>
    );
  }

  return (
    <div className={className}>
      {isLoading && <p>Loading...</p>}
      {/* <button onClick={toggleIsNewUser} disabled={isLoading}>
        New User?
      </button> */}

      <form onSubmit={handleSubmit(onSubmit)}>
        <input
          type='text'
          placeholder='username'
          {...register('username')}
          required
          tabIndex={-1}
          aria-label='username'
        />
        <input
          type='password'
          placeholder='password'
          {...register('password')}
          required
          tabIndex={0}
          aria-label='password'
        />

        <button
          type='submit'
          disabled={isLoading}
          tabIndex={0}
          aria-label='login button'
        >
          {isLoading ? 'Loading.. ' : 'Login'}
          {/* {isNewUser ? 'Sign Up' : 'Login'} */}
        </button>
      </form>
    </div>
  );
}

// console.log(data.username, data.password);
// if (isNewUser) {
//   await signup(data.username, data.password);
// }

// let isNewUser = false;

// function toggleIsNewUser(event) {
//   // placeholder for signup
//   isNewUser = !isNewUser;
//   console.log('isNewUser:', isNewUser);
//   const button = event.target;
//   button.innerText = isNewUser ? 'New User ' : 'New User?';
//   button.style.backgroundColor = isNewUser ? 'lightgreen' : 'initial';
//   document.getElementById('loginBtn').innerText = isNewUser
//     ? 'Sign Up'
//     : 'Login';
// }
