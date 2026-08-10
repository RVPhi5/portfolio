import type { ReactNode } from 'react';

type LayoutProps = {
  children: ReactNode;
};

/**
 * Centered reading column with the shared horizontal padding, used by the
 * prose pages. The homepage sets its own wider track, since the project grid
 * needs room for two cards side by side.
 *
 * The column is painted solid `bg` so the mosaic behind it never sits under
 * body copy — the cubes read in the margins instead, which is what lets the
 * background run at a much higher opacity than it otherwise could.
 */
export default function Layout({ children }: LayoutProps) {
  return (
    <div className="mx-auto w-full max-w-content bg-bg px-6 md:px-8">{children}</div>
  );
}
