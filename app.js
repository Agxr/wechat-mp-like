const api = require('/utils/api.js');

App({
  onLaunch: function (options) {
    var _this = this;
    console.log('场景值', options);
    // 打开小程序场景相关信息
    _this.globalData.open_scene = options.scene;
    if (options.scene == 1036) {
      _this.globalData.open_scence_flag = true;
    }
    // register.GetFenLei();
    wx.getSystemInfo({ // 获取系统信息
      success(resp) {
        console.log(resp);
        _this.globalData.system_info = resp;
      }
    })


    // 微信登陆
    wx.login({
      success: (res) => {
        // console.log(res);
        // 调用wx.getSetting查看用户授权情况
        wx.getSetting({
          success: function (res) {
            // console.log(res);
            if (res.authSetting['scope.userInfo']) {
              // 已经授权，可以直接调用 getUserInfo 获取头像昵称
              wx.getUserInfo({
                success: function (res) {
                  // console.log(res);
                  _this.globalData.wx_user_info = res.userInfo;
                  // wx.setStorageSync('wx_user_info', res.userInfo);
                  //由于这里是网络请求，可能会在 Page.onLoad 之后才返回
                  // 所以此处加入 callback 以防止这种情况
                  _this.globalData.checkAppOnlaunch = true;
                  if (_this.checkLoginReadyCallback) {
                    _this.checkLoginReadyCallback(res);
                  }
                }
              })
            } else {
              _this.globalData.checkAppOnlaunch = true;
              if (_this.checkLoginReadyCallback) {
                _this.checkLoginReadyCallback(res);
              }
            }
          }
        })
      }
    })

  },


  globalData: {
    checkAppOnlaunch: false, // 查看app的onLaunch事件是否完成
    open_scene: 0, // 打开小程序的场景值
    open_scence_flag: false, // 是否app分享打开的小程序，在question页面调用
    system_info: {}, // 设备信息
    openid: '', // wx.login 得到的 String
    user_id: null, // 用户id
    user_mobile: 0, // 用户手机号
    wx_user_info: {}, // wx授权得到的用户信息 Object
    zx_user_info: {}, // checkuserinfo接口得到用户信息 Object
  }
})
