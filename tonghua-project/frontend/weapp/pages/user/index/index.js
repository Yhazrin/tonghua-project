var app = getApp();
var auth = require("../../../utils/auth.js");

Page({
  data: {
    isLoggedIn: false,
    userInfo: null,
    menuItems: [
      { id: "orders", title: "My Orders", icon: "orders", desc: "View all orders" },
      { id: "donations", title: "My Donations", icon: "donate", desc: "Donation records" },
      { id: "artworks", title: "My Artworks", icon: "art", desc: "Uploaded artworks" },
      { id: "settings", title: "Settings", icon: "settings", desc: "Account settings" }
    ]
  },

  onLoad: function () {
    this.checkLoginStatus();
  },

  onShow: function () {
    this.checkLoginStatus();
  },

  onPullDownRefresh: function () {
    this.checkLoginStatus();
    wx.stopPullDownRefresh();
  },

  checkLoginStatus: function () {
    var isLoggedIn = auth.checkLogin();
    if (isLoggedIn) {
      this.setData({
        isLoggedIn: true,
        userInfo: app.globalData.userInfo
      });
    } else {
      this.setData({
        isLoggedIn: false,
        userInfo: null
      });
    }
  },

  handleLogin: function () {
    var that = this;
    auth.doLogin().then(function () {
      that.setData({
        isLoggedIn: true,
        userInfo: app.globalData.userInfo
      });
    }).catch(function () {
      wx.showToast({ title: "Login failed", icon: "none" });
    });
  },

  handleMenuTap: function (e) {
    var id = e.currentTarget.dataset.id;
    if (!this.data.isLoggedIn) {
      this.handleLogin();
      return;
    }
    var routes = {
      orders: "/pages/user/orders/index",
      donations: "/pages/user/donations/index",
      artworks: "/pages/user/artworks/index",
      settings: "/pages/user/settings/index"
    };
    if (routes[id]) {
      wx.navigateTo({ url: routes[id] });
    }
  },

  handleAbout: function () {
    wx.navigateTo({ url: "/pages/about/index" });
  },

  handleLogout: function () {
    var that = this;
    wx.showModal({
      title: "Confirm Logout",
      content: "Are you sure you want to log out?",
      success: function (res) {
        if (res.confirm) {
          auth.logout();
          that.setData({
            isLoggedIn: false,
            userInfo: null
          });
        }
      }
    });
  },

  onShareAppMessage: function () {
    return {
      title: "Tonghua Public Welfare",
      path: "/pages/index/index"
    };
  }
});
