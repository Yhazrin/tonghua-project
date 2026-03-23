var http = require('../../utils/request');

var CLOTHING_TYPES = ['T恤', '衬衫', '连衣裙', '外套', '裤子', '裙子', '毛衣', '羽绒服', '运动服', '童装', '其他'];
var CONDITIONS = [
  { value: 'new', label: '全新' },
  { value: 'like_new', label: '近全新' },
  { value: 'good', label: '良好' },
  { value: 'fair', label: '一般' }
];
var DONATION_STATUS_LABELS = {
  submitted: '已提交',
  scheduled: '已安排取件',
  picked_up: '已取件',
  processing: '处理中',
  converted: '已转化为商品',
  completed: '完成',
  rejected: '不符合标准'
};

Page({
  data: {
    clothingTypes: CLOTHING_TYPES,
    conditions: CONDITIONS,
    step: 'form',
    successId: null,
    formData: {
      clothing_type: '',
      quantity: 1,
      condition: 'good',
      description: '',
      pickup_address: '',
      pickup_time_slot: ''
    },
    myDonations: [],
    loadingHistory: false,
    submitting: false,
    donationStatusLabels: DONATION_STATUS_LABELS
  },

  onLoad: function() {
    this.loadMyDonations();
  },

  loadMyDonations: function() {
    var self = this;
    self.setData({ loadingHistory: true });
    http.get('/ai/clothing-donations/mine').then(function(res) {
      self.setData({ myDonations: res.data || [], loadingHistory: false });
    }).catch(function() {
      self.setData({ loadingHistory: false });
    });
  },

  onClothingTypeSelect: function(e) {
    this.setData({ 'formData.clothing_type': e.currentTarget.dataset.type });
  },

  onConditionSelect: function(e) {
    this.setData({ 'formData.condition': e.currentTarget.dataset.condition });
  },

  onQuantityDecrease: function() {
    var q = this.data.formData.quantity;
    if (q > 1) this.setData({ 'formData.quantity': q - 1 });
  },

  onQuantityIncrease: function() {
    var q = this.data.formData.quantity;
    if (q < 100) this.setData({ 'formData.quantity': q + 1 });
  },

  onDescInput: function(e) {
    this.setData({ 'formData.description': e.detail.value });
  },

  onAddressInput: function(e) {
    this.setData({ 'formData.pickup_address': e.detail.value });
  },

  onTimeSlotInput: function(e) {
    this.setData({ 'formData.pickup_time_slot': e.detail.value });
  },

  onSubmit: function() {
    var self = this;
    var form = this.data.formData;

    if (!form.clothing_type) {
      wx.showToast({ title: '请选择衣物类型', icon: 'none' });
      return;
    }
    if (!form.pickup_address.trim()) {
      wx.showToast({ title: '请填写取件地址', icon: 'none' });
      return;
    }

    self.setData({ submitting: true });
    http.post('/ai/clothing-donations', form).then(function(res) {
      var data = res.data || res;
      self.setData({ step: 'success', successId: data.id, submitting: false });
      self.loadMyDonations();
    }).catch(function() {
      self.setData({ submitting: false });
      wx.showToast({ title: '提交失败，请重试', icon: 'error' });
    });
  },

  onReset: function() {
    this.setData({
      step: 'form',
      successId: null,
      formData: { clothing_type: '', quantity: 1, condition: 'good', description: '', pickup_address: '', pickup_time_slot: '' }
    });
  },

  onViewProduct: function(e) {
    wx.navigateTo({ url: '/pages/shop-detail/index?id=' + e.currentTarget.dataset.id });
  },

  padId: function(id) {
    return String(id).padStart(6, '0');
  }
});
