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
    const prompt = `你是一位专业的占星师，请根据以下信息为用户生成今日运势预测：

出生年月日：${birthInfo.year}年${birthInfo.month}月${birthInfo.day}日
性别：${birthInfo.gender}
请提供以下内容：
1. 今日综合运势评分（1-100分）
2. 今日运势简短描述（100字以内）
3. 事业运势（50字以内）
4. 爱情运势（50字以内）
5. 财运（50字以内）
请直接给出结果，不要有多余的解释。`;
    
    // 调用真实的 DeepSeek API
    this.callDeepSeekAPI(prompt).then(result => {
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
  
  // 调用 DeepSeek API
  callDeepSeekAPI(prompt) {
    return new Promise((resolve, reject) => {
      // DeepSeek API 密钥
      const apiKey = 'sk-cf13be406f254309a3559012ece4d33e';
      
      // DeepSeek API 请求配置
      wx.request({
        url: 'https://api.deepseek.com/v1/chat/completions',
        method: 'POST',
        header: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        data: {
          model: 'deepseek-chat',
          messages: [
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.7,
          max_tokens: 800
        },
        success: (res) => {
          if (res.statusCode === 200 && res.data && res.data.choices && res.data.choices.length > 0) {
            resolve(res.data.choices[0].message.content);
          } else {
            console.error('DeepSeek API 返回异常', res);
            reject(new Error('API 返回数据格式异常'));
          }
        },
        fail: (err) => {
          console.error('调用 DeepSeek API 失败', err);
          reject(err);
        }
      });
    });
  },
  
  // 解析 AI 返回的运势结果
  parseFortuneResult(text) {
    try {
      // 尝试提取运势评分（1-100分）
      const scoreMatch = text.match(/\d+(?=分)/) || text.match(/\b\d{1,3}\b/);
      const score = scoreMatch ? parseInt(scoreMatch[0]) : 75; // 默认75分
      
      // 尝试提取各部分内容
      let description = '';
      let career = '';
      let love = '';
      let wealth = '';
      
      // 提取运势描述
      const descMatch = text.match(/今日运势(?:简短)?描述[：:](.*?)(?=\d|事业|爱情|财运|$)/s);
      if (descMatch && descMatch[1]) {
        description = descMatch[1].trim();
      } else {
        // 如果没有明确标记，尝试提取第一段作为描述
        const firstParagraph = text.split(/\n\s*\n/)[0];
        if (firstParagraph && !firstParagraph.includes('运势评分')) {
          description = firstParagraph.replace(/^[\d\.、]+\s*/, '').trim();
        }
      }
      
      // 提取事业运势
      const careerMatch = text.match(/事业运势[：:](.*?)(?=\d|爱情|财运|$)/s);
      if (careerMatch && careerMatch[1]) {
        career = careerMatch[1].trim();
      }
      
      // 提取爱情运势
      const loveMatch = text.match(/爱情运势[：:](.*?)(?=\d|事业|财运|$)/s);
      if (loveMatch && loveMatch[1]) {
        love = loveMatch[1].trim();
      }
      
      // 提取财运
      const wealthMatch = text.match(/财运[：:](.*?)(?=\d|事业|爱情|$)/s);
      if (wealthMatch && wealthMatch[1]) {
        wealth = wealthMatch[1].trim();
      }
      
      return {
        score: score,
        description: description || '今日运势平稳，保持积极心态将有助于应对各种挑战。',
        career: career || '工作上需保持专注，踏实做事终会得到认可。',
        love: love || '感情需要更多的经营，一个小小的关怀会带来温暖。',
        wealth: wealth || '财务状况稳定，避免冲动消费。'
      };
    } catch (error) {
      console.error('解析运势结果失败', error);
      // 返回默认值
      return {
        score: 75,
        description: '今日运势平稳，保持积极心态将有助于应对各种挑战。',
        career: '工作上需保持专注，踏实做事终会得到认可。',
        love: '感情需要更多的经营，一个小小的关怀会带来温暖。',
        wealth: '财务状况稳定，避免冲动消费。'
      };
    }
  },
  
  // 模拟 DeepSeek API 调用（保留作为备用方案）
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