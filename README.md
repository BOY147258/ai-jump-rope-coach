# AI单摇跳绳提分教练

30秒诊断，3分钟修正，7天提分

## 功能特性

### 学生端
- 班级选择 + 姓名输入
- 摄像头录制30秒跳绳测试
- MediaPipe Pose 实时人体骨架检测
- 脚踝周期计数
- 实时显示：次数、节奏(BPM)
- 8个AI指标诊断
- 一句话诊断结果
- 对应训练处方推荐
- 3分钟训练倒计时

### 教师端
- 班级总览（测试人数、平均成绩、进步人数）
- 学生列表（姓名、成绩、最大问题、建议训练）
- 问题排行榜（可视化柱状图）
- 断绳记录
- 自动训练分组

## 技术架构

```
ai-coach/
├── index.html          # 主页面
├── manifest.json       # PWA配置
├── css/
│   └── style.css       # 样式
└── js/
    ├── app.js          # 主应用逻辑
    ├── analyzer.js     # MediaPipe姿态分析器
    ├── diagnosis.js    # AI诊断规则引擎
    └── prescriptions.js # 训练处方库
```

## 本地运行

```bash
# 使用 Python
python -m http.server 8080

# 或使用 Node.js
npx serve .
```

然后访问 http://localhost:8080

## 部署到 GitHub Pages

1. 在 GitHub 创建私人仓库 `ai-jump-rope-coach`

2. 关联并推送
```bash
git remote add origin https://github.com/YOUR_USERNAME/ai-jump-rope-coach.git
git push -u origin master
```

3. 在仓库 Settings → Pages → Source 选择 `master branch`

4. 访问 `https://YOUR_USERNAME.github.io/ai-jump-rope-coach/`

## 演示模式

如果没有摄像头，应用会自动切换到演示模式，随机生成测试数据进行演示。

## 开发说明

### AI诊断规则
系统使用规则引擎判断最大问题：
- 手臂外展（优先级最高）
- 起跳过高
- 手腕发力不足
- 节奏不稳
- 后半段掉速
- 落地偏重
- 断绳频繁

### 训练处方
每个问题对应一个最有效的训练处方，帮助学生快速提升。
