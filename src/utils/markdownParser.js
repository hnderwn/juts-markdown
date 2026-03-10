import MarkdownIt from 'markdown-it';
import mark from 'markdown-it-mark';
import footnote from 'markdown-it-footnote';
import sup from 'markdown-it-sup';
import sub from 'markdown-it-sub';
import deflist from 'markdown-it-deflist';
import { full as emoji } from 'markdown-it-emoji';
import admon from 'markdown-it-admon';
import taskLists from 'markdown-it-task-lists';
import container from 'markdown-it-container';
import attrs from 'markdown-it-attrs';
import abbr from 'markdown-it-abbr';
import * as anchorModule from 'markdown-it-anchor';
const anchor = anchorModule.default || anchorModule;
const permalink = anchorModule.permalink || (anchorModule.default && anchorModule.default.permalink);
import toc from 'markdown-it-toc-done-right';
import Prism from 'prismjs';
import katex from '@traptitech/markdown-it-katex';
import 'katex/dist/katex.min.css';

// Import PrismJS languages that we might need
import 'prismjs/components/prism-markdown';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-css';
import 'prismjs/components/prism-bash';
import 'prismjs/components/prism-json';

/**
 * Konfigurasi MarkdownIt dengan semua plugin dan Syntax Highlighting (PrismJS).
 */
const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
  highlight: function (str, lang) {
    if (lang && Prism.languages[lang]) {
      try {
        return `<pre class="language-${lang}"><code class="language-${lang}">${Prism.highlight(str, Prism.languages[lang], lang)}</code></pre>`;
      } catch (__) {}
    }
    return `<pre class="language-none"><code class="language-none">${md.utils.escapeHtml(str)}</code></pre>`;
  },
});

// Plugin mermaid custom — simpan diagram sebagai div biasa
// mermaid.run() di Preview.jsx yang akan proses render-nya
const mermaidPlugin = (md) => {
  const defaultFence = md.renderer.rules.fence?.bind(md.renderer.rules) || ((tokens, idx, options, env, self) => self.renderToken(tokens, idx, options));

  md.renderer.rules.fence = (tokens, idx, options, env, self) => {
    const token = tokens[idx];
    if (token.info.trim() === 'mermaid') {
      // Wrap dalam div dengan class mermaid — ini yang di-pick up mermaid.run()
      return `<div class="mermaid">${token.content}</div>`;
    }
    return defaultFence(tokens, idx, options, env, self);
  };
};

// Register Plugins
md.use(mark)
  .use(footnote)
  .use(sup)
  .use(sub)
  .use(deflist)
  .use(emoji)
  .use(abbr)
  .use(admon)
  .use(katex)
  .use(mermaidPlugin)
  .use(taskLists, { label: true, labelAfter: true, enabled: true })
  .use(anchor, {
    slugify: (s) =>
      s
        .trim()
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-'),
    permalink: permalink.ariaHidden({
      placement: 'after',
      symbol: '#',
    }),
  })
  .use(attrs)
  .use(toc, { placeholder: '(\\[toc\\])' });

// Custom Containers for Admonitions (VitePress/GitHub style)
const containers = ['info', 'warning', 'danger', 'tip', 'note'];
containers.forEach((type) => {
  md.use(container, type, {
    render: (tokens, idx) => {
      const m = tokens[idx].info.trim().match(new RegExp(`^${type}\\s*(.*)$`));
      if (tokens[idx].nesting === 1) {
        // opening tag
        return `<div class="admonition admonition-${type}">\n<p class="admonition-title">${md.utils.escapeHtml(m[1] || type.toUpperCase())}</p>\n`;
      } else {
        // closing tag
        return '</div>\n';
      }
    },
  });
});

export const renderMarkdown = (content) => md.render(content);

export default md;
