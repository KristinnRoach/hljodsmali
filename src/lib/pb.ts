import PocketBase from 'pocketbase';

const pb = new PocketBase(
  process.env.POCKETBASE_URL || 'https://hljodsmali.pockethost.io/'
);
pb.autoCancellation(false);

export default pb;
