// share.js
Page({
  data: {
    userInfo: {},
    fortuneResult: null,
    date: '',
    canvasWidth: 300,
    canvasHeight: 480,
    shareImagePath: ''
  },
  
  onLoad() {
    const app = getApp();
    
    // 检查是否有用户信息和运势结果
    if (!app.globalData.userInfo || !app.globalData.fortuneResult) {
      wx.redirectTo({
        url: '/pages/fortune/fortune'
      });
      return;
    }
    
    this.setData({
      userInfo: app.globalData.userInfo,
      fortuneResult: app.globalData.fortuneResult,
      date: app.globalData.fortuneResult.date
    });
    
    // 获取设备信息，设置画布大小
    wx.getSystemInfo({
      success: (res) => {
        const canvasWidth = res.windowWidth * 0.8;
        const canvasHeight = canvasWidth * 1.6; // 保持一定的宽高比
        this.setData({
          canvasWidth,
          canvasHeight
        });
        
        // 生成分享图片
        this.generateShareImage();
      }
    });
  },
  
  // 生成分享图片
  generateShareImage() {
    const { canvasWidth, canvasHeight, userInfo, fortuneResult, date } = this.data;
    const ctx = wx.createCanvasContext('shareCanvas');
    
    // 绘制背景
    ctx.setFillStyle('#f8f9fa');
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    
    // 绘制卡片背景
    ctx.setFillStyle('#ffffff');
    ctx.setShadow(0, 2, 10, 'rgba(0, 0, 0, 0.1)');
    ctx.fillRect(15, 15, canvasWidth - 30, canvasHeight - 30);
    ctx.setShadow(0, 0, 0, '#000000');
    
    // 绘制标题
    ctx.setFontSize(18);
    ctx.setFillStyle('#6C5CE7');
    ctx.setTextAlign('center');
    ctx.fillText('运势星球', canvasWidth / 2, 50);
    
    // 绘制日期
    ctx.setFontSize(14);
    ctx.setFillStyle('#333333');
    ctx.fillText(`${date} 今日运势`, canvasWidth / 2, 80);
    
    // 绘制用户信息
    if (userInfo.nickName) {
      ctx.setFontSize(14);
      ctx.setFillStyle('#666666');
      ctx.fillText(`${userInfo.nickName}的专属运势`, canvasWidth / 2, 110);
    }
    
    // 绘制分数
    ctx.setFontSize(40);
    ctx.setFillStyle('#6C5CE7');
    ctx.fillText(fortuneResult.score, canvasWidth / 2, 170);
    
    ctx.setFontSize(14);
    ctx.setFillStyle('#666666');
    ctx.fillText('综合运势评分', canvasWidth / 2, 200);
    
    // 绘制分割线
    ctx.beginPath();
    ctx.setLineWidth(1);
    ctx.setStrokeStyle('#f0f0f0');
    ctx.moveTo(30, 220);
    ctx.lineTo(canvasWidth - 30, 220);
    ctx.stroke();
    
    // 绘制运势描述
    ctx.setFontSize(14);
    ctx.setFillStyle('#333333');
    ctx.setTextAlign('left');
    this.drawMultilineText(ctx, fortuneResult.description, 30, 250, canvasWidth - 60, 20);
    
    // 绘制运势详情标题
    const detailY = 340;
    ctx.setFontSize(14);
    ctx.setFillStyle('#333333');
    ctx.setTextAlign('left');
    ctx.fillText('运势详情', 30, detailY);
    
    // 绘制事业运势
    this.drawFortuneDetail(ctx, '事业', fortuneResult.career, 30, detailY + 30);
    
    // 绘制爱情运势
    this.drawFortuneDetail(ctx, '爱情', fortuneResult.love, 30, detailY + 70);
    
    // 绘制财富运势
    this.drawFortuneDetail(ctx, '财富', fortuneResult.wealth, 30, detailY + 110);
    
    // 绘制小程序码提示
    ctx.setFontSize(12);
    ctx.setFillStyle('#999999');
    ctx.setTextAlign('center');
    ctx.fillText('长按识别小程序码，查看你的今日运势', canvasWidth / 2, canvasHeight - 30);
    
    // 绘制完成后保存图片
    ctx.draw(false, () => {
      setTimeout(() => {
        wx.canvasToTempFilePath({
          canvasId: 'shareCanvas',
          success: (res) => {
            this.setData({
              shareImagePath: res.tempFilePath
            });
          },
          fail: (error) => {
            console.error('生成分享图片失败', error);
            wx.showToast({
              title: '生成分享图片失败',
              icon: 'none'
            });
          }
        });
      }, 500); // 延迟一点时间确保画布已经渲染完成
    });
  },
  
  // 绘制多行文本
  drawMultilineText(ctx, text, x, y, maxWidth, lineHeight) {
    if (!text) return;
    
    let chars = text.split('');
    let line = '';
    let lineCount = 0;
    
    for (let i = 0; i < chars.length; i++) {
      line += chars[i];
      if (ctx.measureText(line).width >= maxWidth || i === chars.length - 1) {
        ctx.fillText(line, x, y + lineCount * lineHeight);
        line = '';
        lineCount++;
        if (lineCount > 3) break; // 最多显示4行
      }
    }
  },
  
  // 绘制运势详情项
  drawFortuneDetail(ctx, title, content, x, y) {
    // 绘制图标背景
    let bgColor;
    switch (title) {
      case '事业':
        bgColor = '#FF9F43';
        break;
      case '爱情':
        bgColor = '#FF6B6B';
        break;
      case '财富':
        bgColor = '#2ED573';
        break;
      default:
        bgColor = '#6C5CE7';
    }
    
    ctx.setFillStyle(bgColor);
    ctx.beginPath();
    ctx.arc(x + 10, y - 5, 10, 0, 2 * Math.PI);
    ctx.fill();
    
    // 绘制图标文字
    ctx.setFontSize(12);
    ctx.setFillStyle('#ffffff');
    ctx.setTextAlign('center');
    ctx.fillText(title.substr(0, 1), x + 10, y - 1);
    
    // 绘制详情标题
    ctx.setFontSize(14);
    ctx.setFillStyle('#333333');
    ctx.setTextAlign('left');
    ctx.fillText(`${title}运势`, x + 30, y);
    
    // 绘制详情内容
    ctx.setFontSize(12);
    ctx.setFillStyle('#666666');
    this.drawMultilineText(ctx, content, x + 30, y + 20, 200, 16);
  },
  
  // 保存图片到相册
  saveImage() {
    if (!this.data.shareImagePath) {
      wx.showToast({
        title: '图片生成中，请稍候',
        icon: 'none'
      });
      return;
    }
    
    wx.saveImageToPhotosAlbum({
      filePath: this.data.shareImagePath,
      success: () => {
        wx.showToast({
          title: '图片已保存到相册',
          icon: 'success'
        });
      },
      fail: (error) => {
        console.error('保存图片失败', error);
        if (error.errMsg.indexOf('auth deny') >= 0) {
          wx.showModal({
            title: '提示',
            content: '需要您授权保存图片到相册',
            showCancel: false,
            success: () => {
              wx.openSetting();
            }
          });
        } else {
          wx.showToast({
            title: '保存图片失败',
            icon: 'none'
          });
        }
      }
    });
  },
  
  // 分享给朋友
  onShareAppMessage() {
    return {
      title: `我的今日运势评分：${this.data.fortuneResult.score}分，快来看看你的运势吧！`,
      path: '/pages/index/index',
      imageUrl: this.data.shareImagePath
    };
  }
});