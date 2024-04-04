import PocketBase from 'pocketbase';

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// const pb = new PocketBase('https://pocketbase.io');

export async function getOneUser() {
  //const result = await pb.collection('users').listAuthMethods();
  const pb = new PocketBase('http://127.0.0.1:8090');

  const record = await pb.collection('users').getOne('la4eike99fujwwl', {
    expand: 'relField1,relField2.subRelField',
  });

  console.log(record);
}
