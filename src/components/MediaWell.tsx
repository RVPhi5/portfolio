import { ImageIcon } from 'lucide-react';
import type { Project } from '../data/projects';
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion';

type MediaWellProps = {
  media?: Project['media'];
  title: string;
};

/**
 * Full-width 16:9 media container.
 * Renders an image, a video, or a "coming soon" placeholder.
 * Videos autoplay muted/looped and lazily; reduced-motion viewers get the
 * static poster frame instead of a playing video.
 */
export default function MediaWell({ media, title }: MediaWellProps) {
  const prefersReducedMotion = usePrefersReducedMotion();

  const frame =
    'relative w-full overflow-hidden rounded-xl border border-border bg-surface aspect-video';

  if (!media) {
    return (
      <div className={frame}>
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-muted">
          <ImageIcon size={28} strokeWidth={1.5} aria-hidden="true" />
          <span className="text-[13px] tracking-wide">media coming soon</span>
        </div>
      </div>
    );
  }

  if (media.type === 'image') {
    return (
      <div className={frame}>
        <img
          src={media.src}
          alt={`${title} preview`}
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover"
        />
      </div>
    );
  }

  // Video. Fall back to the static poster frame when motion is reduced.
  if (prefersReducedMotion) {
    return (
      <div className={frame}>
        {media.poster ? (
          <img
            src={media.poster}
            alt={`${title} preview`}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-muted">
            <ImageIcon size={28} strokeWidth={1.5} aria-hidden="true" />
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={frame}>
      <video
        className="h-full w-full object-cover"
        autoPlay
        muted
        loop
        playsInline
        preload="none"
        poster={media.poster}
        aria-label={`${title} preview`}
      >
        <source src={media.src} />
      </video>
    </div>
  );
}
