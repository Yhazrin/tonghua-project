import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import PageWrapper from '@/components/layout/PageWrapper';
import SectionContainer from '@/components/layout/SectionContainer';
import PaperTextureBackground from '@/components/editorial/PaperTextureBackground';
import GrainOverlay from '@/components/editorial/GrainOverlay';
import NumberedSectionHeading from '@/components/editorial/NumberedSectionHeading';
import { MagazineDivider } from '@/components/editorial/MagazineDivider';
import { ordersApi } from '@/services/orders';
import { getOrderLogistics, logisticsStatusMap } from '@/services/logistics';
import { createReview } from '@/services/reviews';
import { createAfterSales } from '@/services/afterSales';
import type { CreateReviewData } from '@/services/reviews';
import type { CreateAfterSalesData } from '@/services/afterSales';

// API response type for order (snake_case from backend)
interface OrderAPIResponse {
  id: number;
  order_no?: string;
  total_amount?: number | string;
  totalAmount?: number | string;
  status: string;
  shipping_address?: string;
  payment_method?: string;
  paid_at?: string;
  shipped_at?: string;
  created_at?: string;
  createdAt?: string;
  items?: Array<{ id: number; product_id: number; quantity: number; price: number | string }>;
}

const ORDER_STATUS_LABELS: Record<string, string> = {
  pending: '待支付',
  paid: '已支付',
  processing: '备货中',
  shipped: '已发货',
  delivered: '已到达',
  completed: '已完成',
  cancelled: '已取消',
  refunding: '退款中',
  refunded: '已退款',
};

const ORDER_STATUS_STEPS = ['pending', 'paid', 'processing', 'shipped', 'delivered', 'completed'];

const AFTER_SALES_TYPES = [
  { value: 'return', label: '退货退款' },
  { value: 'exchange', label: '换货' },
  { value: 'repair', label: '维修' },
  { value: 'complaint', label: '投诉' },
  { value: 'inquiry', label: '咨询' },
];

export default function OrderDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'detail' | 'logistics' | 'review' | 'aftersales'>('detail');
  const [reviewForm, setReviewForm] = useState({ product_id: 0, rating: 5, title: '', content: '', sustainability_rating: 5, is_anonymous: false });
  const [reviewSubmitted, setReviewSubmitted] = useState(false);
  const [afterSalesForm, setAfterSalesForm] = useState({ request_type: 'return' as const, reason: '', description: '' });
  const [afterSalesSubmitted, setAfterSalesSubmitted] = useState(false);

  const { data: order, isLoading, isError } = useQuery<OrderAPIResponse>({
    queryKey: ['order', id],
    queryFn: () => ordersApi.getById(id!) as unknown as Promise<OrderAPIResponse>,
    enabled: !!id,
  });

  const { data: logistics, isLoading: loadingLogistics, isError: noLogistics } = useQuery({
    queryKey: ['logistics', id],
    queryFn: () => getOrderLogistics(parseInt(id!)),
    enabled: !!id && activeTab === 'logistics',
  });

  const reviewMutation = useMutation({
    mutationFn: (data: CreateReviewData) => createReview(data),
    onSuccess: () => {
      setReviewSubmitted(true);
      queryClient.invalidateQueries({ queryKey: ['order', id] });
    },
  });

  const afterSalesMutation = useMutation({
    mutationFn: (data: CreateAfterSalesData) => createAfterSales(data),
    onSuccess: () => {
      setAfterSalesSubmitted(true);
    },
  });

  const cancelMutation = useMutation({
    mutationFn: () => ordersApi.cancel(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['order', id] });
    },
  });

  if (isLoading) {
    return (
      <PageWrapper>
        <PaperTextureBackground variant="paper" className="min-h-[60vh] flex items-center justify-center relative">
          <GrainOverlay />
          <p className="font-body text-body-sm text-ink-faded">加载中…</p>
        </PaperTextureBackground>
      </PageWrapper>
    );
  }

  if (isError || !order) {
    return (
      <PageWrapper>
        <PaperTextureBackground variant="paper" className="min-h-[60vh] flex items-center justify-center relative">
          <GrainOverlay />
          <div className="text-center">
            <p className="font-body text-body-sm text-ink-faded mb-4">订单不存在或无权访问</p>
            <button onClick={() => navigate('/profile')} className="cursor-pointer font-body text-overline tracking-widest uppercase text-rust hover:text-ink transition-colors">
              返回我的订单 →
            </button>
          </div>
        </PaperTextureBackground>
      </PageWrapper>
    );
  }

  const currentStepIndex = ORDER_STATUS_STEPS.indexOf(order.status);
  const orderStatus = order.status || '';
  const canReview = (orderStatus === 'delivered' || orderStatus === 'completed') && !reviewSubmitted;
  const canAfterSales = ['delivered', 'completed', 'shipped'].includes(orderStatus) && !afterSalesSubmitted;
  const canCancel = orderStatus === 'pending';

  const TABS: Array<{ key: string; label: string; disabled?: boolean }> = [
    { key: 'detail', label: '订单详情' },
    { key: 'logistics', label: '物流追踪' },
    { key: 'review', label: '评价商品', disabled: !canReview },
    { key: 'aftersales', label: '申请售后', disabled: !canAfterSales },
  ];

  return (
    <PageWrapper>
      <PaperTextureBackground variant="paper" className="py-16 md:py-24 relative">
        <GrainOverlay />
        <SectionContainer>
          <div className="flex items-center gap-4 mb-8">
            <button
              onClick={() => navigate('/profile')}
              className="cursor-pointer font-body text-overline tracking-[0.15em] uppercase text-sepia-mid hover:text-ink transition-colors"
              aria-label="返回我的订单"
            >
              ← 我的订单
            </button>
            <span className="text-warm-gray/30" aria-hidden="true">|</span>
            <span className="font-body text-overline text-ink-faded">订单 #{order.order_no || order.id}</span>
          </div>

          <NumberedSectionHeading number="09" title="订单详情" />

          {/* Status Progress */}
          {!['cancelled', 'refunding', 'refunded'].includes(orderStatus) && (
            <div className="mb-12 overflow-x-auto">
              <div className="flex items-center gap-0 min-w-max">
                {ORDER_STATUS_STEPS.map((stepKey, i) => {
                  const isCompleted = i < currentStepIndex;
                  const isCurrent = i === currentStepIndex;
                  return (
                    <div key={stepKey} className="flex items-center">
                      <div className="flex flex-col items-center">
                        <div className={`w-8 h-8 border-2 flex items-center justify-center transition-colors ${
                          isCompleted ? 'bg-ink border-ink text-paper' :
                          isCurrent ? 'border-rust text-rust' :
                          'border-warm-gray/30 text-ink-faded'
                        }`}>
                          {isCompleted ? (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          ) : (
                            <span className="font-body text-xs">{i + 1}</span>
                          )}
                        </div>
                        <span className={`font-body text-caption mt-1 whitespace-nowrap ${isCurrent ? 'text-rust' : isCompleted ? 'text-ink' : 'text-ink-faded'}`}>
                          {ORDER_STATUS_LABELS[stepKey]}
                        </span>
                      </div>
                      {i < ORDER_STATUS_STEPS.length - 1 && (
                        <div className={`w-16 h-px mx-1 ${i < currentStepIndex ? 'bg-ink' : 'bg-warm-gray/30'}`} aria-hidden="true" />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Tabs */}
          <div className="flex gap-6 mb-8 border-b border-warm-gray/20" role="tablist">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                role="tab"
                aria-selected={activeTab === tab.key}
                disabled={tab.disabled}
                onClick={() => !tab.disabled && setActiveTab(tab.key as 'detail' | 'logistics' | 'review' | 'aftersales')}
                className={`cursor-pointer pb-3 font-body text-body-sm tracking-[0.1em] uppercase transition-colors ${
                  activeTab === tab.key
                    ? 'text-ink border-b-2 border-ink'
                    : tab.disabled
                    ? 'text-ink-faded/40 cursor-not-allowed'
                    : 'text-sepia-mid hover:text-ink'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {/* ── 订单详情 ── */}
            {activeTab === 'detail' && (
              <motion.div
                key="detail"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="border border-warm-gray/20 p-6 bg-paper/50 space-y-3">
                    <h3 className="font-body text-overline tracking-[0.15em] uppercase text-sepia-mid">订单信息</h3>
                    <div className="space-y-2">
                      {[
                        { label: '订单编号', value: order.order_no || String(order.id) },
                        { label: '订单状态', value: ORDER_STATUS_LABELS[orderStatus] ?? orderStatus },
                        { label: '支付方式', value: order.payment_method ?? '未选择' },
                        { label: '下单时间', value: new Date(order.created_at || order.createdAt || '').toLocaleString('zh-CN') },
                      ].map((item) => (
                        <div key={item.label} className="flex justify-between">
                          <span className="font-body text-caption text-ink-faded">{item.label}</span>
                          <span className="font-body text-caption text-ink">{item.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="border border-warm-gray/20 p-6 bg-paper/50 space-y-3">
                    <h3 className="font-body text-overline tracking-[0.15em] uppercase text-sepia-mid">收货信息</h3>
                    <p className="font-body text-body-sm text-ink">
                      {order.shipping_address ?? '暂无地址信息'}
                    </p>
                  </div>
                </div>

                {/* Items */}
                <div className="border border-warm-gray/20 bg-paper/50">
                  <h3 className="font-body text-overline tracking-[0.15em] uppercase text-sepia-mid px-6 py-4 border-b border-warm-gray/20">
                    商品明细
                  </h3>
                  <div className="divide-y divide-warm-gray/10">
                    {((order.items as Array<{ id: number; product_id: number; quantity: number; price: number }>) || []).map((item) => (
                      <div key={item.id} className="flex items-center justify-between px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-warm-gray/15 flex items-center justify-center border border-warm-gray/20">
                            <span className="font-body text-overline text-sepia-mid">#{item.product_id}</span>
                          </div>
                          <div>
                            <Link
                              to={`/shop/${item.product_id}`}
                              className="font-body text-body-sm text-ink hover:text-rust transition-colors"
                            >
                              商品 #{item.product_id}
                            </Link>
                            <p className="font-body text-caption text-ink-faded">× {item.quantity}</p>
                          </div>
                        </div>
                        <span className="font-display text-base text-ink">
                          ¥{(Number(item.price) * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between items-center px-6 py-4 border-t border-warm-gray/20">
                    <span className="font-body text-body-sm tracking-[0.1em] uppercase text-sepia-mid">合计</span>
                    <span className="font-display text-xl text-ink">
                      ¥{Number(order.total_amount || order.totalAmount).toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-4 flex-wrap">
                  {canCancel && (
                    <button
                      onClick={() => cancelMutation.mutate()}
                      disabled={cancelMutation.isPending}
                      className="cursor-pointer font-body text-body-sm tracking-[0.1em] uppercase border border-rust/40 text-rust px-6 py-3 hover:bg-rust/5 disabled:opacity-50 transition-colors"
                    >
                      {cancelMutation.isPending ? '取消中…' : '取消订单'}
                    </button>
                  )}
                  {canReview && (
                    <button
                      onClick={() => setActiveTab('review')}
                      className="cursor-pointer font-body text-body-sm tracking-[0.1em] uppercase bg-ink text-paper px-6 py-3 hover:bg-rust transition-colors"
                    >
                      评价商品
                    </button>
                  )}
                  {canAfterSales && (
                    <button
                      onClick={() => setActiveTab('aftersales')}
                      className="cursor-pointer font-body text-body-sm tracking-[0.1em] uppercase border border-warm-gray/40 text-ink px-6 py-3 hover:bg-warm-gray/10 transition-colors"
                    >
                      申请售后
                    </button>
                  )}
                </div>
              </motion.div>
            )}

            {/* ── 物流追踪 ── */}
            {activeTab === 'logistics' && (
              <motion.div
                key="logistics"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                {loadingLogistics ? (
                  <p className="font-body text-body-sm text-ink-faded">加载物流信息…</p>
                ) : noLogistics || !logistics ? (
                  <div className="border border-warm-gray/20 p-8 text-center bg-paper/50">
                    <p className="font-body text-body-sm text-ink-faded mb-2">暂无物流信息</p>
                    <p className="font-body text-caption text-ink-faded">订单发货后将自动显示物流追踪</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Logistics Summary */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {[
                        { label: '快递公司', value: logistics.carrier ?? '暂无' },
                        { label: '运单号', value: logistics.tracking_no ?? '暂无' },
                        { label: '当前状态', value: logisticsStatusMap[logistics.status] ?? logistics.status },
                      ].map((item) => (
                        <div key={item.label} className="border border-warm-gray/20 p-4 bg-paper/50">
                          <p className="font-body text-overline tracking-[0.1em] uppercase text-sepia-mid mb-1">{item.label}</p>
                          <p className="font-body text-body-sm text-ink">{item.value}</p>
                        </div>
                      ))}
                    </div>

                    {/* Timeline */}
                    {logistics.events && logistics.events.length > 0 && (
                      <div>
                        <h3 className="font-body text-overline tracking-[0.15em] uppercase text-sepia-mid mb-4">
                          物流轨迹
                        </h3>
                        <div className="relative pl-4">
                          <div className="absolute left-1.5 top-2 bottom-2 w-px bg-warm-gray/30" aria-hidden="true" />
                          <div className="space-y-6">
                            {logistics.events.map((event, i) => (
                              <motion.div
                                key={event.id}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.05 }}
                                className="relative pl-6"
                              >
                                <div className={`absolute left-0 top-1 w-3 h-3 border-2 rounded-full ${
                                  i === 0 ? 'bg-ink border-ink' : 'bg-paper border-warm-gray/40'
                                }`} aria-hidden="true" />
                                <div className={i === 0 ? 'text-ink' : 'text-ink-faded'}>
                                  <p className="font-body text-body-sm">{event.description}</p>
                                  {event.location && (
                                    <p className="font-body text-caption mt-0.5">{event.location}</p>
                                  )}
                                  <p className="font-body text-caption text-ink-faded/70 mt-0.5">
                                    {new Date(event.event_time).toLocaleString('zh-CN')}
                                  </p>
                                </div>
                              </motion.div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {logistics.estimated_delivery && (
                      <p className="font-body text-caption text-sepia-mid">
                        预计送达：{new Date(logistics.estimated_delivery).toLocaleDateString('zh-CN', { month: 'long', day: 'numeric' })}
                      </p>
                    )}
                  </div>
                )}
              </motion.div>
            )}

            {/* ── 评价商品 ── */}
            {activeTab === 'review' && (
              <motion.div
                key="review"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                {reviewSubmitted ? (
                  <div className="text-center py-12">
                    <div className="w-12 h-12 bg-ink/5 border-2 border-ink/20 flex items-center justify-center mx-auto mb-4">
                      <svg className="w-6 h-6 text-ink" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <p className="font-display text-xl text-ink mb-2">感谢您的评价！</p>
                    <p className="font-body text-body-sm text-ink-faded">您的评价将帮助其他用户做出更好的选择</p>
                  </div>
                ) : (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      const items = order.items as Array<{ product_id: number }> | undefined;
                      const firstProductId = items?.[0]?.product_id ?? 0;
                      reviewMutation.mutate({
                        product_id: reviewForm.product_id || firstProductId,
                        order_id: parseInt(id!),
                        rating: reviewForm.rating,
                        title: reviewForm.title,
                        content: reviewForm.content,
                        sustainability_rating: reviewForm.sustainability_rating,
                        is_anonymous: reviewForm.is_anonymous,
                      });
                    }}
                    className="max-w-lg space-y-6"
                  >
                    {/* Product Selection */}
                    {(order.items as unknown[])?.length > 1 && (
                      <div>
                        <label className="font-body text-overline tracking-[0.15em] uppercase text-sepia-mid block mb-2">
                          选择评价商品
                        </label>
                        <select
                          value={reviewForm.product_id}
                          onChange={(e) => setReviewForm((p) => ({ ...p, product_id: parseInt(e.target.value) }))}
                          className="w-full bg-transparent border border-warm-gray/30 px-4 py-3 font-body text-body-sm text-ink focus:outline-none focus:border-ink/60"
                        >
                          {(order.items as Array<{ product_id: number }>).map((item) => (
                            <option key={item.product_id} value={item.product_id}>
                              商品 #{item.product_id}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    {/* Rating */}
                    <div>
                      <label className="font-body text-overline tracking-[0.15em] uppercase text-sepia-mid block mb-2">
                        商品评分
                      </label>
                      <div className="flex gap-2" role="group" aria-label="评分">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setReviewForm((p) => ({ ...p, rating: star }))}
                            className={`cursor-pointer text-2xl transition-transform hover:scale-110 ${star <= reviewForm.rating ? 'text-rust' : 'text-warm-gray/40'}`}
                            aria-label={`${star}星`}
                          >
                            ★
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Sustainability Rating */}
                    <div>
                      <label className="font-body text-overline tracking-[0.15em] uppercase text-sepia-mid block mb-2">
                        可持续性评分
                      </label>
                      <div className="flex gap-2" role="group" aria-label="可持续性评分">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setReviewForm((p) => ({ ...p, sustainability_rating: star }))}
                            className={`cursor-pointer text-2xl transition-transform hover:scale-110 ${star <= reviewForm.sustainability_rating ? 'text-archive-brown' : 'text-warm-gray/40'}`}
                            aria-label={`可持续性${star}星`}
                          >
                            ✦
                          </button>
                        ))}
                      </div>
                      <p className="font-body text-caption text-ink-faded mt-1">
                        评价此商品的环保可持续性
                      </p>
                    </div>

                    {/* Title */}
                    <div>
                      <label htmlFor="review-title" className="font-body text-overline tracking-[0.15em] uppercase text-sepia-mid block mb-2">
                        评价标题（可选）
                      </label>
                      <input
                        id="review-title"
                        type="text"
                        value={reviewForm.title}
                        onChange={(e) => setReviewForm((p) => ({ ...p, title: e.target.value }))}
                        placeholder="用一句话概括您的体验"
                        className="w-full bg-transparent border border-warm-gray/30 px-4 py-3 font-body text-body-sm text-ink placeholder-ink-faded/60 focus:outline-none focus:border-ink/60"
                      />
                    </div>

                    {/* Content */}
                    <div>
                      <label htmlFor="review-content" className="font-body text-overline tracking-[0.15em] uppercase text-sepia-mid block mb-2">
                        详细评价（可选）
                      </label>
                      <textarea
                        id="review-content"
                        value={reviewForm.content}
                        onChange={(e) => setReviewForm((p) => ({ ...p, content: e.target.value }))}
                        placeholder="分享您对商品质量、包装、环保理念等方面的感受"
                        rows={4}
                        className="w-full bg-transparent border border-warm-gray/30 px-4 py-3 font-body text-body-sm text-ink placeholder-ink-faded/60 focus:outline-none focus:border-ink/60 resize-none"
                      />
                    </div>

                    {/* Anonymous */}
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={reviewForm.is_anonymous}
                        onChange={(e) => setReviewForm((p) => ({ ...p, is_anonymous: e.target.checked }))}
                        className="w-4 h-4 border border-warm-gray/40 text-ink focus:ring-0"
                      />
                      <span className="font-body text-body-sm text-ink-faded">匿名发布</span>
                    </label>

                    {reviewMutation.isError && (
                      <p className="font-body text-sm text-rust">提交失败，请稍后重试</p>
                    )}

                    <button
                      type="submit"
                      disabled={reviewMutation.isPending}
                      className="cursor-pointer w-full font-body text-body-sm tracking-[0.2em] uppercase bg-ink text-paper py-4 hover:bg-rust disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                    >
                      {reviewMutation.isPending ? '提交中…' : '提交评价'}
                    </button>
                  </form>
                )}
              </motion.div>
            )}

            {/* ── 申请售后 ── */}
            {activeTab === 'aftersales' && (
              <motion.div
                key="aftersales"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                {afterSalesSubmitted ? (
                  <div className="text-center py-12">
                    <div className="w-12 h-12 bg-ink/5 border-2 border-ink/20 flex items-center justify-center mx-auto mb-4">
                      <svg className="w-6 h-6 text-ink" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <p className="font-display text-xl text-ink mb-2">售后申请已提交</p>
                    <p className="font-body text-body-sm text-ink-faded mb-6">客服将在1-2个工作日内处理您的申请</p>
                    <button
                      onClick={() => navigate('/profile?tab=aftersales')}
                      className="cursor-pointer font-body text-overline tracking-widest uppercase text-rust hover:text-ink transition-colors"
                    >
                      查看售后进度 →
                    </button>
                  </div>
                ) : (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      afterSalesMutation.mutate({
                        order_id: parseInt(id!),
                        request_type: afterSalesForm.request_type,
                        reason: afterSalesForm.reason,
                        description: afterSalesForm.description,
                      });
                    }}
                    className="max-w-lg space-y-6"
                  >
                    {/* Type */}
                    <div>
                      <label className="font-body text-overline tracking-[0.15em] uppercase text-sepia-mid block mb-2">
                        售后类型 <span className="text-rust" aria-hidden="true">*</span>
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {AFTER_SALES_TYPES.map((type) => (
                          <button
                            key={type.value}
                            type="button"
                            onClick={() => setAfterSalesForm((p) => ({ ...p, request_type: type.value as 'return' }))}
                            className={`cursor-pointer px-4 py-2.5 font-body text-sm border transition-colors ${
                              afterSalesForm.request_type === type.value
                                ? 'bg-ink text-paper border-ink'
                                : 'bg-transparent text-ink border-warm-gray/30 hover:border-ink/40'
                            }`}
                          >
                            {type.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Reason */}
                    <div>
                      <label htmlFor="as-reason" className="font-body text-overline tracking-[0.15em] uppercase text-sepia-mid block mb-2">
                        申请原因 <span className="text-rust" aria-hidden="true">*</span>
                      </label>
                      <input
                        id="as-reason"
                        type="text"
                        required
                        value={afterSalesForm.reason}
                        onChange={(e) => setAfterSalesForm((p) => ({ ...p, reason: e.target.value }))}
                        placeholder="简要描述申请原因"
                        className="w-full bg-transparent border border-warm-gray/30 px-4 py-3 font-body text-body-sm text-ink placeholder-ink-faded/60 focus:outline-none focus:border-ink/60"
                      />
                    </div>

                    {/* Description */}
                    <div>
                      <label htmlFor="as-description" className="font-body text-overline tracking-[0.15em] uppercase text-sepia-mid block mb-2">
                        详细说明（可选）
                      </label>
                      <textarea
                        id="as-description"
                        value={afterSalesForm.description}
                        onChange={(e) => setAfterSalesForm((p) => ({ ...p, description: e.target.value }))}
                        placeholder="请尽量详细描述问题，有助于快速处理"
                        rows={4}
                        className="w-full bg-transparent border border-warm-gray/30 px-4 py-3 font-body text-body-sm text-ink placeholder-ink-faded/60 focus:outline-none focus:border-ink/60 resize-none"
                      />
                    </div>

                    {afterSalesMutation.isError && (
                      <p className="font-body text-sm text-rust">
                        {afterSalesMutation.error instanceof Error
                          ? afterSalesMutation.error.message
                          : '提交失败，请稍后重试'}
                      </p>
                    )}

                    <button
                      type="submit"
                      disabled={afterSalesMutation.isPending || !afterSalesForm.reason}
                      className="cursor-pointer w-full font-body text-body-sm tracking-[0.2em] uppercase bg-ink text-paper py-4 hover:bg-rust disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                    >
                      {afterSalesMutation.isPending ? '提交中…' : '提交售后申请'}
                    </button>
                  </form>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </SectionContainer>
      </PaperTextureBackground>

      <MagazineDivider />
    </PageWrapper>
  );
}
