var http = require('./request');

// NOTE: Authentication is handled via Bearer tokens stored locally.
// The token is retrieved from the server response and sent in the Authorization header.

function checkLogin() {
  // Check if a token exists in local storage
  return getToken() !== null;
}

function ensureLogin() {
  return new Promise(function(resolve, reject) {
    // Client handles token presence
    // If token is missing, login flow should be triggered
    // Note: This function currently resolves immediately.
    // Real implementation might check checkLogin() and redirect if false.
    resolve();
  });
}

function doLogin() {
  return new Promise(function(resolve, reject) {
    wx.login({
      success: function(res) {
        if (res.code) {
          http.post('/auth/wx-login', { code: res.code }).then(function(r) {
            // Server returns token in JSON body
            // Save token client-side for Authorization header
            if (r.success && r.data && r.data.access_token) {
              getApp().globalData.token = r.data.access_token;
            }
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
  // Clear local token and user info.
  // Note: /auth/logout endpoint can be called to invalidate server-side session if needed.
  getApp().globalData.userInfo = null;
  getApp().globalData.token = null;
}

function getToken() {
  // Retrieve token from global data
  return getApp().globalData.token || null;
}

module.exports = { checkLogin: checkLogin, ensureLogin: ensureLogin, doLogin: doLogin, logout: logout, getToken: getToken };
