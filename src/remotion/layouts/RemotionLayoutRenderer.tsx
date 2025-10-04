import { AbsoluteFill } from 'remotion';
import { RemotionImage } from '../RemotionImage';
import type { Scene, Theme, LayoutContent } from '@/types';
import { getBackgroundStyle } from '@/lib/themes';

interface RemotionLayoutRendererProps {
  scene: Scene;
  theme: Theme;
}

export function RemotionLayoutRenderer({ scene, theme }: RemotionLayoutRendererProps) {
  const layoutContent = scene.layoutContent as LayoutContent;
  const mergedTheme = scene.themeOverride ? { ...theme, ...scene.themeOverride } : theme;

  // Get background style
  const backgroundStyle = getBackgroundStyle(mergedTheme);

  // Common text styles (scaled up for 1920x1080 video)
  const titleStyle: React.CSSProperties = {
    fontFamily: mergedTheme.typography?.titleFont || 'Inter, sans-serif',
    fontSize: `${(mergedTheme.typography?.titleSize || 48) * 2}px`,
    fontWeight: mergedTheme.typography?.titleWeight || 700,
    color: mergedTheme.typography?.titleColor || '#ffffff',
    lineHeight: 1.2,
  };

  const subtitleStyle: React.CSSProperties = {
    fontFamily: mergedTheme.typography?.bodyFont || 'Inter, sans-serif',
    fontSize: `${(mergedTheme.typography?.bodySize || 20) * 2.4}px`,
    fontWeight: mergedTheme.typography?.bodyWeight || 400,
    color: mergedTheme.typography?.bodyColor || '#e0e0e0',
    lineHeight: 1.5,
  };

  const bodyStyle: React.CSSProperties = {
    fontFamily: mergedTheme.typography?.bodyFont || 'Inter, sans-serif',
    fontSize: `${(mergedTheme.typography?.bodySize || 20) * 2}px`,
    fontWeight: mergedTheme.typography?.bodyWeight || 400,
    color: mergedTheme.typography?.bodyColor || '#d0d0d0',
    lineHeight: 1.6,
  };

  const padding = (mergedTheme.spacing?.padding || 60) * 2;
  const gap = (mergedTheme.spacing?.gap || 24) * 2;

  // Render based on layout type
  switch (scene.layout) {
    case 'cover':
      return (
        <AbsoluteFill style={{ ...backgroundStyle, padding }}>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            textAlign: 'center'
          }}>
            {layoutContent.title && (
              <div style={{ ...titleStyle, maxWidth: '80%' }}>
                {layoutContent.title}
              </div>
            )}
            {layoutContent.subtitle && (
              <div style={{ ...subtitleStyle, maxWidth: '70%', marginTop: gap }}>
                {layoutContent.subtitle}
              </div>
            )}
          </div>
        </AbsoluteFill>
      );

    case 'imageLeft':
      return (
        <AbsoluteFill style={{ ...backgroundStyle, padding: layoutContent.imageBleed ? 0 : padding }}>
          <div style={{ display: 'flex', height: '100%', gap: layoutContent.imageBleed ? 0 : gap, alignItems: 'center' }}>
            {/* Left: Image (40%) */}
            <div style={{ flex: '0 0 40%', height: layoutContent.imageBleed ? '100%' : 'auto' }}>
              {layoutContent.imageUrl && (
                <RemotionImage
                  src={layoutContent.imageUrl}
                  alt="Scene image"
                  style={{
                    width: '100%',
                    height: layoutContent.imageBleed ? '100%' : 'auto',
                    borderRadius: layoutContent.imageBleed ? 0 : '12px',
                    objectFit: 'cover'
                  }}
                />
              )}
            </div>
            {/* Right: Text (60%) */}
            <div style={{ flex: '1', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: layoutContent.imageBleed ? padding : 0 }}>
              {layoutContent.title && (
                <div style={titleStyle}>{layoutContent.title}</div>
              )}
              {layoutContent.body && (
                <div style={{ ...bodyStyle, marginTop: gap }}>{layoutContent.body}</div>
              )}
            </div>
          </div>
        </AbsoluteFill>
      );

    case 'imageRight':
      return (
        <AbsoluteFill style={{ ...backgroundStyle, padding: layoutContent.imageBleed ? 0 : padding }}>
          <div style={{ display: 'flex', height: '100%', gap: layoutContent.imageBleed ? 0 : gap, alignItems: 'center' }}>
            {/* Left: Text (60%) */}
            <div style={{ flex: '1', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: layoutContent.imageBleed ? padding : 0 }}>
              {layoutContent.title && (
                <div style={titleStyle}>{layoutContent.title}</div>
              )}
              {layoutContent.body && (
                <div style={{ ...bodyStyle, marginTop: gap }}>{layoutContent.body}</div>
              )}
            </div>
            {/* Right: Image (40%) */}
            <div style={{ flex: '0 0 40%', height: layoutContent.imageBleed ? '100%' : 'auto' }}>
              {layoutContent.imageUrl && (
                <RemotionImage
                  src={layoutContent.imageUrl}
                  alt="Scene image"
                  style={{
                    width: '100%',
                    height: layoutContent.imageBleed ? '100%' : 'auto',
                    borderRadius: layoutContent.imageBleed ? 0 : '12px',
                    objectFit: 'cover'
                  }}
                />
              )}
            </div>
          </div>
        </AbsoluteFill>
      );

    case 'titleBody':
      return (
        <AbsoluteFill style={{ ...backgroundStyle, padding }}>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            height: '100%',
            maxWidth: '70%',
            margin: '0 auto'
          }}>
            {layoutContent.title && (
              <div style={{ ...titleStyle, textAlign: 'center' }}>{layoutContent.title}</div>
            )}
            {layoutContent.body && (
              <div style={{ ...bodyStyle, marginTop: gap, textAlign: 'center' }}>{layoutContent.body}</div>
            )}
          </div>
        </AbsoluteFill>
      );

    case 'imageBullets':
      return (
        <AbsoluteFill style={{ ...backgroundStyle, padding }}>
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'center', gap }}>
            {layoutContent.imageUrl && (
              <div style={{ textAlign: 'center' }}>
                <RemotionImage
                  src={layoutContent.imageUrl}
                  alt="Scene image"
                  style={{
                    maxWidth: '60%',
                    height: 'auto',
                    borderRadius: layoutContent.imageBleed ? 0 : '12px',
                    margin: '0 auto'
                  }}
                />
              </div>
            )}
            {layoutContent.bulletPoints && layoutContent.bulletPoints.length > 0 && (
              <div style={{ maxWidth: '70%', margin: '0 auto' }}>
                {layoutContent.bulletPoints.map((bullet, index) => (
                  <div key={index} style={{ display: 'flex', marginBottom: '12px', ...bodyStyle }}>
                    <span style={{ marginRight: '12px', color: mergedTheme.colors?.accent || '#60a5fa' }}>•</span>
                    <span>{bullet}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </AbsoluteFill>
      );

    case 'fullImage':
      return (
        <AbsoluteFill style={{ ...backgroundStyle }}>
          {layoutContent.imageUrl && (
            <RemotionImage
              src={layoutContent.imageUrl}
              alt="Scene image"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          )}
          <div style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            padding,
            background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)'
          }}>
            {layoutContent.title && (
              <div style={{ ...titleStyle, textAlign: 'center' }}>{layoutContent.title}</div>
            )}
            {layoutContent.subtitle && (
              <div style={{ ...subtitleStyle, textAlign: 'center', marginTop: gap / 2 }}>{layoutContent.subtitle}</div>
            )}
          </div>
        </AbsoluteFill>
      );

    case 'twoColumn':
      return (
        <AbsoluteFill style={{ ...backgroundStyle, padding }}>
          <div style={{ display: 'flex', height: '100%', gap, alignItems: 'center' }}>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              {layoutContent.leftColumn && (
                <div style={bodyStyle}>{layoutContent.leftColumn}</div>
              )}
            </div>
            <div style={{ width: '2px', backgroundColor: mergedTheme.colors?.accent || '#60a5fa', height: '60%' }} />
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              {layoutContent.rightColumn && (
                <div style={bodyStyle}>{layoutContent.rightColumn}</div>
              )}
            </div>
          </div>
        </AbsoluteFill>
      );

    case 'blank':
      return (
        <AbsoluteFill style={{ ...backgroundStyle, padding }}>
          {/* Blank canvas for annotations */}
        </AbsoluteFill>
      );

    default:
      // Fallback to simple centered layout
      return (
        <AbsoluteFill style={{ ...backgroundStyle, padding }}>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            textAlign: 'center'
          }}>
            {layoutContent.title && (
              <div style={{ ...titleStyle, maxWidth: '80%' }}>{layoutContent.title}</div>
            )}
            {layoutContent.subtitle && (
              <div style={{ ...subtitleStyle, maxWidth: '70%', marginTop: gap }}>{layoutContent.subtitle}</div>
            )}
            {layoutContent.body && (
              <div style={{ ...bodyStyle, maxWidth: '70%', marginTop: gap }}>{layoutContent.body}</div>
            )}
          </div>
        </AbsoluteFill>
      );
  }
}
