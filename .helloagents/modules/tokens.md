# tokens 模块

## 职责
- 管理 API 令牌的生成与生命周期
- 维护额度与已用额度统计
- 控制令牌启用/禁用状态

## 接口定义
- `GET /api/tokens` 令牌列表
- `POST /api/tokens` 生成令牌
- `PATCH /api/tokens/:id` 更新令牌
- `DELETE /api/tokens/:id` 删除令牌
- `GET /api/tokens/:id/reveal` 再次查看令牌

## 行为规范
- 令牌可通过 reveal 接口再次查看
- 默认允许所有渠道
- 可选限制允许的渠道列表（`allowed_channels`），为空或未设置表示全开
- 额度消耗由代理调用记录
- `expires_at` 为可选字段，留空表示永不过期
- 管理台以北京时间输入过期时间，服务端统一转为 UTC 存储
- 令牌过期后直接拒绝请求（`token_expired`），不自动更改状态
- 管理台支持编辑名称/额度/状态/过期时间/允许渠道，新增令牌默认复制到剪贴板
- 管理台列表展示创建时间与 key_prefix 前缀、过期时间

## 依赖关系
- `tokens` 表
- `usage` 模块（用量回写）
