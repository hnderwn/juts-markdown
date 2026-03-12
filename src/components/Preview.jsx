import { useMemo, useEffect, useRef } from 'preact/hooks';
import DOMPurify from 'dompurify';
import md from '../utils/markdownParser';

/**
 * Komponen Preview untuk merender markdown menjadi HTML yang aman.
 */
export default function Preview({ content, onPreviewMount, onScroll }) {
  const mermaidTimer = useRef(null);
  const mermaidRef = useRef(null);

  const sanitizedHTML = useMemo(() => {
    try {
      // Render markdown menggunakan markdown-it
      const rawHTML = md.render(content || '');

      // Konfigurasi DOMPurify agar plugin markdown-it bisa berjalan (class, id, checkbox)
      return DOMPurify.sanitize(rawHTML, {
        ADD_TAGS: ['input', 'aside', 'svg', 'foreignObject'],
        ADD_ATTR: ['target', 'checkbox', 'checked', 'disabled', 'class', 'id', 'xmlns', 'viewBox'],
      });
    } catch (error) {
      console.error('Error parsing markdown:', error);
      return '<p class="text-red-500 font-bold border border-red-900/30 p-4 bg-red-900/10 rounded">Error rendering markdown</p>';
    }
  }, [content]);

  // Debounce mermaid render (delay 600ms)
  useEffect(() => {
    if (!content?.includes('```mermaid')) return;
    if (mermaidTimer.current) clearTimeout(mermaidTimer.current);

    mermaidTimer.current = setTimeout(async () => {
      // Lazy load mermaid hanya saat pertama kali dibutuhkan
      if (!mermaidRef.current) {
        const { default: mermaid } = await import('mermaid');
        mermaid.initialize({
          startOnLoad: false,
          theme: window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'default',
        });
        mermaidRef.current = mermaid;
      }

      mermaidRef.current.run();
    }, 600);

    return () => clearTimeout(mermaidTimer.current);
  }, [sanitizedHTML]);

  return (
    <div
      id="markdown-preview"
      ref={(el) => {
        if (el && onPreviewMount) onPreviewMount(el);
      }}
      onScroll={(e) => onScroll && onScroll(e.target)}
      className="prose prose-sm sm:prose lg:prose-lg prose-invert max-w-none h-full w-full overflow-auto p-6 border-none transition-colors duration-300 relative"
      style={{
        backgroundColor: 'var(--bg-preview)',
        backgroundImage: `radial-gradient(ellipse 60% 40% at 15% 10%, rgba(99,102,241,0.045) 0%, transparent 70%)`,
      }}
      dangerouslySetInnerHTML={{ __html: sanitizedHTML }}
    />
  );
}
