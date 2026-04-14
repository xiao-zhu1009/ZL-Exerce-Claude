# 数据看板设计claude版

---

## 【任务书】

**1. 需求说明：**
改造用户端数据看板，从当前的 mock 数据 + 静态图表，升级为对接真实后端接口的完整数据看板。展示用户的训练、饮食、身体指标等多维度数据，图表丰富、信息清晰。

**2. 实现思路：**
- 后端新增 `GET /user/dashboard` 聚合接口，一次性返回看板所需全部数据（本周训练统计、今日饮食、体重趋势、训练趋势），减少前端多次请求
- 前端重写 `Dashboard/index.vue`，使用 ECharts 渲染多个图表，替换 mock 数据

**3. 前端要做什么：**
- 重写 `src/views/user/Dashboard/index.vue`：
  - 顶部 4 张概览卡片（本周训练次数、本周消耗卡路里、今日摄入卡路里、当前体重）
  - 体重变化折线图（近 30 天 body_records）
  - 本周训练时长柱状图（周一~周日每天训练分钟数）
  - 近 7 天热量摄入折线图（diet/records/range 接口）
  - 训练类型分布饼图（training/stats/type 接口）
- 修改 `src/api/user.js`：`getDashboard` 改为真实请求 `GET /user/dashboard`

**4. 后端要做什么：**
- `api/user.py` 新增 `GET /user/dashboard` 聚合接口，返回：
  - `workout_count_week`：本周训练次数
  - `calories_burned_week`：本周消耗卡路里合计
  - `calories_intake_today`：今日摄入卡路里合计
  - `current_weight`：最新体重（body_records 最近一条）
  - `body_records`：近 30 天体重记录列表 `[{date, weight}]`
  - `workout_week`：本周每天训练时长 `[{date, duration, calories}]`（周一~周日，无记录补 0）
  - `workout_type_stats`：近 30 天训练类型分布 `[{type, count}]`
  - `diet_week`：近 7 天每日热量摄入 `[{date, calories}]`

**5. 接口设计：**

```
GET /api/user/dashboard
```

需登录（JWT），无请求参数。

响应 data 结构：
```json
{
  "workout_count_week": 4,
  "calories_burned_week": 1800,
  "calories_intake_today": 2100,
  "current_weight": 74.5,
  "body_records": [
    { "date": "2026-03-15", "weight": 76.0 },
    { "date": "2026-04-01", "weight": 74.5 }
  ],
  "workout_week": [
    { "date": "2026-04-07", "day": "周一", "duration": 60, "calories": 400 },
    { "date": "2026-04-08", "day": "周二", "duration": 0,  "calories": 0   }
  ],
  "workout_type_stats": [
    { "type": "力量训练", "count": 8 },
    { "type": "有氧运动", "count": 5 }
  ],
  "diet_week": [
    { "date": "2026-04-08", "calories": 2100 },
    { "date": "2026-04-09", "calories": 1850 }
  ]
}
```

**6. 数据表结构（复用现有，无需新建）：**

| 表名 | 用途 |
|------|------|
| `body_records` | 体重趋势（record_date, weight） |
| `workout_records` | 训练记录（record_date, duration, calories, workout_type） |
| `diet_records` | 饮食记录（record_date, calories） |

---

## 二、文件变更清单

| 文件 | 操作 | 说明 |
|------|------|------|
| `api/user.py` | 修改 | 新增 `GET /user/dashboard` 聚合接口 |
| `CRUD/training.py` | 修改 | 新增 `get_dashboard_stats` 查询函数 |
| `src/views/user/Dashboard/index.vue` | 重写 | 完整看板页面，4 卡片 + 4 图表 |
| `src/api/user.js` | 修改 | `getDashboard` 改为真实请求 |

---

## 三、前端页面布局

```
┌─────────────────────────────────────────────────────┐
│  本周训练次数  │ 本周消耗卡路里 │ 今日摄入卡路里 │ 当前体重  │  ← 4 卡片
├───────────────────────────┬─────────────────────────┤
│     体重变化折线图（30天）  │   本周训练时长柱状图      │  ← 第一行图表
├───────────────────────────┼─────────────────────────┤
│   近7天热量摄入折线图       │   训练类型分布饼图        │  ← 第二行图表
└───────────────────────────┴─────────────────────────┘
```

---

## 四、后端聚合逻辑说明

`GET /user/dashboard` 内部并行查询：
1. 本周（周一~今天）`workout_records`：统计 count、sum(calories)
2. 今日 `diet_records`：sum(calories)
3. 近 30 天 `body_records`：按 record_date 升序，取 weight
4. 本周每天 `workout_records`：按 record_date group，补全周一~周日
5. 近 30 天 `workout_records`：按 workout_type group，统计 count
6. 近 7 天 `diet_records`：按 record_date group，统计 sum(calories)
