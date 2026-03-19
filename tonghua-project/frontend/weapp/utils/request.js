var app = getApp();
var BASE_URL = app.globalData.baseUrl;
var MAX_RETRIES = 3;
var isRefreshing = false;
var refreshQueue = [];

function generateNonce() {
  // Use crypto-safe random bytes for nonce
  var array = new Uint8Array(16);
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    crypto.getRandomValues(array);
  } else {
    // Fallback: use multiple Math.random calls with timestamp
    for (var i = 0; i < 16; i++) {
      array[i] = Math.floor(Math.random() * 256);
    }
    array[0] ^= Date.now() & 0xFF;
    array[1] ^= (Date.now() >> 8) & 0xFF;
  }
  return Array.from(array).map(function(b) { return b.toString(16).padStart(2, '0'); }).join('');
}

function request(options) {
  return new Promise(function(resolve, reject) {
    wx.request({
      url: BASE_URL + options.url,
      method: options.method || 'GET',
      data: options.data || {},
      header: {
        'Content-Type': 'application/json',
        'X-Timestamp': Date.now().toString(),
        'X-Nonce': generateNonce()
      },
      withCredentials: true, // Enable cookie support for httpOnly authentication
      success: function(res) {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(res.data);
        } else if (res.statusCode === 401) {
          // Session expired - redirect to login
          if (options._refreshAttempted) {
            wx.navigateTo({ url: '/pages/user/login/index' });
            reject(new Error('Session expired. Please log in again.'));
            return;
          }
          options._refreshAttempted = true;
          // Server will handle refresh via httpOnly cookies
          resolve(request(options));
        } else {
          var msg = (res.data && res.data.message) ? res.data.message : 'Request Error';
          wx.showToast({ title: msg, icon: 'none' });
          reject(new Error(msg));
        }
      },
      fail: function(err) {
        if (options._retry && options._retry < MAX_RETRIES) {
          options._retry = (options._retry || 0) + 1;
          setTimeout(function() { resolve(request(options)); }, 1000);
        } else {
          wx.showToast({ title: 'Network Error', icon: 'none' });
          reject(err);
        }
      }
    });
  });
}

// Token refresh is now handled server-side via httpOnly cookies
// No client-side token management needed

function get(url, data) {
  return request({ url: url, method: 'GET', data: data });
}

function post(url, data) {
  return request({ url: url, method: 'POST', data: data });
}

function put(url, data) {
  return request({ url: url, method: 'PUT', data: data });
}

function del(url, data) {
  return request({ url: url, method: 'DELETE', data: data });
}

function upload(url, filePath, name, formData) {
  return new Promise(function(resolve, reject) {
    wx.uploadFile({
      url: BASE_URL + url,
      filePath: filePath,
      name: name || 'file',
      formData: formData || {},
      header: {
        'X-Timestamp': Date.now().toString(),
        'X-Nonce': generateNonce()
      },
      withCredentials: true, // Enable cookie support for httpOnly authentication
      success: function(res) {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try {
            resolve(JSON.parse(res.data));
          } catch (e) {
            resolve(res.data);
          }
        } else if (res.statusCode === 401) {
          // Session expired - redirect to login
          wx.navigateTo({ url: '/pages/user/login/index' });
          reject(new Error('Session expired. Please log in again.'));
        } else {
          reject(new Error('Upload failed: ' + res.statusCode));
        }
      },
      fail: function(err) {
        wx.showToast({ title: '上传失败', icon: 'none' });
        reject(err);
      }
    });
  });
}

module.exports = { request: request, get: get, post: post, put: put, del: del, upload: upload };
