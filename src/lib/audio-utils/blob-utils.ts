function blobToFile(blob: Blob, fileName: string): File {
  return new File([blob], fileName, { type: blob.type });
}

/* blob to sample file here? Forgot where it is */
