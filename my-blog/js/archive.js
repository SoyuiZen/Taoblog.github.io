/* 归档页：按年份分组 + 关键词搜索 + 标签过滤（支持 ?tag= 参数） */
(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', async function () {
    const box = document.getElementById('archive');
    const search = document.getElementById('search');
    const countEl = document.getElementById('count');
    const chipEl = document.getElementById('tag-chip');

    let posts = [];
    const tagFilter = new URLSearchParams(location.search).get('tag') || '';
    let query = '';

    function render() {
      let list = posts;
      if (tagFilter) list = list.filter((p) => (p.tags || []).includes(tagFilter));
      if (query) {
        const q = query.toLowerCase();
        list = list.filter((p) =>
          p.title.toLowerCase().includes(q) ||
          (p.summary || '').toLowerCase().includes(q) ||
          (p.tags || []).some((t) => t.toLowerCase().includes(q))
        );
      }

      countEl.textContent =
        '共 ' + list.length + ' 篇文章' + (tagFilter ? ' · 标签 #' + tagFilter : '');

      if (!list.length) {
        box.innerHTML = '<div class="notice">没有匹配的文章，换个关键词试试。</div>';
        return;
      }

      const byYear = {};
      list.forEach((p) => {
        const y = String(p.date).slice(0, 4);
        (byYear[y] = byYear[y] || []).push(p);
      });

      box.innerHTML = Object.keys(byYear)
        .sort((a, b) => b.localeCompare(a))
        .map((y) =>
          '<section class="year-group">' +
          '<h2 class="year-title">' + y + '<span>' + byYear[y].length + ' 篇</span></h2>' +
          '<div class="post-list">' + byYear[y].map(Blog.postItemHtml).join('') + '</div>' +
          '</section>'
        ).join('');
    }

    try {
      posts = await Blog.getIndex();

      if (tagFilter && chipEl) {
        chipEl.innerHTML =
          '筛选标签：<span class="tag"># ' + Blog.escapeHtml(tagFilter) + '</span>' +
          '<a href="archive.html">清除</a>';
      }

      render();
      search.addEventListener('input', function () {
        query = search.value.trim();
        render();
      });
    } catch (e) {
      Blog.showError(
        box,
        '文章列表加载失败。',
        '若在本地用 file:// 方式打开页面，请改用本地服务器预览：<code>python -m http.server 8000</code>'
      );
    }
  });
})();
