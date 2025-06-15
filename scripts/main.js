const { APIManager } = require('./apiManager');
const { StyleParser } = require('./styleParser');
const { DualModelProcessor } = require('./dualModelProcessor');

class AgentNxExtension {
  constructor() {
    this.apiManager = new APIManager();
    this.styleParser = new StyleParser();
    this.processor = new DualModelProcessor(this.apiManager);
    this.settings = {
      modelA: null,
      modelB: null,
      promptA: '分析对话并生成回复大纲',
      promptB: '根据大纲生成最终回复'
    };
  }

  async loadSettings(settings) {
    this.settings = { ...this.settings, ...settings };
    if (this.settings.modelA) this.processor.setModelA(this.settings.modelA);
    if (this.settings.modelB) this.processor.setModelB(this.settings.modelB);
  }

  async onMessage(message) {
    try {
      // 解析消息中的风格标记
      const styles = this.styleParser.parse(message.content);
      
      // 使用双模型处理对话
      const response = await this.processor.processConversation(
        message.content, 
        styles
      );
      
      return response;
    } catch (error) {
      console.error('AgentNx处理错误:', error);
      return '处理消息时出错';
    }
  }
}

module.exports = AgentNxExtension;
