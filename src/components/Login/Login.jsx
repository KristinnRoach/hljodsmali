'use client';

import PocketBase from 'pocketbase';
import { useForm } from 'react-hook-form';
import useLogout from '../../hooks/useLogout';
import useLogin from '../../hooks/useLogin';

import pb from '../../db/pb';
import styles from './Login.module.scss';

export default function Auth() {
  const logout = useLogout();
  const { login, isLoading } = useLogin();

  const { register, handleSubmit, reset } = useForm();

  const isLoggedIn = pb.authStore.isValid;

  async function onSubmit(data) {
    login({ email: data.email, password: data.password });
    reset();
  }

  if (isLoggedIn) {
    return (
      <div className={styles.login}>
        <div className={styles.toTheRight}>
          <h1>
            {
              ('Logged In: ', isLoggedIn && pb.authStore.model.username)
              /*pb.authStore.model.email*/
            }
          </h1>
          <button onClick={logout}>Logout</button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.login}>
      <div className={styles.toTheRight}>
        <h1>Login to save your shit</h1>
        {isLoading && <p>Loading...</p>}

        <form onSubmit={handleSubmit(onSubmit)}>
          <input type="text" placeholder="email" {...register('email')} />
          <input
            type="password"
            placeholder="Password"
            {...register('password')}
          />
          <button type="submit" disabled={isLoading}>
            {isLoading ? 'Loading' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
}

// import { getPocketBase } from '../../db/db_samples';

// const pb = getPocketBase();

// export async function authData() {
//   await pb.collection('users').authWithPassword('kiddi', 'kiddi1234');

//   // after the above you can also access the auth data from the authStore
//   if (pb.authStore && pb.authStore.model) {
//     console.log(pb.authStore.isValid);
//     console.log(pb.authStore.token);
//     console.log(pb.authStore.model.id);
//   } else {
//     console.log('no pb authstore :o ');
//   }
// }

// // "logout" the last authenticated model
// export function logout() {
//   if (pb.authStore) {
//     pb.authStore.clear();
//   }
// }

// interface LoginProps {
//   authData: () => Promise<void>;
// }
// const getAuthData = async () => {
//     await authData();
//   };

//   const logout = () => {
//     logout();
//   };
