import type {
  User, Artwork, Campaign, Donation, Order,
  ChildParticipant, AuditLogEntry, DashboardMetrics,
  ChartDataPoint, SystemSettings,
} from '../types';

// Deterministic seeded PRNG — replaces Math.random() for stable mock data
function seeded(seed: number): number {
  // Simple hash: returns deterministic 0..1 value from integer seed
  let h = seed;
  h = Math.imul(h ^ (h >>> 16), 0x45d9f3b);
  h = Math.imul(h ^ (h >>> 13), 0x45d9f3b);
  h = h ^ (h >>> 16);
  return (h >>> 0) / 0xFFFFFFFF;
}

// Helper for deterministic dates
const randomDate = (start: string, end: string, seed: number) => {
  const s = new Date(start).getTime();
  const e = new Date(end).getTime();
  return new Date(s + seeded(seed) * (e - s)).toISOString();
};

const statuses: Artwork['status'][] = ['pending', 'approved', 'rejected', 'archived'];
const categories = ['Oil Painting', 'Watercolor', 'Sketch', 'Crayon Drawing', 'Collage', 'Digital Art'];
const regions = ['Beijing', 'Shanghai', 'Guangzhou', 'Chengdu', 'Xi\'an', 'Hangzhou', 'Nanjing', 'Chongqing'];
const paymentMethods: Donation['paymentMethod'][] = ['wechat', 'alipay', 'stripe', 'paypal'];
const orderStatuses: Order['status'][] = ['pending', 'paid', 'shipped', 'delivered', 'cancelled', 'refunded'];

// Mock Users
export const mockUsers: User[] = Array.from({ length: 48 }, (_, i) => ({
  id: `user-${String(i + 1).padStart(3, '0')}`,
  username: ['Zhang Ming', 'Li Hua', 'Wang Fang', 'Liu Yang', 'Chen Jing', 'Zhao Lei', 'Sun Li', 'Zhou Jie', 'Wu Min', 'Zheng Wei'][i % 10] + (i > 9 ? i : ''),
  email: `user${i + 1}@tonghua.org`,
  phone: `138${String(Math.floor(seeded(i * 101) * 100000000)).padStart(8, '0')}`,
  role: i === 0 ? 'admin' : (['editor', 'viewer', 'auditor'] as User['role'][])[i % 3],
  status: i < 40 ? 'active' : (['disabled', 'pending'] as User['status'][])[i % 2],
  createdAt: randomDate('2024-01-01', '2025-12-31', i * 7 + 1),
  lastLogin: randomDate('2025-01-01', '2026-03-19', i * 7 + 2),
}));

// Mock Artworks
export const mockArtworks: Artwork[] = Array.from({ length: 86 }, (_, i) => ({
  id: `art-${String(i + 1).padStart(3, '0')}`,
  title: [
    'Garden in Spring', 'My Hometown', 'Running Under the Rainbow', 'Happy Holidays', 'Starry Sky Dreams',
    'Green Earth', 'A Warm Home', 'Hands of Friendship', 'Ocean World', 'City of the Future',
    'Country Path', 'Beautiful Butterfly', 'Blue Sky and White Clouds', 'Harvest Season', 'Winter Snow Scene',
  ][i % 15],
  description: 'A beautiful world painted by children, full of imagination and hope for a better life.',
  childName: ['Xiao Ming', 'Xiao Hong', 'Xiao Hua', 'Xiao Li', 'Xiao Qiang', 'Xiao Fang', 'Xiao Jun', 'Xiao Yan'][i % 8],
  childAge: 5 + (i % 8),
  imageUrl: `/placeholder/artwork-${(i % 6) + 1}.jpg`,
  status: statuses[i % 4],
  category: categories[i % categories.length],
  campaignId: `camp-${(i % 5) + 1}`,
  votes: Math.floor(seeded(i * 31) * 500) + 10,
  createdAt: randomDate('2025-01-01', '2026-03-01', i * 7 + 3),
  reviewedAt: i % 4 !== 0 ? randomDate('2025-02-01', '2026-03-19', i * 7 + 4) : undefined,
  reviewedBy: i % 4 !== 0 ? 'Admin' : undefined,
}));

// Mock Campaigns
export const mockCampaigns: Campaign[] = [
  {
    id: 'camp-1', title: '2025 Spring Children\'s Art Exhibition', description: 'Collecting spring-themed artworks from children nationwide',
    startDate: '2025-03-01', endDate: '2025-05-31', status: 'ended',
    targetAmount: 500000, raisedAmount: 423000, participantCount: 1280,
    artworkCount: 2100, createdAt: '2025-01-15',
  },
  {
    id: 'camp-2', title: '2025 Summer Charity Art Exhibition', description: 'An environmental charity art exhibition themed "Green Earth"',
    startDate: '2025-06-01', endDate: '2025-08-31', status: 'ended',
    targetAmount: 800000, raisedAmount: 756000, participantCount: 2100,
    artworkCount: 3400, createdAt: '2025-04-20',
  },
  {
    id: 'camp-3', title: '2025 Autumn Children\'s Art Charity', description: 'Depicting warm family and friendship stories',
    startDate: '2025-09-01', endDate: '2025-11-30', status: 'ended',
    targetAmount: 600000, raisedAmount: 580000, participantCount: 1800,
    artworkCount: 2800, createdAt: '2025-07-10',
  },
  {
    id: 'camp-4', title: '2026 New Year Children\'s Art', description: 'New Year themed artwork collection, depicting New Year wishes',
    startDate: '2025-12-15', endDate: '2026-02-28', status: 'ended',
    targetAmount: 700000, raisedAmount: 680000, participantCount: 1500,
    artworkCount: 2400, createdAt: '2025-10-25',
  },
  {
    id: 'camp-5', title: '2026 Spring Children\'s Art Festival', description: 'A spring art exhibition themed "Colorful Dreams"',
    startDate: '2026-03-01', endDate: '2026-05-31', status: 'active',
    targetAmount: 900000, raisedAmount: 125000, participantCount: 450,
    artworkCount: 680, createdAt: '2026-01-10',
  },
  {
    id: 'camp-6', title: '2026 Summer Charity Program', description: 'Summer children\'s art education charity project',
    startDate: '2026-07-01', endDate: '2026-08-31', status: 'draft',
    targetAmount: 1000000, raisedAmount: 0, participantCount: 0,
    artworkCount: 0, createdAt: '2026-03-05',
  },
];

// Mock Donations
export const mockDonations: Donation[] = Array.from({ length: 120 }, (_, i) => ({
  id: `don-${String(i + 1).padStart(4, '0')}`,
  donorName: i % 5 === 0 ? 'Anonymous Donor' : ['Zhang San', 'Li Si', 'Wang Wu', 'Zhao Liu', 'Qian Qi', 'Sun Ba', 'Zhou Jiu', 'Wu Shi'][i % 8],
  donorEmail: `donor${i + 1}@example.com`,
  amount: [10, 20, 50, 100, 200, 500, 1000, 2000, 5000][i % 9],
  currency: paymentMethods[i % 4] === 'stripe' || paymentMethods[i % 4] === 'paypal' ? 'USD' : 'CNY',
  paymentMethod: paymentMethods[i % 4],
  status: i % 10 === 0 ? 'pending' : i % 15 === 0 ? 'failed' : 'completed',
  campaignId: `camp-${(i % 5) + 1}`,
  campaignTitle: ['2025 Spring Children\'s Art Exhibition', '2025 Summer Charity Art Exhibition', '2025 Autumn Children\'s Art Charity', '2026 New Year Children\'s Art', '2026 Spring Children\'s Art Festival'][i % 5],
  message: i % 3 === 0 ? 'Hope more people can see the children\'s artwork!' : undefined,
  isAnonymous: i % 5 === 0,
  transactionId: `TXN${20250000 + i}`,
  createdAt: randomDate('2025-01-01', '2026-03-19', i * 7 + 5),
}));

// Mock Orders
const productNames = ['Children\'s Art T-Shirt', 'Charity Canvas Bag', 'Art Postcard Set', 'Children\'s Art Book', 'Charity Pin Set', 'Art Apron', 'Crayon Gift Box', 'Frame Set'];

export const mockOrders: Order[] = Array.from({ length: 95 }, (_, i) => ({
  id: `ord-${String(i + 1).padStart(4, '0')}`,
  orderNo: `TH${20250000 + i + 1}`,
  userId: `user-${String((i % 30) + 1).padStart(3, '0')}`,
  userName: ['Zhang Ming', 'Li Hua', 'Wang Fang', 'Liu Yang', 'Chen Jing', 'Zhao Lei', 'Sun Li', 'Zhou Jie'][i % 8],
  items: [
    {
      productId: `prod-${(i % 8) + 1}`,
      productName: productNames[i % 8],
      quantity: (i % 3) + 1,
      price: [89, 59, 39, 49, 29, 69, 99, 129][i % 8],
    },
  ],
  totalAmount: [89, 59, 39, 49, 29, 69, 99, 129][i % 8] * ((i % 3) + 1),
  status: orderStatuses[i % orderStatuses.length],
  paymentMethod: ['wechat', 'alipay'][i % 2],
  shippingAddress: `${regions[i % regions.length]}, District ${(i % 5) + 1}, Road ${i + 1}`,
  trackingNo: i % 6 >= 2 && i % 6 <= 3 ? `SF${String(Math.floor(seeded(i * 53) * 10000000000)).padStart(10, '0')}` : undefined,
  createdAt: randomDate('2025-01-01', '2026-03-19', i * 7 + 6),
  paidAt: i % 6 !== 0 ? randomDate('2025-01-02', '2026-03-19', i * 7 + 7) : undefined,
  shippedAt: i % 6 >= 2 ? randomDate('2025-01-05', '2026-03-19', i * 7 + 8) : undefined,
}));

// Mock Child Participants
export const mockChildParticipants: ChildParticipant[] = Array.from({ length: 35 }, (_, i) => ({
  id: `child-${String(i + 1).padStart(3, '0')}`,
  childName: ['Chen Xiaochun', 'Lin Xiaoming', 'Huang Xiaohong', 'Yang Xiaohua', 'Zhu Xiaoli', 'He Xiaoqiang', 'Gao Xiaofang', 'Liang Xiaojun'][i % 8] + (i > 7 ? `${i}` : ''),
  age: 5 + (i % 8),
  guardianName: ['Chen Daming', 'Lin Dali', 'Huang Guoqing', 'Yang Xiuying', 'Zhu Jianhua', 'He Zhiyuan', 'Gao Minghui', 'Liang Yongqiang'][i % 8],
  guardianPhone: `138${String(Math.floor(seeded(i * 103) * 100000000)).padStart(8, '0')}`,
  guardianEmail: `guardian${i + 1}@example.com`,
  consentGiven: true,
  consentDate: randomDate('2024-06-01', '2025-12-31', i * 7 + 9),
  region: regions[i % regions.length],
  school: ['Sunshine Elementary', 'Hope Elementary', 'Yucai Elementary', 'Experimental Elementary', 'No.1 Elementary'][i % 5],
  artworkCount: Math.floor(seeded(i * 37) * 10) + 1,
  status: i < 30 ? 'active' : (['withdrawn', 'pending_review'] as ChildParticipant['status'][])[(i - 30) % 2],
  createdAt: randomDate('2024-06-01', '2025-12-31', i * 7 + 10),
  lastActivity: randomDate('2025-06-01', '2026-03-19', i * 7 + 11),
}));

// Mock Audit Logs
const auditActions = ['System Login', 'Review Artwork', 'Modify User Role', 'Export Data', 'Modify Settings', 'Create Campaign', 'Process Donation', 'Update Order Status', 'View Child Info', 'Delete Data'];
const auditResources = ['User', 'Artwork', 'Campaign', 'Donation', 'Order', 'System Settings', 'Child Participant', 'Report'];

export const mockAuditLogs: AuditLogEntry[] = Array.from({ length: 200 }, (_, i) => ({
  id: `log-${String(i + 1).padStart(4, '0')}`,
  userId: `user-${String((i % 10) + 1).padStart(3, '0')}`,
  userName: ['Zhang Ming', 'Li Hua', 'Wang Fang', 'Liu Yang', 'Chen Jing', 'Zhao Lei', 'Sun Li', 'Zhou Jie', 'Wu Min', 'Zheng Wei'][i % 10],
  action: auditActions[i % auditActions.length],
  resource: auditResources[i % auditResources.length],
  resourceId: `res-${(i % 50) + 1}`,
  details: `${auditActions[i % auditActions.length]} - ${auditResources[i % auditResources.length]} #${(i % 50) + 1}`,
  ipAddress: `192.168.1.${(i % 254) + 1}`,
  userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
  timestamp: randomDate('2025-06-01', '2026-03-19', i * 7 + 12),
}));

// Dashboard Metrics
export const mockDashboardMetrics: DashboardMetrics = {
  totalArtworks: 86,
  pendingArtworks: 22,
  totalDonations: 120,
  totalDonationAmount: 256400,
  totalOrders: 95,
  totalUsers: 48,
  activeCampaigns: 1,
  childParticipants: 35,
};

// Chart Data
export const mockDonationTrend: ChartDataPoint[] = [
  { name: '2025-01', value: 12000, wechat: 5000, alipay: 4000, stripe: 2000, paypal: 1000 },
  { name: '2025-02', value: 18000, wechat: 7000, alipay: 6000, stripe: 3000, paypal: 2000 },
  { name: '2025-03', value: 25000, wechat: 10000, alipay: 8000, stripe: 4000, paypal: 3000 },
  { name: '2025-04', value: 22000, wechat: 9000, alipay: 7000, stripe: 3500, paypal: 2500 },
  { name: '2025-05', value: 30000, wechat: 12000, alipay: 10000, stripe: 5000, paypal: 3000 },
  { name: '2025-06', value: 28000, wechat: 11000, alipay: 9000, stripe: 4500, paypal: 3500 },
  { name: '2025-07', value: 35000, wechat: 14000, alipay: 11000, stripe: 6000, paypal: 4000 },
  { name: '2025-08', value: 32000, wechat: 13000, alipay: 10000, stripe: 5500, paypal: 3500 },
  { name: '2025-09', value: 27000, wechat: 11000, alipay: 8000, stripe: 5000, paypal: 3000 },
  { name: '2025-10', value: 31000, wechat: 12000, alipay: 10000, stripe: 5500, paypal: 3500 },
  { name: '2025-11', value: 29000, wechat: 11500, alipay: 9500, stripe: 5000, paypal: 3000 },
  { name: '2025-12', value: 38000, wechat: 15000, alipay: 12000, stripe: 7000, paypal: 4000 },
  { name: '2026-01', value: 42000, wechat: 17000, alipay: 13000, stripe: 7500, paypal: 4500 },
  { name: '2026-02', value: 36000, wechat: 14000, alipay: 11000, stripe: 6500, paypal: 4500 },
  { name: '2026-03', value: 15000, wechat: 6000, alipay: 5000, stripe: 2500, paypal: 1500 },
];

export const mockArtworkByCategory: ChartDataPoint[] = [
  { name: 'Oil Painting', value: 18 },
  { name: 'Watercolor', value: 22 },
  { name: 'Sketch', value: 15 },
  { name: 'Crayon Drawing', value: 12 },
  { name: 'Collage', value: 10 },
  { name: 'Digital Art', value: 9 },
];

export const mockOrderTrend: ChartDataPoint[] = [
  { name: '2025-01', value: 8, revenue: 1200 },
  { name: '2025-02', value: 12, revenue: 1800 },
  { name: '2025-03', value: 15, revenue: 2250 },
  { name: '2025-04', value: 10, revenue: 1500 },
  { name: '2025-05', value: 18, revenue: 2700 },
  { name: '2025-06', value: 14, revenue: 2100 },
  { name: '2025-07', value: 20, revenue: 3000 },
  { name: '2025-08', value: 16, revenue: 2400 },
  { name: '2025-09', value: 22, revenue: 3300 },
  { name: '2025-10', value: 19, revenue: 2850 },
  { name: '2025-11', value: 25, revenue: 3750 },
  { name: '2025-12', value: 30, revenue: 4500 },
  { name: '2026-01', value: 28, revenue: 4200 },
  { name: '2026-02', value: 24, revenue: 3600 },
  { name: '2026-03', value: 10, revenue: 1500 },
];

export const mockUserGrowth: ChartDataPoint[] = [
  { name: '2025-01', value: 120 },
  { name: '2025-02', value: 185 },
  { name: '2025-03', value: 260 },
  { name: '2025-04', value: 340 },
  { name: '2025-05', value: 420 },
  { name: '2025-06', value: 530 },
  { name: '2025-07', value: 680 },
  { name: '2025-08', value: 820 },
  { name: '2025-09', value: 950 },
  { name: '2025-10', value: 1100 },
  { name: '2025-11', value: 1280 },
  { name: '2025-12', value: 1450 },
  { name: '2026-01', value: 1620 },
  { name: '2026-02', value: 1780 },
  { name: '2026-03', value: 1860 },
];

// Mock System Settings
export const mockSystemSettings: SystemSettings = {
  siteName: 'Tonghua Charity',
  siteDescription: 'Tonghua Charity x Sustainable Fashion',
  contactEmail: 'admin@tonghua.org',
  donationEnabled: true,
  shopEnabled: true,
  registrationEnabled: true,
  maintenanceMode: false,
  paymentMethods: {
    wechat: { enabled: true, appId: 'wx_mock_app_id', merchantId: 'M12345678' },
    alipay: { enabled: true, appId: '2021_mock_alipay' },
    stripe: { enabled: true, publicKey: 'pk_test_mock_key' },
    paypal: { enabled: false, clientId: '' },
  },
};
