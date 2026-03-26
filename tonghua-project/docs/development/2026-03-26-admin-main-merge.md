# 2026-03-26 本地联调说明

这份说明记录的是当前这次合并后的真实本地状态：

- 已合并 `origin/main` 上的后台登录页英文文案更新。
- 已保留本地修复的主站和后端问题。
- 已拆分主站与后台端口，避免互相冲突。
- 已把后台登录、儿童审计访问、OAuth 回调和后端鉴权链路对齐。

如果以后有人继续改这套仓库，先看这份文档，再动代码。

## 1. 当前端口分配

| 服务 | 路径 | 本地地址 | 备注 |
|---|---|---|---|
| 主站前端 | `frontend/web-react` | `http://localhost:5173` | Google OAuth 回调必须基于这个端口 |
| 管理后台 | `admin` | `http://localhost:5174` | 不能再占用 `5173` |
| 后端 API | `backend` | `http://127.0.0.1:8000` | 前后端都代理到这里 |

不要把后台改回 `5173`。`5173` 已经留给主站，Google OAuth 的 redirect URI 也绑定了这个地址。

## 2. 本次更新涉及的关键文件

### 主站

- `frontend/web-react/package.json`
- `frontend/web-react/vite.config.ts`
- `frontend/web-react/vite.config.js`
- `frontend/web-react/.env.local`

### 管理后台

- `admin/vite.config.ts`
- `admin/src/pages/LoginPage.tsx`
- `admin/src/pages/ChildAuditPage.tsx`
- `admin/src/services/api.ts`
- `admin/src/stores/authStore.ts`

### 后端

- `backend/app/deps.py`
- `backend/app/routers/auth.py`
- `backend/app/routers/admin.py`
- `backend/.env`
- `backend/.env.example`

## 3. 为什么要这样改

### 3.1 主站和后台不能共用同一个端口

主站和后台都属于 React/Vite 前端。如果都跑 `5173`，浏览器只能打开一个，另一个会被顶掉。

当前方案是：

- 主站留在 `5173`
- 后台改到 `5174`

这样两个前端可以同时存在，且 Google OAuth 仍然只绑定主站。

### 3.2 后台 API 必须对齐后端真实路由

后台前端原来使用的是：

- `baseURL: /api/admin`
- 儿童审计接口：`/api/admin/auth/verify-audit-access`

后端真实路由是：

- `POST /api/v1/admin/...`

所以这次统一成：

- `baseURL: /api/v1/admin`
- 审计验证接口：`POST /api/v1/admin/auth/verify-audit-access`

### 3.3 后台登录必须能拿到 cookie 或 Authorization 头

后台前端主要通过 `httpOnly` cookie 维持登录状态，但后端以前只看 `Authorization: Bearer ...`。

这次后端 `deps.py` 已经补上：

- 先读 `Authorization` 头
- 如果没有，再读 `access_token` cookie

这样后台页面和手工 curl 测试都能用同一套认证逻辑。

## 4. 启动顺序

### 4.1 后端

在 `backend` 目录启动：

```powershell
cd C:\Users\Administrator\Desktop\demo\tonghua-project\tonghua-project\backend
.\.venv\Scripts\python.exe -m uvicorn app.main:app --host 127.0.0.1 --port 8000
```

健康检查：

```powershell
curl.exe http://127.0.0.1:8000/health
```

### 4.2 主站前端

在 `frontend/web-react` 目录启动：

```powershell
cd C:\Users\Administrator\Desktop\demo\tonghua-project\tonghua-project\frontend\web-react
npm install
npm run dev
```

打开：

- `http://localhost:5173`

### 4.3 管理后台

在 `admin` 目录启动：

```powershell
cd C:\Users\Administrator\Desktop\demo\tonghua-project\tonghua-project\admin
npm ci
npm run dev
```

打开：

- `http://localhost:5174`

## 5. 登录和授权

### 5.1 主站 Google 登录

Google Console 必须保持下面两项完全一致：

- JavaScript origin: `http://localhost:5173`
- Redirect URI: `http://localhost:5173/api/v1/auth/google/callback`

注意：

- JavaScript origin 不能带路径
- Redirect URI 不能少路径，也不能多结尾斜杠
- `5173` 是主站端口，不是后台端口

### 5.2 管理后台登录

后台登录页已经改成英文，登录入口仍然是后台前端页面：

- `http://localhost:5174`

开发环境下，后台登录账号是：

- 邮箱：`admin@tonghua.org`
- 密码：使用本地 `backend/.env` 里的 `SEED_ADMIN_PASSWORD`

这个值同时也被用于：

- 后台儿童审计页的访问码校验

也就是说，当前开发态里：

- 管理后台登录密码
- 儿童审计访问码

都来自同一个环境变量，避免两处密码漂移。

### 5.3 后台审计访问

儿童审计页现在调用：

- `POST /api/v1/admin/auth/verify-audit-access`

如果返回 `Insufficient permissions`，通常有两种原因：

1. 你没有用 `admin@tonghua.org` 登录。
2. 后端没有用最新代码重启。

## 6. 本次改动的行为变化

### 6.1 `admin/src/pages/LoginPage.tsx`

- 登录页文案改成英文。
- 登录成功后，把后端返回的 `nickname` 归一化为 `username`，避免顶栏显示空白。
- OAuth 按钮继续保留，但管理后台目前主要用邮箱密码登录。

### 6.2 `admin/src/pages/ChildAuditPage.tsx`

- 访问码验证接口改成真实后端路径。
- 只有通过验证后才会加载敏感儿童数据。

### 6.3 `backend/app/routers/admin.py`

- 新增 `verify-audit-access` 接口。
- 该接口要求管理员身份，并检查额外访问码。

### 6.4 `backend/app/deps.py`

- 认证依赖现在支持：
  - `Authorization` 头里的 Bearer token
  - `access_token` cookie
- 开发态下，非数字 `sub` 也可以从 token claims 直接还原用户。

### 6.5 `backend/app/routers/auth.py`

- 开发态管理员账号不再和数据库普通用户的数字 ID 撞号。
- mock 管理员 token 使用独立 subject，避免权限误判。
- 管理员开发密码统一走 `SEED_ADMIN_PASSWORD`。

## 7. 验证方法

下面这三个检查是当前最重要的：

```powershell
curl.exe http://127.0.0.1:8000/health
curl.exe -o NUL -w "%{http_code}" http://127.0.0.1:5173/
curl.exe -o NUL -w "%{http_code}" http://127.0.0.1:5174/
```

登录与审计验证：

```powershell
# 1. 先登录后台，保存 cookie
curl.exe -c cookies.txt -H "Content-Type: application/json" -d "{`"email`":`"admin@tonghua.org`",`"password`":`"<SEED_ADMIN_PASSWORD>`"}" http://127.0.0.1:8000/api/v1/auth/login

# 2. 再带 cookie 验证儿童审计访问码
curl.exe -b cookies.txt -H "Content-Type: application/json" -d "{`"accessCode`":`"<SEED_ADMIN_PASSWORD>`"}" http://127.0.0.1:8000/api/v1/admin/auth/verify-audit-access
```

## 8. 已知问题

主站 `frontend/web-react` 目前还有几处历史 TypeScript 报错，不属于这次后台合并造成的变更：

- `src/components/editorial/DonationPanel.tsx`
- `src/components/layout/Header.tsx`
- `src/pages/AuthCallback/index.tsx`
- `src/pages/Home/index.tsx`

当前情况是：

- `npm run dev` 能跑
- `npm run build` 仍会被这些历史问题拦住

如果以后要做发布，把这些旧问题单独清掉，不要和这次后台更新混在一起改。
