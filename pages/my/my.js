const app = getApp();
const api = require('../../utils/api.js');
const utils = require('../../utils/util.js');

Page({

  // 页面的初始数据
  data: {
    isAutoWechatInfoFlag: false, // 是否微信授权
    wxUserInfoObj: {}, // 授权的微信信息
    getUserInfoObj: {}, // 数据库中获得的用户信息
  },
  onLoad: function () {
    // console.log(app.globalData.wx_user_info);
    if (Object.keys(app.globalData.wx_user_info).length) {
      this.setData({
        isAutoWechatInfoFlag: true,
        wxUserInfoObj: app.globalData.wx_user_info
      })
    } else {
      this.setData({
        isAutoWechatInfoFlag: false
      })
    }
  },
  // 生命周期函数--监听页面显示
  onShow: function () {
    this.getCheckUserInfoFun(); // 查询用户信息
  },
  // 页面相关事件处理函数--监听用户下拉动作
  onPullDownRefresh: function () {
  },
  // 事件处理函数
  getCheckUserInfoFun: function () { // 查询用户信息
    let _this = this;
    wx.login({
      success: function (res) {
        let getParams = {
          code: res.code
        };
        api.getUserOpenidInfoData({
          method: 'GET',
          data: getParams,
          success: function (resp) {
            // console.log(resp);
            // // resp = {data: { "code": -2, "data": { "openid": "oj2fs4tEXjqYMVs5wWWYSb7ws4hY", "user_id": "", "mobile": "", "nickname": "" }, "msg": "" }}; // 测试用例
            if (resp.data.code == 0) { // 已注册
              app.globalData.openid = resp.data.data.openid;
              app.globalData.zx_user_info = resp.data.data;
              app.globalData.user_id = resp.data.data.user_id;
              app.globalData.user_mobile = resp.data.data.mobile;
            } else if (resp.data.code == -2) { // 该微信用户未注册
              app.globalData.openid = resp.data.data.openid || '';
            } else {
              console.log(resp.data.msg || '获取用户openid失败');
              _this.setData({
                isLoginFlag: false
              })
            }
          },
          fail: function (err) {
            console.log(err.msg || '获取用户openid失败');
          }
        })
      }
    })
  },
  getAutoUserinfoFun: function () {  // 已注册时再查看是否微信授权
    let _this = this;
    // 微信登陆
    let curUserInfo = app.globalData.wx_user_info;
    if (Object.keys(curUserInfo).length) {
      // console.log(curUserInfo);
      _this.setData({
        isAutoWechatInfoFlag: true,
        wxUserInfoObj: curUserInfo
      })
    } else {
      wx.login({
        success: (res) => {
          // console.log(res);
          // 调用wx.getSetting查看用户授权情况
          wx.getSetting({
            success: function (res) {
              if (res.authSetting['scope.userInfo']) {
                // 已经授权，可以直接调用 getUserInfo 获取头像昵称
                wx.getUserInfo({
                  success: function (res) {
                    // console.log(res);
                    app.globalData.wx_user_info = res.userInfo;
                    _this.setData({
                      isAutoWechatInfoFlag: true,
                      wxUserInfoObj: res.userInfo
                    })
                  }
                })
              } else {
                console.log("未授权微信信息！");
                _this.setData({
                  isAutoWechatInfoFlag: false
                })
              }
            }
          })
        }
      })
    }
  },
  onGetUserInfoEvn: function (e) { // 获取微信用户信息
    console.log(e.detail);
    let _this = this;
    let curMsg = e.detail.errMsg.toLocaleLowerCase();
    if (curMsg.indexOf('ok') > -1) {
      app.globalData.wx_user_info = e.detail.userInfo;
      this.setData({
        isAutoWechatInfoFlag: true,
        wxUserInfoObj: e.detail.userInfo
      })
      _this.onSaveUserWechatinfoFun(); // 注册用户的微信信息
    } else {
      wx.showModal({
        title: '提示',
        content: '未授权，影响后续使用体验',
        showCancel: false,
        confirmText: '去设置',
        success: function (res) {
          if (res.confirm) {
            wx.openSetting({
              success(res) {
                // console.log(res.authSetting);
                // res.authSetting = {
                //   "scope.userInfo": true,
                //   "scope.userLocation": true
                // }
                wx.getUserInfo({
                  success: function (getuserinfoobj) {
                    // console.log(getuserinfoobj);
                    app.globalData.wx_user_info = getuserinfoobj.userInfo;
                    _this.setData({
                      isAutoWechatInfoFlag: true,
                      wxUserInfoObj: getuserinfoobj.userInfo
                    })
                    _this.onSaveUserWechatinfoFun(); // 注册用户的微信信息
                  }
                })
              }
            })
          }
        }
      })
    }
  },
  onSaveUserWechatinfoFun: function () { // 注册用户的微信信息
    let getParams = {
      openid: app.globalData.openid || '',
      nickname: app.globalData.wx_user_info.nickName,
      avatar: app.globalData.wx_user_info.avatarUrl
    }
    api.getUserSaveInfoData({
      data: getParams,
      success: function (res) {
        console.log(res);
      }
    })
  },
  onGetIntegralCheckEvn: function (e) { // 立即签到
    // console.log('立即签到', e);
    // 判断是否登录
    let curAllFlag = this.checkLoginFun();
    // console.log(curAllFlag);
    if (!curAllFlag) {
      return false;
    }

    let _this = this;
    let curParams = {
      openid: app.globalData.openid || '',
      user_id: app.globalData.user_id || app.globalData.zx_user_info.user_id || '',
      platform: '22'
    };
    api.getCheckDayData({
      data: curParams,
      success: function (res) {
        // console.log(res);
        if (res.data.code == 0) {
          _this.setData({
            isUserCheckFlag: true
          })
          wx.showToast({
            title: '签到成功',
            icon: 'success',
            duration: 2000
          })
          _this.getMyConfigFun();
        } else {
          wx.showToast({
            title: res.data.msg || '签到失败',
            icon: 'none',
            duration: 2000
          })
        }
      },
      fail: function (err) {
        wx.showToast({
          title: err.msg || '签到失败',
          icon: 'none',
          duration: 2000
        })
      }
    })
  },
  goRwjfPageEvn: function (e) { // 赚任务积分
    // 判断是否登录
    let curAllFlag = this.checkLoginFun();
    if (!curAllFlag) {
      return false;
    }

    wx.navigateTo({
      url: '/pages/my_rwjf/my_rwjf',
    })
  },
  goJfPageEvn: function (e) { // 我的积分
    // 判断是否登录
    let curAllFlag = this.checkLoginFun();
    if (!curAllFlag) {
      return false;
    }

    wx.navigateTo({
      url: '/pages/my_jf/my_jf',
    })
  },
  goOrderPageEvn: function (e) { // 我的订单页面
    // 判断是否登录
    let curAllFlag = this.checkLoginFun();
    if (!curAllFlag) {
      return false;
    }

    wx.navigateTo({
      url: '/pages/my_order/my_order',
    })
  },
  goYhqPageEvn: function (e) { // 我的优惠券页面
    // 判断是否登录
    let curAllFlag = this.checkLoginFun();
    if (!curAllFlag) {
      return false;
    }

    wx.navigateTo({
      url: '/pages/my_yhq/my_yhq',
    })
  },
  goAddreddPageEvn: function (e) { // 地址管理页面
    // console.log('地址管理', e);
    // 判断是否登录
    let curAllFlag = this.checkLoginFun();
    if (!curAllFlag) {
      return false;
    }

    wx.navigateTo({
      url: '/pages/address_manage/address_manage',
    })
  },
  goBookcodePageEvn: function (e) { // 激活授权码页面
    // 判断是否登录
    let curAllFlag = this.checkLoginFun();
    if (!curAllFlag) {
      return false;
    }

    wx.navigateTo({
      url: '/pages/course_code/course_code',
    })
  },
  // 判断是否登录
  checkLoginFun: function () {
    let curOpenid = app.globalData.openid;
    let curWxUserObj = app.globalData.wx_user_info;
    let curGetUserObj = app.globalData.zx_user_info;
    let curMobile = app.globalData.user_mobile || curGetUserObj.mobile;
    let isAutoUserinfo = false;
    let isLoginFlag = false;
    console.log('curOpenid:  ' + curOpenid, 'nickName:  ' + curWxUserObj.nickName, 'mobile:  ' + curMobile);

    if (curWxUserObj.nickName || curWxUserObj.avatarUrl) {
      isAutoUserinfo = true;
    } else {
      isAutoUserinfo = false;
      wx.showToast({
        title: '请先登录',
        icon: 'none',
        duration: 2000
      })
      return false;
    }
    if (curOpenid && curMobile) {
      isLoginFlag = true;
    } else {
      isLoginFlag = false;
      console.log('未注册手机号');
      // wx.showToast({
      //   title: '请授权使用你的手机号',
      //   icon: 'none',
      //   duration: 600
      // })
      this.setData({
        layerAutoMobileFlag: true
      })
      wx.hideTabBar();
      
      return false;
    }
    let curReturn = [isAutoUserinfo, isLoginFlag];

    return curReturn;
  },
  getWechatUserinfoEvn: function (e) { // 蒙层授权成功
    this.setData({
      isAutoWechatInfoFlag: true,
      wxUserInfoObj: app.globalData.wx_user_info
    })
  },
  toHideLayerEvn: function (e) { // 取消授权蒙层
    // console.log(e);
    this.setData({
      layerShowFlag: false
    })
    wx.showTabBar();
  },
  getUserinfoMobileEvn: function (e) { // 手机号授权成功
    this.setData({
      isLoginFlag: true
    })
  },
  toHideLayerMobileEvn: function (e) { // 取消手机授权蒙层
    this.setData({
      layerAutoMobileFlag: false
    })
    wx.showTabBar();
  },
})