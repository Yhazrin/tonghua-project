App({
  globalData: {
    userInfo: null,
    token: null,
    refreshToken: null,
    systemInfo: null,
    baseUrl: `https://api.tonghua.example.com`,
    isConnected: true
  },
  onLaunch: function() {
    this.checkNetworkStatus();
    this.getSystemInfo();
    this.autoLogin();
  },
  getSystemInfo: function() {
    this.globalData.systemInfo = wx.getSystemInfoSync();
  },
  checkNetworkStatus: function() {
    var self = this;
    wx.getNetworkType({ success: function(r) { self.globalData.isConnected = r.networkType \!== `none`; } });
  },
  autoLogin: function() {
    var token = wx.getStorageSync(`accessToken`);
    if (token) { this.globalData.token = token; }
  },
  wxLogin: function() {
    var self = this;
    return new Promise(function(resolve, reject) {
      wx.login({
        success: function(res) {
          if (res.code) {
            self.request({ url: `/auth/wx-login`, method: `POST`, data: { code: res.code } })
              .then(function(r) {
                self.globalData.token = r.accessToken;
                self.globalData.refreshToken = r.refreshToken;
                wx.setStorageSync(`accessToken`, r.accessToken);
                wx.setStorageSync(`refreshToken`, r.refreshToken);
                resolve(r);
              }).catch(reject);
          } else { reject(new Error(`login failed`)); }
        },
        fail: reject
      });
    });
  },
  fetchUserInfo: function() {
    var self = this;
    return self.request({ url: `/user/profile`, method: `GET` }).then(function(res) {
      self.globalData.userInfo = res;
      return res;
    });
  },
  request: function(options) {
    var self = this;
    return new Promise(function(resolve, reject) {
      wx.request({
        url: self.globalData.baseUrl + options.url,
        method: options.method || `GET`,
        data: options.data,
        header: { `Content-Type`: `application/json`, `Authorization`: self.globalData.token ? `Bearer ` + self.globalData.token : `` },
        success: function(res) {
          if (res.statusCode === 200) { resolve(res.data); }
          else if (res.statusCode === 401) { self.wxLogin().then(function() { resolve(self.request(options)); }).catch(reject); }
          else { reject(new Error(res.data.message || `Request failed`)); }
        },
        fail: reject
      });
    });
  },
  onError: function(error) { console.error(`App Error:`, error); },
  onPageNotFound: function() { wx.redirectTo({ url: `/pages/index/index` }); }
});
