/**
 * Utility functions for preparing video assets (audio, images) for Remotion
 * Converts base64 data URLs to static files in /public folder
 */

import { Scene } from '@/types';

export interface AssetPreparationProgress {
  total: number;
  completed: number;
  currentTask: string;
  status: 'preparing' | 'ready' | 'error';
}

/**
 * Save base64 data URL to public folder and return the public URL
 */
async function saveAsset(
  dataUrl: string,
  filename: string,
  type: 'audio' | 'image'
): Promise<string> {
  try {
    const response = await fetch('/api/save-asset', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ dataUrl, filename, type }),
    });

    if (!response.ok) {
      throw new Error('Failed to save asset');
    }

    const data = await response.json();
    return data.url; // Returns /audio/filename or /images/filename
  } catch (error) {
    console.error('Error saving asset:', error);
    throw error;
  }
}

/**
 * Generate audio for a scene via API
 */
async function generateAudioForScene(
  sceneId: string,
  content: string,
  voice: string = 'alloy'
): Promise<{ url: string; duration: number }> {
  const response = await fetch('/api/voices', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text: content, voice }),
  });

  if (!response.ok) {
    throw new Error('Failed to generate audio');
  }

  const data = await response.json();

  // Calculate duration from base64 audio
  const audio = new Audio(data.url);
  const duration = await new Promise<number>((resolve) => {
    audio.addEventListener('loadedmetadata', () => {
      resolve(Math.ceil(audio.duration));
    });
    audio.addEventListener('error', () => {
      resolve(5); // Default to 5 seconds if can't load
    });
  });

  return { url: data.url, duration };
}

/**
 * Prepare all assets for a project's scenes
 * Automatically generates missing audio and saves all assets
 * Returns updated scenes with public URLs instead of data URLs
 */
export async function prepareVideoAssets(
  scenes: Scene[],
  onProgress: (progress: AssetPreparationProgress) => void,
  voice: string = 'alloy'
): Promise<Scene[]> {
  // Count total assets that need processing
  let totalAssets = 0;

  scenes.forEach(scene => {
    // Need to generate audio if missing
    if (scene.content && !scene.audioUrl) totalAssets++;
    // Need to save audio if it's a data URL
    if (scene.audioUrl && scene.audioUrl.startsWith('data:')) totalAssets++;
    // Need to save images if they're data URLs
    const layoutContent = scene.layoutContent as any;
    if (layoutContent?.imageUrl && layoutContent.imageUrl.startsWith('data:')) totalAssets++;
  });

  if (totalAssets === 0) {
    onProgress({
      total: 0,
      completed: 0,
      currentTask: 'All assets ready!',
      status: 'ready',
    });
    return scenes;
  }

  let completed = 0;
  const updatedScenes: Scene[] = [];

  onProgress({
    total: totalAssets,
    completed: 0,
    currentTask: 'Starting asset preparation...',
    status: 'preparing',
  });

  for (let i = 0; i < scenes.length; i++) {
    const scene = scenes[i];
    let updatedScene = { ...scene };

    // Generate audio if missing
    if (scene.content && !scene.audioUrl) {
      onProgress({
        total: totalAssets,
        completed,
        currentTask: `Generating audio for scene ${i + 1}/${scenes.length}...`,
        status: 'preparing',
      });

      try {
        const { url, duration } = await generateAudioForScene(scene.id, scene.content, voice);

        // Save the base64 audio to a file
        const audioFilename = `scene-${scene.id}-audio.mp3`;
        const audioPublicUrl = await saveAsset(url, audioFilename, 'audio');
        const finalAudioUrl = audioPublicUrl.startsWith('/') ? audioPublicUrl.substring(1) : audioPublicUrl;

        updatedScene.audioUrl = finalAudioUrl;
        updatedScene.duration = duration;

        // Update in database with the file path
        const updateResponse = await fetch('/api/scenes', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sceneId: scene.id,
            audioUrl: finalAudioUrl,
            duration,
          }),
        });

        if (!updateResponse.ok) {
          console.error('Failed to update scene in database:', await updateResponse.text());
        } else {
          console.log('✅ Scene updated in database:', scene.id, finalAudioUrl);
        }

        completed++;
      } catch (error) {
        console.error(`Failed to generate audio for scene ${i + 1}:`, error);
        // Continue with other scenes
      }
    }

    // Save images to public folder if they're data URLs
    const layoutContent = updatedScene.layoutContent as any;
    if (layoutContent?.imageUrl && layoutContent.imageUrl.startsWith('data:')) {
      onProgress({
        total: totalAssets,
        completed,
        currentTask: `Saving image for scene ${i + 1}/${scenes.length}...`,
        status: 'preparing',
      });

      const imageFilename = `scene-${scene.id}-image.png`;
      const imagePublicUrl = await saveAsset(layoutContent.imageUrl, imageFilename, 'image');
      // Remove leading slash for staticFile
      const publicPath = imagePublicUrl.startsWith('/') ? imagePublicUrl.substring(1) : imagePublicUrl;
      updatedScene = {
        ...updatedScene,
        layoutContent: {
          ...updatedScene.layoutContent,
          imageUrl: publicPath,
        },
      };
      completed++;
    }

    updatedScenes.push(updatedScene);
  }

  onProgress({
    total: totalAssets,
    completed: totalAssets,
    currentTask: 'All assets ready!',
    status: 'ready',
  });

  return updatedScenes;
}
