//index.js
//获取应用实例
const app = getApp();
const api = require('../../utils/api.js');
const utils = require('../../utils/util.js');
const key = '6DJBZ-H5IWG-LSFQG-IZGQZ-F7OZO-JDBZI'; //使用在腾讯位置服务申请的key
const referer = '时光荒芜'; // 调用插件的app的名称
const location = ''; // JSON.stringify({latitude: 39.89631551, longitude: 116.323459711})
const category = '生活服务,娱乐休闲';
const chooseLocation = requirePlugin('chooseLocation');


Page({
  data: {
    motto: 'Hello World',
    userInfo: {},
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo')
  },
  onLoad: function () {
    let _this = this;
    if (Object.keys(app.globalData.wx_user_info).length) {
      this.setData({
        userInfo: app.globalData.wx_user_info,
        hasUserInfo: true
      })
      // this.getIndexData();
    } else {
      app.checkLoginReadyCallback = res => {
        // console.log(res);
        if (Object.keys(app.globalData.wx_user_info).length) {
          _this.setData({
            userInfo: app.globalData.wx_user_info,
            hasUserInfo: true
          })
        } else {
          _this.setData({
            hasUserInfo: false
          })
        }
      }
    }
  },
  onShow: function () {
    let location = chooseLocation.getLocation(); // 如果点击确认选点按钮，则返回选点结果对象，否则返回null
    console.log('用户选择点： ', location);
  },
  // 事件处理函数
  getUserInfo: function(e) {
    console.log(e)
    app.globalData.wx_user_info = e.detail.userInfo
    this.setData({
      userInfo: e.detail.userInfo,
      hasUserInfo: true
    })
  },
  goMapSelAddressEvn: function () {
    wx.navigateTo({
      url: 'plugin://chooseLocation/index?key=' + key + '&referer=' + referer + '&location=' + location + '&category' + category
    });
  }
})
