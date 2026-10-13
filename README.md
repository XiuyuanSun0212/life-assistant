# 个人生活助理 · 孙sir

一个纯静态的本地工作台：健身打卡、DPDK 学习、杭州爬山路线、旅游与娱乐记录，
外加一个可以自己录入数据的记录系统。双击 `index.html` 就能用，不需要装任何东西。

## 目录结构

```
life-assistant/
├── index.html              页面骨架
├── README.md               本文件
├── deploy-github.bat       一键推送到 GitHub Pages（Windows）
├── deploy-github.sh        一键推送到 GitHub Pages（macOS / Linux / Git Bash）
├── .nojekyll               GitHub Pages 用，别删
└── assets/
    ├── css/style.css       全部样式（含深浅色主题与动作动画）
    └── js/
        ├── content.js      固定内容：动作库、知识卡、路线、旅游计划
        ├── store.js        你的记录：训练 / 学习 / 体重 / 爬山，存浏览器本地
        └── app.js          渲染与交互
```

## 数据存在哪（重要）

**没有服务器。** 你录入的训练、学习、体重、爬山记录都保存在**当前浏览器的本地存储**里。

这意味着：

- 换浏览器、换设备、清理浏览器缓存，数据都会丢。
- 部署到公网后也一样，每台设备、每个浏览器各存各的。
- 所以**定期导出备份**：进「数据」页 → 导出 JSON。想恢复就导入那个文件。

## 怎么改内容

| 想改什么 | 改哪个文件 |
| --- | --- |
| 动作库、知识卡、路线、旅游计划、娱乐条目 | `assets/js/content.js` |
| 页面结构、表单、交互 | `assets/js/app.js` |
| 颜色、间距、深浅色主题 | `assets/css/style.css`（改最上面的 CSS 变量最省事） |

弄错了也不怕，改完刷新页面即可。数据在浏览器里，改代码不会影响已录入的记录。

### 想把动作示意换成真人动图

`content.js` 里每个动作都有一个 `gif` 字段，默认是空的（现在用我自绘的动画示意图）。
把你找的动图放进 `assets/img/`，然后把字段改成：

```js
{ name: "哑铃弯举", gif: "assets/img/curl.gif", ... }
```

刷新就会优先显示图片。注意动图版权，别商用。

## 部署到公网

### 方式一：GitHub Pages（你已有的账号）

前置：GitHub 上先建一个空仓库。推荐名字 `life-assistant`，建的时候不要勾选初始化 README。

然后在这个目录下双击 `deploy-github.bat`（Windows），或者在 Git Bash 里跑：

```bash
bash deploy-github.sh
```

脚本会初始化仓库、提交、推送到 `main` 分支。第一次会弹出 GitHub 登录窗口，正常登录即可。

推完去仓库的 Settings → Pages，Source 选 `Deploy from a branch`，Branch 选 `main` / `root`，保存。
等一两分钟，访问：

```
https://xiuyuansun0212.github.io/life-assistant/
```

如果你想把站点挂在自己的用户主页仓库（`xiuyuansun0212.github.io`）下面，
那就把这个整个文件夹复制进那个仓库，访问地址是 `https://xiuyuansun0212.github.io/life-assistant/`。

### 方式二：WorkBuddy 直接发布

不需要 GitHub、不需要公网 IP，直接生成一个能公网访问的链接。适合临时给手机看。

## 已经内置的东西

- 七个栏目：总览 / 健身 / 学习 / 爬山 / 旅游 / 娱乐 / 数据
- 四个记录入口：训练、体重、学习、爬山打卡，另有自定义路线、心愿目的地、随手记
- 体重自动出折线图，爬山路线自带爬升剖面示意图和打卡印章
- 深色 / 浅色主题，选择会记住
- 装备清单、准备清单可勾选，状态保存在本地
- 数据页支持导出 JSON、复制到剪贴板、选文件导入、文本框粘贴导入、一键清空

## 后续可以加

- 训练量、学习时长的趋势图
- 每周自动生成的复盘（目前由 WorkBuddy 的定时任务负责，写回本地文件）
- 把记录同步到云端，实现多设备统一
