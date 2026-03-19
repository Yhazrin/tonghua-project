var app = getApp();
var BASE_URL = app.globalData.baseUrl;
var MAX_RETRIES = 3;

function request(options) {
  return new Promise(function(resolve, reject) {
    var token = wx.getStorageSync(`accessToken`);
    wx.request({
      url: BASE_URL + options.url,
      method: options.method || `GET`,
      data: options.data || {},
      header: {
        `Content-Type`: `application/json`,
        `Authorization`: token ? `Bearer ` + token : ``,
        `X-Timestamp`: Date.now().toString(),
        `X-Nonce`: Math.random().toString(36).substr(2, 16)
      },
      success: function(res) {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(res.data);
        } else if (res.statusCode === 401) {
          refreshToken().then(function() { resolve(request(options)); }).catch(reject);
        } else {
          wx.showToast({ title: res.data.message || `Request Error`, icon: `none` });
          reject(res);
        }
      },
      fail: function(err) {
        if (options._retry && options._retry < MAX_RETRIES) {
          options._retry = (options._retry || 0) + 1;
          setTimeout(function() { resolve(request(options)); }, 1000);
        } else {
          wx.showToast({ title: `Network Error`, icon: `none` });
          reject(err);
        }
      }
    });
  });
}

function refreshToken() {
  var refresh = wx.getStorageSync(`refreshToken`);
  return request({
    url: `/auth/refresh`,
    method: `POST`,
    data: { refreshToken: refresh }
  }).then(function(res) {
    wx.setStorageSync(`accessToken`, res.accessToken);
    return res;
  });
}

function get(url, data) {
  return request({ url: url, method: `GET`, data: data });
}

function post(url, data) {
  return request({ url: url, method: `POST`, data: data });
}

function put(url, data) {
  return request({ url: url, method: `PUT`, data: data });
}

function del(url, data) {
  return request({ url: url, method: `DELETE`, data: data });
}

module.exports = { request: request, get: get, post: post, put: put, del: del };
