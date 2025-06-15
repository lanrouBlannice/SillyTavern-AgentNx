class SettingsManager {
  constructor() {
    this.apiManager = new (require('./apiManager')).APIManager();
    this.currentProvider = null;
  }

  async init(settings) {
    this.settings = settings;
    this.renderProviders();
    this.setupEventListeners();
  }

  renderProviders() {
    const providerList = document.getElementById('providerList');
    providerList.innerHTML = '';
    
    Object.keys(this.settings.providers || {}).forEach(provider => {
      const option = document.createElement('option');
      option.value = provider;
      option.textContent = provider;
      providerList.appendChild(option);
    });
    
    if (this.settings.providers && Object.keys(this.settings.providers).length > 0) {
      this.currentProvider = Object.keys(this.settings.providers)[0];
      this.renderProviderDetails();
    }
  }

  renderProviderDetails() {
    if (!this.currentProvider) return;
    
    const provider = this.settings.providers[this.currentProvider];
    document.getElementById('apiUrl').value = provider.url || '';
    document.getElementById('apiKey').value = provider.apiKey || '';
    
    this.renderModels(provider.models || []);
  }

  async renderModels(models) {
    const modelList = document.getElementById('modelList');
    modelList.innerHTML = '';
    
    models.forEach(model => {
      const option = document.createElement('option');
      option.value = model.id;
      option.textContent = `${model.name} (${model.id})`;
      modelList.appendChild(option);
    });
  }

  setupEventListeners() {
    document.getElementById('providerList').addEventListener('change', (e) => {
      this.currentProvider = e.target.value;
      this.renderProviderDetails();
    });

    document.getElementById('addProvider').addEventListener('click', () => {
      const providerName = prompt('输入新的API提供者名称:');
      if (providerName) {
        if (!this.settings.providers) this.settings.providers = {};
        this.settings.providers[providerName] = { url: '', apiKey: '' };
        this.renderProviders();
        this.currentProvider = providerName;
        this.renderProviderDetails();
      }
    });

    document.getElementById('removeProvider').addEventListener('click', () => {
      if (this.currentProvider && confirm(`确定要删除 ${this.currentProvider} 吗?`)) {
        delete this.settings.providers[this.currentProvider];
        this.renderProviders();
        this.currentProvider = null;
        document.getElementById('apiUrl').value = '';
        document.getElementById('apiKey').value = '';
        document.getElementById('modelList').innerHTML = '';
      }
    });

    document.getElementById('saveProvider').addEventListener('click', () => {
      if (!this.currentProvider) return;
      
      this.settings.providers[this.currentProvider].url = document.getElementById('apiUrl').value;
      this.settings.providers[this.currentProvider].apiKey = document.getElementById('apiKey').value;
      alert('API配置已保存!');
    });

    document.getElementById('fetchModels').addEventListener('click', async () => {
      if (!this.currentProvider) return;
      
      const provider = this.settings.providers[this.currentProvider];
      if (!provider.url || !provider.apiKey) {
        alert('请先填写API URL和密钥');
        return;
      }
      
      try {
        this.apiManager.addEndpoint(this.currentProvider, provider.url);
        this.apiManager.addApiKey(this.currentProvider, provider.apiKey);
        const models = await this.apiManager.fetchModels(this.currentProvider);
        provider.models = models;
        this.renderModels(models);
        alert(`成功获取 ${models.length} 个模型`);
      } catch (error) {
        alert(`获取模型失败: ${error.message}`);
      }
    });

    document.getElementById('modelA').addEventListener('change', (e) => {
      this.settings.modelA = e.target.value;
    });

    document.getElementById('modelB').addEventListener('change', (e) => {
      this.settings.modelB = e.target.value;
    });

    document.getElementById('promptA').addEventListener('input', (e) => {
      this.settings.promptA = e.target.value;
    });

    document.getElementById('promptB').addEventListener('input', (e) => {
      this.settings.promptB = e.target.value;
    });
  }

  getSettings() {
    return this.settings;
  }
}

module.exports = SettingsManager;
