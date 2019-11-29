// api域名
// 线上环境域名
// const phpUrl = 'https://cg.tianxuesong.com';
// 测试环境域名
const phpUrl = 'https://dev-cg.zhenxue.com.cn';
// 请求
const wxRequest = (params, url) => {
  wx.showLoading({
    title: 'loading...'
  })
  wx.request({
    url,
    method: params.method || 'POST',
    data: params.data || {},
    header: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    success(res) {
      //console.log(res)
      wx.hideLoading();
      if (params.success) {
        params.success(res);
      }
    },
    fail(res) {
      wx.hideLoading();
      if (params.fail) {
        params.fail(res);
      }
    },
    complete(res) {
      wx.stopPullDownRefresh();
      if (params.complete) {
        params.complete(res);
      }
    },
  });
};

// 上传图片
const wxRequestUploadFile = (params, url) => {
  wx.showLoading({
    title: 'loading...'
  })
  wx.uploadFile({
    url: url,
    filePath: params.filePath || '',
    formData: params.formData || {},
    name: 'file',
    success(res) {
      //console.log(res)
      wx.hideLoading();
      if (params.success) {
        params.success(res);
      }
    },
    fail(res) {
      wx.hideLoading();
      if (params.fail) {
        params.fail(res);
      }
    },
    complete(res) {
      wx.stopPullDownRefresh();
      if (params.complete) {
        params.complete(res);
      }
    },
  });
};


// 根据code获取openid和用户注册信息  method：get  参数：code
const getUserOpenidInfoData = (params) => {
  wxRequest(params, `${phpUrl}/index.php?c=user_ctrl&m=get_wxuserinfo`);
}



module.exports = {
  // 通过openid获取用户注册信息
  getUserOpenidInfoData,

};
