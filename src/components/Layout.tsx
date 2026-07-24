import type { ReactNode } from 'react';

type LayoutProps = {
  children: ReactNode;
};

/** Centered max-width container with the shared horizontal padding. */
export default function Layout({ children }: LayoutProps) {
  return (
    <div className="mx-auto w-full max-w-content px-6 md:px-8">{children}</div>
  );
}
