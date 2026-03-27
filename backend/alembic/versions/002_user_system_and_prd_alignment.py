"""User system overhaul + PRD 7.1 alignment

Revision ID: 002
Revises: 001
Create Date: 2026-03-26 00:00:00.000000

Changes:
- users: add phone_hash, wechat_openid/unionid, gender, carbon stats, last_login_at
- users: make email/password nullable (phone-first login)
- users: change role enum to client_role (user/collector)
- New table: admin_users (RBAC 6-role system)
- New table: user_addresses
- New table: designs
- New table: votes
- New table: recycle_orders
- New table: notifications
- New table: sms_verification_codes
- New table: product_skus
- New table: suppliers
- New table: shipments
- Updated: artworks (PRD fields)
- Updated: orders (donation_amount, recycle_requested, sku_id)
- Updated: order_items (sku_id, donation_amount)
- Updated: donations (period, dual-confirm, proof, publish)
- Updated: supply_chain_records (origin coords, supplier_id)
- Updated: audit_logs (operator fields, before/after value, module)
- Updated: child_participants (age_group)
- Updated: products (design_id, donation_ratio)
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = '002'
down_revision: Union[str, None] = '001'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # ══════════════════════════════════════════════════════════
    #  1. admin_users — 管理端独立用户表（RBAC 6角色）
    # ══════════════════════════════════════════════════════════
    op.create_table(
        'admin_users',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('username', sa.String(100), nullable=False),
        sa.Column('password_hash', sa.String(255), nullable=False),
        sa.Column('real_name', sa.String(100), nullable=False),
        sa.Column('role', sa.Enum('admin', 'auditor', 'designer', 'logistics', 'finance', 'operator', name='admin_role'), nullable=False),
        sa.Column('status', sa.Enum('active', 'disabled', name='admin_status'), nullable=False, server_default='active'),
        sa.Column('last_login_at', sa.DateTime(), nullable=True),
        sa.Column('last_login_ip', sa.String(45), nullable=True),
        sa.Column('failed_login_count', sa.Integer(), nullable=False, server_default=sa.text('0')),
        sa.Column('totp_secret', sa.String(64), nullable=True),
        sa.Column('created_at', sa.DateTime(), server_default=sa.func.now(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), server_default=sa.func.now(), nullable=False),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('username'),
    )
    op.create_index('ix_admin_users_username', 'admin_users', ['username'], unique=True)

    # ══════════════════════════════════════════════════════════
    #  2. suppliers — 供应商档案
    # ══════════════════════════════════════════════════════════
    op.create_table(
        'suppliers',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('name', sa.String(200), nullable=False),
        sa.Column('contact_person', sa.String(100), nullable=True),
        sa.Column('contact_phone_encrypted', sa.Text(), nullable=True),
        sa.Column('region', sa.String(200), nullable=True),
        sa.Column('sa8000_cert_no', sa.String(100), nullable=True),
        sa.Column('sa8000_expiry', sa.DateTime(), nullable=True),
        sa.Column('bsci_cert_no', sa.String(100), nullable=True),
        sa.Column('bsci_expiry', sa.DateTime(), nullable=True),
        sa.Column('cert_image_url', sa.String(500), nullable=True),
        sa.Column('avg_wage_level', sa.String(50), nullable=True),
        sa.Column('worker_count', sa.Integer(), nullable=True),
        sa.Column('improvement_notes', sa.Text(), nullable=True),
        sa.Column('status', sa.Enum('active', 'inactive', 'expired', name='supplier_status'), nullable=False, server_default='active'),
        sa.Column('created_at', sa.DateTime(), server_default=sa.func.now(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), server_default=sa.func.now(), nullable=False),
        sa.PrimaryKeyConstraint('id'),
    )

    # ══════════════════════════════════════════════════════════
    #  3. designs — 设计稿
    # ══════════════════════════════════════════════════════════
    op.create_table(
        'designs',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('designer_id', sa.Integer(), nullable=False),
        sa.Column('artwork_ids', sa.Text(), nullable=False),
        sa.Column('design_concept', sa.Text(), nullable=False),
        sa.Column('image_url', sa.String(500), nullable=False),
        sa.Column('thumbnail_url', sa.String(500), nullable=True),
        sa.Column('version', sa.Integer(), nullable=False, server_default=sa.text('1')),
        sa.Column('internal_vote_count', sa.Integer(), nullable=False, server_default=sa.text('0')),
        sa.Column('public_vote_count', sa.Integer(), nullable=False, server_default=sa.text('0')),
        sa.Column('is_shortlisted', sa.Boolean(), nullable=False, server_default=sa.text('false')),
        sa.Column('is_final', sa.Boolean(), nullable=False, server_default=sa.text('false')),
        sa.Column('status', sa.Enum('draft', 'submitted', 'shortlisted', 'final', 'rejected', name='design_status'), nullable=False, server_default='draft'),
        sa.Column('created_at', sa.DateTime(), server_default=sa.func.now(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), server_default=sa.func.now(), nullable=False),
        sa.PrimaryKeyConstraint('id'),
        sa.ForeignKeyConstraint(['designer_id'], ['admin_users.id']),
    )
    op.create_index('ix_designs_designer_id', 'designs', ['designer_id'])

    # ══════════════════════════════════════════════════════════
    #  4. product_skus — 商品 SKU
    # ══════════════════════════════════════════════════════════
    op.create_table(
        'product_skus',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('product_id', sa.Integer(), nullable=False),
        sa.Column('design_id', sa.Integer(), nullable=True),
        sa.Column('color', sa.String(50), nullable=True),
        sa.Column('size', sa.String(20), nullable=True),
        sa.Column('sku_code', sa.String(100), nullable=False),
        sa.Column('image_url', sa.String(500), nullable=True),
        sa.Column('price', sa.DECIMAL(12, 2), nullable=False),
        sa.Column('donation_ratio', sa.DECIMAL(3, 2), nullable=False, server_default=sa.text('0.30')),
        sa.Column('donation_amount', sa.DECIMAL(12, 2), nullable=False),
        sa.Column('stock_qty', sa.Integer(), nullable=False, server_default=sa.text('0')),
        sa.Column('status', sa.Enum('on_sale', 'off_shelf', name='sku_status'), nullable=False, server_default='on_sale'),
        sa.Column('created_at', sa.DateTime(), server_default=sa.func.now(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), server_default=sa.func.now(), nullable=False),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('sku_code'),
        sa.ForeignKeyConstraint(['product_id'], ['products.id']),
        sa.ForeignKeyConstraint(['design_id'], ['designs.id']),
    )
    op.create_index('ix_product_skus_product_id', 'product_skus', ['product_id'])
    op.create_index('ix_product_skus_sku_code', 'product_skus', ['sku_code'], unique=True)

    # ══════════════════════════════════════════════════════════
    #  5. ALTER users — 手机号登录 + 微信 + 碳贡献
    # ══════════════════════════════════════════════════════════
    op.add_column('users', sa.Column('phone_hash', sa.String(64), nullable=True))
    op.add_column('users', sa.Column('wechat_openid', sa.String(128), nullable=True))
    op.add_column('users', sa.Column('wechat_unionid', sa.String(128), nullable=True))
    op.add_column('users', sa.Column('gender', sa.Enum('unknown', 'male', 'female', name='user_gender'), server_default='unknown', nullable=False))
    op.add_column('users', sa.Column('total_carbon_saved_kg', sa.Integer(), server_default=sa.text('0'), nullable=False))
    op.add_column('users', sa.Column('total_donation_amount', sa.Integer(), server_default=sa.text('0'), nullable=False))
    op.add_column('users', sa.Column('total_recycle_count', sa.Integer(), server_default=sa.text('0'), nullable=False))
    op.add_column('users', sa.Column('last_login_at', sa.DateTime(), nullable=True))

    # email 和 password_hash 改为可空（手机号/微信登录不需要）
    op.alter_column('users', 'email', existing_type=sa.String(255), nullable=True)
    op.alter_column('users', 'password_hash', existing_type=sa.String(255), nullable=True)

    op.create_index('ix_users_phone_hash', 'users', ['phone_hash'], unique=True)
    op.create_index('ix_users_wechat_openid', 'users', ['wechat_openid'], unique=True)
    op.create_index('ix_users_wechat_unionid', 'users', ['wechat_unionid'], unique=True)

    # ══════════════════════════════════════════════════════════
    #  6. user_addresses — 收货地址
    # ══════════════════════════════════════════════════════════
    op.create_table(
        'user_addresses',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('receiver_name', sa.String(100), nullable=False),
        sa.Column('receiver_phone_encrypted', sa.Text(), nullable=False),
        sa.Column('province', sa.String(50), nullable=False),
        sa.Column('city', sa.String(50), nullable=False),
        sa.Column('district', sa.String(50), nullable=False),
        sa.Column('detail_address_encrypted', sa.Text(), nullable=False),
        sa.Column('postal_code', sa.String(10), nullable=True),
        sa.Column('is_default', sa.Boolean(), nullable=False, server_default=sa.text('false')),
        sa.Column('created_at', sa.DateTime(), server_default=sa.func.now(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), server_default=sa.func.now(), nullable=False),
        sa.PrimaryKeyConstraint('id'),
        sa.ForeignKeyConstraint(['user_id'], ['users.id']),
    )
    op.create_index('ix_user_addresses_user_id', 'user_addresses', ['user_id'])

    # ══════════════════════════════════════════════════════════
    #  7. votes — 投票记录
    # ══════════════════════════════════════════════════════════
    op.create_table(
        'votes',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('voter_id', sa.Integer(), nullable=True),
        sa.Column('voter_phone_hash', sa.String(64), nullable=False),
        sa.Column('voter_ip_hash', sa.String(64), nullable=True),
        sa.Column('design_id', sa.Integer(), nullable=False),
        sa.Column('vote_time', sa.DateTime(), server_default=sa.func.now(), nullable=False),
        sa.Column('vote_type', sa.Enum('internal', 'public', name='vote_type'), nullable=False),
        sa.Column('is_valid', sa.Boolean(), nullable=False, server_default=sa.text('true')),
        sa.Column('invalid_reason', sa.String(200), nullable=True),
        sa.Column('device_fingerprint', sa.String(128), nullable=True),
        sa.PrimaryKeyConstraint('id'),
        sa.ForeignKeyConstraint(['voter_id'], ['users.id']),
        sa.ForeignKeyConstraint(['design_id'], ['designs.id']),
        sa.UniqueConstraint('voter_phone_hash', 'vote_type', 'design_id', name='uq_vote_phone_type_design'),
    )
    op.create_index('ix_votes_voter_id', 'votes', ['voter_id'])
    op.create_index('ix_votes_voter_phone_hash', 'votes', ['voter_phone_hash'])
    op.create_index('ix_votes_design_id', 'votes', ['design_id'])

    # ══════════════════════════════════════════════════════════
    #  8. recycle_orders — 旧衣回收
    # ══════════════════════════════════════════════════════════
    op.create_table(
        'recycle_orders',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('recycle_no', sa.String(50), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('related_order_id', sa.Integer(), nullable=True),
        sa.Column('pickup_address_encrypted', sa.Text(), nullable=False),
        sa.Column('pickup_contact_encrypted', sa.Text(), nullable=False),
        sa.Column('pickup_time', sa.DateTime(), nullable=False),
        sa.Column('actual_pickup_time', sa.DateTime(), nullable=True),
        sa.Column('status', sa.Enum('pending', 'picked_up', 'sorting', 'completed', 'cancelled', name='recycle_status'), nullable=False, server_default='pending'),
        sa.Column('assigned_staff_id', sa.Integer(), nullable=True),
        sa.Column('good_qty', sa.Integer(), nullable=False, server_default=sa.text('0')),
        sa.Column('damaged_qty', sa.Integer(), nullable=False, server_default=sa.text('0')),
        sa.Column('fiber_kg', sa.DECIMAL(8, 2), nullable=False, server_default=sa.text('0')),
        sa.Column('carbon_saved_kg', sa.DECIMAL(8, 2), nullable=False, server_default=sa.text('0')),
        sa.Column('note', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(), server_default=sa.func.now(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), server_default=sa.func.now(), nullable=False),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('recycle_no'),
        sa.ForeignKeyConstraint(['user_id'], ['users.id']),
        sa.ForeignKeyConstraint(['related_order_id'], ['orders.id']),
        sa.ForeignKeyConstraint(['assigned_staff_id'], ['admin_users.id']),
    )
    op.create_index('ix_recycle_orders_user_id', 'recycle_orders', ['user_id'])
    op.create_index('ix_recycle_orders_recycle_no', 'recycle_orders', ['recycle_no'], unique=True)

    # ══════════════════════════════════════════════════════════
    #  9. notifications — 消息通知
    # ══════════════════════════════════════════════════════════
    op.create_table(
        'notifications',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('title', sa.String(200), nullable=False),
        sa.Column('content', sa.Text(), nullable=False),
        sa.Column('category', sa.Enum('vote_result', 'order_status', 'donation_update', 'recycle_status', 'system', name='notification_category'), nullable=False),
        sa.Column('resource_type', sa.String(50), nullable=True),
        sa.Column('resource_id', sa.Integer(), nullable=True),
        sa.Column('is_read', sa.Boolean(), nullable=False, server_default=sa.text('false')),
        sa.Column('read_at', sa.DateTime(), nullable=True),
        sa.Column('created_at', sa.DateTime(), server_default=sa.func.now(), nullable=False),
        sa.PrimaryKeyConstraint('id'),
        sa.ForeignKeyConstraint(['user_id'], ['users.id']),
    )
    op.create_index('ix_notifications_user_id', 'notifications', ['user_id'])

    # ══════════════════════════════════════════════════════════
    #  10. sms_verification_codes — 短信验证码
    # ══════════════════════════════════════════════════════════
    op.create_table(
        'sms_verification_codes',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('phone_hash', sa.String(64), nullable=False),
        sa.Column('code', sa.String(6), nullable=False),
        sa.Column('purpose', sa.String(20), nullable=False, server_default='login'),
        sa.Column('ip_address', sa.String(45), nullable=True),
        sa.Column('is_used', sa.Boolean(), nullable=False, server_default=sa.text('false')),
        sa.Column('attempts', sa.Integer(), nullable=False, server_default=sa.text('0')),
        sa.Column('expires_at', sa.DateTime(), nullable=False),
        sa.Column('created_at', sa.DateTime(), server_default=sa.func.now(), nullable=False),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index('ix_sms_codes_phone_hash', 'sms_verification_codes', ['phone_hash'])

    # ══════════════════════════════════════════════════════════
    #  11. shipments — 物流信息
    # ══════════════════════════════════════════════════════════
    op.create_table(
        'shipments',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('order_id', sa.Integer(), nullable=False),
        sa.Column('carrier_name', sa.String(100), nullable=False),
        sa.Column('tracking_no', sa.String(100), nullable=False),
        sa.Column('status', sa.Enum('pending', 'shipped', 'in_transit', 'delivering', 'delivered', name='shipment_status'), nullable=False, server_default='pending'),
        sa.Column('is_green', sa.Boolean(), nullable=False, server_default=sa.text('false')),
        sa.Column('updater_id', sa.Integer(), nullable=True),
        sa.Column('last_track_time', sa.DateTime(), nullable=True),
        sa.Column('created_at', sa.DateTime(), server_default=sa.func.now(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), server_default=sa.func.now(), nullable=False),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('tracking_no'),
        sa.ForeignKeyConstraint(['order_id'], ['orders.id']),
        sa.ForeignKeyConstraint(['updater_id'], ['admin_users.id']),
    )
    op.create_index('ix_shipments_order_id', 'shipments', ['order_id'])
    op.create_index('ix_shipments_tracking_no', 'shipments', ['tracking_no'], unique=True)

    # ══════════════════════════════════════════════════════════
    #  12. ALTER child_participants — 加 age_group
    # ══════════════════════════════════════════════════════════
    op.add_column('child_participants', sa.Column('age_group', sa.Enum('6-9', '10-13', '14-17', name='child_age_group'), nullable=True))

    # ══════════════════════════════════════════════════════════
    #  13. ALTER artworks — PRD 7.1 字段
    # ══════════════════════════════════════════════════════════
    op.add_column('artworks', sa.Column('region', sa.String(200), nullable=True))
    op.add_column('artworks', sa.Column('author_alias', sa.String(100), nullable=True))
    op.add_column('artworks', sa.Column('age_group', sa.Enum('6-9', '10-13', '14-17', name='artwork_age_group'), nullable=True))
    op.add_column('artworks', sa.Column('theme_tags', sa.JSON(), nullable=True))
    op.add_column('artworks', sa.Column('original_image_url', sa.String(500), nullable=True))
    op.add_column('artworks', sa.Column('desensitized_image_url', sa.String(500), nullable=True))
    op.add_column('artworks', sa.Column('upload_staff_id', sa.Integer(), nullable=True))
    op.add_column('artworks', sa.Column('audit_status', sa.Enum('pending', 'approved', 'rejected', name='artwork_audit_status'), server_default='pending', nullable=True))
    op.add_column('artworks', sa.Column('auditor_id', sa.Integer(), nullable=True))
    op.add_column('artworks', sa.Column('audit_note', sa.Text(), nullable=True))
    op.add_column('artworks', sa.Column('audit_time', sa.DateTime(), nullable=True))
    op.add_column('artworks', sa.Column('display_status', sa.Enum('visible', 'hidden', name='artwork_display_status'), server_default='visible', nullable=True))
    op.add_column('artworks', sa.Column('favorite_count', sa.Integer(), server_default=sa.text('0'), nullable=False))
    op.add_column('artworks', sa.Column('upload_time', sa.DateTime(), server_default=sa.func.now(), nullable=True))

    # ══════════════════════════════════════════════════════════
    #  14. ALTER orders — PRD 7.1 字段
    # ══════════════════════════════════════════════════════════
    op.add_column('orders', sa.Column('sku_id', sa.Integer(), nullable=True))
    op.add_column('orders', sa.Column('quantity', sa.Integer(), server_default=sa.text('1'), nullable=True))
    op.add_column('orders', sa.Column('unit_price', sa.DECIMAL(12, 2), nullable=True))
    op.add_column('orders', sa.Column('donation_amount', sa.DECIMAL(12, 2), server_default=sa.text('0'), nullable=True))
    op.add_column('orders', sa.Column('pay_time', sa.DateTime(), nullable=True))
    op.add_column('orders', sa.Column('pay_channel', sa.Enum('wechat', 'alipay', name='pay_channel'), nullable=True))
    op.add_column('orders', sa.Column('order_status', sa.Enum('pending_payment', 'paid', 'shipped', 'delivered', 'refunded', 'cancelled', name='order_status_v2'), server_default='pending_payment', nullable=True))
    op.add_column('orders', sa.Column('recycle_requested', sa.Boolean(), server_default=sa.text('false'), nullable=True))

    # ══════════════════════════════════════════════════════════
    #  15. ALTER order_items — 加 sku_id, donation_amount
    # ══════════════════════════════════════════════════════════
    op.add_column('order_items', sa.Column('sku_id', sa.Integer(), nullable=True))
    op.add_column('order_items', sa.Column('donation_amount', sa.DECIMAL(12, 2), server_default=sa.text('0'), nullable=True))

    # ══════════════════════════════════════════════════════════
    #  16. ALTER products — 加 design_id, donation_ratio, updated_at
    # ══════════════════════════════════════════════════════════
    op.add_column('products', sa.Column('design_id', sa.Integer(), nullable=True))
    op.add_column('products', sa.Column('donation_ratio', sa.DECIMAL(3, 2), server_default=sa.text('0.30'), nullable=True))
    op.add_column('products', sa.Column('updated_at', sa.DateTime(), server_default=sa.func.now(), nullable=True))

    # ══════════════════════════════════════════════════════════
    #  17. ALTER donations — PRD 7.1 字段
    # ══════════════════════════════════════════════════════════
    op.add_column('donations', sa.Column('period', sa.String(20), nullable=True))
    op.add_column('donations', sa.Column('total_sales', sa.DECIMAL(12, 2), server_default=sa.text('0'), nullable=True))
    op.add_column('donations', sa.Column('donation_amount', sa.DECIMAL(12, 2), nullable=True))
    op.add_column('donations', sa.Column('confirmer_id', sa.Integer(), nullable=True))
    op.add_column('donations', sa.Column('second_confirmer_id', sa.Integer(), nullable=True))
    op.add_column('donations', sa.Column('confirm_time', sa.DateTime(), nullable=True))
    op.add_column('donations', sa.Column('material_list', sa.JSON(), nullable=True))
    op.add_column('donations', sa.Column('target_region', sa.String(200), nullable=True))
    op.add_column('donations', sa.Column('proof_url', sa.String(500), nullable=True))
    op.add_column('donations', sa.Column('actual_delivery_time', sa.DateTime(), nullable=True))
    op.add_column('donations', sa.Column('publish_status', sa.Enum('draft', 'pending_review', 'published', name='donation_publish_status'), server_default='draft', nullable=True))
    op.add_column('donations', sa.Column('updated_at', sa.DateTime(), server_default=sa.func.now(), nullable=True))

    # ══════════════════════════════════════════════════════════
    #  18. ALTER supply_chain_records — 坐标 + 供应商
    # ══════════════════════════════════════════════════════════
    op.add_column('supply_chain_records', sa.Column('origin_name', sa.String(200), nullable=True))
    op.add_column('supply_chain_records', sa.Column('origin_lat', sa.DECIMAL(10, 7), nullable=True))
    op.add_column('supply_chain_records', sa.Column('origin_lng', sa.DECIMAL(10, 7), nullable=True))
    op.add_column('supply_chain_records', sa.Column('purchase_qty_ton', sa.DECIMAL(10, 2), nullable=True))
    op.add_column('supply_chain_records', sa.Column('purchase_price_per_ton', sa.DECIMAL(12, 2), nullable=True))
    op.add_column('supply_chain_records', sa.Column('transport_distance_km', sa.DECIMAL(10, 2), nullable=True))
    op.add_column('supply_chain_records', sa.Column('carbon_estimate_kg', sa.DECIMAL(10, 2), nullable=True))
    op.add_column('supply_chain_records', sa.Column('purchase_date', sa.DateTime(), nullable=True))
    op.add_column('supply_chain_records', sa.Column('supplier_id', sa.Integer(), nullable=True))

    # ══════════════════════════════════════════════════════════
    #  19. ALTER audit_logs — operator + before/after + module
    # ══════════════════════════════════════════════════════════
    op.add_column('audit_logs', sa.Column('operator_id', sa.Integer(), nullable=True))
    op.add_column('audit_logs', sa.Column('operator_name', sa.String(100), nullable=True))
    op.add_column('audit_logs', sa.Column('module', sa.String(100), nullable=True))
    op.add_column('audit_logs', sa.Column('before_value', sa.JSON(), nullable=True))
    op.add_column('audit_logs', sa.Column('after_value', sa.JSON(), nullable=True))


def downgrade() -> None:
    # audit_logs
    op.drop_column('audit_logs', 'after_value')
    op.drop_column('audit_logs', 'before_value')
    op.drop_column('audit_logs', 'module')
    op.drop_column('audit_logs', 'operator_name')
    op.drop_column('audit_logs', 'operator_id')

    # supply_chain_records
    op.drop_column('supply_chain_records', 'supplier_id')
    op.drop_column('supply_chain_records', 'purchase_date')
    op.drop_column('supply_chain_records', 'carbon_estimate_kg')
    op.drop_column('supply_chain_records', 'transport_distance_km')
    op.drop_column('supply_chain_records', 'purchase_price_per_ton')
    op.drop_column('supply_chain_records', 'purchase_qty_ton')
    op.drop_column('supply_chain_records', 'origin_lng')
    op.drop_column('supply_chain_records', 'origin_lat')
    op.drop_column('supply_chain_records', 'origin_name')

    # donations
    op.drop_column('donations', 'updated_at')
    op.drop_column('donations', 'publish_status')
    op.drop_column('donations', 'actual_delivery_time')
    op.drop_column('donations', 'proof_url')
    op.drop_column('donations', 'target_region')
    op.drop_column('donations', 'material_list')
    op.drop_column('donations', 'confirm_time')
    op.drop_column('donations', 'second_confirmer_id')
    op.drop_column('donations', 'confirmer_id')
    op.drop_column('donations', 'donation_amount')
    op.drop_column('donations', 'total_sales')
    op.drop_column('donations', 'period')

    # products
    op.drop_column('products', 'updated_at')
    op.drop_column('products', 'donation_ratio')
    op.drop_column('products', 'design_id')

    # order_items
    op.drop_column('order_items', 'donation_amount')
    op.drop_column('order_items', 'sku_id')

    # orders
    op.drop_column('orders', 'recycle_requested')
    op.drop_column('orders', 'order_status')
    op.drop_column('orders', 'pay_channel')
    op.drop_column('orders', 'pay_time')
    op.drop_column('orders', 'donation_amount')
    op.drop_column('orders', 'unit_price')
    op.drop_column('orders', 'quantity')
    op.drop_column('orders', 'sku_id')

    # artworks
    op.drop_column('artworks', 'upload_time')
    op.drop_column('artworks', 'favorite_count')
    op.drop_column('artworks', 'display_status')
    op.drop_column('artworks', 'audit_time')
    op.drop_column('artworks', 'audit_note')
    op.drop_column('artworks', 'auditor_id')
    op.drop_column('artworks', 'audit_status')
    op.drop_column('artworks', 'upload_staff_id')
    op.drop_column('artworks', 'desensitized_image_url')
    op.drop_column('artworks', 'original_image_url')
    op.drop_column('artworks', 'theme_tags')
    op.drop_column('artworks', 'age_group')
    op.drop_column('artworks', 'author_alias')
    op.drop_column('artworks', 'region')

    # child_participants
    op.drop_column('child_participants', 'age_group')

    # Drop new tables
    op.drop_index('ix_shipments_tracking_no', table_name='shipments')
    op.drop_index('ix_shipments_order_id', table_name='shipments')
    op.drop_table('shipments')

    op.drop_index('ix_sms_codes_phone_hash', table_name='sms_verification_codes')
    op.drop_table('sms_verification_codes')

    op.drop_index('ix_notifications_user_id', table_name='notifications')
    op.drop_table('notifications')

    op.drop_index('ix_recycle_orders_recycle_no', table_name='recycle_orders')
    op.drop_index('ix_recycle_orders_user_id', table_name='recycle_orders')
    op.drop_table('recycle_orders')

    op.drop_index('ix_votes_design_id', table_name='votes')
    op.drop_index('ix_votes_voter_phone_hash', table_name='votes')
    op.drop_index('ix_votes_voter_id', table_name='votes')
    op.drop_table('votes')

    op.drop_index('ix_user_addresses_user_id', table_name='user_addresses')
    op.drop_table('user_addresses')

    # users: drop new columns
    op.drop_index('ix_users_wechat_unionid', table_name='users')
    op.drop_index('ix_users_wechat_openid', table_name='users')
    op.drop_index('ix_users_phone_hash', table_name='users')
    op.drop_column('users', 'last_login_at')
    op.drop_column('users', 'total_recycle_count')
    op.drop_column('users', 'total_donation_amount')
    op.drop_column('users', 'total_carbon_saved_kg')
    op.drop_column('users', 'gender')
    op.drop_column('users', 'wechat_unionid')
    op.drop_column('users', 'wechat_openid')
    op.drop_column('users', 'phone_hash')
    op.alter_column('users', 'email', existing_type=sa.String(255), nullable=False)
    op.alter_column('users', 'password_hash', existing_type=sa.String(255), nullable=False)

    op.drop_index('ix_product_skus_sku_code', table_name='product_skus')
    op.drop_index('ix_product_skus_product_id', table_name='product_skus')
    op.drop_table('product_skus')

    op.drop_index('ix_designs_designer_id', table_name='designs')
    op.drop_table('designs')

    op.drop_table('suppliers')

    op.drop_index('ix_admin_users_username', table_name='admin_users')
    op.drop_table('admin_users')
