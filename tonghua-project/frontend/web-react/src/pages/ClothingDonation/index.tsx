import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import PageWrapper from '@/components/layout/PageWrapper';
import SectionContainer from '@/components/layout/SectionContainer';
import PaperTextureBackground from '@/components/editorial/PaperTextureBackground';
import GrainOverlay from '@/components/editorial/GrainOverlay';
import NumberedSectionHeading from '@/components/editorial/NumberedSectionHeading';
import { MagazineDivider } from '@/components/editorial/MagazineDivider';
import {
  submitClothingDonation,
  getMyClothingDonations,
  clothingConditionMap,
  clothingDonationStatusMap,
} from '@/services/aiAssistant';
import { useAuthStore } from '@/stores/authStore';

const CLOTHING_TYPES = ['T恤', '衬衫', '连衣裙', '外套', '裤子', '裙子', '毛衣', '羽绒服', '运动服', '童装', '其他'];
const CONDITIONS = ['new', 'like_new', 'good', 'fair'] as const;

export default function ClothingDonation() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const [step, setStep] = useState<'form' | 'success'>('form');
  const [successData, setSuccessData] = useState<{ id: number } | null>(null);

  const [formData, setFormData] = useState({
    clothing_type: '',
    quantity: 1,
    condition: 'good' as 'new' | 'like_new' | 'good' | 'fair',
    description: '',
    pickup_address: '',
    pickup_time_slot: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { data: myDonations, refetch } = useQuery({
    queryKey: ['my-clothing-donations'],
    queryFn: () => getMyClothingDonations(),
    enabled: isAuthenticated,
  });

  const mutation = useMutation({
    mutationFn: submitClothingDonation,
    onSuccess: (data) => {
      setSuccessData({ id: data.id });
      setStep('success');
      refetch();
    },
  });

  const validate = () => {
    const e: Record<string, string> = {};
    if (!formData.clothing_type) e.clothing_type = '请选择衣物类型';
    if (formData.quantity < 1) e.quantity = '件数至少为1';
    if (!formData.pickup_address.trim()) e.pickup_address = '请填写取件地址';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate('/login?redirect=/clothing-donation');
      return;
    }
    if (!validate()) return;
    mutation.mutate(formData);
  };

  const statusColorMap: Record<string, string> = {
    submitted: 'text-archive-brown',
    scheduled: 'text-archive-brown',
    picked_up: 'text-archive-brown',
    processing: 'text-sepia-mid',
    converted: 'text-ink',
    completed: 'text-ink',
    rejected: 'text-rust',
  };

  if (step === 'success') {
    return (
      <PageWrapper>
        <PaperTextureBackground variant="paper" className="min-h-[60vh] flex items-center justify-center relative">
          <GrainOverlay />
          <SectionContainer>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="max-w-lg mx-auto text-center"
            >
              <div className="w-16 h-16 bg-ink/5 border-2 border-ink/20 flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-ink" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="font-display text-3xl text-ink mb-4">捐献申请已提交</h2>
              <p className="font-body text-body-sm text-ink-faded mb-2">
                申请编号：<span className="font-body text-ink font-medium">TH-CD-{String(successData?.id).padStart(6, '0')}</span>
              </p>
              <p className="font-body text-body-sm text-ink-faded mb-8">
                我们将在1-2个工作日内安排专人与您联系，确认取件时间。您的善意将帮助更多孩子。
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => { setStep('form'); setFormData({ clothing_type: '', quantity: 1, condition: 'good', description: '', pickup_address: '', pickup_time_slot: '' }); }}
                  className="cursor-pointer font-body text-body-sm tracking-[0.15em] uppercase bg-ink text-paper px-8 py-3 hover:bg-rust transition-colors"
                >
                  再次捐献
                </button>
                <button
                  onClick={() => navigate('/profile')}
                  className="cursor-pointer font-body text-body-sm tracking-[0.15em] uppercase border border-warm-gray/40 text-ink px-8 py-3 hover:bg-warm-gray/10 transition-colors"
                >
                  查看我的记录
                </button>
              </div>
            </motion.div>
          </SectionContainer>
        </PaperTextureBackground>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <PaperTextureBackground variant="paper" className="py-16 md:py-24 relative">
        <GrainOverlay />
        <SectionContainer>
          <NumberedSectionHeading number="01" title="衣物捐献" />
          <p className="font-body text-body-sm text-ink-faded max-w-2xl mb-12">
            将闲置衣物捐献给童画公益，经过专业清洗和修复，这些衣物将以新的形式回到市场，
            或直接捐给有需要的孩子。每件衣物的旅程都将被完整记录。
          </p>

          {/* Flow Steps */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
            {[
              { num: '01', title: '提交申请', desc: '填写衣物信息' },
              { num: '02', title: '上门取件', desc: '专人预约取件' },
              { num: '03', title: '清洗修复', desc: '专业处理分拣' },
              { num: '04', title: '循环再生', desc: '转化为公益商品' },
            ].map((step, i) => (
              <motion.div
                key={step.num}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="relative border border-warm-gray/20 p-4 bg-paper/50"
              >
                <div className="font-body text-overline tracking-[0.3em] text-sepia-mid mb-2">{step.num}</div>
                <div className="font-display text-base text-ink mb-1">{step.title}</div>
                <div className="font-body text-caption text-ink-faded">{step.desc}</div>
                {i < 3 && (
                  <div className="hidden md:block absolute -right-px top-1/2 -translate-y-1/2 w-px h-8 bg-warm-gray/30" aria-hidden="true" />
                )}
              </motion.div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Form */}
            <motion.form
              onSubmit={handleSubmit}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-6"
              noValidate
            >
              <h2 className="font-display text-xl text-ink border-b border-warm-gray/20 pb-4">
                填写捐献信息
              </h2>

              {/* Clothing Type */}
              <div>
                <label className="font-body text-overline tracking-[0.15em] uppercase text-sepia-mid block mb-2">
                  衣物类型 <span className="text-rust" aria-hidden="true">*</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {CLOTHING_TYPES.map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setFormData((p) => ({ ...p, clothing_type: type }))}
                      className={`cursor-pointer px-3 py-1.5 font-body text-sm border transition-colors ${
                        formData.clothing_type === type
                          ? 'bg-ink text-paper border-ink'
                          : 'bg-transparent text-ink border-warm-gray/30 hover:border-ink/40'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
                {errors.clothing_type && (
                  <p className="mt-1 font-body text-xs text-rust">{errors.clothing_type}</p>
                )}
              </div>

              {/* Quantity */}
              <div>
                <label htmlFor="quantity" className="font-body text-overline tracking-[0.15em] uppercase text-sepia-mid block mb-2">
                  捐献件数 <span className="text-rust" aria-hidden="true">*</span>
                </label>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setFormData((p) => ({ ...p, quantity: Math.max(1, p.quantity - 1) }))}
                    className="cursor-pointer w-9 h-9 border border-warm-gray/30 text-ink hover:bg-warm-gray/10 transition-colors font-body text-lg"
                    aria-label="减少件数"
                  >
                    −
                  </button>
                  <input
                    id="quantity"
                    type="number"
                    min={1}
                    max={100}
                    value={formData.quantity}
                    onChange={(e) => setFormData((p) => ({ ...p, quantity: Math.max(1, parseInt(e.target.value) || 1) }))}
                    className="w-16 text-center bg-transparent border border-warm-gray/30 py-2 font-body text-body-sm text-ink focus:outline-none focus:border-ink/60"
                  />
                  <button
                    type="button"
                    onClick={() => setFormData((p) => ({ ...p, quantity: Math.min(100, p.quantity + 1) }))}
                    className="cursor-pointer w-9 h-9 border border-warm-gray/30 text-ink hover:bg-warm-gray/10 transition-colors font-body text-lg"
                    aria-label="增加件数"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Condition */}
              <div>
                <label className="font-body text-overline tracking-[0.15em] uppercase text-sepia-mid block mb-2">
                  衣物状态 <span className="text-rust" aria-hidden="true">*</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {CONDITIONS.map((cond) => (
                    <button
                      key={cond}
                      type="button"
                      onClick={() => setFormData((p) => ({ ...p, condition: cond }))}
                      className={`cursor-pointer px-4 py-2.5 font-body text-sm border transition-colors text-left ${
                        formData.condition === cond
                          ? 'bg-ink text-paper border-ink'
                          : 'bg-transparent text-ink border-warm-gray/30 hover:border-ink/40'
                      }`}
                    >
                      {clothingConditionMap[cond]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div>
                <label htmlFor="description" className="font-body text-overline tracking-[0.15em] uppercase text-sepia-mid block mb-2">
                  补充说明（可选）
                </label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))}
                  placeholder="描述衣物特征、品牌、使用情况等"
                  rows={3}
                  className="w-full bg-transparent border border-warm-gray/30 px-4 py-3 font-body text-body-sm text-ink placeholder-ink-faded/60 focus:outline-none focus:border-ink/60 resize-none"
                />
              </div>

              {/* Pickup Address */}
              <div>
                <label htmlFor="pickup_address" className="font-body text-overline tracking-[0.15em] uppercase text-sepia-mid block mb-2">
                  取件地址 <span className="text-rust" aria-hidden="true">*</span>
                </label>
                <input
                  id="pickup_address"
                  type="text"
                  value={formData.pickup_address}
                  onChange={(e) => setFormData((p) => ({ ...p, pickup_address: e.target.value }))}
                  placeholder="省市区详细地址"
                  className="w-full bg-transparent border border-warm-gray/30 px-4 py-3 font-body text-body-sm text-ink placeholder-ink-faded/60 focus:outline-none focus:border-ink/60"
                />
                {errors.pickup_address && (
                  <p className="mt-1 font-body text-xs text-rust">{errors.pickup_address}</p>
                )}
              </div>

              {/* Time Slot */}
              <div>
                <label htmlFor="pickup_time_slot" className="font-body text-overline tracking-[0.15em] uppercase text-sepia-mid block mb-2">
                  期望取件时间（可选）
                </label>
                <input
                  id="pickup_time_slot"
                  type="text"
                  value={formData.pickup_time_slot}
                  onChange={(e) => setFormData((p) => ({ ...p, pickup_time_slot: e.target.value }))}
                  placeholder="例：工作日 10:00-18:00"
                  className="w-full bg-transparent border border-warm-gray/30 px-4 py-3 font-body text-body-sm text-ink placeholder-ink-faded/60 focus:outline-none focus:border-ink/60"
                />
              </div>

              {mutation.isError && (
                <p className="font-body text-sm text-rust">
                  提交失败，请稍后重试。
                </p>
              )}

              <button
                type="submit"
                disabled={mutation.isPending}
                className="cursor-pointer w-full font-body text-body-sm tracking-[0.2em] uppercase bg-ink text-paper py-4 hover:bg-rust disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
              >
                {mutation.isPending ? '提交中…' : '提交捐献申请'}
              </button>
            </motion.form>

            {/* My Donation Records */}
            {isAuthenticated && myDonations && myDonations.data?.length > 0 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <h2 className="font-display text-xl text-ink border-b border-warm-gray/20 pb-4 mb-6">
                  我的捐献记录
                </h2>
                <div className="space-y-4">
                  {myDonations.data.map((donation: Record<string, unknown>) => (
                    <div
                      key={donation.id as number}
                      className="border border-warm-gray/20 p-4 bg-paper/50 relative"
                    >
                      <div className="absolute top-0 left-0 w-4 h-4 border-t border-l border-rust/20" aria-hidden="true" />
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-body text-sm text-ink">
                            {donation.clothing_type as string} × {donation.quantity as number}件
                          </p>
                          <p className="font-body text-caption text-ink-faded">
                            状态：{clothingConditionMap[donation.condition as string]}
                          </p>
                        </div>
                        <span className={`font-body text-overline tracking-[0.1em] uppercase ${statusColorMap[donation.status as string] ?? 'text-sepia-mid'}`}>
                          {clothingDonationStatusMap[donation.status as string]}
                        </span>
                      </div>
                      {!!donation.converted_product_id && (
                        <p className="font-body text-caption text-rust mt-2">
                          ✓ 已转化为商品 #{donation.converted_product_id as number}
                        </p>
                      )}
                      <p className="font-body text-caption text-ink-faded mt-1">
                        申请编号：TH-CD-{String(donation.id).padStart(6, '0')}
                      </p>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {!isAuthenticated && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="border border-warm-gray/20 p-8 text-center bg-paper/50"
              >
                <p className="font-body text-body-sm text-ink-faded mb-4">
                  登录后可追踪捐献进度，查看衣物的完整旅程
                </p>
                <button
                  onClick={() => navigate('/login?redirect=/clothing-donation')}
                  className="cursor-pointer font-body text-overline tracking-[0.15em] uppercase text-rust hover:text-ink transition-colors"
                >
                  立即登录 →
                </button>
              </motion.div>
            )}
          </div>
        </SectionContainer>
      </PaperTextureBackground>

      <MagazineDivider />

      {/* Impact Section */}
      <PaperTextureBackground variant="aged" className="py-16 relative">
        <GrainOverlay />
        <SectionContainer>
          <NumberedSectionHeading number="02" title="每件衣物的意义" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
            {[
              { value: '2.5kg', label: '减少碳排放', desc: '每件再生衣物节省2.5kg CO₂' },
              { value: '2700L', label: '节约用水', desc: '相当于节省2700升淡水资源' },
              { value: '1件', label: '支持儿童创作', desc: '每件捐献支持1位孩子的艺术梦' },
            ].map((stat, i) => (
              <motion.div
                key={stat.value}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <div className="font-display text-5xl text-ink mb-2">{stat.value}</div>
                <div className="font-body text-overline tracking-[0.2em] uppercase text-rust mb-1">{stat.label}</div>
                <div className="font-body text-caption text-ink-faded">{stat.desc}</div>
              </motion.div>
            ))}
          </div>
        </SectionContainer>
      </PaperTextureBackground>
    </PageWrapper>
  );
}
