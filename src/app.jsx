import { useState, useEffect, useCallback, useMemo, useRef } from 'preact/hooks';
import Editor from './components/Editor';
import Preview from './components/Preview';
import ThemeSwitcher from './components/ThemeSwitcher';
import useLocalStorage from './hooks/useLocalStorage';
import { downloadMarkdown, downloadHTML, copyToClipboard, calculateReadingTime } from './utils/exportUtils';
import { marked } from 'marked';
import DOMPurify from 'dompurify';

/**
 * Komponen utama App JustMarkdown.
 * Mengelola state konten dan layout responsif.
 */
export default function App() {
  // Persistence (Phase 2 & 3)
  const [content, setContent] = useLocalStorage('jm-draft', '# Just Markdown\n\nSelamat datang di Just Markdown!');
  const [theme, setTheme] = useLocalStorage('jm-theme', 'dark');
  const [isZenMode, setIsZenMode] = useState(false);
  const [editorWidth, setEditorWidth] = useLocalStorage('jm-editor-width', 50);
  const [showHeadingBorder, setShowHeadingBorder] = useLocalStorage('jm-heading-border', false);

  const [debouncedContent, setDebouncedContent] = useState(content);
  const [activeTab, setActiveTab] = useState('edit');
  const [copyStatus, setCopyStatus] = useState('Copy HTML');
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const isResizing = useRef(false);
  const menuRef = useRef(null);

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

  // Click outside listener for mobile menu
  useEffect(() => {
    function handleClickOutside(event) {
      if (showMobileMenu && menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMobileMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showMobileMenu]);

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
    const rawHTML = marked.parse(content || '', { gfm: true, breaks: true });
    const sanitized = DOMPurify.sanitize(rawHTML);
    downloadHTML(sanitized);
  }, [content]);

  const handleCopyHTML = useCallback(async () => {
    try {
      const rawHTML = marked.parse(content || '');
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

  // Common button style
  const btnStyle = (isActive) => ({
    backgroundColor: isActive ? 'var(--accent)' : 'var(--bg-secondary)',
    borderColor: 'var(--border-color)',
    color: isActive ? 'var(--bg-primary)' : 'var(--text-primary)',
    cursor: 'pointer',
  });

  return (
    <div className="flex flex-col h-screen overflow-hidden transition-colors duration-300 font-sans" style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
      {/* Header / Toolbar */}
      <header className="flex items-center justify-between px-4 py-2 border-b shadow-md z-30 transition-colors duration-300" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)' }}>
        <div className="flex items-center gap-2">
          {/* Logo */}
          <span className="hidden sm:block text-xl font-bold tracking-tight" style={{ color: 'var(--accent)' }}>
            JustMarkdown
          </span>
          <img src="/src/assets/logo.svg" alt="Logo" className="block sm:hidden w-8 h-8 object-contain" />
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          {/* Toggle Tab Mobile (Single Button) */}
          <button onClick={() => setActiveTab(activeTab === 'edit' ? 'preview' : 'edit')} className="md:hidden text-[10px] px-3 py-1.5 rounded-lg transition border uppercase font-bold" style={btnStyle(true)}>
            {activeTab === 'edit' ? 'PREVIEW' : 'EDIT'}
          </button>

          <ThemeSwitcher theme={theme} setTheme={setTheme} />

          {/* Actions Desktoip */}
          <div className="hidden md:flex items-center gap-2">
            <button onClick={() => setIsZenMode(!isZenMode)} className="text-[10px] px-2 py-1 rounded transition border" style={btnStyle(isZenMode)}>
              Zen Mode
            </button>
            <button onClick={() => setShowHeadingBorder(!showHeadingBorder)} className="text-[10px] px-2 py-1 rounded transition border" style={btnStyle(showHeadingBorder)}>
              Border
            </button>
            <button onClick={handleCopyHTML} className="text-[10px] px-2 py-1 rounded transition border" style={btnStyle(false)}>
              {copyStatus}
            </button>
            <button onClick={handleDownload} className="text-[10px] px-2 py-1 rounded transition border" style={btnStyle(false)}>
              MD
            </button>
            <button onClick={handleDownloadHTML} className="text-[10px] px-2 py-1 rounded transition border" style={btnStyle(false)}>
              HTML
            </button>
            <button onClick={handleClear} className="text-[10px] px-2 py-1 rounded transition border border-red-900/30 hover:bg-red-900/40 text-red-400 cursor-pointer" style={{ backgroundColor: 'rgba(127, 29, 29, 0.1)' }}>
              Clear
            </button>
          </div>

          {/* Action Menu Mobile */}
          <div ref={menuRef} className="md:hidden relative">
            <button onClick={() => setShowMobileMenu(!showMobileMenu)} className="p-2 rounded-lg transition-colors border border-[var(--border-color)] cursor-pointer" style={{ backgroundColor: 'var(--bg-secondary)' }}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" />
              </svg>
            </button>

            {showMobileMenu && (
              <div className="absolute right-0 mt-2 w-48 rounded-xl shadow-2xl border border-[var(--border-color)] overflow-hidden z-[100] animate-in slide-in-from-top-2 duration-200" style={{ backgroundColor: 'var(--bg-secondary)' }}>
                {[
                  { label: copyStatus, onClick: handleCopyHTML },
                  { label: 'Download MD', onClick: handleDownload },
                  { label: 'Download HTML', onClick: handleDownloadHTML },
                  { label: `Border: ${showHeadingBorder ? 'ON' : 'OFF'}`, onClick: () => setShowHeadingBorder(!showHeadingBorder) },
                  { label: 'Clear All', onClick: handleClear, className: 'text-red-400' },
                ].map((item, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      item.onClick();
                      setShowMobileMenu(false);
                    }}
                    className={`w-full text-left px-4 py-3 text-xs hover:bg-white/5 transition-colors border-b last:border-0 border-[var(--border-color)] ${item.className || ''}`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Area */}
      <main className="flex-1 flex overflow-hidden relative" style={{ '--editor-width': isZenMode ? '100%' : `${editorWidth}%` }}>
        <div
          className={`h-full border-r border-neutral-800 transition-all duration-75 ease-out editor-pane ${activeTab === 'edit' ? 'flex' : 'hidden'} ${isZenMode ? 'w-full px-[5%] sm:px-[15%] lg:px-[25%]' : 'md:flex'}`}
          style={{ backgroundColor: isZenMode ? 'var(--bg-primary)' : 'transparent' }}
        >
          <Editor value={content} onChange={setContent} />
        </div>

        {!isZenMode && <div className="hidden md:block resizer-h" onMouseDown={startResizing} />}

        {!isZenMode && (
          <div className={`h-full transition-all duration-75 ease-out preview-pane ${activeTab === 'preview' ? 'flex' : 'hidden'} md:flex overflow-hidden ${showHeadingBorder ? 'show-heading-border' : ''}`}>
            <Preview content={debouncedContent} />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer
        className="px-4 py-1 text-[10px] border-t flex justify-between items-center font-mono transition-colors duration-300"
        style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)', color: 'var(--text-secondary)' }}
      >
        <div className="flex gap-4">
          <span>Characters: {stats.chars}</span>
          <span>Words: {stats.words}</span>
          <span>Reading: ~{stats.readingTime} min</span>
        </div>
        <div>v0.2.0 - Stability & Utilities</div>
      </footer>
    </div>
  );
}
