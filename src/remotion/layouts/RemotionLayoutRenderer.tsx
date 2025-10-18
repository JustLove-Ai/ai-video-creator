import { AbsoluteFill } from 'remotion';
import { RemotionImage } from '../RemotionImage';
import type { Scene, Theme, LayoutContent } from '@/types';
import { getBackgroundStyle } from '@/lib/themes';
import { useRemotionAnimation } from '../animationHelpers';
import { getElementAnimation } from '@/lib/animationHelpers';
import { applyTextFormatting } from '@/lib/textFormatting';

interface RemotionLayoutRendererProps {
  scene: Scene;
  theme: Theme;
}

export function RemotionLayoutRenderer({ scene, theme }: RemotionLayoutRendererProps) {
  const layoutContent = scene.layoutContent as LayoutContent;
  const mergedTheme = scene.themeOverride ? { ...theme, ...scene.themeOverride } : theme;

  // Get animation styles for each element
  const titleAnimation = useRemotionAnimation(getElementAnimation(scene.animationConfig, 'title'));
  const subtitleAnimation = useRemotionAnimation(getElementAnimation(scene.animationConfig, 'subtitle'));
  const bodyAnimation = useRemotionAnimation(getElementAnimation(scene.animationConfig, 'body'));
  const imageAnimation = useRemotionAnimation(getElementAnimation(scene.animationConfig, 'image'));
  const leftColumnAnimation = useRemotionAnimation(getElementAnimation(scene.animationConfig, 'leftColumn'));
  const rightColumnAnimation = useRemotionAnimation(getElementAnimation(scene.animationConfig, 'rightColumn'));
  const bulletPointsAnimation = useRemotionAnimation(getElementAnimation(scene.animationConfig, 'bulletPoints'));

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
              <div style={{ ...applyTextFormatting(titleStyle, layoutContent.titleFormatting), ...titleAnimation, maxWidth: '80%' }}>
                {layoutContent.title}
              </div>
            )}
            {layoutContent.subtitle && (
              <div style={{ ...applyTextFormatting(subtitleStyle, layoutContent.subtitleFormatting), ...subtitleAnimation, maxWidth: '70%', marginTop: gap }}>
                {layoutContent.subtitle}
              </div>
            )}
          </div>
        </AbsoluteFill>
      );

    case 'imageLeft':
      const hasImageLeftBleed = layoutContent.imageBleed ?? true; // Default to true
      return (
        <AbsoluteFill style={{ ...backgroundStyle, padding: hasImageLeftBleed ? 0 : padding }}>
          <div style={{ display: 'flex', height: '100%', gap: hasImageLeftBleed ? 0 : gap, alignItems: 'center' }}>
            {/* Left: Image (40%) */}
            <div style={{ flex: '0 0 40%', height: hasImageLeftBleed ? '100%' : 'auto', ...imageAnimation }}>
              {layoutContent.imageUrl && (
                <RemotionImage
                  src={layoutContent.imageUrl}
                  alt="Scene image"
                  style={{
                    width: '100%',
                    height: hasImageLeftBleed ? '100%' : 'auto',
                    borderRadius: hasImageLeftBleed ? 0 : '12px',
                    objectFit: 'cover'
                  }}
                />
              )}
            </div>
            {/* Right: Text (60%) */}
            <div style={{ flex: '1', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: hasImageLeftBleed ? padding : 0 }}>
              {layoutContent.title && (
                <div style={{ ...titleStyle, ...titleAnimation }}>{layoutContent.title}</div>
              )}
              {layoutContent.body && (
                <div style={{ ...bodyStyle, ...bodyAnimation, marginTop: gap }}>{layoutContent.body}</div>
              )}
            </div>
          </div>
        </AbsoluteFill>
      );

    case 'imageRight':
      const hasImageRightBleed = layoutContent.imageBleed ?? true; // Default to true
      return (
        <AbsoluteFill style={{ ...backgroundStyle, padding: hasImageRightBleed ? 0 : padding }}>
          <div style={{ display: 'flex', height: '100%', gap: hasImageRightBleed ? 0 : gap, alignItems: 'center' }}>
            {/* Left: Text (60%) */}
            <div style={{ flex: '1', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: hasImageRightBleed ? padding : 0 }}>
              {layoutContent.title && (
                <div style={{ ...titleStyle, ...titleAnimation }}>{layoutContent.title}</div>
              )}
              {layoutContent.body && (
                <div style={{ ...bodyStyle, ...bodyAnimation, marginTop: gap }}>{layoutContent.body}</div>
              )}
            </div>
            {/* Right: Image (40%) */}
            <div style={{ flex: '0 0 40%', height: hasImageRightBleed ? '100%' : 'auto', ...imageAnimation }}>
              {layoutContent.imageUrl && (
                <RemotionImage
                  src={layoutContent.imageUrl}
                  alt="Scene image"
                  style={{
                    width: '100%',
                    height: hasImageRightBleed ? '100%' : 'auto',
                    borderRadius: hasImageRightBleed ? 0 : '12px',
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
              <div style={{ ...titleStyle, ...titleAnimation, textAlign: 'center' }}>{layoutContent.title}</div>
            )}
            {layoutContent.body && (
              <div style={{ ...bodyStyle, ...bodyAnimation, marginTop: gap, textAlign: 'center' }}>{layoutContent.body}</div>
            )}
          </div>
        </AbsoluteFill>
      );

    case 'imageBullets':
      const hasBulletsBleed = layoutContent.imageBleed;
      return (
        <AbsoluteFill style={{
          ...backgroundStyle,
          padding: hasBulletsBleed ? 0 : padding
        }}>
          {/* Title */}
          <div style={{
            padding: hasBulletsBleed ? `${padding}px ${padding}px 0` : '0',
            paddingTop: hasBulletsBleed ? padding : gap * 2
          }}>
            {layoutContent.title && (
              <div style={{ ...titleStyle, ...titleAnimation }}>{layoutContent.title}</div>
            )}
          </div>

          {/* Image and Bullets in two columns */}
          <div style={{
            flex: 1,
            display: 'flex',
            alignItems: 'flex-start',
            gap: hasBulletsBleed ? 0 : gap * 2,
            padding: hasBulletsBleed ? `${gap}px 0 0 0` : `${gap}px 0`
          }}>
            {/* Left: Image */}
            <div style={{
              width: '45%',
              height: hasBulletsBleed ? '100%' : 'auto',
              ...imageAnimation
            }}>
              {layoutContent.imageUrl && (
                <RemotionImage
                  src={layoutContent.imageUrl}
                  alt="Scene image"
                  style={{
                    width: '100%',
                    height: hasBulletsBleed ? '100%' : 'auto',
                    borderRadius: hasBulletsBleed ? 0 : '24px',
                    objectFit: 'cover'
                  }}
                />
              )}
            </div>

            {/* Right: Bullet Points */}
            <div style={{
              width: '55%',
              display: 'flex',
              flexDirection: 'column',
              gap: gap * 0.75,
              padding: hasBulletsBleed ? `0 ${padding}px 0 ${gap * 2}px` : '0'
            }}>
              {layoutContent.bulletPoints && layoutContent.bulletPoints.length > 0 && (
                <>
                  {layoutContent.bulletPoints.map((bullet, index) => (
                    <div key={index} style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '24px',
                      ...bulletPointsAnimation
                    }}>
                      <div style={{
                        width: '16px',
                        height: '16px',
                        borderRadius: '50%',
                        backgroundColor: mergedTheme.accent || '#60a5fa',
                        flexShrink: 0,
                        marginTop: '8px'
                      }} />
                      <div style={{
                        flex: 1,
                        ...bodyStyle
                      }}>
                        {bullet}
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>
        </AbsoluteFill>
      );

    case 'fullImage':
      return (
        <AbsoluteFill style={{ ...backgroundStyle }}>
          {layoutContent.imageUrl && (
            <div style={imageAnimation}>
              <RemotionImage
                src={layoutContent.imageUrl}
                alt="Scene image"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
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
              <div style={{ ...titleStyle, ...titleAnimation, textAlign: 'center' }}>{layoutContent.title}</div>
            )}
            {layoutContent.subtitle && (
              <div style={{ ...subtitleStyle, ...subtitleAnimation, textAlign: 'center', marginTop: gap / 2 }}>{layoutContent.subtitle}</div>
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
                <div style={{ ...bodyStyle, ...leftColumnAnimation }}>{layoutContent.leftColumn}</div>
              )}
            </div>
            <div style={{ width: '2px', backgroundColor: mergedTheme.accent || '#60a5fa', height: '60%' }} />
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              {layoutContent.rightColumn && (
                <div style={{ ...bodyStyle, ...rightColumnAnimation }}>{layoutContent.rightColumn}</div>
              )}
            </div>
          </div>
        </AbsoluteFill>
      );

    case 'imageBulletsBleedLeft':
      return (
        <AbsoluteFill style={{ ...backgroundStyle, padding: 0 }}>
          <div style={{ display: 'flex', height: '100%', gap: 0 }}>
            {/* Left: Image (50%) - Full bleed */}
            <div style={{ flex: '0 0 50%', height: '100%', ...imageAnimation }}>
              {layoutContent.imageUrl && (
                <RemotionImage
                  src={layoutContent.imageUrl}
                  alt="Scene image"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover'
                  }}
                />
              )}
            </div>
            {/* Right: Title + Bullets (50%) */}
            <div style={{ flex: '1', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding }}>
              {layoutContent.title && (
                <div style={{ ...titleStyle, ...titleAnimation, marginBottom: gap }}>{layoutContent.title}</div>
              )}
              {layoutContent.bulletPoints && layoutContent.bulletPoints.length > 0 && (
                <div style={{ ...bulletPointsAnimation }}>
                  {layoutContent.bulletPoints.map((bullet, index) => (
                    <div key={index} style={{ display: 'flex', marginBottom: '24px', ...bodyStyle }}>
                      <span style={{ marginRight: '24px', color: mergedTheme.accent || '#60a5fa' }}>•</span>
                      <span>{bullet}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </AbsoluteFill>
      );

    case 'imageBulletsBleedRight':
      return (
        <AbsoluteFill style={{ ...backgroundStyle, padding: 0 }}>
          <div style={{ display: 'flex', height: '100%', gap: 0 }}>
            {/* Left: Title + Bullets (50%) */}
            <div style={{ flex: '1', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding }}>
              {layoutContent.title && (
                <div style={{ ...titleStyle, ...titleAnimation, marginBottom: gap }}>{layoutContent.title}</div>
              )}
              {layoutContent.bulletPoints && layoutContent.bulletPoints.length > 0 && (
                <div style={{ ...bulletPointsAnimation }}>
                  {layoutContent.bulletPoints.map((bullet, index) => (
                    <div key={index} style={{ display: 'flex', marginBottom: '24px', ...bodyStyle }}>
                      <span style={{ marginRight: '24px', color: mergedTheme.accent || '#60a5fa' }}>•</span>
                      <span>{bullet}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            {/* Right: Image (50%) - Full bleed */}
            <div style={{ flex: '0 0 50%', height: '100%', ...imageAnimation }}>
              {layoutContent.imageUrl && (
                <RemotionImage
                  src={layoutContent.imageUrl}
                  alt="Scene image"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover'
                  }}
                />
              )}
            </div>
          </div>
        </AbsoluteFill>
      );

    case 'centeredImageMedium':
      return (
        <AbsoluteFill style={{ ...backgroundStyle, padding }}>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            gap: gap * 1.5
          }}>
            {layoutContent.title && (
              <div style={{ ...titleStyle, ...titleAnimation, textAlign: 'center', maxWidth: '80%' }}>
                {layoutContent.title}
              </div>
            )}
            {layoutContent.imageUrl && (
              <div style={{ width: '50%', ...imageAnimation }}>
                <RemotionImage
                  src={layoutContent.imageUrl}
                  alt="Scene image"
                  style={{
                    width: '100%',
                    height: 'auto',
                    borderRadius: '16px',
                    objectFit: 'cover'
                  }}
                />
              </div>
            )}
          </div>
        </AbsoluteFill>
      );

    case 'centeredImageLarge':
      return (
        <AbsoluteFill style={{ ...backgroundStyle, padding }}>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            gap: gap * 1.5
          }}>
            {layoutContent.title && (
              <div style={{ ...titleStyle, ...titleAnimation, textAlign: 'center', maxWidth: '90%' }}>
                {layoutContent.title}
              </div>
            )}
            {layoutContent.imageUrl && (
              <div style={{ width: '75%', ...imageAnimation }}>
                <RemotionImage
                  src={layoutContent.imageUrl}
                  alt="Scene image"
                  style={{
                    width: '100%',
                    height: 'auto',
                    borderRadius: '16px',
                    objectFit: 'cover'
                  }}
                />
              </div>
            )}
          </div>
        </AbsoluteFill>
      );

    case 'quote':
      const hasQuoteBleed = layoutContent.imageBleed ?? true;

      if (hasQuoteBleed && layoutContent.imageUrl) {
        // With background image - use white text for readability
        return (
          <AbsoluteFill style={{ position: 'relative' }}>
            {/* Background image */}
            {layoutContent.imageUrl && (
              <div style={imageAnimation}>
                <RemotionImage
                  src={layoutContent.imageUrl}
                  alt="Quote background"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>
            )}
            {/* Dark overlay for readability */}
            <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0, 0, 0, 0.4)' }} />

            {/* Quote content */}
            <div style={{
              position: 'relative',
              zIndex: 10,
              width: '100%',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              gap: gap * 2,
              padding: padding * 2
            }}>
              <div style={{ fontSize: `${(mergedTheme.typography?.titleSize || 48) * 3}px`, color: '#ffffff', opacity: 0.3 }}>
                "
              </div>
              {(layoutContent.quote || layoutContent.body) && (
                <div style={{
                  ...titleStyle,
                  ...bodyAnimation,
                  maxWidth: '80%',
                  fontStyle: 'italic',
                  color: '#ffffff',
                  fontSize: `${(mergedTheme.typography?.titleSize || 48) * 3}px`
                }}>
                  {layoutContent.quote || layoutContent.body}
                </div>
              )}
              {(layoutContent.quoteAuthor || layoutContent.subtitle) && (
                <div style={{
                  ...subtitleStyle,
                  ...subtitleAnimation,
                  maxWidth: '60%',
                  color: '#ffffff',
                  opacity: 0.8,
                  fontWeight: 600
                }}>
                  — {layoutContent.quoteAuthor || layoutContent.subtitle}
                </div>
              )}
            </div>
          </AbsoluteFill>
        );
      }

      // Without background image - use theme colors
      return (
        <AbsoluteFill style={{ ...backgroundStyle, padding }}>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            textAlign: 'center',
            gap: gap * 2
          }}>
            <div style={{ fontSize: `${(mergedTheme.typography?.titleSize || 48) * 3}px`, color: mergedTheme.typography?.titleColor || '#ffffff', opacity: 0.3 }}>
              "
            </div>
            {(layoutContent.quote || layoutContent.body) && (
              <div style={{
                ...titleStyle,
                ...bodyAnimation,
                maxWidth: '80%',
                fontStyle: 'italic',
                fontSize: `${(mergedTheme.typography?.titleSize || 48) * 3}px`
              }}>
                {layoutContent.quote || layoutContent.body}
              </div>
            )}
            {(layoutContent.quoteAuthor || layoutContent.subtitle) && (
              <div style={{ ...subtitleStyle, ...subtitleAnimation, maxWidth: '60%' }}>
                — {layoutContent.quoteAuthor || layoutContent.subtitle}
              </div>
            )}
          </div>
        </AbsoluteFill>
      );

    case 'steps2':
    case 'steps3':
    case 'steps5':
      const stepCount = scene.layout === 'steps2' ? 2 : scene.layout === 'steps3' ? 3 : 5;
      const steps = layoutContent.steps?.slice(0, stepCount) || [];
      const isCompactLayout = stepCount === 5;
      return (
        <AbsoluteFill style={{ ...backgroundStyle, padding }}>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            justifyContent: 'center',
            gap: gap * 2
          }}>
            {layoutContent.title && (
              <div style={{ ...titleStyle, ...titleAnimation, textAlign: 'center', marginBottom: gap }}>
                {layoutContent.title}
              </div>
            )}
            <div style={{
              display: 'grid',
              gridTemplateColumns: `repeat(${stepCount}, 1fr)`,
              gap: gap * 1.5,
              padding: `${gap}px 0`,
              ...bulletPointsAnimation
            }}>
              {steps.map((step, index) => (
                <div key={index} style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'flex-start',
                  textAlign: 'center',
                  gap: gap
                }}>
                  {/* Step Number Circle */}
                  <div style={{
                    width: isCompactLayout ? '96px' : '128px',
                    height: isCompactLayout ? '96px' : '128px',
                    borderRadius: '50%',
                    backgroundColor: mergedTheme.accent || '#60a5fa',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: isCompactLayout ? '40px' : '56px',
                    fontWeight: 700,
                    color: '#ffffff'
                  }}>
                    {index + 1}
                  </div>
                  {/* Step Title */}
                  <div style={{
                    ...titleStyle,
                    fontSize: isCompactLayout ? `${(mergedTheme.typography?.titleSize || 48) * 1.4}px` : `${(mergedTheme.typography?.titleSize || 48) * 1.6}px`,
                    textAlign: 'center'
                  }}>
                    {step.title}
                  </div>
                  {/* Step Description */}
                  <div style={{
                    ...bodyStyle,
                    fontSize: isCompactLayout ? `${(mergedTheme.typography?.bodySize || 20) * 1.5}px` : `${(mergedTheme.typography?.bodySize || 20) * 1.7}px`,
                    textAlign: 'center',
                    lineHeight: 1.4
                  }}>
                    {step.description}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </AbsoluteFill>
      );

    case 'imageGrid2':
    case 'imageGrid4':
    case 'imageGrid6':
      const gridCount = scene.layout === 'imageGrid2' ? 2 : scene.layout === 'imageGrid4' ? 4 : 6;
      const cols = scene.layout === 'imageGrid2' ? 2 : scene.layout === 'imageGrid4' ? 2 : 3;
      const rows = scene.layout === 'imageGrid2' ? 1 : scene.layout === 'imageGrid4' ? 2 : 2;
      const images = [
        layoutContent.imageUrl,
        layoutContent.imageUrl2,
        layoutContent.imageUrl3,
        layoutContent.imageUrl4,
        layoutContent.imageUrl5,
        layoutContent.imageUrl6,
      ].filter(Boolean).slice(0, gridCount);

      return (
        <AbsoluteFill style={{ ...backgroundStyle, padding }}>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            gap: gap * 1.5
          }}>
            {layoutContent.title && (
              <div style={{ ...titleStyle, ...titleAnimation, textAlign: 'center' }}>
                {layoutContent.title}
              </div>
            )}
            <div style={{
              flex: 1,
              display: 'grid',
              gridTemplateColumns: `repeat(${cols}, 1fr)`,
              gridTemplateRows: `repeat(${rows}, 1fr)`,
              gap: gap,
              ...imageAnimation
            }}>
              {images.map((imageUrl, index) => (
                <div key={index} style={{ overflow: 'hidden', borderRadius: '12px' }}>
                  {imageUrl && (
                    <RemotionImage
                      src={imageUrl}
                      alt={`Grid image ${index + 1}`}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover'
                      }}
                    />
                  )}
                </div>
              ))}
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
