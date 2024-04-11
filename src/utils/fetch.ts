export async function fetchBlobFromUrl(url: string): Promise<void> {
  if (url) {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      return blob;
    } catch (error) {
      console.error('Error fetching audio:', error);
      return;
    }
  }
}
