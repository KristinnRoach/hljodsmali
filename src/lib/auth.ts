// import { getPocketBase } from './db_samples';

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
//   // þarf að skoða hvað þarf fyrir logout
//   if (pb.authStore) {
//     pb.authStore.clear();
//   }
// }
