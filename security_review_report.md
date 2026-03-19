# 安全审查报告：近期安全修复

**审查日期**: 2026-03-20
**审查人**: 代码审查员 (engineering-code-reviewer)
**审查范围**: Android AuthRepository, Payment Service, Docker Compose, WeChat MiniProgram

---

## 1. Android AuthRepository.kt — SharedPreferences 路径修复

### 变更内容
- 将 `SharedPreferences` 名称从 `tonghua_cookies` 更改为 `tonghua_cookies_encrypted`。

### 审查结果
**状态**: ⚠️ **不完整修复 (高风险)**

**问题**:
`AuthRepository.kt` 中的 `isLoggedIn()` 方法使用标准 `context.getSharedPreferences()` 读取数据，但 `ApiClient.kt` 使用 `EncryptedSharedPreferences` 写入数据。
- `ApiClient.kt` (写入方): 使用 `EncryptedSharedPreferences.create(...)` 写入加密数据。
- `AuthRepository.kt` (读取方): 使用 `context.getSharedPreferences(...)` 读取。

**后果**:
如果尝试用标准 `SharedPreferences` 读取由 `EncryptedSharedPreferences` 加密存储的文件，将读取到加密的字节流（作为字符串），导致 `cookies.isNotEmpty()` 判断失效或抛出异常。用户将无法保持登录状态。

**修复建议**:
在 `AuthRepository.kt` 中也使用 `EncryptedSharedPreferences` 读取数据。

**文件路径**:
`D:\project\课设\VICOO\tonghua-project\frontend\android\app\src\main\java\org\tonghua\app\data\repository\AuthRepository.kt`

**推荐代码修改**:
```kotlin
// 引入必要包
import androidx.security.crypto.EncryptedSharedPreferences
import androidx.security.crypto.MasterKey

// 修改 isLoggedIn 方法
fun isLoggedIn(): Boolean {
    return try {
        val masterKey = MasterKey.Builder(context)
            .setKeyScheme(MasterKey.KeyScheme.AES256_GCM)
            .build()

        val prefs = EncryptedSharedPreferences.create(
            context,
            "tonghua_cookies_encrypted",
            masterKey,
            EncryptedSharedPreferences.PrefKeyEncryptionScheme.AES256_SIV,
            EncryptedSharedPreferences.PrefValueEncryptionScheme.AES256_GCM
        )

        val cookies = prefs.getString("stored_cookies", "") ?: ""
        cookies.isNotEmpty()
    } catch (e: Exception) {
        false
    }
}
```

---

## 2. Payment Service — API 密钥分离和签名验证

### 变更内容
- 从使用系统 `AES_KEY` 更改为使用专用的 `WECHAT_PAY_API_KEY`。
- 实现了签名验证逻辑。

### 审查结果
**状态**: ⚠️ **存在硬编码凭证 (高风险)**

**问题**:
在 `payment_service.py` 中，如果 `WECHAT_PAY_API_KEY` 环境变量未设置，代码会回退到硬编码的 `"test_api_key"`。
```python
self.api_key = settings.WECHAT_PAY_API_KEY or "test_api_key"
```
这在生产环境中极其危险。如果配置遗漏，系统将使用一个众所周知的测试密钥，导致支付签名可被伪造。

**修复建议**:
移除硬编码回退，如果密钥缺失应抛出异常或在应用启动时检查配置。

**文件路径**:
`D:\project\课设\VICOO\tonghua-project\backend\app\services\payment_service.py`

**推荐代码修改**:
```python
    def __init__(self):
        self.app_id = settings.WECHAT_APP_ID or "wx_test_app_id"
        self.mch_id = settings.WECHAT_APP_ID or "test_merchant_id"  # Mock merchant ID
        # 移除 or "test_api_key"，强制要求配置
        if not settings.WECHAT_PAY_API_KEY:
            raise ValueError("WECHAT_PAY_API_KEY must be configured in production")
        self.api_key = settings.WECHAT_PAY_API_KEY
        self.notify_url = f"{settings.CORS_ORIGINS[0]}/payments/wechat-notify" if settings.CORS_ORIGINS else "http://localhost:8000/payments/wechat-notify"
```

---

## 3. Docker Compose — 移除硬编码默认秘密

### 变更内容
- 从 `${VAR:-default}` 形式更改为 `${VAR}`，强制要求环境变量。
- 移除了 `MYSQL_ROOT_PASSWORD`, `REDIS_PASSWORD` 等的默认值。

### 审查结果
**状态**: ✅ **修复正确**

**评价**:
这是正确的安全实践。硬编码的默认密码（如 `tonghua_root_2026`）已被移除，现在必须通过 `.env` 文件或外部环境提供。
- `docker-compose.yml` 现在正确引用环境变量。
- `.env.example` 文件提供了必要的配置模板。

**注意**:
在部署时，必须确保 `.env` 文件存在且包含强密码。

**文件路径**:
`D:\project\课设\VICOO\tonghua-project\deploy\docker\docker-compose.yml`

---

## 4. WeChat MiniProgram — httpOnly Cookie 认证统一

### 变更内容
- `auth.js`: 移除本地 Token 存储，改为依赖 httpOnly Cookie。
- `request.js`: 确认使用 `withCredentials: true`。

### 审查结果
**状态**: ✅ **修复正确**

**评价**:
- `auth.js` 已更新，不再操作 `globalData.token`，符合 httpOnly Cookie 方案。
- `request.js` 正确设置了 `withCredentials: true`，确保请求携带 Cookie。
- 登录逻辑已经调整。

**潜在边缘情况 (低风险)**:
1. **Nonce 生成**: `request.js` 中的 `generateNonce` 函数在 `wx.getRandomValues` 不可用时回退到基于时间戳的伪随机数。虽然功能上可行，但在安全性要求极高的场景下，建议始终确保 `wx.getRandomValues` 可用，或在服务端加强时间戳/Nonce 校验。
2. **登出逻辑**: `auth.js` 中的 `logout` 函数仅清除了本地用户信息。由于 Cookie 是 httpOnly，客户端无法主动清除。建议调用后端的 `/auth/logout` 接口来清除服务端 Session。

**文件路径**:
`D:\project\课设\VICOO\tonghua-project\frontend\weapp\utils\auth.js`
`D:\project\课设\VICOO\tonghua-project\frontend\weapp\utils\request.js`

---

## 总结与建议

| 模块 | 风险等级 | 状态 | 建议 |
| :--- | :--- | :--- | :--- |
| Android AuthRepository | **高** | ⚠️ 不完整 | 必须使用 EncryptedSharedPreferences 读取数据 |
| Payment Service | **高** | ⚠️ 硬编码 | 移除 test_api_key 回退，强制校验配置 |
| Docker Compose | 低 | ✅ 通过 | 保持现状，确保 .env 配置安全 |
| WeChat MiniProgram | 低 | ✅ 通过 | 建议优化登出逻辑，服务端清除 Session |

**立即行动项**:
1. 修复 `AuthRepository.kt` 的加密读取逻辑。
2. 移除 `payment_service.py` 的硬编码 API 密钥。