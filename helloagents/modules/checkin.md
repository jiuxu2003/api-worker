# checkin 模块

## 职责
- 维护签到站点列表与状态
- 执行一键签到并汇总结果
- 提供手动签到跳转入口
- 写回今日签到结果到站点表

## 接口定义
- `GET /api/checkin-sites`: 获取签到站点列表
- `POST /api/checkin-sites`: 新增签到站点
- `PATCH /api/checkin-sites/:id`: 更新签到站点
- `DELETE /api/checkin-sites/:id`: 删除签到站点
- `POST /api/checkin-sites/checkin-all`: 一键签到（仅启用站点）

## 行为规范
- 一键签到仅执行 `status=active` 的站点
- 一键签到会跳过 `last_checkin_date` 已是北京时间当日且状态为成功/已签的站点
- 手动签到优先打开 `checkin_url`，为空则打开 `base_url`
- 签到执行使用后端代理调用 `{base_url}/api/user/checkin`（GET 检查，POST 签到）
- 请求头必须携带 `New-Api-User`（值来自站点的 `userid` 配置）
- 签到结果写回 `checkin_sites.last_checkin_*` 字段（date/status/message/at）

## 依赖关系
- `worker` 路由与 D1 数据表 `checkin_sites`
- `admin-ui` 负责前端交互与结果展示
