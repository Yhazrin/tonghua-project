var http = require('./request');

// NOTE: Authentication is handled via httpOnly cookies managed by the server.
// No client-side token storage is needed.

function checkLogin() {
  // For now, always return true to let server handle session validation
  // In a real implementation, you might check for a session cookie presence
  return true;
}

function ensureLogin() {
  return new Promise(function(resolve, reject) {
    // Server handles session via httpOnly cookies
    // No need to check for client-side tokens
    resolve();
  });
}

function doLogin() {
  return new Promise(function(resolve, reject) {
    wx.login({
      success: function(res) {
        if (res.code) {
          http.post('/auth/wx-login', { code: res.code }).then(function(r) {
            // Server sets httpOnly cookies via Set-Cookie header
            // No need to store tokens client-side
            resolve();
          }).catch(reject);
        } else {
          reject(new Error('login failed'));
        }
      },
      fail: reject
    });
  });
}

function logout() {
  // Server will clear httpOnly cookies on /auth/logout
  getApp().globalData.userInfo = null;
  getApp().globalData.token = null;
}

function getToken() {
  // Token is managed by httpOnly cookies, not stored client-side
  return null;
}

module.exports = { checkLogin: checkLogin, ensureLogin: ensureLogin, doLogin: doLogin, logout: logout, getToken: getToken };
