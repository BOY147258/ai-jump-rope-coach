#!/usr/bin/env python3
"""Create GitHub repository using PyGithub"""

import sys

# You'll need to provide your GitHub token
# You can create one at: https://github.com/settings/tokens
# Select "repo" scope for full repository access

TOKEN = input("请输入你的 GitHub Personal Access Token: ").strip()

try:
    from github import Github

    g = Github(TOKEN)
    user = g.get_user()

    # Create private repo
    repo = user.create_repo(
        name="ai-jump-rope-coach",
        description="AI单摇跳绳提分教练 - 30秒诊断，3分钟修正，7天提分",
        private=True
    )

    print(f"\n仓库创建成功！")
    print(f"仓库地址: {repo.clone_url}")

except ImportError:
    print("请先安装 PyGithub: pip install PyGithub")
except Exception as e:
    print(f"错误: {e}")
    print("\n可能的原因:")
    print("1. Token 无效或过期")
    print("2. 仓库名已存在")
    print("3. 没有 repo 权限")
