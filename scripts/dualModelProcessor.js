const axios = require('axios');

class DualModelProcessor {
    constructor(apiManager) {
        this.apiManager = apiManager;
        this.modelA = null;
        this.modelB = null;
    }

    setModelA(model) {
        this.modelA = model;
    }

    setModelB(model) {
        this.modelB = model;
    }

    async processConversation(conversation, styles) {
        if (!this.modelA || !this.modelB) {
            throw new Error('请先设置模型A和模型B');
        }

        // 步骤1: 使用模型A分析对话并生成大纲
        const analysisPrompt = `分析以下对话并生成回复大纲：\n\n${conversation}\n\n风格要求：${JSON.stringify(styles)}`;
        const analysisResult = await this.callModel(this.modelA, analysisPrompt);
        
        // 步骤2: 使用模型B根据大纲生成最终回复
        const generationPrompt = `根据以下大纲生成回复：\n\n${analysisResult}\n\n风格要求：${JSON.stringify(styles)}`;
        const finalResponse = await this.callModel(this.modelB, generationPrompt);
        
        return finalResponse;
    }

    async callModel(modelConfig, prompt) {
        const provider = modelConfig.provider;
        const modelId = modelConfig.modelId;
        
        if (!this.apiManager.endpoints[provider] || !this.apiManager.apiKeys[provider]) {
            throw new Error(`未配置 ${provider} 的API端点或密钥`);
        }
        
        try {
            const response = await axios.post(
                `${this.apiManager.endpoints[provider]}/chat/completions`,
                {
                    model: modelId,
                    messages: [
                        { role: "user", content: prompt }
                    ],
                    temperature: 0.7,
                    max_tokens: 2000
                },
                {
                    headers: {
                        'Authorization': `Bearer ${this.apiManager.apiKeys[provider]}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
            
            return response.data.choices[0].message.content;
        } catch (error) {
            console.error('API调用失败:', error.response?.data || error.message);
            throw new Error(`模型调用失败: ${error.message}`);
        }
    }
}

module.exports = { DualModelProcessor };
