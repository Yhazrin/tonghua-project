import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import PageWrapper from '@/components/layout/PageWrapper';
import SectionContainer from '@/components/layout/SectionContainer';
import NumberedSectionHeading from '@/components/editorial/NumberedSectionHeading';
import PaperTextureBackground from '@/components/editorial/PaperTextureBackground';
import GrainOverlay from '@/components/editorial/GrainOverlay';
import SectionGrainOverlay from '@/components/editorial/SectionGrainOverlay';
import { MagazineDivider } from '@/components/editorial/MagazineDivider';
import { EditorialCard } from '@/components/editorial/EditorialCard';
import { useAuthStore } from '@/stores/authStore';
import { ordersApi } from '@/services/orders';
import { donationsApi } from '@/services/donations';
import { getMyClothingDonations, clothingDonationStatusMap } from '@/services/aiAssistant';
import { getMyAfterSales, afterSalesStatusMap, afterSalesTypeMap } from '@/services/afterSales';

const STATUS_COLORS: Record<string, string> = {
  pending: 'text-sepia-mid',
  paid: 'text-archive-brown',
  shipped: 'text-archive-brown',
  delivered: 'text-archive-brown',
  cancelled: 'text-rust',
  completed: 'text-archive-brown',
  failed: 'text-rust',
  refunded: 'text-sepia-mid',
  processing: 'text-archive-brown',
};

type TabKey = 'orders' | 'donations' | 'clothing' | 'aftersales';

const TABS: Array<{ key: TabKey; label: string; numLabel: string }> = [
  { key: 'orders', label: '我的订单', numLabel: '01' },
  { key: 'donations', label: '捐款记录', numLabel: '02' },
  { key: 'clothing', label: '衣物捐献', numLabel: '03' },
  { key: 'aftersales', label: '售后申请', numLabel: '04' },
];

export default function Profile() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const prefersReducedMotion = useReducedMotion();
  const { user, isAuthenticated, logout } = useAuthStore();
  const [activeTab, setActiveTab] = useState<TabKey>('orders');

  const { data: orders = [], isLoading: loadingOrders } = useQuery({
    queryKey: ['my-orders'],
    queryFn: () => ordersApi.getMyOrders(),
    enabled: isAuthenticated,
  });

  const { data: donations = [], isLoading: loadingDonations } = useQuery({
    queryKey: ['my-donations'],
    queryFn: () => donationsApi.getMyDonations(),
    enabled: isAuthenticated,
  });

  const { data: clothingDonations, isLoading: loadingClothing } = useQuery({
    queryKey: ['my-clothing-donations'],
    queryFn: () => getMyClothingDonations(),
    enabled: isAuthenticated,
  });

  const { data: afterSalesData, isLoading: loadingAfterSales } = useQuery({
    queryKey: ['my-after-sales'],
    queryFn: () => getMyAfterSales(),
    enabled: isAuthenticated,
  });

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (!isAuthenticated || !user) {
    return (
      <PageWrapper>
        <PaperTextureBackground variant="paper" className="min-h-[100dvh] flex items-center justify-center relative">
          <GrainOverlay />
          <div className="absolute left-6 top-1/4 bottom-1/4 w-px bg-rust/15 hidden md:block" aria-hidden="true" />
          <div className="text-center relative">
            <motion.span
              initial={prefersReducedMotion ? false : { opacity: 0 }}
              animate={prefersReducedMotion ? undefined : { opacity: 1 }}
              transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.8, delay: 0.1 }}
              className="font-body text-overline tracking-[0.3em] uppercase text-sepia-mid block mb-6"
            >
              Vol. IX · No. 11
            </motion.span>
            <motion.p
              initial={prefersReducedMotion ? false : { opacity: 0, y: 10 }}
              animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
              transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.6, ease: [0, 0, 0.2, 1] }}
              className="font-body text-body-sm text-ink-faded mb-6"
            >
              {t('profile.notLoggedIn')}
            </motion.p>
            <motion.div
              {...(prefersReducedMotion ? {} : { initial: { scaleX: 0 }, animate: { scaleX: 1 }, transition: { duration: 0.8, delay: 0.3 } })}
              className="h-px w-[60px] bg-rust/40 mx-auto mb-8 origin-center"
            />
            <motion.button
              initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
              animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
              transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.6, ease: [0, 0, 0.2, 1], delay: 0.2 }}
              whileHover={prefersReducedMotion ? undefined : { scale: 1.01 }}
              whileTap={prefersReducedMotion ? undefined : { scale: 0.99 }}
              onClick={() => navigate('/login')}
              className="cursor-pointer font-body text-body-sm tracking-[0.15em] uppercase bg-ink text-paper px-10 py-4 hover:bg-rust transition-colors duration-300"
            >
              {t('nav.login')}
            </motion.button>
          </div>
        </PaperTextureBackground>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <h1 className="sr-only">{t('profile.title')}</h1>

      {/* Profile Header */}
      <PaperTextureBackground variant="paper" className="py-16 md:py-24 relative">
        <GrainOverlay />
        <SectionContainer>
          <NumberedSectionHeading number="10" title={t('profile.title')} />

          <motion.div
            initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
            animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
            transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.6, ease: [0, 0, 0.2, 1], delay: 0.2 }}
            className="relative bg-paper border border-warm-gray/30 p-8"
          >
            <div className="absolute top-0 left-0 w-5 h-5 border-t-2 border-l-2 border-rust/30 pointer-events-none" aria-hidden="true" />
            <div className="absolute bottom-0 right-0 w-5 h-5 border-b-2 border-r-2 border-rust/30 pointer-events-none" aria-hidden="true" />

            <div className="space-y-6">
              <div className="flex items-center gap-6 pb-6 border-b border-warm-gray/20">
                <motion.div
                  whileHover={prefersReducedMotion ? undefined : { scale: 1.03 }}
                  className="w-20 h-20 bg-warm-gray/20 flex items-center justify-center border-2 border-rust/20 relative cursor-default"
                >
                  <SectionGrainOverlay />
                  <div className="absolute top-1.5 left-1.5 w-3 h-3 border-t border-l border-rust/30 pointer-events-none" aria-hidden="true" />
                  <div className="absolute top-1.5 right-1.5 w-3 h-3 border-t border-r border-rust/30 pointer-events-none" aria-hidden="true" />
                  <div className="absolute bottom-1.5 left-1.5 w-3 h-3 border-b border-l border-rust/30 pointer-events-none" aria-hidden="true" />
                  <div className="absolute bottom-1.5 right-1.5 w-3 h-3 border-b border-r border-rust/30 pointer-events-none" aria-hidden="true" />
                  <span className="font-display text-2xl text-ink relative z-10">
                    {user.nickname ? user.nickname.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
                  </span>
                </motion.div>
                <div>
                  <h2 className="font-display text-xl text-ink">{user.nickname || user.email}</h2>
                  <p className="font-body text-body-sm text-ink-faded">{user.email}</p>
                  <span className="inline-block mt-2 font-body text-overline tracking-[0.1em] uppercase text-sepia-mid bg-warm-gray/20 px-2 py-1">
                    {user.role}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: '我的订单', count: (orders as unknown[]).length, tab: 'orders' as TabKey },
                  { label: '捐款记录', count: (donations as unknown[]).length, tab: 'donations' as TabKey },
                  { label: '衣物捐献', count: clothingDonations?.data?.length ?? 0, tab: 'clothing' as TabKey },
                  { label: '售后申请', count: afterSalesData?.data?.length ?? 0, tab: 'aftersales' as TabKey },
                ].map((stat) => (
                  <button
                    key={stat.label}
                    onClick={() => setActiveTab(stat.tab)}
                    className="cursor-pointer text-center border border-warm-gray/20 p-4 hover:border-ink/30 transition-colors"
                  >
                    <div className="font-display text-3xl text-ink mb-1">{stat.count}</div>
                    <div className="font-body text-caption text-sepia-mid">{stat.label}</div>
                  </button>
                ))}
              </div>

              <div className="flex gap-4 pt-2">
                <button
                  onClick={() => navigate('/clothing-donation')}
                  className="cursor-pointer flex-1 font-body text-body-sm tracking-[0.1em] uppercase bg-ink text-paper px-6 py-3 hover:bg-rust transition-colors"
                >
                  捐献衣物
                </button>
                <motion.button
                  whileHover={prefersReducedMotion ? undefined : { scale: 1.01 }}
                  whileTap={prefersReducedMotion ? undefined : { scale: 0.99 }}
                  onClick={handleLogout}
                  className="cursor-pointer font-body text-body-sm tracking-[0.1em] uppercase border border-warm-gray/40 text-ink px-6 py-3 hover:bg-warm-gray/10 transition-colors"
                >
                  {t('nav.logout')}
                </motion.button>
              </div>
            </div>
          </motion.div>
        </SectionContainer>
      </PaperTextureBackground>

      <MagazineDivider variant="decorative" />

      {/* Tabs Content */}
      <PaperTextureBackground variant="aged" className="py-16 md:py-24 relative">
        <GrainOverlay />
        <SectionContainer>
          {/* Tab List */}
          <div
            className="flex flex-wrap gap-6 mb-12 border-b border-warm-gray/30"
            role="tablist"
          >
            {TABS.map((tab) => (
              <button
                key={tab.key}
                role="tab"
                aria-selected={activeTab === tab.key}
                aria-controls={`panel-${tab.key}`}
                onClick={() => setActiveTab(tab.key)}
                className={`cursor-pointer pb-4 font-body text-body-sm tracking-[0.15em] uppercase transition-colors whitespace-nowrap ${
                  activeTab === tab.key
                    ? 'text-ink border-b-2 border-ink'
                    : 'text-sepia-mid hover:text-ink'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {/* ── 我的订单 ── */}
            {activeTab === 'orders' && (
              <motion.div
                key="orders"
                role="tabpanel"
                id="panel-orders"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <NumberedSectionHeading number="01" title="订单历史" />
                {loadingOrders ? (
                  <p className="font-body text-body-sm text-ink-faded">加载中…</p>
                ) : (orders as unknown[]).length === 0 ? (
                  <div className="text-center py-12">
                    <p className="font-body text-body-sm text-ink-faded mb-4">暂无订单</p>
                    <Link to="/shop" className="font-body text-overline tracking-[0.15em] uppercase text-rust hover:text-ink transition-colors">
                      去逛逛 →
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {(orders as unknown as Array<Record<string, unknown>>).map((order, index) => (
                      <EditorialCard
                        key={order.id as number}
                        title={`订单 #${(order.order_no as string) || String(order.id)}`}
                        subtitle={new Date(((order.created_at as string) || (order.createdAt as string) || '')).toLocaleDateString('zh-CN')}
                        index={index}
                        hoverEffect="border"
                      >
                        <div className="flex justify-between items-center mb-3">
                          <span className={`font-body text-overline tracking-[0.1em] uppercase ${STATUS_COLORS[order.status as string] ?? 'text-sepia-mid'}`}>
                            {order.status as string}
                          </span>
                          <span className="font-display text-base text-ink">
                            ¥{Number((order.total_amount as number) || (order.totalAmount as number)).toFixed(2)}
                          </span>
                        </div>
                        <button
                          onClick={() => navigate(`/orders/${order.id}`)}
                          className="cursor-pointer font-body text-overline tracking-[0.1em] uppercase text-rust hover:text-ink transition-colors mt-2 block"
                        >
                          查看详情 →
                        </button>
                      </EditorialCard>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {/* ── 捐款记录 ── */}
            {activeTab === 'donations' && (
              <motion.div
                key="donations"
                role="tabpanel"
                id="panel-donations"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <NumberedSectionHeading number="02" title="捐款历史" />
                {loadingDonations ? (
                  <p className="font-body text-body-sm text-ink-faded">加载中…</p>
                ) : (donations as unknown[]).length === 0 ? (
                  <div className="text-center py-12">
                    <p className="font-body text-body-sm text-ink-faded mb-4">暂无捐款记录</p>
                    <Link to="/donate" className="font-body text-overline tracking-[0.15em] uppercase text-rust hover:text-ink transition-colors">
                      去捐款 →
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {(donations as unknown as Array<Record<string, unknown>>).map((donation, index) => (
                      <EditorialCard
                        key={donation.id as number}
                        title={`${donation.currency as string} ${Number(donation.amount).toFixed(2)}`}
                        subtitle={new Date(((donation.created_at as string) || (donation.createdAt as string) || '')).toLocaleDateString('zh-CN')}
                        index={index}
                        hoverEffect="border"
                      >
                        <span className={`font-body text-overline tracking-[0.1em] uppercase ${STATUS_COLORS[donation.status as string] ?? 'text-sepia-mid'}`}>
                          {donation.status as string}
                        </span>
                        {!!donation.message && (
                          <p className="font-body text-caption text-ink-faded italic mt-2 pl-4 border-l-2 border-warm-gray/20">
                            &ldquo;{donation.message as string}&rdquo;
                          </p>
                        )}
                      </EditorialCard>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {/* ── 衣物捐献 ── */}
            {activeTab === 'clothing' && (
              <motion.div
                key="clothing"
                role="tabpanel"
                id="panel-clothing"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex items-center justify-between mb-8">
                  <NumberedSectionHeading number="03" title="衣物捐献记录" />
                  <button
                    onClick={() => navigate('/clothing-donation')}
                    className="cursor-pointer font-body text-overline tracking-[0.15em] uppercase bg-ink text-paper px-4 py-2 hover:bg-rust transition-colors"
                  >
                    + 新增捐献
                  </button>
                </div>
                {loadingClothing ? (
                  <p className="font-body text-body-sm text-ink-faded">加载中…</p>
                ) : !clothingDonations?.data?.length ? (
                  <div className="text-center py-12">
                    <p className="font-body text-body-sm text-ink-faded mb-4">暂无衣物捐献记录</p>
                    <button onClick={() => navigate('/clothing-donation')} className="cursor-pointer font-body text-overline tracking-[0.15em] uppercase text-rust hover:text-ink transition-colors">
                      立即捐献 →
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {clothingDonations.data.map((item: Record<string, unknown>, index: number) => (
                      <EditorialCard
                        key={item.id as number}
                        title={`${item.clothing_type as string} × ${item.quantity as number}件`}
                        subtitle={new Date(item.created_at as string).toLocaleDateString('zh-CN')}
                        index={index}
                        hoverEffect="border"
                      >
                        <div className="flex justify-between items-start">
                          <span className="font-body text-overline tracking-[0.1em] uppercase text-sepia-mid">
                            {clothingDonationStatusMap[item.status as string] ?? item.status as string}
                          </span>
                          {!!item.converted_product_id && (
                            <Link
                              to={`/shop/${item.converted_product_id as number}`}
                              className="font-body text-caption text-rust hover:text-ink transition-colors"
                            >
                              查看商品 →
                            </Link>
                          )}
                        </div>
                        <p className="font-body text-caption text-ink-faded mt-1">
                          编号：TH-CD-{String(item.id).padStart(6, '0')}
                        </p>
                      </EditorialCard>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {/* ── 售后申请 ── */}
            {activeTab === 'aftersales' && (
              <motion.div
                key="aftersales"
                role="tabpanel"
                id="panel-aftersales"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <NumberedSectionHeading number="04" title="售后申请记录" />
                {loadingAfterSales ? (
                  <p className="font-body text-body-sm text-ink-faded">加载中…</p>
                ) : !afterSalesData?.data?.length ? (
                  <div className="text-center py-12">
                    <p className="font-body text-body-sm text-ink-faded">暂无售后申请</p>
                    <p className="font-body text-caption text-ink-faded mt-2">如需售后服务，请在订单详情页提交申请</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {afterSalesData.data.map((item: Record<string, unknown>, index: number) => (
                      <EditorialCard
                        key={item.id as number}
                        title={`${afterSalesTypeMap[item.request_type as string] ?? item.request_type as string}申请`}
                        subtitle={new Date(item.created_at as string).toLocaleDateString('zh-CN')}
                        index={index}
                        hoverEffect="border"
                      >
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="font-body text-caption text-ink-faded">状态</span>
                            <span className={`font-body text-overline tracking-[0.1em] uppercase ${STATUS_COLORS[item.status as string] ?? 'text-sepia-mid'}`}>
                              {afterSalesStatusMap[item.status as string] ?? item.status as string}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="font-body text-caption text-ink-faded">原因</span>
                            <span className="font-body text-caption text-ink">{item.reason as string}</span>
                          </div>
                          {!!item.refund_amount && (
                            <div className="flex justify-between">
                              <span className="font-body text-caption text-ink-faded">退款金额</span>
                              <span className="font-body text-caption text-ink">¥{item.refund_amount as string}</span>
                            </div>
                          )}
                          <button
                            onClick={() => navigate(`/orders/${item.order_id}`)}
                            className="cursor-pointer font-body text-overline tracking-[0.1em] uppercase text-rust hover:text-ink transition-colors mt-1 block"
                          >
                            查看订单 →
                          </button>
                        </div>
                      </EditorialCard>
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </SectionContainer>
      </PaperTextureBackground>
    </PageWrapper>
  );
}
