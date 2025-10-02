// Image Library Management
export interface ImageMetadata {
  id: string;
  url: string;
  type: "upload" | "ai-generated";
  name: string;
  prompt?: string; // For AI-generated images
  createdAt: number;
}

const STORAGE_KEY = "ai-video-creator-image-library";

export function getImageLibrary(): ImageMetadata[] {
  if (typeof window === "undefined") return [];

  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return [];

  try {
    return JSON.parse(stored);
  } catch {
    return [];
  }
}

export function addImageToLibrary(image: Omit<ImageMetadata, "id" | "createdAt">): ImageMetadata {
  const newImage: ImageMetadata = {
    ...image,
    id: Date.now().toString(),
    createdAt: Date.now(),
  };

  const library = getImageLibrary();
  library.unshift(newImage); // Add to beginning

  localStorage.setItem(STORAGE_KEY, JSON.stringify(library));

  return newImage;
}

export function updateImageInLibrary(id: string, updates: Partial<ImageMetadata>): void {
  const library = getImageLibrary();
  const index = library.findIndex(img => img.id === id);

  if (index !== -1) {
    library[index] = { ...library[index], ...updates };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(library));
  }
}

export function deleteImageFromLibrary(id: string): void {
  const library = getImageLibrary();
  const filtered = library.filter(img => img.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
}

export function getImagesByType(type: "upload" | "ai-generated"): ImageMetadata[] {
  return getImageLibrary().filter(img => img.type === type);
}
