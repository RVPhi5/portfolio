import { useEffect, useState } from 'react';

/** Tracks whether the tab is foregrounded, so the render loop can be paused. */
export function usePageVisible(): boolean {
  const [visible, setVisible] = useState(() =>
    typeof document !== 'undefined' ? document.visibilityState === 'visible' : true,
  );

  useEffect(() => {
    const onChange = () => setVisible(document.visibilityState === 'visible');
    // Sync once on mount: the tab may have been backgrounded before this ran.
    onChange();
    document.addEventListener('visibilitychange', onChange);
    return () => document.removeEventListener('visibilitychange', onChange);
  }, []);

  return visible;
}
