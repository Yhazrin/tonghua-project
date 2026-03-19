App({
  globalData: {
    userInfo: null,
    systemInfo: null,
    baseUrl: 'https://api.tonghua.org/api/v1',
    isConnected: true
  },
  onLaunch: function() {
    this.checkNetworkStatus();
    this.getSystemInfo();
  },
  getSystemInfo: function() {
    this.globalData.systemInfo = wx.getSystemInfoSync();
  },
  checkNetworkStatus: function() {
    var self = this;
    wx.getNetworkType({ success: function(r) { self.globalData.isConnected = r.networkType !== 'none'; } });
  },
  wxLogin: function() {
    var self = this;
    return new Promise(function(resolve, reject) {
      wx.login({
        success: function(res) {
          if (res.code) {
            var request = require('./utils/request');
            request.post('/auth/wx-login', { code: res.code })
              .then(function(r) {
                // Server sets httpOnly cookies, no need to store tokens client-side
                resolve(r);
              }).catch(reject);
          } else { reject(new Error('login failed')); }
        },
        fail: reject
      });
    });
  },
  onError: function(error) { console.error('App Error:', error); },
  onPageNotFound: function() { wx.redirectTo({ url: '/pages/index/index' }); }
});
