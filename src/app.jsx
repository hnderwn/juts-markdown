import { useState, useEffect, useRef, useCallback, useMemo } from 'preact/hooks';
import Editor from './components/Editor';
import Preview from './components/Preview';
import Header from './components/Header';
import Footer from './components/Footer';
import useLocalStorage from './hooks/useLocalStorage';
import { downloadMarkdown, downloadHTML, copyToClipboard, calculateReadingTime } from './utils/exportUtils';
import { renderMarkdown } from './utils/markdownParser';
import DOMPurify from 'dompurify';
import boilerplate from '../boilerplate.md?raw';

/**
 * Komponen utama App JustMarkdown.
 * Mengelola state konten dan layout responsif.
 */
export default function App() {
  // Persistence (Phase 2 & 3)
  const [content, setContent] = useLocalStorage('jm-draft', boilerplate);
  const [theme, setTheme] = useLocalStorage('jm-theme', 'dark');
  const [isZenMode, setIsZenMode] = useState(false);
  const [editorWidth, setEditorWidth] = useLocalStorage('jm-editor-width', 50);
  const [showHeadingBorder, setShowHeadingBorder] = useLocalStorage('jm-heading-border', false);
  const [spacing, setSpacing] = useLocalStorage('jm-spacing', 'loose');

  const [debouncedContent, setDebouncedContent] = useState(content);
  const [activeTab, setActiveTab] = useState('edit');
  const [copyStatus, setCopyStatus] = useState('Copy HTML');
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const isResizing = useRef(false);
  const editorScrollDOM = useRef(null);
  const previewScrollDOM = useRef(null);
  const isSyncing = useRef(false);

  // Logic Resizing
  const startResizing = useCallback(() => {
    isResizing.current = true;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  }, []);

  const stopResizing = useCallback(() => {
    if (!isResizing.current) return;
    isResizing.current = false;
    document.body.style.cursor = 'default';
    document.body.style.userSelect = 'auto';
  }, []);

  const resize = useCallback(
    (e) => {
      if (!isResizing.current) return;
      const newWidth = (e.clientX / window.innerWidth) * 100;
      if (newWidth > 15 && newWidth < 85) {
        setEditorWidth(newWidth);
      }
    },
    [setEditorWidth],
  );

  useEffect(() => {
    window.addEventListener('mousemove', resize);
    window.addEventListener('mouseup', stopResizing);
    return () => {
      window.removeEventListener('mousemove', resize);
      window.removeEventListener('mouseup', stopResizing);
    };
  }, [resize, stopResizing]);

  // Force Edit tab when entering Zen Mode
  useEffect(() => {
    if (isZenMode) setActiveTab('edit');
  }, [isZenMode]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Implementasi Debounce 300ms
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedContent(content);
    }, 300);

    return () => clearTimeout(handler);
  }, [content]);

  const handleClear = useCallback(() => {
    if (confirm('Bersihkan semua teks?')) {
      setContent('');
    }
  }, [setContent]);

  const handleDownload = useCallback(() => {
    downloadMarkdown(content);
  }, [content]);

  const handleDownloadHTML = useCallback(() => {
    const rawHTML = renderMarkdown(content || '');
    const sanitized = DOMPurify.sanitize(rawHTML);
    downloadHTML(sanitized);
  }, [content]);

  const handleCopyHTML = useCallback(async () => {
    try {
      const rawHTML = renderMarkdown(content || '');
      const sanitized = DOMPurify.sanitize(rawHTML);
      const success = await copyToClipboard(sanitized);
      if (success) {
        setCopyStatus('Copied!');
        setTimeout(() => setCopyStatus('Copy HTML'), 2000);
      }
    } catch (err) {
      console.error(err);
    }
  }, [content]);

  const stats = useMemo(
    () => ({
      chars: content.length,
      words: content.trim() ? content.trim().split(/\s+/).length : 0,
      readingTime: calculateReadingTime(content),
    }),
    [content],
  );

  // Sync Scroll Logic (Optimized for smoothness)
  const syncScroll = useCallback(
    (source, target) => {
      if (!source || !target || isSyncing.current || isZenMode) return;

      isSyncing.current = true;

      // Gunakan requestAnimationFrame untuk pergerakan yang mulus (60fps)
      requestAnimationFrame(() => {
        const scrollRatio = source.scrollTop / (source.scrollHeight - source.clientHeight);
        const targetPos = scrollRatio * (target.scrollHeight - target.clientHeight);

        // Hanya update jika ada perubahan signifikan untuk performa
        if (Math.abs(target.scrollTop - targetPos) > 1) {
          target.scrollTop = targetPos;
        }

        // Lepas lock di frame berikutnya
        requestAnimationFrame(() => {
          isSyncing.current = false;
        });
      });
    },
    [isZenMode],
  );

  const handleEditorScroll = useCallback(
    (dom) => {
      if (!isZenMode) syncScroll(dom, previewScrollDOM.current);
    },
    [isZenMode, syncScroll],
  );

  const handlePreviewScroll = useCallback(
    (dom) => {
      if (!isZenMode) syncScroll(dom, editorScrollDOM.current);
    },
    [isZenMode, syncScroll],
  );

  return (
    <div className="flex flex-col h-full overflow-hidden transition-colors duration-300 font-sans" style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
      <Header
        className="shrink-0 overflow-hidden"
        theme={theme}
        setTheme={setTheme}
        isZenMode={isZenMode}
        setIsZenMode={setIsZenMode}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        showHeadingBorder={showHeadingBorder}
        setShowHeadingBorder={setShowHeadingBorder}
        spacing={spacing}
        setSpacing={setSpacing}
        copyStatus={copyStatus}
        handleCopyHTML={handleCopyHTML}
        handleDownload={handleDownload}
        handleDownloadHTML={handleDownloadHTML}
        handleClear={handleClear}
        showMobileMenu={showMobileMenu}
        setShowMobileMenu={setShowMobileMenu}
      />

      {/* Main Area */}
      <main className="flex-1 flex overflow-hidden relative" style={{ '--editor-width': isZenMode ? '100%' : `${editorWidth}%` }}>
        <div
          className={`h-full border-r border-neutral-800 transition-all duration-75 ease-out editor-pane ${activeTab === 'edit' ? 'flex' : 'hidden'} ${isZenMode ? 'w-full px-[5%] sm:px-[15%] lg:px-[25%]' : 'md:flex'}`}
          style={{ backgroundColor: isZenMode ? 'var(--bg-primary)' : 'transparent' }}
        >
          <Editor value={content} onChange={setContent} onEditorMount={(dom) => (editorScrollDOM.current = dom)} onScroll={handleEditorScroll} />
        </div>

        {!isZenMode && <div className="hidden md:block resizer-h" onMouseDown={startResizing} />}

        {!isZenMode && (
          <div className={`h-full transition-all duration-75 ease-out preview-pane ${activeTab === 'preview' ? 'flex' : 'hidden'} md:flex overflow-hidden ${showHeadingBorder ? 'show-heading-border' : ''}`} data-spacing={spacing}>
            <Preview content={debouncedContent} onPreviewMount={(dom) => (previewScrollDOM.current = dom)} onScroll={handlePreviewScroll} />
          </div>
        )}
      </main>

      <Footer stats={stats} className="shrink-0" />
    </div>
  );
}
