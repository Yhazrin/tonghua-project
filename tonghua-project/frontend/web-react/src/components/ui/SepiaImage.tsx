import { type ImgHTMLAttributes } from 'react';

interface SepiaImageProps extends ImgHTMLAttributes<HTMLImageElement> {
  aspectRatio?: string;
  grainOverlay?: boolean;
}

export default function SepiaImage({
  aspectRatio = '4/3',
  grainOverlay = true,
  className = '',
  style,
  ...props
}: SepiaImageProps) {
  return (
    <div
      className={`relative overflow-hidden ${className}`}
      style={{ aspectRatio, ...style }}
    >
      <img
        {...props}
        className="w-full h-full object-cover"
        style={{
          filter: 'sepia(0.2) contrast(1.05) brightness(0.97)',
        }}
        loading={props.loading ?? 'lazy'}
      />
      {grainOverlay && (
        <div
          className="absolute inset-0 pointer-events-none mix-blend-multiply opacity-30"
          style={{
            backgroundImage: 'url(/textures/grain.png)',
            backgroundRepeat: 'repeat',
            backgroundSize: '200px 200px',
          }}
        />
      )}
    </div>
  );
}
