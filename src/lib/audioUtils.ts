/**
 * Calculate audio duration from a base64 data URL
 * Returns duration in seconds
 */
export async function getAudioDuration(audioDataUrl: string): Promise<number> {
  return new Promise((resolve, reject) => {
    const audio = new Audio();

    audio.addEventListener('loadedmetadata', () => {
      resolve(audio.duration);
    });

    audio.addEventListener('error', (e) => {
      reject(new Error('Failed to load audio metadata'));
    });

    audio.src = audioDataUrl;
  });
}

/**
 * Calculate audio duration on the server side (Node.js)
 * Estimates based on file size for MP3 (rough approximation)
 * For accurate duration, would need a proper audio library
 */
export function estimateAudioDuration(base64Audio: string): number {
  // Remove data URL prefix
  const base64Data = base64Audio.replace(/^data:audio\/\w+;base64,/, '');

  // Calculate file size in bytes
  const sizeInBytes = (base64Data.length * 3) / 4;

  // Estimate duration based on typical MP3 bitrate (128 kbps)
  // This is a rough estimate and may not be accurate
  const bitrate = 128000; // 128 kbps
  const estimatedDuration = (sizeInBytes * 8) / bitrate;

  return Math.max(3, Math.round(estimatedDuration)); // Minimum 3 seconds
}
