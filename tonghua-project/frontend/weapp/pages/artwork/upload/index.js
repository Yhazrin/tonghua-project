var http = require(`../../utils/request`);
var auth = require(`../../utils/auth`);

Page({
  data: {
    imageList: [],
    childDisplayName: ``,
    description: ``,
    campaignId: ``,
    campaigns: [],
    guardianConsent: false,
    uploading: false
  },
  onLoad: function() {
    var self = this;
    http.get(`/campaigns/active`).then(function(res) {
      self.setData({ campaigns: res || [] });
    });
  },
  chooseImage: function() {
    var self = this;
    wx.chooseMedia({
      count: 3 - self.data.imageList.length,
      mediaType: [`image`],
      sourceType: [`album`, `camera`],
      sizeType: [`compressed`],
      success: function(res) {
        var files = res.tempFiles.map(function(f) { return f.tempFilePath; });
        self.setData({ imageList: self.data.imageList.concat(files) });
      }
    });
  },
  removeImage: function(e) {
    var idx = e.currentTarget.dataset.index;
    var list = this.data.imageList;
    list.splice(idx, 1);
    this.setData({ imageList: list });
  },
  onNameInput: function(e) { this.setData({ childDisplayName: e.detail.value }); },
  onDescInput: function(e) { this.setData({ description: e.detail.value }); },
  onCampaignChange: function(e) { this.setData({ campaignId: this.data.campaigns[e.detail.value].id }); },
  onConsentChange: function(e) { this.setData({ guardianConsent: e.detail.value }); },
  submit: function() {
    var self = this;
    if (\!self.data.imageList.length) { wx.showToast({ title: `\u8BF7\u9009\u62E9\u56FE\u7247`, icon: `none` }); return; }
    if (\!self.data.childDisplayName) { wx.showToast({ title: `\u8BF7\u8F93\u5165\u7528\u6237\u540D`, icon: `none` }); return; }
    if (\!self.data.guardianConsent) { wx.showToast({ title: `\u8BF7\u786E\u8BA4\u76D1\u62A4\u4EBA\u540C\u610F`, icon: `none` }); return; }
    auth.ensureLogin().then(function() {
      self.setData({ uploading: true });
      var formData = { childDisplayName: self.data.childDisplayName, description: self.data.description, campaignId: self.data.campaignId };
      self.data.imageList.forEach(function(filePath, idx) {
        wx.uploadFile({
          url: getApp().globalData.baseUrl + `/artworks/upload`,
          filePath: filePath,
          name: `file`,
          formData: formData,
          header: { Authorization: `Bearer ` + auth.getToken() },
          success: function() {
            if (idx === self.data.imageList.length - 1) {
              self.setData({ uploading: false });
              wx.showToast({ title: `\u4E0A\u4F20\u6210\u529F` });
              setTimeout(function() { wx.navigateBack(); }, 1500);
            }
          },
          fail: function() { self.setData({ uploading: false }); wx.showToast({ title: `\u4E0A\u4F20\u5931\u8D25`, icon: `none` }); }
        });
      });
    });
  }
});
