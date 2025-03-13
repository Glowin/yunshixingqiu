// index.js
Page({
  data: {
    hasUserInfo: false,
    canIUseGetUserProfile: false,
    starAnimation: {}
  },
  onLoad() {
    if (wx.getUserProfile) {
      this.setData({
        canIUseGetUserProfile: true
      });
    }
    
    // 检查是否已有用户信息
    const app = getApp();
    if (app.globalData.userInfo && app.globalData.birthInfo) {
      this.setData({
        hasUserInfo: true
      });
    }
    
    // 初始化星星动画
    this.initStarAnimation();
  },
  
  getUserProfile() {
    wx.getUserProfile({
      desc: '用于完善会员资料',
      success: (res) => {
        const app = getApp();
        app.globalData.userInfo = res.userInfo;
        
        // 跳转到用户信息页面完善出生信息
        wx.navigateTo({
          url: '/pages/userInfo/userInfo'
        });
      }
    });
  },
  
  goToUserInfo() {
    wx.navigateTo({
      url: '/pages/userInfo/userInfo'
    });
  },
  
  goToFortune() {
    wx.navigateTo({
      url: '/pages/fortune/fortune'
    });
  },
  
  initStarAnimation() {
    // 创建星星闪烁动画
    const animation = wx.createAnimation({
      duration: 2000,
      timingFunction: 'ease',
    });
    
    let step = 0;
    setInterval(() => {
      if (step % 2 === 0) {
        animation.scale(1.1).opacity(1).step();
      } else {
        animation.scale(1.0).opacity(0.8).step();
      }
      
      this.setData({
        starAnimation: animation.export()
      });
      
      step++;
    }, 2000);
  }
});