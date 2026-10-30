# 我的博客（My Blog）

一个极简风格的个人静态博客：**纯 HTML / CSS / JavaScript，零依赖、零成本**，可直接免费部署到 GitHub Pages。所有文章都是 Markdown 纯文本，永久可读、随时可迁移。

## ✨ 功能特性

- **极简黑白灰设计 + 明暗双主题**：跟随系统自动切换，也可点击右上角按钮手动切换并记住偏好
- **手机 / 平板 / 桌面**自适应布局
- 页面齐全：首页（最新文章）、文章页（上一篇/下一篇导航 + 阅读时长估算）、归档页（按年份分组 + 关键词/标签过滤）、关于页、404 页
- **内置轻量 Markdown 渲染器**：不依赖任何外部 CDN，离线可用、国内访问稳定
- 基础 SEO：meta 描述、Open Graph、`sitemap.xml`、`robots.txt`
- 标签系统：点击标签直达归档页并自动过滤

## 📁 目录结构

```
my-blog/
├── index.html              # 首页
├── post.html               # 文章页模板（通过 ?p=文章名 加载）
├── archive.html            # 归档页（搜索 + 标签过滤）
├── about.html              # 关于页（直接编辑此文件自我介绍）
├── 404.html                # 404 页面
├── favicon.svg             # 网站图标
├── robots.txt              # 搜索引擎协议（部署后改域名）
├── sitemap.xml             # 站点地图（部署后改域名）
├── .nojekyll               # 告诉 GitHub Pages 跳过 Jekyll 处理
├── css/
│   └── style.css           # 全部样式（主题色等变量在文件顶部）
├── js/
│   ├── blog.js             # 公共逻辑：索引读取 + Markdown 渲染
│   ├── main.js             # 主题切换、导航高亮、页脚年份
│   ├── index.js            # 首页文章列表
│   ├── post.js             # 文章页渲染
│   └── archive.js          # 归档/搜索/标签过滤
└── posts/
    ├── index.json          # ★ 文章索引（发新文章要在这里登记）
    ├── 2026-10-30-hello-world.md
    ├── 2026-10-28-why-i-blog.md
    ├── 2026-10-25-my-writing-workflow.md
    └── img/                # 文章图片放这里
```

## 🚀 快速开始

### 一、本地预览

> ⚠️ 不要直接双击 `index.html` 打开：浏览器出于安全限制，禁止 `file://` 页面读取本地文件，文章会加载失败。请用下面任一方式启动本地服务器：

**方式 1（Python）**

```bash
cd my-blog
python -m http.server 8000
```

浏览器打开 <http://localhost:8000>

**方式 2（VS Code + Live Server 插件）**：安装 Live Server 插件后，右键 `index.html` → Open with Live Server。

**方式 3（Node.js）**

```bash
npx serve .
```

### 二、部署到 GitHub Pages（免费，约 10 分钟）

1. **注册 GitHub**：打开 <https://github.com> 免费注册账号。
2. **新建仓库**：右上角 `+` → `New repository` → 仓库名填 `blog`（或任意名）→ 选择 **Public** → 不勾选任何初始化文件 → `Create repository`。
3. **上传文件**：仓库页面 → `Add file` → `Upload files` → 把 `my-blog` 文件夹里的**全部文件**拖进去 → `Commit changes`。
4. **开启 Pages**：仓库 → `Settings` → `Pages` → `Build and deployment` 的 Source 选 **Deploy from a branch** → Branch 选 `main`、目录选 `/ (root)` → `Save`。
5. **等待约 1 分钟**，访问：

   ```
   https://你的用户名.github.io/blog/
   ```

   仓库页面出现绿色 ✓ 即发布成功。

   💡 若把仓库名改为 `你的用户名.github.io`，网址就是 `https://你的用户名.github.io/`，更简洁。

**Git 方式上传（可选，后续更新推荐用这个）**

```bash
cd my-blog
git init
git add .
git commit -m "初始化博客"
git branch -M main
git remote add origin https://github.com/你的用户名/blog.git
git push -u origin main
```

以后每次更新只需：

```bash
git add .
git commit -m "新文章：xxx"
git push
```

### 三、绑定自定义域名（可选，约 ¥60–90/年）

1. 购买域名：海外推荐 [Namecheap](https://www.namecheap.com)、[Cloudflare](https://www.cloudflare.com)；国内可选阿里云/腾讯云（需实名认证）。
2. 在域名服务商后台添加 DNS 记录：
   - 一条 **CNAME**：主机记录 `www` → `你的用户名.github.io`
   - 四条 **A** 记录：指向 GitHub Pages 的 IP（`185.199.108.153` 等，以 GitHub 官方文档为准）
3. 仓库 → Settings → Pages → **Custom domain** 填入域名 → Save → 勾选 **Enforce HTTPS**。
4. 更新 `robots.txt` 与 `sitemap.xml` 里的网址为你的域名。

> 说明：GitHub Pages 属于海外托管，**无需 ICP 备案**。若想国内访问更快：可把本仓库导入腾讯云 EdgeOne Pages（有免费个人套餐），或购买国内轻量云服务器（约 ¥60–200/年，需备案）。本模板同样适用于任何静态托管平台。

### 四、写新文章（3 步）

1. **新建 Markdown 文件**：在 `posts/` 下新建，命名规则 `日期-短标题.md`（英文或数字文件名），例如 `2026-11-01-my-first-post.md`，正文用 Markdown 书写。
2. **登记到索引**：编辑 `posts/index.json`，在 `posts` 数组里**加一条**：

   ```json
   {
     "file": "2026-11-01-my-first-post.md",
     "title": "我的第一篇正式文章",
     "date": "2026-11-01",
     "tags": ["随笔"],
     "summary": "一句话摘要，显示在首页和归档列表里。"
   }
   ```

3. **发布**：重新上传 / `git push`，约 1 分钟生效。

> 注意：
> - `file` 必须与文件名**完全一致**（含大小写、含 `.md`）
> - `date` 用 `YYYY-MM-DD` 格式，文章按日期自动倒序排列
> - 图片放进 `posts/img/`，文章里写 `![描述](posts/img/文件名.png)` 或 `![描述](img/文件名.png)` 均可

### 五、Markdown 速查

| 语法 | 效果 |
| --- | --- |
| `# 标题` | 一级标题（`#` 至 `######`） |
| `**加粗**`、`*斜体*`、`~~删除线~~` | **加粗**、*斜体*、~~删除线~~ |
| `` `代码` `` | 行内代码 |
| ` ``` ` 围栏 | 代码块（```语言 可指定语言） |
| `- 项目`、`1. 项目` | 无序 / 有序列表 |
| `> 引用` | 引用块 |
| `[文字](网址)` | 链接（外链自动新窗口打开） |
| `![描述](图片地址)` | 图片 |
| `---` | 分割线 |
| 表头行 + `\| --- \|` 分隔行 | 表格 |

### 六、自定义你的博客

| 想改什么 | 去哪改 |
| --- | --- |
| 站名 / 副标题 | `index.html` 的 `<title>`、`<meta name="site-name">` 和 hero 区；其他页面的 `<title>` |
| 关于页 | `about.html` |
| 页脚 | 各页面的 `<footer>` |
| 主题色 / 字号 | `css/style.css` 顶部 `:root` 变量（改 `--accent` 即可换主色） |
| 网站图标 | 替换 `favicon.svg` |
| 导航菜单 | 各页面 `<nav class="site-nav">` |
| 文章页评论 | 见下方「进阶玩法」 |

### 七、进阶玩法（可选）

- **评论系统（Giscus）**：免费、读者用 GitHub 账号登录，5 分钟接入：
  1. 开启仓库的 Discussions（Settings → General → Features）；
  2. 打开 <https://giscus.app> 按提示生成一段 `<script>`；
  3. 粘贴到 `post.html` 中 `<!-- 可选：评论系统 -->` 注释处。
- **访问统计（Umami）**：注册 <https://umami.is> 获取统计脚本，插入各页面 `<head>`。
- **搜索引擎收录**：部署后把网址提交到 Google Search Console 与 Bing Webmaster；每次发布新文章记得同步更新 `sitemap.xml`。
- **RSS 订阅**：可用 RSSHub 等第三方服务为本站生成订阅源。

### 八、常见问题

- **本地双击 index.html，文章加载失败？** 正常现象。请用本地服务器预览（见「本地预览」）。
- **部署后文章 404？** 检查 `posts/index.json` 中 `file` 是否与文件名完全一致；确认文件已成功上传。
- **改完内容网站没变？** GitHub Pages 约 1 分钟生效；强制刷新（Ctrl+F5）；在仓库 Actions 页查看构建状态。
- **需要备案吗？** 用 GitHub Pages / Vercel 等海外托管**不需要**；只有服务器位于中国大陆才需要 ICP 备案。
- **以后想换主题 / 平台？** 所有内容都是 Markdown 纯文本，随时无损迁移，不会被任何平台锁定。

## 📜 许可

模板代码可随意使用、修改与分发（MIT）。`posts/` 里的示例文章请自行替换为你的内容。
