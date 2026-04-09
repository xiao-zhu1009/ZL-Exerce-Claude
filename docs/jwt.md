# 【任务书】JWT 登录验证接入

---

## 1. 需求说明

在现有登录流程中接入 JWT（JSON Web Token）验证机制：
- 用户登录成功后，后端签发 JWT Token
- 前端将 Token 存入 localStorage，后续请求自动携带
- 后端对受保护接口进行 Token 校验，过期或无效则返回 401
- 前端拦截 401 响应，自动跳转登录页

---

## 2. 实现思路

```
登录 → 后端验证账号密码 → 签发 JWT → 前端存储 Token
→ 后续请求 Header 携带 Bearer Token
→ 后端中间件/依赖注入校验 Token → 合法则放行，否则返回 401
→ 前端拦截 401 → 清除本地 Token → 跳转 /login
```

---

## 3. 前端要做什么

### 3.1 src/api/auth.js — 取消 mock，对接真实接口

```js
import request from '../utils/request'

export function login(data) {
  return request.post('/auth/login', data)
}

export function register(data) {
  return request.post('/auth/register', data)
}
```

### 3.2 src/utils/request.js — 修改 baseURL 指向后端

```js
baseURL: 'http://localhost:8000'  // 改掉 '/api'
```

> 请求拦截（注入 Token）和响应拦截（401 跳转）已实现，无需修改。

### 3.3 登录成功后存储 Token

```js
import { setToken, setUser } from '@/utils/auth'

login(formData).then(res => {
  setToken(res.data.token)
  setUser({ id: res.data.id, username: res.data.username, role: res.data.role, nickname: res.data.nickname })
  this.$router.push('/')
})
```

### 3.4 退出登录时清除 Token

```js
import { removeToken, removeUser } from '@/utils/auth'

function logout() {
  removeToken()
  removeUser()
  this.$router.push('/login')
}
```

> 路由守卫已在 router/index.js 中实现，无需修改。

---

## 4. 后端要做什么

### 4.1 安装依赖

```bash
pip install python-jose[cryptography] passlib[bcrypt]
```

### 4.2 新建 utils/jwt.py — Token 签发与解析

```python
from datetime import datetime, timedelta
from jose import JWTError, jwt

SECRET_KEY = "换成随机长字符串"
ALGORITHM = "HS256"
EXPIRE_MINUTES = 60 * 24  # 24小时

def create_access_token(data: dict) -> str:
    payload = {**data, "exp": datetime.utcnow() + timedelta(minutes=EXPIRE_MINUTES)}
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)

def decode_token(token: str) -> dict:
    return jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
```

### 4.3 新建 deps.py — 受保护接口的依赖注入

```python
from fastapi import Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from utils.jwt import decode_token
from jose import JWTError

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

async def get_current_user(token: str = Depends(oauth2_scheme)):
    try:
        return decode_token(token)
    except JWTError:
        raise HTTPException(status_code=401, detail="Token 无效或已过期")
```

### 4.4 修改登录接口 routers/auth.py

```python
from passlib.context import CryptContext
from utils.jwt import create_access_token

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

class LoginForm(BaseModel):
    username: str
    password: str

@router.post("/login")
async def login(form: LoginForm, db=Depends(get_db)):
    user = await db.execute(select(User).where(User.username == form.username))
    user = user.scalar_one_or_none()
    if not user or not pwd_context.verify(form.password, user.password_hash):
        raise HTTPException(status_code=400, detail="用户名或密码错误")
    token = create_access_token({"user_id": user.id, "role": user.role})
    return {
        "code": 200,
        "msg": "登录成功",
        "data": {
            "id": user.id,
            "username": user.username,
            "role": user.role,
            "nickname": user.nickname,
            "token": token
        }
    }
```

### 4.5 受保护接口示例

```python
from deps import get_current_user

@router.get("/profile")
async def get_profile(current_user=Depends(get_current_user)):
    return {"code": 200, "msg": "ok", "data": current_user}
```

---

## 5. 接口设计

| 方法 | 路径 | 说明 | 是否需要 Token |
|------|------|------|---------------|
| POST | /auth/login | 登录，返回 JWT Token | 否 |
| POST | /auth/register | 注册新用户 | 否 |
| GET  | /auth/profile | 获取当前用户信息 | 是 |

**登录请求体：**
```json
{ "username": "user01", "password": "123456" }
```

**登录响应体：**
```json
{
  "code": 200,
  "msg": "登录成功",
  "data": {
    "id": 1,
    "username": "user01",
    "role": "user",
    "nickname": "健身达人",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**受保护接口请求头：**
```
Authorization: Bearer <token>
```

---

## 6. 数据表结构

```sql
CREATE TABLE users (
  id            INT PRIMARY KEY AUTO_INCREMENT,
  username      VARCHAR(50)  NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role          ENUM('user','coach','admin') NOT NULL DEFAULT 'user',
  nickname      VARCHAR(50),
  created_at    DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

> 如已有 users 表，只需确保有 `password_hash` 字段（bcrypt 哈希，不存明文）。

---

## 7. 运行说明

1. 后端安装依赖：`pip install python-jose[cryptography] passlib[bcrypt]`
2. 修改 `SECRET_KEY` 为随机长字符串（生产环境必须修改）
3. 前端 `src/api/auth.js` 去掉 mock，改为真实请求
4. 前端 `src/utils/request.js` 的 `baseURL` 改为 `http://localhost:8000`
5. 启动后端：`uvicorn main:app --reload`
6. 启动前端：`npm run serve`
