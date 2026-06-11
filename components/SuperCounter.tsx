'use client';

import { useEffect, useRef } from 'react';

// SuperCounters' online_i.js emits its markup via document.write, which —
// when the script loads after the page is parsed — lands at the end of the
// document, outside <body>. This loads the script inside our own container,
// captures the written markup, and renders it here (hidden) instead.
export default function SuperCounter() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = ref.current;
    if (!container || container.childElementCount > 0) return;

    const originalWrite = document.write.bind(document);
    let captured = '';
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (document as any).write = (html: string) => { captured += html; };

    const restore = () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (document as any).write = originalWrite;
    };

    const script = document.createElement('script');
    script.src = 'https://widget.supercounters.com/ssl/online_i.js';
    script.async = true;
    script.onload = () => {
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const sc = (window as any).sc_online_i;
        if (typeof sc === 'function') sc(1735248, 'ffffff', 'ffffff');
      } finally {
        restore();
        if (captured) container.innerHTML = captured;
        // Some widget versions append straight to the document instead of
        // writing — pull any stray supercounters nodes into the container.
        document.querySelectorAll(
          'body > [src*="supercounters"], body > [href*="supercounters"], html > [src*="supercounters"]'
        ).forEach(el => container.appendChild(el));
      }
    };
    script.onerror = restore;
    container.appendChild(script);

    return restore;
  }, []);

  return (
    <div
      ref={ref}
      aria-hidden="true"
      style={{ position: 'fixed', top: 0, left: 0, width: '1px', height: '1px', overflow: 'hidden', visibility: 'hidden' }}
    />
  );
}
