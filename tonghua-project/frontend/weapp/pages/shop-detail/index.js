var app = getApp()
var request = require('../../utils/request')

var MOCK_PRODUCTS = {
  1: {
    id: 1,
    title: '森林呼吸帆布包',
    price: 89.00,
    original_price: 129.00,
    description: '采用GOTS认证有机棉帆布，手感柔软，经久耐用。印有孩子们创作的森林主题画作，每售出一件，部分收益将捐赠给乡村儿童艺术教育项目。',
    images: [
      'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=800',
      'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=800'
    ],
    supply_chain: [
      { stage: '原料采购', description: '有机棉采购自新疆阿克苏生态农场，GOTS全球有机纺织品标准认证', location: '新疆·阿克苏', cert: 'GOTS有机认证' },
      { stage: '纺织加工', description: '节水工艺织造帆布面料，相比传统工艺节水60%', location: '江苏·南通', cert: 'OEKO-TEX认证' },
      { stage: '成品制造', description: 'BSCI认证公平贸易工厂手工缝制，工人享有合理薪酬', location: '广东·东莞', cert: 'BSCI认证' },
      { stage: '质量检测', description: 'SGS第三方检测，涵盖28项安全指标', location: '上海', cert: 'SGS检测报告' }
    ],
    stock: 156,
    sales: 342
  },
  2: {
    id: 2,
    title: '自然系列T恤',
    price: 129.00,
    original_price: 169.00,
    description: '精梳有机棉T恤，柔软亲肤。印有孩子们描绘的自然主题画作，舒适与公益兼得。',
    images: [
      'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=800'
    ],
    supply_chain: [
      { stage: '原料采购', description: '有机棉原料采购，GOTS认证', location: '新疆', cert: 'GOTS有机认证' },
      { stage: '纺织加工', description: '精梳棉纺织，环保染色', location: '山东·济南', cert: 'OEKO-TEX认证' },
      { stage: '成品制造', description: '数码印花技术，减少水资源浪费', location: '广东·深圳', cert: 'BSCI认证' },
      { stage: '质量检测', description: '全面质量检测通过', location: '上海', cert: 'SGS检测报告' }
    ],
    stock: 89,
    sales: 215
  }
}

Page({
  data: {
    product: null,
    loading: true,
    quantity: 1,
    currentImageIndex: 0
  },
  onLoad: function (options) {
    var id = options.id ? parseInt(options.id) : 1
    this.loadProduct(id)
  },
  loadProduct: function (id) {
    var that = this
    that.setData({ loading: true })

    setTimeout(function () {
      var product = MOCK_PRODUCTS[id] || MOCK_PRODUCTS[1]
      that.setData({
        product: product,
        loading: false
      })
      wx.setNavigationBarTitle({ title: product.title })
    }, 300)
  },
  onImageChange: function (e) {
    this.setData({ currentImageIndex: e.detail.current })
  },
  onMinus: function () {
    if (this.data.quantity > 1) {
      this.setData({ quantity: this.data.quantity - 1 })
    }
  },
  onPlus: function () {
    if (this.data.quantity < this.data.product.stock) {
      this.setData({ quantity: this.data.quantity + 1 })
    }
  },
  onAddCart: function () {
    var product = this.data.product
    var quantity = this.data.quantity
    var cart = wx.getStorageSync('cart') || []

    var existIndex = -1
    for (var i = 0; i < cart.length; i++) {
      if (cart[i].id === product.id) {
        existIndex = i
        break
      }
    }

    if (existIndex >= 0) {
      cart[existIndex].quantity += quantity
    } else {
      cart.push({
        id: product.id,
        title: product.title,
        price: product.price,
        image_url: product.images[0],
        quantity: quantity
      })
    }

    wx.setStorageSync('cart', cart)
    wx.showToast({ title: '已加入购物车', icon: 'success' })
  },
  onBuyNow: function () {
    this.onAddCart()
    wx.navigateTo({ url: '/pages/cart/index' })
  },
  onShareAppMessage: function () {
    var p = this.data.product
    return {
      title: p ? p.title : '童画公益商店',
      path: '/pages/shop-detail/index?id=' + (p ? p.id : 1)
    }
  }
})
