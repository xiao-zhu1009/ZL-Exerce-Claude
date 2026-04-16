【任务书】

1. 需求说明：
   管理员端数据统计面板的用户增长趋势图，支持按"月"或"日"两种粒度切换展示。

2. 实现思路：
   - 后端：GET /admin/statistics 新增 query 参数 granularity（month/day），
     按月返回近6个月数据，按日返回近30天数据，label 字段统一命名为 label。
   - 前端：图表卡片头部加 el-radio-group 切换粒度，切换时重新请求接口并刷新图表。

3. 前端要做什么：
   - api/admin.js：getStatistics(granularity) 传参
   - Statistics/index.vue：
     - data 增加 granularity('month')、chart 实例
     - 头部加 el-radio-group（按月/按日）
     - 抽出 loadChart(granularity) 方法，切换时调用

4. 后端要做什么：
   - admin_statistics.py：
     - 接口增加 granularity: str = Query("month") 参数
     - month：近6个月，date_format "%Y-%m"，补齐空月
     - day：近30天，date_format "%m-%d"，补齐空日
     - 返回字段 user_growth 中 key 统一用 label/count

5. 接口设计：
   GET /api/admin/statistics?granularity=month|day
   返回 user_growth: [{ "label": "4月", "count": 12 }, ...]
              或    [{ "label": "04-01", "count": 3 }, ...]

6. 数据表结构：无需变更
