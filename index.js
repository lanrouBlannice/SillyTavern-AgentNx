const AgentNxExtension = require('./scripts/main');
const SettingsManager = require('./scripts/settings');

module.exports = {
  init: function() {
    return {
      name: 'AgentNx',
      settings: {
        providers: {},
        modelA: null,
        modelB: null,
        promptA: '分析对话并生成回复大纲',
        promptB: '根据大纲生成最终回复'
      },
      extension: new AgentNxExtension(),
      settingsManager: new SettingsManager(),
      
      onSettingsUpdate: function(settings) {
        this.settings = settings;
        this.extension.loadSettings(settings);
      },
      
      onMessage: async function(message) {
        return this.extension.onMessage(message);
      },
      
      getSettingsHtml: function() {
        return 'public/settings.html';
      },
      
      getSettingsScript: function() {
        return 'public/settings.js';
      },
      
      getSettingsStyles: function() {
        return 'public/styles.css';
      },
      
      onSettingsOpen: function(settings) {
        this.settingsManager.init(settings);
      },
      
      onSettingsSave: function() {
        return this.settingsManager.getSettings();
      }
    };
  }
};
