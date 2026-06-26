interface NoiseTextureProps {
  className?: string
  baseFrequency?: number
  /** Unique ID suffix to avoid SVG filter/mask ID collisions when multiple instances are on the page */
  id?: string
}

/**
 * SVG fractalNoise overlay with radial gradient mask — fades at edges.
 * Opacity is controlled per-theme via .noise-texture CSS class.
 * Pass a unique `id` prop when rendering more than one instance on the same page.
 */
export function NoiseTexture({ className, baseFrequency = 0.65, id = 'default' }: NoiseTextureProps) {
  const filterId = `noise-filter-${id}`
  const gradientId = `noise-gradient-${id}`
  const maskId = `noise-mask-${id}`

  return (
    <svg
      aria-hidden="true"
      width="100%"
      height="100%"
      xmlns="http://www.w3.org/2000/svg"
      className={`noise-texture pointer-events-none select-none${className ? ` ${className}` : ''}`}
    >
      <defs>
        <filter id={filterId} x="0%" y="0%" width="100%" height="100%">
          <feTurbulence
            type="fractalNoise"
            baseFrequency={baseFrequency}
            numOctaves="4"
            stitchTiles="stitch"
            result="noise"
          />
          <feColorMatrix type="saturate" values="0" in="noise" result="grey" />
        </filter>
        <radialGradient id={gradientId} cx="50%" cy="40%" r="70%">
          <stop offset="0%" stopColor="white" stopOpacity="1" />
          <stop offset="100%" stopColor="white" stopOpacity="0" />
        </radialGradient>
        <mask id={maskId}>
          <rect width="100%" height="100%" fill={`url(#${gradientId})`} />
        </mask>
      </defs>
      <rect
        width="100%"
        height="100%"
        filter={`url(#${filterId})`}
        mask={`url(#${maskId})`}
      />
    </svg>
  )
}
