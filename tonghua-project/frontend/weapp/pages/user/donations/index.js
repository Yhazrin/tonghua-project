var app = getApp();
var auth = require("../../../utils/auth.js");
var util = require("../../../utils/util.js");

Page({
  data: {
    donations: [],
    totalAmount: 0,
    totalCount: 0,
    page: 1,
    pageSize: 10,
    hasMore: true,
    loading: false,
    isEmpty: false
  },

  onLoad: function () {
    if (!auth.ensureLogin()) { return; }
    this.loadDonations();
  },

  onShow: function () {
    if (auth.checkLogin()) {
      this.setData({ page: 1, donations: [], hasMore: true });
      this.loadDonations();
    }
  },

  onPullDownRefresh: function () {
    this.setData({ page: 1, donations: [], hasMore: true });
    this.loadDonations();
    wx.stopPullDownRefresh();
  },

  onReachBottom: function () {
    if (this.data.hasMore && !this.data.loading) {
      this.loadDonations();
    }
  },

  loadDonations: function () {
    var that = this;
    if (that.data.loading) { return; }

    that.setData({ loading: true });

    wx.request({
      url: app.globalData.baseUrl + "/api/donations/my",
      method: "GET",
      header: {
        "Authorization": "Bearer " + auth.getToken()
      },
      data: {
        page: that.data.page,
        pageSize: that.data.pageSize
      },
      success: function (res) {
        if (res.data && res.data.code === 0) {
          var result = res.data.data;
          var list = result.list || [];
          list = list.map(function (item) {
            item.createdAtFormatted = util.formatDate(item.createdAt);
            item.amountFormatted = util.formatPrice(item.amount);
            return item;
          });
          var donations = that.data.page === 1 ? list : that.data.donations.concat(list);
          that.setData({
            donations: donations,
            totalAmount: result.totalAmount || 0,
            totalCount: result.totalCount || donations.length,
            hasMore: list.length >= that.data.pageSize,
            page: that.data.page + 1,
            isEmpty: that.data.page === 1 && list.length === 0
          });
        }
      },
      fail: function () {
        wx.showToast({ title: "Failed to load", icon: "none" });
      },
      complete: function () {
        that.setData({ loading: false });
      }
    });
  },

  handleDonationTap: function (e) {
    var id = e.currentTarget.dataset.id;
    wx.navigateTo({ url: "/pages/donate/detail/index?id=" + id });
  },

  handleDonateNow: function () {
    wx.navigateTo({ url: "/pages/donate/index" });
  },

  handleViewCertificate: function (e) {
    var id = e.currentTarget.dataset.id;
    wx.navigateTo({ url: "/pages/user/certificate/index?id=" + id });
  }
});
