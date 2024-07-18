import PocketBase from 'pocketbase';

const pb = new PocketBase('YOUR_POCKETBASE_URL');

const samplesSchema = {
  name: 'samples',
  type: 'base',
  schema: [
    new SchemaField({
      name: 'name',
      type: 'text',
      required: true,
    }),
    new SchemaField({
      name: 'slug',
      type: 'text',
      required: true,
      options: {
        pattern: '^[a-zA-Z0-9-]+$',
      },
    }),
    new SchemaField({
      name: 'user',
      type: 'relation',
      options: {
        collectionId: '_pb_users_auth_',
        cascadeDelete: false,
      },
    }),
    new SchemaField({
      name: 'sample_file',
      type: 'file',
      required: true,
      options: {
        maxSize: 6666666, // 6.6 MB
        mimeTypes: ['audio/*'],
      },
    }),
    new SchemaField({
      name: 'bufferDuration',
      type: 'number',
      options: {
        max: 20, // 20 seconds
        nonzero: true,
      },
    }),
    new SchemaField({
      name: 'sample_settings',
      type: 'json',
      options: {
        maxSize: 4096, // 4KB in bytes
      },
    }),
  ],
};

async function createSamplesCollectionSchema(): Promise<void> {
  try {
    const collection = await pb.collections.create(samplesSchema);
    console.log('Samples collection created:', collection);
  } catch (error) {
    console.error('Error creating samples collection:', error);
  }
}

// createSamplesCollectionSchema();
