import pb from './pb';

export const isLoggedIn: boolean = pb.authStore.isValid;

export async function signup(
  username: string,
  password: string
  //passwordConfirm: string
) {
  const data = {
    username: username,
    password: password,
  };
  try {
    const createdUser = await pb.collection('users').create(data);
    console.log('Created user:', createdUser);
  } catch (error) {
    console.error('Error creating user:', error);
  }
}

export async function deleteUser(userId: string): Promise<void> {
  await pb.collection('users').delete(userId);
}

// export const createUser = async (
//   username: string,
//   password: string
// ): Promise<void> => {
//   const formData = new FormData();
//   formData.append('username', username);
//   formData.append('password', password);
//   try {
//     const createdUser = await pb.collection('users').create(formData);
//     console.log('Created user:', createdUser);
//   } catch (error) {
//     console.error('Error creating user:', error);
//   }
// };
