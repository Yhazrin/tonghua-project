var http = require(`../../utils/request`);
var auth = require(`../../utils/auth`);

Page({
  data: {
    amounts: [10, 50, 100, 200],
    selectedAmount: 50,
    customAmount: ``,
    message: ``,
    anonymous: false,
    submitting: false,
    showResult: false,
    donationResult: null
  },
  onAmountSelect: function(e) {
    this.setData({ selectedAmount: e.currentTarget.dataset.amount, customAmount: `` });
  },
  onCustomInput: function(e) {
    this.setData({ customAmount: e.detail.value, selectedAmount: 0 });
  },
  onMessageInput: function(e) { this.setData({ message: e.detail.value }); },
  onAnonymousChange: function(e) { this.setData({ anonymous: e.detail.value }); },
  getFinalAmount: function() {
    return this.data.customAmount ? parseInt(this.data.customAmount) : this.data.selectedAmount;
  },
  onSubmit: function() {
    var self = this;
    var amount = self.getFinalAmount();
    if (\!amount || amount <= 0) { wx.showToast({ title: `\u8BF7\u9009\u62E9\u91D1\u989D`, icon: `none` }); return; }
    auth.ensureLogin().then(function() {
      self.setData({ submitting: true });
      http.post(`/donations/create`, {
        amount: amount * 100,
        message: self.data.message,
        anonymous: self.data.anonymous
      }).then(function(order) {
        wx.requestPayment({
          timeStamp: order.timeStamp,
          nonceStr: order.nonceStr,
          package: order.package,
          signType: order.signType || `RSA`,
          paySign: order.paySign,
          success: function() {
            self.setData({ showResult: true, donationResult: { amount: amount }, submitting: false });
          },
          fail: function() {
            self.setData({ submitting: false });
            wx.showToast({ title: `\u652F\u4ED8\u53D6\u6D88`, icon: `none` });
          }
        });
      }).catch(function() {
        self.setData({ submitting: false });
        wx.showToast({ title: `\u521B\u5EFA\u8BA2\u5355\u5931\u8D25`, icon: `none` });
      });
    });
  },
  onCloseResult: function() { this.setData({ showResult: false }); }
});
