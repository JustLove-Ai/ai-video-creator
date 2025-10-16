import { AbsoluteFill } from 'remotion';
import type { AnnotationElement } from '@/types';

interface RemotionAnnotationsProps {
  annotations: AnnotationElement[];
}

/**
 * Renders annotations in Remotion video
 * Annotations are scaled up 2x for 1920x1080 video resolution
 */
export function RemotionAnnotations({ annotations }: RemotionAnnotationsProps) {
  const renderAnnotation = (annotation: AnnotationElement) => {
    const commonProps = {
      stroke: annotation.stroke,
      strokeWidth: annotation.strokeWidth * 2, // Scale for video
      opacity: annotation.opacity,
      fill: annotation.fill || 'none',
    };

    switch (annotation.type) {
      case 'freehand':
        if (!annotation.points || annotation.points.length < 2) return null;
        const pathData = annotation.points
          .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x * 2} ${p.y * 2}`) // Scale for video
          .join(' ');
        return (
          <path
            key={annotation.id}
            d={pathData}
            {...commonProps}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        );

      case 'line':
        return (
          <line
            key={annotation.id}
            x1={annotation.x * 2}
            y1={annotation.y * 2}
            x2={(annotation.endX || annotation.x) * 2}
            y2={(annotation.endY || annotation.y) * 2}
            {...commonProps}
            strokeLinecap="round"
          />
        );

      case 'arrow':
        const dx = (annotation.endX || annotation.x) - annotation.x;
        const dy = (annotation.endY || annotation.y) - annotation.y;
        const angle = Math.atan2(dy, dx);
        const arrowLength = 15 * 2; // Scale for video
        return (
          <g key={annotation.id}>
            <line
              x1={annotation.x * 2}
              y1={annotation.y * 2}
              x2={(annotation.endX || annotation.x) * 2}
              y2={(annotation.endY || annotation.y) * 2}
              {...commonProps}
              strokeLinecap="round"
            />
            <path
              d={`
                M ${(annotation.endX || annotation.x) * 2} ${(annotation.endY || annotation.y) * 2}
                L ${((annotation.endX || annotation.x) - arrowLength * Math.cos(angle - Math.PI / 6)) * 2} ${((annotation.endY || annotation.y) - arrowLength * Math.sin(angle - Math.PI / 6)) * 2}
                M ${(annotation.endX || annotation.x) * 2} ${(annotation.endY || annotation.y) * 2}
                L ${((annotation.endX || annotation.x) - arrowLength * Math.cos(angle + Math.PI / 6)) * 2} ${((annotation.endY || annotation.y) - arrowLength * Math.sin(angle + Math.PI / 6)) * 2}
              `}
              {...commonProps}
              fill="none"
              strokeLinecap="round"
            />
          </g>
        );

      case 'rectangle':
        return (
          <rect
            key={annotation.id}
            x={Math.min(annotation.x, annotation.x + (annotation.width || 0)) * 2}
            y={Math.min(annotation.y, annotation.y + (annotation.height || 0)) * 2}
            width={Math.abs(annotation.width || 0) * 2}
            height={Math.abs(annotation.height || 0) * 2}
            {...commonProps}
          />
        );

      case 'circle':
        const rx = Math.abs(annotation.width || 0) / 2 * 2; // Scale for video
        const ry = Math.abs(annotation.height || 0) / 2 * 2;
        const cx = (annotation.x + (annotation.width || 0) / 2) * 2;
        const cy = (annotation.y + (annotation.height || 0) / 2) * 2;
        return (
          <ellipse
            key={annotation.id}
            cx={cx}
            cy={cy}
            rx={rx}
            ry={ry}
            {...commonProps}
          />
        );

      case 'text':
        return (
          <text
            key={annotation.id}
            x={annotation.x * 2}
            y={annotation.y * 2}
            fill={annotation.stroke}
            fontSize={(annotation.fontSize || 24) * 2} // Scale for video
            opacity={annotation.opacity}
            fontFamily="Caveat, 'Comic Sans MS', cursive"
            fontWeight="500"
          >
            {annotation.text || 'Text'}
          </text>
        );

      default:
        return null;
    }
  };

  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 1920 1080"
        xmlns="http://www.w3.org/2000/svg"
      >
        {annotations.map((annotation) => renderAnnotation(annotation))}
      </svg>
    </AbsoluteFill>
  );
}
