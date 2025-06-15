/**
 * AgentNx Extension - Settings UI Logic
 * 处理设置界面的客户端交互逻辑
 */

// 当DOM加载完成后初始化设置界面
document.addEventListener('DOMContentLoaded', function() {
    // 从extension-settings事件获取设置
    const settingsElement = document.getElementById('extension-settings');
    if (!settingsElement) return;
    
    const settings = JSON.parse(settingsElement.getAttribute('data-settings') || '{}');
    
    // 初始化界面
    initializeUI(settings);
    setupEventListeners(settings);
    populateModelSelectors(settings);
});

/**
 * 初始化设置界面
 * @param {Object} settings 扩展设置
 */
function initializeUI(settings) {
    // 填充API提供者下拉列表
    const providerList = document.getElementById('providerList');
    providerList.innerHTML = '';
    
    if (settings.providers) {
        Object.keys(settings.providers).forEach(provider => {
            const option = document.createElement('option');
            option.value = provider;
            option.textContent = provider;
            providerList.appendChild(option);
        });
        
        // 选择第一个提供者并显示其详情
        if (Object.keys(settings.providers).length > 0) {
            const firstProvider = Object.keys(settings.providers)[0];
            providerList.value = firstProvider;
            displayProviderDetails(firstProvider, settings);
        }
    }
    
    // 填充当前选中的模型A和模型B
    if (settings.modelA) {
        document.getElementById('modelA').value = settings.modelA;
    }
    
    if (settings.modelB) {
        document.getElementById('modelB').value = settings.modelB;
    }
    
    // 填充提示词
    document.getElementById('promptA').value = settings.promptA || '分析对话并生成回复大纲';
    document.getElementById('promptB').value = settings.promptB || '根据大纲生成最终回复';
}

/**
 * 显示选定提供者的详情
 * @param {string} provider 提供者名称
 * @param {Object} settings 扩展设置
 */
function displayProviderDetails(provider, settings) {
    if (!provider || !settings.providers || !settings.providers[provider]) return;
    
    const providerData = settings.providers[provider];
    
    // 设置URL和密钥
    document.getElementById('apiUrl').value = providerData.url || '';
    document.getElementById('apiKey').value = providerData.apiKey || '';
    
    // 清空并填充模型列表
    const modelList = document.getElementById('modelList');
    modelList.innerHTML = '';
    
    if (providerData.models && providerData.models.length > 0) {
        providerData.models.forEach(model => {
            const option = document.createElement('option');
            option.value = JSON.stringify({
                provider: provider,
                modelId: model.id
            });
            option.textContent = model.name || model.id;
            modelList.appendChild(option);
        });
    }
}

/**
 * 设置事件监听器
 * @param {Object} settings 扩展设置
 */
function setupEventListeners(settings) {
    // 提供者选择变更
    document.getElementById('providerList').addEventListener('change', function(e) {
        displayProviderDetails(e.target.value, settings);
    });
    
    // 添加提供者
    document.getElementById('addProvider').addEventListener('click', function() {
        const providerName = prompt('请输入新的API提供者名称:');
        if (!providerName) return;
        
        if (!settings.providers) {
            settings.providers = {};
        }
        
        if (!settings.providers[providerName]) {
            settings.providers[providerName] = {
                url: '',
                apiKey: '',
                models: []
            };
            
            // 添加到下拉列表
            const option = document.createElement('option');
            option.value = providerName;
            option.textContent = providerName;
            document.getElementById('providerList').appendChild(option);
            
            // 选择新添加的提供者
            document.getElementById('providerList').value = providerName;
            displayProviderDetails(providerName, settings);
        } else {
            alert('提供者已存在!');
        }
    });
    
    // 删除提供者
    document.getElementById('removeProvider').addEventListener('click', function() {
        const providerList = document.getElementById('providerList');
        const provider = providerList.value;
        
        if (!provider) {
            alert('请先选择一个提供者!');
            return;
        }
        
        if (confirm(`确定要删除提供者 "${provider}" 吗?`)) {
            delete settings.providers[provider];
            
            // 从下拉列表移除
            const selectedIndex = providerList.selectedIndex;
            providerList.remove(selectedIndex);
            
            // 如果还有其他提供者，选择第一个
            if (providerList.options.length > 0) {
                providerList.selectedIndex = 0;
                displayProviderDetails(providerList.value, settings);
            } else {
                // 清空详情
                document.getElementById('apiUrl').value = '';
                document.getElementById('apiKey').value = '';
                document.getElementById('modelList').innerHTML = '';
            }
        }
    });
    
    // 保存提供者配置
    document.getElementById('saveProvider').addEventListener('click', function() {
        const provider = document.getElementById('providerList').value;
        if (!provider) {
            alert('请先选择一个提供者!');
            return;
        }
        
        const url = document.getElementById('apiUrl').value;
        const apiKey = document.getElementById('apiKey').value;
        
        if (!url || !apiKey) {
            alert('请填写API URL和密钥!');
            return;
        }
        
        settings.providers[provider].url = url;
        settings.providers[provider].apiKey = apiKey;
        
        saveSettings(settings);
        alert('配置已保存!');
    });
    
    // 获取可用模型
    document.getElementById('fetchModels').addEventListener('click', async function() {
        const provider = document.getElementById('providerList').value;
        if (!provider) {
            alert('请先选择一个提供者!');
            return;
        }
        
        const url = document.getElementById('apiUrl').value;
        const apiKey = document.getElementById('apiKey').value;
        
        if (!url || !apiKey) {
            alert('请填写API URL和密钥!');
            return;
        }
        
        try {
            const response = await fetch(`/api/extensions/agentnx/fetch_models`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    provider,
                    url,
                    apiKey
                })
            });
            
            if (!response.ok) {
                throw new Error(`HTTP错误 ${response.status}`);
            }
            
            const data = await response.json();
            
            if (data.error) {
                throw new Error(data.error);
            }
            
            // 更新设置中的模型列表
            settings.providers[provider].models = data.models;
            
            // 刷新模型列表UI
            displayProviderDetails(provider, settings);
            
            // 更新模型选择器
            populateModelSelectors(settings);
            
            saveSettings(settings);
            alert(`成功获取 ${data.models.length} 个模型!`);
            
        } catch (error) {
            alert(`获取模型失败: ${error.message}`);
        }
    });
    
    // 模型A选择
    document.getElementById('modelA').addEventListener('change', function() {
        settings.modelA = this.value;
        saveSettings(settings);
    });
    
    // 模型B选择
    document.getElementById('modelB').addEventListener('change', function() {
        settings.modelB = this.value;
        saveSettings(settings);
    });
    
    // 提示词A修改
    document.getElementById('promptA').addEventListener('input', function() {
        settings.promptA = this.value;
        saveSettings(settings);
    });
    
    // 提示词B修改
    document.getElementById('promptB').addEventListener('input', function() {
        settings.promptB = this.value;
        saveSettings(settings);
    });
}

/**
 * 填充模型A和模型B的选择器
 * @param {Object} settings 扩展设置
 */
function populateModelSelectors(settings) {
    const modelASelect = document.getElementById('modelA');
    const modelBSelect = document.getElementById('modelB');
    
    // 保存当前选中值
    const modelAValue = modelASelect.value;
    const modelBValue = modelBSelect.value;
    
    // 清空选择器
    modelASelect.innerHTML = '<option value="">-- 选择模型 --</option>';
    modelBSelect.innerHTML = '<option value="">-- 选择模型 --</option>';
    
    // 遍历所有提供者的模型
    if (settings.providers) {
        Object.keys(settings.providers).forEach(provider => {
            const providerData = settings.providers[provider];
            
            if (providerData.models && providerData.models.length > 0) {
                // 创建提供者组
                const groupA = document.createElement('optgroup');
                groupA.label = provider;
                modelASelect.appendChild(groupA);
                
                const groupB = document.createElement('optgroup');
                groupB.label = provider;
                modelBSelect.appendChild(groupB);
                
                // 添加模型
                providerData.models.forEach(model => {
                    const modelConfig = JSON.stringify({
                        provider: provider,
                        modelId: model.id
                    });
                    
                    const optionA = document.createElement('option');
                    optionA.value = modelConfig;
                    optionA.textContent = model.name || model.id;
                    groupA.appendChild(optionA);
                    
                    const optionB = document.createElement('option');
                    optionB.value = modelConfig;
                    optionB.textContent = model.name || model.id;
                    groupB.appendChild(optionB);
                });
            }
        });
    }
    
    // 恢复之前的选择
    if (modelAValue) {
        modelASelect.value = modelAValue;
    }
    
    if (modelBValue) {
        modelBSelect.value = modelBValue;
    }
}

/**
 * 保存设置到SillyTavern
 * @param {Object} settings 要保存的设置
 */
function saveSettings(settings) {
    // 触发SillyTavern的设置保存事件
    const settingsEvent = new CustomEvent('extension_settings_update', {
        detail: {
            extension_name: 'agentnx',
            settings: settings
        }
    });
    document.dispatchEvent(settingsEvent);
}
