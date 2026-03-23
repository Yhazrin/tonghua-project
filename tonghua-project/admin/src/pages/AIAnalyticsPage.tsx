import { useQuery } from '@tanstack/react-query';
import v1Api from '../services/v1Api';
import StatCard from '../components/ui/StatCard';
import LineChartCard from '../components/charts/LineChartCard';
import PieChartCard from '../components/charts/PieChartCard';
import BarChartCard from '../components/charts/BarChartCard';
import type { ChartDataPoint } from '../types';

export default function AIAnalyticsPage() {
  const { data: sustainabilitySummary } = useQuery({
    queryKey: ['sustainability-summary'],
    queryFn: async () => {
      const res = await v1Api.get('/ai/sustainability/summary');
      return res.data.data;
    },
  });

  const mockInteractionData: ChartDataPoint[] = [
    { name: '普通对话', value: 42 },
    { name: '商品推荐', value: 28 },
    { name: '售后帮助', value: 15 },
    { name: '可持续建议', value: 10 },
    { name: '捐献引导', value: 5 },
  ];

  const mockWeeklyAI: ChartDataPoint[] = [
    { name: '周一', value: 45, conversations: 45 },
    { name: '周二', value: 62, conversations: 62 },
    { name: '周三', value: 58, conversations: 58 },
    { name: '周四', value: 71, conversations: 71 },
    { name: '周五', value: 89, conversations: 89 },
    { name: '周六', value: 104, conversations: 104 },
    { name: '周日', value: 93, conversations: 93 },
  ];

  const mockSustainabilityTrend: ChartDataPoint[] = [
    { name: '1月', value: 85, carbon: 85, water: 1200, textile: 32 },
    { name: '2月', value: 120, carbon: 120, water: 1680, textile: 45 },
    { name: '3月', value: 180, carbon: 180, water: 2520, textile: 68 },
    { name: '4月', value: 210, carbon: 210, water: 2940, textile: 78 },
    { name: '5月', value: 250, carbon: 250, water: 3500, textile: 92 },
    { name: '6月', value: 405, carbon: 405, water: 5670, textile: 205 },
  ];

  const summary = sustainabilitySummary || {
    total_carbon_saved_kg: 1250.5,
    total_water_saved_liters: 1350000,
    total_textile_recycled_kg: 520.3,
    total_items: 4380,
    children_helped: 1200,
    artworks_created: 3560,
  };

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: 4 }}>AI 分析中心</h1>
        <p style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>AI助手使用数据与可持续性成果概览</p>
      </div>

      {/* Sustainability Stats */}
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 16, fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: 16 }}>可持续性成果</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
          {[
            { title: '减少碳排放', value: `${(summary.total_carbon_saved_kg / 1000).toFixed(1)}t`, subtitle: 'CO₂当量', color: 'success' as const },
            { title: '节约用水', value: `${(summary.total_water_saved_liters / 1000).toFixed(0)}kL`, subtitle: '升淡水', color: 'info' as const },
            { title: '纺织品回收', value: `${summary.total_textile_recycled_kg}kg`, subtitle: '衣物重量', color: 'accent' as const },
            { title: '惠及儿童', value: summary.children_helped?.toLocaleString() || '1,200', subtitle: '位孩子', color: 'warning' as const },
            { title: '艺术作品', value: summary.artworks_created?.toLocaleString() || '3,560', subtitle: '件创作', color: 'accent' as const },
            { title: '循环商品', value: summary.total_items?.toLocaleString() || '4,380', subtitle: '件单品', color: 'success' as const },
          ].map((stat) => (
            <StatCard
              key={stat.title}
              title={stat.title}
              value={stat.value}
              subtitle={stat.subtitle}
              color={stat.color}
              icon={
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                </svg>
              }
              trend={{ value: 10, isUp: true }}
            />
          ))}
        </div>
      </div>

      {/* AI Usage Charts */}
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 16, fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: 16 }}>AI 助手使用分析</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <PieChartCard
            title="对话类型分布"
            data={mockInteractionData}
          />
          <LineChartCard
            title="本周AI对话量"
            data={mockWeeklyAI}
            dataKeys={["conversations"]}
          />
        </div>
      </div>

      {/* Sustainability Trend */}
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 16, fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: 16 }}>可持续性指标趋势</h2>
        <BarChartCard
          title="月度环保成果（近6个月）"
          data={mockSustainabilityTrend}
          bars={[
            { dataKey: 'carbon', name: '减碳(kg)', color: '#6B8E6B' },
            { dataKey: 'textile', name: '纺织品回收(kg)', color: '#8B6B5A' },
          ]}
          xKey="name"
        />
      </div>

      {/* AI Response Quality */}
      <div>
        <h2 style={{ fontSize: 16, fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: 16 }}>AI 响应质量</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 16 }}>
          {[
            { title: '有用反馈率', value: '87.3%', subtitle: '用户满意度' },
            { title: '平均响应时间', value: '1.2s', subtitle: 'AI响应延迟' },
            { title: '本月对话总量', value: '2,847', subtitle: '次交互' },
            { title: '商品推荐转化', value: '23.6%', subtitle: '点击率' },
          ].map((stat) => (
            <StatCard
              key={stat.title}
              title={stat.title}
              value={stat.value}
              subtitle={stat.subtitle}
              icon={
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5z" />
                </svg>
              }
            />
          ))}
        </div>
      </div>
    </div>
  );
}
