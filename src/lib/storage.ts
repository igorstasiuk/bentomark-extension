import localforage from 'localforage';

// Configure localforage to use IndexedDB
localforage.config({
  driver: localforage.INDEXEDDB,
  name: 'BentoMark',
  version: 1.0,
  storeName: 'media_assets',
  description: 'Stores large media assets like background images and cover photos.'
});

export const saveMedia = async (id: string, data: Blob | string) => {
  try {
    await localforage.setItem(id, data);
    return id;
  } catch (err) {
    console.error('Error saving media:', err);
    throw err;
  }
};

export const getMedia = async (id: string) => {
  try {
    return await localforage.getItem<Blob | string>(id);
  } catch (err) {
    console.error('Error getting media:', err);
    throw err;
  }
};

export const deleteMedia = async (id: string) => {
  try {
    await localforage.removeItem(id);
  } catch (err) {
    console.error('Error deleting media:', err);
    throw err;
  }
};