/* ==========================================================================
   博客公共逻辑：文章索引读取、轻量 Markdown 渲染、日期/标签格式化
   整个站点零外部依赖，离线也能正常工作。
   ========================================================================== */
(function () {
  'use strict';

  /* ---------------- 轻量 Markdown 渲染器（内置，无 CDN 依赖） ---------------- */

  // 行内语法：`代码`、**加粗**、*斜体*、~~删除线~~、[链接](url)、![图片](url)
  function renderInline(text) {
    let t = Blog.escapeHtml(text);

    // 先用占位符保护行内代码，避免被后续规则误处理
    const codes = [];
    t = t.replace(/`([^`]+)`/g, function (m, c) {
      codes.push(c);
      return '\u0001' + (codes.length - 1) + '\u0001';
    });

    // 图片（须在链接之前处理）
    t = t.replace(/!\[([^\]]*)\]\(([^)\s]+)(?:\s+"([^"]*)")?\)/g, function (m, alt, src, title) {
      let s = src;
      if (!/^(https?:|data:|\/)/i.test(s)) s = 'posts/' + s; // 相对路径补全为 posts/ 目录
      const ttl = title ? ' title="' + Blog.escapeHtml(title) + '"' : '';
      return '<img src="' + s + '" alt="' + alt + '"' + ttl + ' loading="lazy">';
    });

    // 链接（外链自动新窗口打开）
    t = t.replace(/\[([^\]]+)\]\(([^)\s]+)(?:\s+"([^"]*)")?\)/g, function (m, label, href, title) {
      const ext = /^https?:\/\//i.test(href);
      const extra = (ext ? ' target="_blank" rel="noopener noreferrer"' : '') +
        (title ? ' title="' + Blog.escapeHtml(title) + '"' : '');
      return '<a href="' + href + '"' + extra + '>' + label + '</a>';
    });

    t = t.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    t = t.replace(/(^|[^*])\*([^*\n]+)\*(?!\*)/g, '$1<em>$2</em>');
    t = t.replace(/~~([^~]+)~~/g, '<del>$1</del>');

    // 还原行内代码
    t = t.replace(/\u0001(\d+)\u0001/g, function (m, n) {
      return '<code>' + codes[Number(n)] + '</code>';
    });

    t = t.replace(/\n/g, '<br>');
    return t;
  }

  function splitRow(line) {
    return line.replace(/^\s*\|/, '').replace(/\|\s*$/, '').split('|');
  }

  // 块级渲染：标题、段落、代码块、引用、列表、表格、分割线
  function renderBlocks(src) {
    const lines = src.split('\n');
    const out = [];
    let i = 0;

    const isBlank = (l) => /^\s*$/.test(l);
    const isFence = (l) => /^```/.test(l);
    const isHeading = (l) => /^#{1,6}\s+/.test(l);
    const isQuote = (l) => /^\s*>\s?/.test(l);
    const isHr = (l) => /^\s*(-{3,}|\*{3,}|_{3,})\s*$/.test(l);
    const isUl = (l) => /^\s*[-*+]\s+/.test(l);
    const isOl = (l) => /^\s*\d+[.)]\s+/.test(l);
    const isTableSep = (l) => l.includes('|') && /^\s*\|?[\s:|-]+\|?\s*$/.test(l) && l.includes('-');
    const startsTable = (idx) => lines[idx] && lines[idx].includes('|') && isTableSep(lines[idx + 1] || '');

    while (i < lines.length) {
      const line = lines[i];

      if (isBlank(line)) { i++; continue; }

      // 围栏代码块
      if (isFence(line)) {
        const lang = (line.match(/^```(\S*)/) || [])[1] || '';
        const buf = [];
        i++;
        while (i < lines.length && !isFence(lines[i])) { buf.push(lines[i]); i++; }
        i++; // 跳过结束围栏
        const langAttr = lang ? ' class="language-' + Blog.escapeHtml(lang) + '"' : '';
        out.push('<pre><code' + langAttr + '>' + Blog.escapeHtml(buf.join('\n')) + '</code></pre>');
        continue;
      }

      if (isHr(line)) { out.push('<hr>'); i++; continue; }

      // 标题
      const h = line.match(/^(#{1,6})\s+(.*)$/);
      if (h) {
        const lv = h[1].length;
        out.push('<h' + lv + '>' + renderInline(h[2]) + '</h' + lv + '>');
        i++;
        continue;
      }

      // 引用（连续多行合并，内部递归渲染块级元素）
      if (isQuote(line)) {
        const buf = [];
        while (i < lines.length && isQuote(lines[i])) {
          buf.push(lines[i].replace(/^\s*>\s?/, ''));
          i++;
        }
        out.push('<blockquote>' + renderBlocks(buf.join('\n')) + '</blockquote>');
        continue;
      }

      // 表格（表头行 + 分隔行 + 数据行）
      if (startsTable(i)) {
        const header = splitRow(line);
        i += 2;
        const rows = [];
        while (i < lines.length && lines[i].includes('|') && !isBlank(lines[i])) {
          rows.push(splitRow(lines[i]));
          i++;
        }
        const cells = (arr, tag) =>
          arr.map((c) => '<' + tag + '>' + renderInline(c.trim()) + '</' + tag + '>').join('');
        out.push(
          '<table><thead><tr>' + cells(header, 'th') + '</tr></thead><tbody>' +
          rows.map((r) => '<tr>' + cells(r, 'td') + '</tr>').join('') + '</tbody></table>'
        );
        continue;
      }

      // 无序 / 有序列表（缩进续行并入当前条目）
      const ul = line.match(/^\s*[-*+]\s+(.*)$/);
      const ol = line.match(/^\s*\d+[.)]\s+(.*)$/);
      if (ul || ol) {
        const ordered = !!ol;
        const items = [];
        while (i < lines.length) {
          const m = ordered
            ? lines[i].match(/^\s*\d+[.)]\s+(.*)$/)
            : lines[i].match(/^\s*[-*+]\s+(.*)$/);
          if (!m) break;
          items.push(m[1]);
          i++;
          const cont = [];
          while (i < lines.length && /^\s{2,}\S/.test(lines[i]) && !isFence(lines[i])) {
            cont.push(lines[i].replace(/^\s{2,}/, ''));
            i++;
          }
          if (cont.length) items[items.length - 1] += '\n' + cont.join('\n');
        }
        const tag = ordered ? 'ol' : 'ul';
        out.push('<' + tag + '>' + items.map((it) => '<li>' + renderInline(it) + '</li>').join('') + '</' + tag + '>');
        continue;
      }

      // 段落：收集到空行或下一个块级元素开始
      const buf = [line];
      i++;
      while (
        i < lines.length &&
        !isBlank(lines[i]) &&
        !isFence(lines[i]) &&
        !isHeading(lines[i]) &&
        !isQuote(lines[i]) &&
        !isHr(lines[i]) &&
        !isUl(lines[i]) &&
        !isOl(lines[i]) &&
        !startsTable(i)
      ) {
        buf.push(lines[i]);
        i++;
      }
      out.push('<p>' + renderInline(buf.join('\n')) + '</p>');
    }

    return out.join('\n');
  }

  /* ---------------- 博客公共 API ---------------- */

  const Blog = {
    /** 读取文章索引（按日期倒序） */
    async getIndex() {
      const res = await fetch('posts/index.json', { cache: 'no-cache' });
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const data = await res.json();
      return (data.posts || []).slice().sort((a, b) => (a.date < b.date ? 1 : -1));
    },

    /** 读取某篇文章的 Markdown 原文 */
    async getPost(file) {
      const res = await fetch('posts/' + file, { cache: 'no-cache' });
      if (!res.ok) throw new Error('HTTP ' + res.status);
      return res.text();
    },

    escapeHtml(s) {
      return String(s).replace(/[&<>"']/g, (c) => (
        { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
      ));
    },

    /** '2026-10-30' -> '2026 年 10 月 30 日' */
    formatDate(iso) {
      const m = String(iso || '').match(/^(\d{4})-(\d{2})-(\d{2})/);
      if (!m) return iso;
      return m[1] + ' 年 ' + Number(m[2]) + ' 月 ' + Number(m[3]) + ' 日';
    },

    /** 阅读时长估算（中文约 400 字/分钟） */
    readMinutes(md) {
      const chars = String(md || '').replace(/\s/g, '').length;
      return Math.max(1, Math.round(chars / 400));
    },

    /** Markdown -> HTML */
    renderMarkdown(md) {
      return renderBlocks(String(md || '').replace(/\r\n?/g, '\n'));
    },

    /** 标签 pills HTML（点击跳转归档页并过滤） */
    tagsHtml(tags) {
      return (tags || []).map((t) =>
        '<a class="tag" href="archive.html?tag=' + encodeURIComponent(t) + '"># ' + Blog.escapeHtml(t) + '</a>'
      ).join('');
    },

    /** 文章列表项 HTML */
    postItemHtml(post) {
      const key = post.file.replace(/\.md$/i, '');
      return (
        '<article class="post-item">' +
        '<time class="post-date" datetime="' + Blog.escapeHtml(post.date) + '">' +
        Blog.escapeHtml(Blog.formatDate(post.date)) + '</time>' +
        '<h2 class="post-title"><a href="post.html?p=' + encodeURIComponent(key) + '">' +
        Blog.escapeHtml(post.title) + '</a></h2>' +
        '<p class="post-summary">' + Blog.escapeHtml(post.summary || '') + '</p>' +
        '<div class="post-tags">' + Blog.tagsHtml(post.tags) + '</div>' +
        '</article>'
      );
    },

    /** 错误提示条 */
    showError(el, msg, extra) {
      el.innerHTML = '<div class="notice">⚠️ ' + msg + (extra ? '<br>' + extra : '') + '</div>';
    }
  };

  window.Blog = Blog;
  const meta = typeof document !== 'undefined' ? document.querySelector('meta[name="site-name"]') : null;
  window.SITE_NAME = (meta && meta.content) || '我的博客';
})();
