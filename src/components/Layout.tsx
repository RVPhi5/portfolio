import type { ReactNode } from 'react';

type LayoutProps = {
  children: ReactNode;
  /**
   * 'centered' — the classic centred reading column (default).
   * 'split'    — on large screens the column is pinned to the left half so the
   *              background scene has the right half to itself. Below `lg`
   *              there isn't room to split, so it falls back to centred.
   */
  variant?: 'centered' | 'split';
};

/** Centered max-width container with the shared horizontal padding. */
export default function Layout({ children, variant = 'centered' }: LayoutProps) {
  if (variant === 'centered') {
    return (
      <div className="mx-auto w-full max-w-content px-6 md:px-8">{children}</div>
    );
  }

  return (
    // The outer track is centred and the inner column is exactly half of its
    // padded width, so the column's right edge lands on the viewport centre at
    // every width above `lg` — which is precisely where SceneStage begins.
    <div className="mx-auto w-full max-w-[1440px] px-6 md:px-8">
      <div className="mx-auto w-full max-w-content lg:mx-0 lg:w-1/2 lg:max-w-none lg:pr-10">
        {children}
      </div>
    </div>
  );
}
