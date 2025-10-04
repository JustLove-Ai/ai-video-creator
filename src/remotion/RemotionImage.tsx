import { Img, staticFile } from 'remotion';

interface RemotionImageProps {
  src?: string;
  alt?: string;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Image component for Remotion that properly handles staticFile
 */
export function RemotionImage({ src, alt = 'Image', className = '', style = {} }: RemotionImageProps) {
  if (!src) {
    return null;
  }

  // If src is already a full URL (http/https), use it directly
  // Otherwise, treat it as a path in the public folder and use staticFile
  const imageSrc = src.startsWith('http') ? src : staticFile(src);

  return (
    <Img
      src={imageSrc}
      alt={alt}
      className={className}
      style={style}
    />
  );
}
