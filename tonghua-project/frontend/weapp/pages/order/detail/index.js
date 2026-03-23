var http = require('../../../utils/request');

var ORDER_STATUS_LABELS = {
  pending: '待支付',
  paid: '已支付',
  processing: '备货中',
  shipped: '已发货',
  delivered: '已到达',
  completed: '已完成',
  cancelled: '已取消',
  refunding: '退款中',
  refunded: '已退款'
};

var LOGISTICS_STATUS_LABELS = {
  pending: '待揽收',
  picked_up: '已揽收',
  in_transit: '运输中',
  out_for_delivery: '派送中',
  delivered: '已签收',
  exception: '运输异常'
};

Page({
  data: {
    order: null,
    logistics: null,
    loading: true,
    activeTab: 'detail',
    canReview: false,
    canAfterSales: false,
    reviewForm: { rating: 5, sustainability_rating: 5, title: '', content: '', is_anonymous: false },
    reviewSubmitted: false,
    afterSalesForm: { request_type: 'return', reason: '', description: '' },
    afterSalesSubmitted: false,
    afterSalesTypes: [
      { value: 'return', label: '退货退款' },
      { value: 'exchange', label: '换货' },
      { value: 'repair', label: '维修' },
      { value: 'complaint', label: '投诉' },
      { value: 'inquiry', label: '咨询' }
    ],
    orderStatusLabels: ORDER_STATUS_LABELS
  },

  onLoad: function(options) {
    this.orderId = options.id;
    this.loadOrder();
  },

  loadOrder: function() {
    var self = this;
    http.get('/orders/' + self.orderId).then(function(res) {
      var order = res.data || res;
      var canReview = ['delivered', 'completed'].includes(order.status);
      var canAfterSales = ['delivered', 'completed', 'shipped'].includes(order.status);
      self.setData({
        order: order,
        loading: false,
        canReview: canReview,
        canAfterSales: canAfterSales
      });
    }).catch(function() {
      self.setData({ loading: false });
      wx.showToast({ title: '加载失败', icon: 'error' });
    });
  },

  switchTab: function(e) {
    var tab = e.currentTarget.dataset.tab;
    this.setData({ activeTab: tab });
    if (tab === 'logistics' && !this.data.logistics) {
      this.loadLogistics();
    }
  },

  loadLogistics: function() {
    var self = this;
    http.get('/logistics/order/' + self.orderId).then(function(res) {
      self.setData({ logistics: res.data || res });
    }).catch(function() {
      self.setData({ logistics: null });
    });
  },

  onCancelOrder: function() {
    var self = this;
    wx.showModal({
      title: '确认取消',
      content: '确定要取消这个订单吗？',
      success: function(res) {
        if (res.confirm) {
          http.post('/orders/' + self.orderId + '/cancel').then(function() {
            wx.showToast({ title: '订单已取消' });
            self.loadOrder();
          }).catch(function() {
            wx.showToast({ title: '取消失败', icon: 'error' });
          });
        }
      }
    });
  },

  onRatingTap: function(e) {
    var rating = e.currentTarget.dataset.rating;
    this.setData({ 'reviewForm.rating': rating });
  },

  onSustainabilityRatingTap: function(e) {
    var rating = e.currentTarget.dataset.rating;
    this.setData({ 'reviewForm.sustainability_rating': rating });
  },

  onReviewTitleInput: function(e) {
    this.setData({ 'reviewForm.title': e.detail.value });
  },

  onReviewContentInput: function(e) {
    this.setData({ 'reviewForm.content': e.detail.value });
  },

  onAnonymousChange: function(e) {
    this.setData({ 'reviewForm.is_anonymous': e.detail.value });
  },

  onSubmitReview: function() {
    var self = this;
    var order = this.data.order;
    if (!order || !order.items || order.items.length === 0) {
      wx.showToast({ title: '暂无可评价商品', icon: 'none' });
      return;
    }
    var productId = order.items[0].product_id;
    var form = this.data.reviewForm;

    http.post('/reviews', {
      product_id: productId,
      order_id: parseInt(self.orderId),
      rating: form.rating,
      title: form.title,
      content: form.content,
      sustainability_rating: form.sustainability_rating,
      is_anonymous: form.is_anonymous
    }).then(function() {
      self.setData({ reviewSubmitted: true });
      wx.showToast({ title: '评价提交成功' });
    }).catch(function(err) {
      wx.showToast({ title: err.detail || '提交失败', icon: 'error' });
    });
  },

  onAfterSalesTypeChange: function(e) {
    this.setData({ 'afterSalesForm.request_type': e.currentTarget.dataset.type });
  },

  onAfterSalesReasonInput: function(e) {
    this.setData({ 'afterSalesForm.reason': e.detail.value });
  },

  onAfterSalesDescInput: function(e) {
    this.setData({ 'afterSalesForm.description': e.detail.value });
  },

  onSubmitAfterSales: function() {
    var self = this;
    var form = this.data.afterSalesForm;
    if (!form.reason.trim()) {
      wx.showToast({ title: '请填写申请原因', icon: 'none' });
      return;
    }
    http.post('/after-sales', {
      order_id: parseInt(self.orderId),
      request_type: form.request_type,
      reason: form.reason,
      description: form.description
    }).then(function() {
      self.setData({ afterSalesSubmitted: true });
      wx.showToast({ title: '售后申请已提交' });
    }).catch(function(err) {
      wx.showToast({ title: err.detail || '提交失败', icon: 'error' });
    });
  },

  formatLogisticsStatus: function(status) {
    return LOGISTICS_STATUS_LABELS[status] || status;
  }
});
