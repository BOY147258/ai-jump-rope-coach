# 部署指南

## 第一步：在 GitHub 创建私人仓库

1. 访问 https://github.com/new
2. 仓库名称：`ai-jump-rope-coach`
3. 选择 **Private**（私人仓库）
4. 不要勾选任何初始化选项
5. 点击 **Create repository**

## 第二步：推送代码到仓库

在本地终端运行以下命令（把 `YOUR_USERNAME` 替换成你的 GitHub 用户名）：

```bash
cd C:\Users\75641\jingjitimer\ai-coach

git remote add origin https://github.com/YOUR_USERNAME/ai-jump-rope-coach.git

git push -u origin master
```

## 第三步：启用 GitHub Pages

1. 进入仓库 **Settings**
2. 左侧菜单找到 **Pages**
3. **Source** 选择 `Deploy from a branch`
4. **Branch** 选择 `master` / `(root)`
5. 点击 **Save**

## 第四步：访问你的应用

等待约1分钟后，访问：
```
https://YOUR_USERNAME.github.io/ai-jump-rope-coach/
```

## 功能说明

### 学生端
- 选择班级、输入姓名
- 点击「开始30秒AI诊断」
- 摄像头会录制30秒
- 系统分析并给出诊断结果和训练处方
- 3分钟针对性训练

### 教师端
- 切换到「教师端」
- 查看班级总览、学生列表
- 问题排行榜、训练分组

## 注意

- 如果没有摄像头，会自动使用演示模式
- 演示模式会随机生成数据进行演示
- 连接真实摄像头后即可进行真实测试
