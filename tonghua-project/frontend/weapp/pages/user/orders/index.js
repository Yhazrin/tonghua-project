var app = getApp();
var auth = require("../../../utils/auth.js");
var util = require("../../../utils/util.js");

Page({
  data: {
    statusTabs: [
      { key: "all", label: "All" },
      { key: "pending", label: "Pending" },
      { key: "paid", label: "Paid" },
      { key: "shipped", label: "Shipped" },
      { key: "completed", label: "Completed" }
    ],
    currentStatus: "all",
    orders: [],
    page: 1,
    pageSize: 10,
    hasMore: true,
    loading: false,
    isEmpty: false
  },

  onLoad: function () {
    if (!auth.ensureLogin()) { return; }
    this.loadOrders();
  },

  onShow: function () {
    if (auth.checkLogin()) {
      this.loadOrders();
    }
  },

  onPullDownRefresh: function () {
    this.setData({ page: 1, hasMore: true, orders: [] });
    this.loadOrders();
    wx.stopPullDownRefresh();
  },

  onReachBottom: function () {
    if (this.data.hasMore && !this.data.loading) {
      this.loadOrders();
    }
  },

  handleStatusChange: function (e) {
    var status = e.currentTarget.dataset.status;
    this.setData({
      currentStatus: status,
      page: 1,
      orders: [],
      hasMore: true
    });
    this.loadOrders();
  },

  loadOrders: function () {
    var that = this;
    if (that.data.loading) { return; }

    that.setData({ loading: true });

    wx.request({
      url: app.globalData.baseUrl + "/api/orders",
      method: "GET",
      header: {
        "Authorization": "Bearer " + auth.getToken()
      },
      data: {
        status: that.data.currentStatus === "all" ? "" : that.data.currentStatus,
        page: that.data.page,
        pageSize: that.data.pageSize
      },
      success: function (res) {
        if (res.data && res.data.code === 0) {
          var list = res.data.data.list || [];
          list = list.map(function (item) {
            item.createdAtFormatted = util.formatDate(item.createdAt);
            item.totalAmountFormatted = util.formatPrice(item.totalAmount);
            return item;
          });
          var orders = that.data.page === 1 ? list : that.data.orders.concat(list);
          that.setData({
            orders: orders,
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

  handleOrderTap: function (e) {
    var id = e.currentTarget.dataset.id;
    wx.navigateTo({ url: "/pages/order/detail/index?id=" + id });
  },

  getStatusText: function (status) {
    var map = {
      pending: "Pending Payment",
      paid: "Paid",
      shipped: "Shipped",
      completed: "Completed",
      cancelled: "Cancelled",
      refunded: "Refunded"
    };
    return map[status] || status;
  }
});
