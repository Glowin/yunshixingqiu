// userInfo.js
Page({
  data: {
    userInfo: {},
    birthYear: 1990,
    birthMonth: 1,
    birthDay: 1,
    gender: '男',
    years: [],
    months: [],
    days: [],
    genders: ['男', '女']
  },
  
  onLoad() {
    const app = getApp();
    
    // 如果已有用户信息，则加载
    if (app.globalData.userInfo) {
      this.setData({
        userInfo: app.globalData.userInfo
      });
    }
    
    // 如果已有出生信息，则加载
    if (app.globalData.birthInfo) {
      const birthInfo = app.globalData.birthInfo;
      this.setData({
        birthYear: birthInfo.year,
        birthMonth: birthInfo.month,
        birthDay: birthInfo.day,
        gender: birthInfo.gender
      });
    }
    
    // 初始化年月日选择器数据
    this.initDatePicker();
  },
  
  initDatePicker() {
    // 生成年份列表（1950-当前年）
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let i = 1950; i <= currentYear; i++) {
      years.push(i);
    }
    
    // 生成月份列表
    const months = [];
    for (let i = 1; i <= 12; i++) {
      months.push(i);
    }
    
    // 生成日期列表（默认31天，会在月份变化时更新）
    const days = [];
    for (let i = 1; i <= 31; i++) {
      days.push(i);
    }
    
    this.setData({ years, months, days });
  },
  
  // 年份变化处理
  bindYearChange(e) {
    this.setData({
      birthYear: this.data.years[e.detail.value]
    });
    this.updateDays();
  },
  
  // 月份变化处理
  bindMonthChange(e) {
    this.setData({
      birthMonth: this.data.months[e.detail.value]
    });
    this.updateDays();
  },
  
  // 日期变化处理
  bindDayChange(e) {
    this.setData({
      birthDay: this.data.days[e.detail.value]
    });
  },
  
  // 性别变化处理
  bindGenderChange(e) {
    this.setData({
      gender: this.data.genders[e.detail.value]
    });
  },
  
  // 根据年月更新天数
  updateDays() {
    const { birthYear, birthMonth } = this.data;
    let daysInMonth = 31;
    
    // 根据月份确定天数
    if (birthMonth === 2) {
      // 判断闰年
      if ((birthYear % 4 === 0 && birthYear % 100 !== 0) || birthYear % 400 === 0) {
        daysInMonth = 29;
      } else {
        daysInMonth = 28;
      }
    } else if ([4, 6, 9, 11].includes(birthMonth)) {
      daysInMonth = 30;
    }
    
    const days = [];
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }
    
    // 如果当前选择的日期超过了该月最大天数，则调整为最大天数
    let birthDay = this.data.birthDay;
    if (birthDay > daysInMonth) {
      birthDay = daysInMonth;
    }
    
    this.setData({ days, birthDay });
  },
  
  // 保存用户信息
  saveUserInfo() {
    const app = getApp();
    const { birthYear, birthMonth, birthDay, gender } = this.data;
    
    // 保存出生信息到全局数据
    app.globalData.birthInfo = {
      year: birthYear,
      month: birthMonth,
      day: birthDay,
      gender: gender
    };
    
    wx.showToast({
      title: '保存成功',
      icon: 'success',
      duration: 2000,
      success: () => {
        // 延迟返回，让用户看到提示
        setTimeout(() => {
          // 修改：无论是否有运势结果，都跳转到运势页面
          wx.redirectTo({
            url: '/pages/fortune/fortune'
          });
        }, 1500);
      }
    });
  }
});