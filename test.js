/**
 * AgentNx 扩展测试套件
 * 提供全面的单元测试和集成测试，确保扩展功能正常
 */

const assert = require('assert');
const sinon = require('sinon');
const axios = require('axios');

// 导入扩展组件
const extension = require('./index');
const { APIManager } = require('./scripts/apiManager');
const { StyleParser } = require('./scripts/styleParser');
const { DualModelProcessor } = require('./scripts/dualModelProcessor');

// 测试配置
const TEST_CONFIG = {
  providers: {
    'openai': {
      url: 'https://api.openai.com/v1',
      apiKey: 'sk-test-key-openai',
      models: [
        { id: 'gpt-4-turbo', name: 'GPT-4 Turbo' },
        { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo' }
      ]
    },
    'anthropic': {
      url: 'https://api.anthropic.com/v1',
      apiKey: 'sk-test-key-anthropic',
      models: [
        { id: 'claude-3-opus', name: 'Claude 3 Opus' },
        { id: 'claude-3-sonnet', name: 'Claude 3 Sonnet' }
      ]
    }
  },
  modelA: JSON.stringify({
    provider: 'anthropic',
    modelId: 'claude-3-sonnet'
  }),
  modelB: JSON.stringify({
    provider: 'openai',
    modelId: 'gpt-4-turbo'
  }),
  promptA: '分析以下对话并生成回复大纲，包括主要观点和可能的回应方向。',
  promptB: '根据提供的大纲，生成符合风格要求的最终回复。'
};

// 测试用例集
const runTests = async () => {
  console.log('======== AgentNx 扩展测试开始 ========');
  
  try {
    await testStyleParser();
    await testAPIManager();
    await testDualModelProcessor();
    await testExtensionIntegration();
    
    console.log('\n✅ 所有测试通过！');
  } catch (error) {
    console.error('\n❌ 测试失败:', error.message);
    console.error(error.stack);
  } finally {
    console.log('======== AgentNx 扩展测试结束 ========');
    
    // 恢复所有模拟
    if (axios.post.restore) axios.post.restore();
    if (axios.get.restore) axios.get.restore();
  }
};

/**
 * 测试风格解析器
 */
const testStyleParser = async () => {
  console.log('\n📋 测试风格解析器...');
  
  const styleParser = new StyleParser();
  
  // 测试基本标记解析
  const text1 = "请用幽默风格回复[style=humorous]";
  const styles1 = styleParser.parse(text1);
  assert.deepStrictEqual(styles1, { humorous: 'true' }, '基本风格标记解析失败');
  console.log('✓ 基本风格标记解析测试通过');
  
  // 测试多参数风格标记
  const text2 = "请回复[style=formal,academic,concise]";
  const styles2 = styleParser.parse(text2);
  assert.deepStrictEqual(styles2, { 
    formal: 'true', 
    academic: 'true', 
    concise: 'true' 
  }, '多参数风格标记解析失败');
  console.log('✓ 多参数风格标记解析测试通过');
  
  // 测试带值的风格标记
  const text3 = "请回复[style=temperature:0.7,creativity:high]";
  const styles3 = styleParser.parse(text3);
  assert.deepStrictEqual(styles3, { 
    temperature: '0.7', 
    creativity: 'high' 
  }, '带值的风格标记解析失败');
  console.log('✓ 带值的风格标记解析测试通过');
  
  // 测试没有风格标记的情况
  const text4 = "普通消息，没有风格标记";
  const styles4 = styleParser.parse(text4);
  assert.deepStrictEqual(styles4, {}, '无风格标记情况处理失败');
  console.log('✓ 无风格标记情况测试通过');
  
  console.log('✅ 风格解析器测试全部通过');
};

/**
 * 测试API管理器
 */
const testAPIManager = async () => {
  console.log('\n📋 测试API管理器...');
  
  // 创建API管理器实例
  const apiManager = new APIManager();
  
  // 测试添加端点和密钥
  apiManager.addEndpoint('test-provider', 'https://api.test.com/v1');
  apiManager.addApiKey('test-provider', 'test-api-key');
  
  assert.strictEqual(apiManager.endpoints['test-provider'], 'https://api.test.com/v1', '添加API端点失败');
  assert.strictEqual(apiManager.apiKeys['test-provider'], 'test-api-key', '添加API密钥失败');
  console.log('✓ 添加API端点和密钥测试通过');
  
  // 模拟获取模型API响应
  const mockModelsResponse = {
    data: {
      data: [
        { id: 'model-1', name: 'Test Model 1' },
        { id: 'model-2', name: 'Test Model 2' }
      ]
    }
  };
  
  // 使用sinon模拟axios.get
  sinon.stub(axios, 'get').resolves(mockModelsResponse);
  
  // 测试获取模型列表
  const models = await apiManager.fetchModels('test-provider');
  assert.strictEqual(models.length, 2, '获取模型列表长度不正确');
  assert.strictEqual(models[0].id, 'model-1', '模型ID不匹配');
  assert.strictEqual(models[1].name, 'Test Model 2', '模型名称不匹配');
  console.log('✓ 获取模型列表测试通过');
  
  // 测试未配置的提供者错误
  try {
    await apiManager.fetchModels('non-existent-provider');
    assert.fail('应该抛出错误但没有');
  } catch (error) {
    assert.ok(error.message.includes('未配置'), '错误消息不匹配');
    console.log('✓ 未配置提供者错误测试通过');
  }
  
  // 恢复模拟
  axios.get.restore();
  
  console.log('✅ API管理器测试全部通过');
};

/**
 * 测试双模型处理器
 */
const testDualModelProcessor = async () => {
  console.log('\n📋 测试双模型处理器...');
  
  // 创建API管理器和处理器实例
  const apiManager = new APIManager();
  apiManager.addEndpoint('openai', 'https://api.openai.com/v1');
  apiManager.addEndpoint('anthropic', 'https://api.anthropic.com/v1');
  apiManager.addApiKey('openai', 'sk-test-openai');
  apiManager.addApiKey('anthropic', 'sk-test-anthropic');
  
  const processor = new DualModelProcessor(apiManager);
  
  // 设置模型A和B
  processor.setModelA({
    provider: 'anthropic',
    modelId: 'claude-3-sonnet'
  });
  
  processor.setModelB({
    provider: 'openai',
    modelId: 'gpt-4-turbo'
  });
  
  // 模拟API响应
  const mockModelAResponse = {
    data: {
      choices: [
        {
          message: {
            content: '分析结果：\n1. 用户在询问技术问题\n2. 回复应包含技术解释和示例代码'
          }
        }
      ]
    }
  };
  
  const mockModelBResponse = {
    data: {
      choices: [
        {
          message: {
            content: '你好！我很乐意帮助你解决这个技术问题。以下是详细解释和示例代码...'
          }
        }
      ]
    }
  };
  
  // 使用sinon模拟axios.post
  const postStub = sinon.stub(axios, 'post');
  postStub.onFirstCall().resolves(mockModelAResponse);
  postStub.onSecondCall().resolves(mockModelBResponse);
  
  // 测试对话处理
  const conversation = "用户：你能解释一下JavaScript中的闭包吗？\nAI：当然可以，有什么具体问题？";
  const styles = { technical: 'true', concise: 'true' };
  
  const result = await processor.processConversation(conversation, styles);
  assert.strictEqual(result, mockModelBResponse.data.choices[0].message.content, '处理结果不匹配');
  
  // 验证调用了两个模型
  assert.strictEqual(postStub.callCount, 2, '应该调用两个模型');
  
  // 验证第一个调用是模型A
  const firstCall = postStub.getCall(0);
  assert.ok(firstCall.args[0].includes('anthropic'), '第一个调用应该是Anthropic API');
  assert.strictEqual(firstCall.args[1].model, 'claude-3-sonnet', '模型A应该是claude-3-sonnet');
  
  // 验证第二个调用是模型B
  const secondCall = postStub.getCall(1);
  assert.ok(secondCall.args[0].includes('openai'), '第二个调用应该是OpenAI API');
  assert.strictEqual(secondCall.args[1].model, 'gpt-4-turbo', '模型B应该是gpt-4-turbo');
  
  console.log('✓ 对话处理测试通过');
  
  // 测试未设置模型错误
  const newProcessor = new DualModelProcessor(apiManager);
  try {
    await newProcessor.processConversation(conversation, {});
    assert.fail('应该抛出错误但没有');
  } catch (error) {
    assert.ok(error.message.includes('请先设置模型A和模型B'), '错误消息不匹配');
    console.log('✓ 未设置模型错误测试通过');
  }
  
  // 恢复模拟
  axios.post.restore();
  
  console.log('✅ 双模型处理器测试全部通过');
};

/**
 * 测试扩展集成
 */
const testExtensionIntegration = async () => {
  console.log('\n📋 测试扩展集成...');
  
  // 初始化扩展
  const ext = extension.init();
  
  // 验证扩展基本属性
  assert.strictEqual(ext.name, 'AgentNx', '扩展名称不匹配');
  assert.ok(ext.extension, '缺少extension属性');
  assert.ok(ext.settingsManager, '缺少settingsManager属性');
  console.log('✓ 扩展基本属性测试通过');
  
  // 测试设置更新
  ext.onSettingsUpdate(TEST_CONFIG);
  assert.deepStrictEqual(ext.settings, TEST_CONFIG, '设置更新失败');
  console.log('✓ 设置更新测试通过');
  
  // 模拟API响应
  const mockResponse = {
    data: {
      choices: [
        {
          message: {
            content: '这是一个测试回复'
          }
        }
      ]
    }
  };
  
  // 使用sinon模拟axios.post
  sinon.stub(axios, 'post').resolves(mockResponse);
  
  // 测试消息处理
  const message = {
    content: "你好[style=friendly,warm]",
    context: "上下文内容"
  };
  
  const response = await ext.onMessage(message);
  assert.strictEqual(response, '这是一个测试回复', '消息处理结果不匹配');
  console.log('✓ 消息处理测试通过');
  
  // 验证获取设置相关函数
  assert.strictEqual(ext.getSettingsHtml(), 'public/settings.html', '获取设置HTML路径不匹配');
  assert.strictEqual(ext.getSettingsScript(), 'public/settings.js', '获取设置脚本路径不匹配');
  assert.strictEqual(ext.getSettingsStyles(), 'public/styles.css', '获取设置样式路径不匹配');
  console.log('✓ 获取设置相关函数测试通过');
  
  console.log('✅ 扩展集成测试全部通过');
};

// 运行所有测试
runTests().catch(console.error);
