/* 首页：渲染最新文章列表 */
(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', async function () {
    const list = document.getElementById('post-list');
    try {
      const posts = await Blog.getIndex();
      if (!posts.length) {
        list.innerHTML = '<p class="muted">还没有文章。去 <code>posts/</code> 目录写第一篇吧 ✍️</p>';
        return;
      }
      list.innerHTML = posts.slice(0, 6).map(Blog.postItemHtml).join('');
    } catch (e) {
      Blog.showError(
        list,
        '文章列表加载失败。',
        '若在本地用 file:// 方式打开页面，请改用本地服务器预览：<code>python -m http.server 8000</code>'
      );
    }
  });
})();
