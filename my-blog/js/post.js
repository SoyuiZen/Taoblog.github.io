/* 文章页：根据 URL 中的 ?p=文章名 加载并渲染文章 */
(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', async function () {
    const key = new URLSearchParams(location.search).get('p');
    const el = document.getElementById('post');

    if (!key) {
      Blog.showError(el, '没有指定文章。', '<a href="archive.html">去归档页看看 →</a>');
      return;
    }

    try {
      const posts = await Blog.getIndex();
      const idx = posts.findIndex((p) => p.file.replace(/\.md$/i, '') === key);

      if (idx === -1) {
        Blog.showError(
          el,
          '没有找到这篇文章（' + Blog.escapeHtml(key) + '）。',
          '<a href="archive.html">去归档页看看 →</a>'
        );
        return;
      }

      const post = posts[idx];
      const md = await Blog.getPost(post.file);

      document.title = post.title + ' · ' + window.SITE_NAME;

      el.innerHTML =
        '<header class="post-head">' +
        '<a class="back-link" href="archive.html">← 归档</a>' +
        '<h1>' + Blog.escapeHtml(post.title) + '</h1>' +
        '<div class="post-meta">' +
        '<time datetime="' + Blog.escapeHtml(post.date) + '">' +
        Blog.escapeHtml(Blog.formatDate(post.date)) + '</time>' +
        '<span>约 ' + Blog.readMinutes(md) + ' 分钟阅读</span>' +
        '</div>' +
        '<div class="post-tags">' + Blog.tagsHtml(post.tags) + '</div>' +
        '</header>' +
        '<div class="article">' + Blog.renderMarkdown(md) + '</div>';

      // 上一篇 / 下一篇
      const nav = document.getElementById('post-nav');
      if (nav) {
        const prev = posts[idx + 1];
        const next = posts[idx - 1];
        const keyOf = (p) => encodeURIComponent(p.file.replace(/\.md$/i, ''));
        nav.innerHTML =
          (prev
            ? '<a href="post.html?p=' + keyOf(prev) + '"><span class="label">← 上一篇</span>' + Blog.escapeHtml(prev.title) + '</a>'
            : '<span class="placeholder"></span>') +
          (next
            ? '<a class="next" href="post.html?p=' + keyOf(next) + '"><span class="label">下一篇 →</span>' + Blog.escapeHtml(next.title) + '</a>'
            : '<span class="placeholder"></span>');
      }
    } catch (e) {
      Blog.showError(
        el,
        '文章加载失败。',
        '若在本地用 file:// 方式打开页面，请改用本地服务器预览：<code>python -m http.server 8000</code>'
      );
    }
  });
})();
