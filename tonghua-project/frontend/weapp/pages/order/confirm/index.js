var http = require(`../../../utils/request`);
var auth = require(`../../../utils/auth`);

Page({
  data: {
    cartItems: [],
    address: { name: ``, phone: ``, detail: `` },
    totalAmount: 0,
    submitting: false
  },
  onLoad: function() {
    var cart = wx.getStorageSync(`cart`) || [];
    var self = this;
    if (\!cart.length) { wx.navigateBack(); return; }
    var ids = cart.map(function(c) { return c.productId; }).join(`,`);
    http.get(`/products/batch`, { ids: ids }).then(function(res) {
      var items = cart.map(function(c) {
        var p = (res || []).find(function(x) { return x.id === c.productId; }) || {};
        return { product: p, quantity: c.quantity };
      });
      var total = items.reduce(function(s, i) { return s + (i.product.price || 0) * i.quantity; }, 0);
      self.setData({ cartItems: items, totalAmount: total });
    });
  },
  onNameInput: function(e) { var a = this.data.address; a.name = e.detail.value; this.setData({ address: a }); },
  onPhoneInput: function(e) { var a = this.data.address; a.phone = e.detail.value; this.setData({ address: a }); },
  onAddrInput: function(e) { var a = this.data.address; a.detail = e.detail.value; this.setData({ address: a }); },
  onSubmit: function() {
    var self = this;
    if (\!self.data.address.name || \!self.data.address.phone || \!self.data.address.detail) {
      wx.showToast({ title: `\u8BF7\u586B\u5199\u5B8C\u6574\u5730\u5740`, icon: `none` }); return;
    }
    auth.ensureLogin().then(function() {
      self.setData({ submitting: true });
      var items = self.data.cartItems.map(function(i) { return { productId: i.product.id, quantity: i.quantity }; });
      http.post(`/orders/create`, { items: items, address: self.data.address }).then(function(order) {
        wx.requestPayment({
          timeStamp: order.timeStamp,
          nonceStr: order.nonceStr,
          package: order.package,
          signType: order.signType || `RSA`,
          paySign: order.paySign,
          success: function() {
            wx.removeStorageSync(`cart`);
            wx.redirectTo({ url: `/pages/order/detail?id=` + order.id });
          },
          fail: function() {
            self.setData({ submitting: false });
            wx.showToast({ title: `\u652F\u4ED8\u53D6\u6D88`, icon: `none` });
          }
        });
      }).catch(function() { self.setData({ submitting: false }); });
    });
  }
});
