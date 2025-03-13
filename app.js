// app.js
App({
  globalData: {
    userInfo: null,
    birthInfo: null,
    fortuneResult: null,
    apiKey: 'YOUR_DEEPSEEK_API_KEY' // 实际使用时需替换为真实的API密钥
  },
  onLaunch() {
    // 小程序启动时执行的逻辑
    console.log('App launched');
  }
});