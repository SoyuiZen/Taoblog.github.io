/* 全局交互：主题切换、页脚年份、导航高亮 */
(function () {
  'use strict';

  function setTheme(theme, save) {
    document.documentElement.dataset.theme = theme;
    const btn = document.getElementById('theme-toggle');
    if (btn) btn.textContent = theme === 'dark' ? '☀️' : '🌙';
    if (save) {
      try { localStorage.setItem('theme', theme); } catch (e) { /* 隐私模式下忽略 */ }
    }
  }

  document.addEventListener('DOMContentLoaded', function () {
    // 页面 head 内联脚本已应用初始主题，这里同步按钮图标
    setTheme(document.documentElement.dataset.theme || 'light', false);

    const btn = document.getElementById('theme-toggle');
    if (btn) {
      btn.addEventListener('click', function () {
        const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
        setTheme(next, true);
      });
    }

    // 页脚年份
    const year = document.getElementById('year');
    if (year) year.textContent = new Date().getFullYear();

    // 导航高亮（相对路径匹配，兼容 GitHub Pages 子目录部署）
    let page = location.pathname.split('/').pop();
    if (!page) page = 'index.html';
    document.querySelectorAll('.site-nav a').forEach(function (a) {
      if (a.getAttribute('href') === page) a.classList.add('active');
    });
  });
})();
