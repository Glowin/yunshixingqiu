// fortune.js
Page({
  data: {
    userInfo: {},
    birthInfo: {},
    fortuneResult: null,
    loading: false,
    date: '',
    fortuneScore: 0,
    fortuneDesc: '',
    careerFortune: '',
    loveFortune: '',
    wealthFortune: ''
  },
  
  onLoad() {
    const app = getApp();
    
    // 检查是否有用户信息和出生信息
    if (!app.globalData.userInfo || !app.globalData.birthInfo) {
      wx.redirectTo({
        url: '/pages/userInfo/userInfo'
      });
      return;
    }
    
    this.setData({
      userInfo: app.globalData.userInfo,
      birthInfo: app.globalData.birthInfo,
      date: this.formatDate(new Date())
    });
    
    // 检查是否已有今日运势结果
    if (app.globalData.fortuneResult) {
      const savedDate = app.globalData.fortuneResult.date;
      const currentDate = this.formatDate(new Date());
      
      // 如果已有今日运势，直接显示
      if (savedDate === currentDate) {
        this.setData({
          fortuneResult: app.globalData.fortuneResult,
          fortuneScore: app.globalData.fortuneResult.score,
          fortuneDesc: app.globalData.fortuneResult.description,
          careerFortune: app.globalData.fortuneResult.career,
          loveFortune: app.globalData.fortuneResult.love,
          wealthFortune: app.globalData.fortuneResult.wealth
        });
        return;
      }
    }
    
    // 没有今日运势，生成新的运势
    this.generateFortune();
  },
  
  // 格式化日期为 YYYY-MM-DD
  formatDate(date) {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  },
  
  // 生成运势预测
  generateFortune() {
    this.setData({ loading: true });
    
    const app = getApp();
    const { birthInfo } = this.data;
    
    // 构建提示词
    const prompt = `你是一位专业的占星师，请根据以下信息为用户生成今日运势预测：\n
出生年月日：${birthInfo.year}年${birthInfo.month}月${birthInfo.day}日\n
性别：${birthInfo.gender}\n
请提供以下内容：\n
1. 今日综合运势评分（1-100分）\n
2. 今日运势简短描述（100字以内）\n
3. 事业运势（50字以内）\n
4. 爱情运势（50字以内）\n
5. 财运（50字以内）\n
请直接给出结果，不要有多余的解释。`;
    
    // 模拟调用 DeepSeek API
    // 实际项目中，这里应该调用真实的 DeepSeek API
    this.mockDeepSeekAPI(prompt).then(result => {
      // 解析 AI 返回的结果
      const fortuneResult = this.parseFortuneResult(result);
      
      // 保存结果到全局数据
      app.globalData.fortuneResult = {
        date: this.data.date,
        ...fortuneResult
      };
      
      // 更新页面数据
      this.setData({
        loading: false,
        fortuneResult: app.globalData.fortuneResult,
        fortuneScore: fortuneResult.score,
        fortuneDesc: fortuneResult.description,
        careerFortune: fortuneResult.career,
        loveFortune: fortuneResult.love,
        wealthFortune: fortuneResult.wealth
      });
    }).catch(error => {
      console.error('生成运势失败', error);
      this.setData({ loading: false });
      wx.showToast({
        title: '生成运势失败，请重试',
        icon: 'none'
      });
    });
  },
  
  // 模拟 DeepSeek API 调用
  // 实际项目中应替换为真实的 API 调用
  mockDeepSeekAPI(prompt) {
    return new Promise((resolve) => {
      // 模拟网络延迟
      setTimeout(() => {
        // 生成随机运势数据
        const score = Math.floor(Math.random() * 40) + 60; // 60-99 的随机分数
        const descriptions = [
          '今天的你充满活力，积极的态度将帮助你克服各种挑战。保持开放的心态，会有意外的惊喜等着你。',
          '今日运势平稳，适合处理日常事务。注意倾听他人建议，可能会得到有价值的信息。',
          '今天的你思维敏捷，创意源源不断。是解决复杂问题和开展创新项目的好时机。',
          '今日能量有所波动，上午效率较高，下午可能感到疲惫。合理安排时间，注意休息。',
          '今天的你人际关系和谐，沟通顺畅。是加强人脉和解决人际矛盾的好时机。'
        ];
        
        const careerFortunes = [
          '工作上会遇到新的机会，大胆尝试将获得意外收获。',
          '职场上需要更多耐心，踏实做事终会得到认可。',
          '事业发展顺利，团队合作将带来突破性进展。',
          '工作中可能面临挑战，保持冷静分析将助你渡过难关。',
          '职业规划需要调整，不妨寻求前辈或导师的建议。'
        ];
        
        const loveFortunes = [
          '感情上有甜蜜的小惊喜，增进彼此了解的好时机。',
          '单身者可能遇到有趣的人，保持真实的自己更有吸引力。',
          '恋爱中的你需要更多包容，沟通是解决问题的关键。',
          '今日桃花运旺盛，社交场合可能遇到心动的对象。',
          '感情需要更多的经营，一个小小的关怀会带来温暖。'
        ];
        
        const wealthFortunes = [
          '财运稳定，适合做长期投资规划。',
          '可能有意外收入，但也要控制冲动消费。',
          '财务状况需要重新评估，避免不必要的开支。',
          '投资机会显现，但需谨慎分析风险。',
          '财运上升，是拓展财源的好时机。'
        ];
        
        // 随机选择描述
        const randomIndex = Math.floor(Math.random() * 5);
        const result = {
          score: score,
          description: descriptions[randomIndex],
          career: careerFortunes[randomIndex],
          love: loveFortunes[randomIndex],
          wealth: wealthFortunes[randomIndex]
        };
        
        resolve(result);
      }, 1500);
    });
  },
  
  // 解析 AI 返回的运势结果
  // 实际项目中，这里需要根据 DeepSeek API 的返回格式进行解析
  parseFortuneResult(result) {
    // 这里直接返回模拟数据，实际项目中需要解析 AI 返回的文本
    return result;
  },
  
  // 重新生成运势
  refreshFortune() {
    this.generateFortune();
  },
  
  // 分享运势
  shareFortuneCard() {
    wx.navigateTo({
      url: '/pages/share/share'
    });
  }
});