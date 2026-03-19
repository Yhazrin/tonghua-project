var http = require('./request');

// NOTE: Authentication is handled via httpOnly Cookies.
// The server manages the session and sets the session cookie on login.
// The client does NOT store the token locally.

function checkLogin() {
  // With httpOnly Cookies, we cannot check login status synchronously from the client.
  // Use an asynchronous check (e.g., fetch user profile) or assume logged out until
  // the server responds with 401/200. Here we return false to force re-login checks.
  // Real implementation might query an endpoint like GET /api/user/me
  // For now, we rely on the request interceptor or component logic to handle session state.
  return false;
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
            // Server sets httpOnly session cookie on successful login.
            // Client does NOT store the token.
            resolve(r);
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
  // Clear local user info.
  // Note: /auth/logout endpoint should be called to clear server-side session/cookie.
  getApp().globalData.userInfo = null;
  // No token to clear locally as it's httpOnly cookie
}

function getToken() {
  // Token is stored in httpOnly Cookie, cannot be retrieved by JavaScript.
  return null;
}

module.exports = { checkLogin: checkLogin, ensureLogin: ensureLogin, doLogin: doLogin, logout: logout, getToken: getToken };
