const axios = require('axios');

class APIManager {
    constructor() {
        this.endpoints = {};
        this.apiKeys = {};
    }

    addEndpoint(provider, url) {
        this.endpoints[provider] = url;
    }

    addApiKey(provider, key) {
        this.apiKeys[provider] = key;
    }

    async fetchModels(provider) {
        if (!this.endpoints[provider] || !this.apiKeys[provider]) {
            throw new Error(`未配置 ${provider} 的API端点或密钥`);
        }

        try {
            const response = await axios.get(`${this.endpoints[provider]}/models`, {
                headers: {
                    'Authorization': `Bearer ${this.apiKeys[provider]}`
                }
            });
            
            // 假设API返回格式为 { data: [ { id: 'model1', name: 'Model 1' }, ... ] }
            return response.data.data.map(model => ({
                id: model.id,
                name: model.name || model.id
            }));
        } catch (error) {
            console.error('API调用失败:', error.response?.data || error.message);
            throw new Error(`获取模型失败: ${error.message}`);
        }
    }
}

module.exports = { APIManager };
