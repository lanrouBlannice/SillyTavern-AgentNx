# AgentNx - SillyTavern 双模型协作扩展

AgentNx 是一个创新的 SillyTavern 扩展，通过双模型协作机制提升对话质量。模型A负责分析对话并生成回复大纲，模型B根据大纲和用户指定的风格生成最终回复。

## 功能特性

- 🧠 **双模型协作**：模型A分析对话生成大纲，模型B生成最终回复
- 🔑 **API管理**：支持多API提供商配置，安全存储API密钥
- 🧩 **模型选择**：可自由选择不同模型用于分析和生成阶段
- ✍️ **提示词定制**：为每个模型定制专属提示词
- 🎨 **风格解析**：自动解析用户消息中的风格标记（如`[style=humorous]`）
- ⚙️ **直观设置界面**：提供友好的用户界面进行配置

## 安装方法

1. 将本仓库克隆到 SillyTavern 的 `public/extensions` 目录：
```bash
cd public/extensions
git clone https://github.com/yourusername/AgentNx.git
```

2. 安装依赖：
```bash
cd AgentNx
npm install
```

3. 重启 SillyTavern

## 使用方法

1. 在 SillyTavern 的扩展列表中找到 "AgentNx 双模型协作" 并启用
2. 点击设置图标配置：
   - 添加API提供商（如OpenAI）并输入URL和密钥
   - 点击"获取可用模型"加载可用模型列表
   - 为模型A（分析模型）和模型B（生成模型）选择模型
   - 定制每个模型的提示词
3. 在聊天界面中，在消息中添加风格标记，例如：
   `[style=humorous,formal]请用幽默且正式的风格回复`
4. AgentNx 会自动处理对话流程

## 开发

```bash
# 安装依赖
npm install

# 运行测试
npm test

# 构建扩展
npm run build
```

## 贡献
欢迎提交 issue 和 pull request

## 作者
作者：lanroublannice、Claude 3.7 sonnet、Cline。本项目由AI编程，不保证兼容性和功能完整性。

## 许可证
MIT License
