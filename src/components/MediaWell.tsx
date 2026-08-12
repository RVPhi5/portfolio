import { ImageIcon } from 'lucide-react';
import type { Project } from '../data/projects';
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion';

type MediaWellProps = {
  media?: Project['media'];
  title: string;
  /**
   * When set, the well fills its parent instead of holding a 16:9 box, and
   * drops its own rounding and border. Used by the project cards, where the
   * card supplies the frame and the panel has to match the text column's
   * height rather than its own aspect ratio.
   */
  fill?: boolean;
};

/**
 * Full-width 16:9 media container.
 * Renders an image, a video, a YouTube embed, or a "coming soon" placeholder.
 * Videos autoplay muted/looped and lazily; reduced-motion viewers get the
 * static poster frame instead of a playing video, and YouTube embeds drop
 * their autoplay so the viewer starts them.
 */
export default function MediaWell({ media, title, fill = false }: MediaWellProps) {
  const prefersReducedMotion = usePrefersReducedMotion();

  const frame = fill
    ? 'relative h-full min-h-[200px] w-full overflow-hidden bg-surface'
    : 'relative w-full overflow-hidden rounded-xl border border-border bg-surface aspect-video';

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

  if (media.type === 'youtube') {
    // `loop` on the embed player only works alongside a single-video playlist.
    const params = new URLSearchParams({
      modestbranding: '1',
      rel: '0',
      playsinline: '1',
      controls: '1',
    });
    if (!prefersReducedMotion) {
      params.set('autoplay', '1');
      params.set('mute', '1');
      params.set('loop', '1');
      params.set('playlist', media.src);
    }

    return (
      <div className={frame}>
        <iframe
          className="absolute inset-0 h-full w-full"
          src={`https://www.youtube-nocookie.com/embed/${media.src}?${params.toString()}`}
          title={`${title} preview`}
          loading="lazy"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
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
