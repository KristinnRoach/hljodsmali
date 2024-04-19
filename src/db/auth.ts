import getPocketBase from './db_samples';

const pb = getPocketBase();

export async function authData() {
  await pb.collection('users').authWithPassword('kiddi', 'kiddi1234');

  // after the above you can also access the auth data from the authStore
  console.log(pb.authStore.isValid);
  console.log(pb.authStore.token);
  console.log(pb.authStore.model.id);
}

// "logout" the last authenticated model
pb.authStore.clear();
