【任务书】

1. 需求说明：
   管理员端数据统计面板当前展示的是硬编码假数据，需要对接真实后端接口，展示数据库中的真实统计数据。

2. 实现思路：
   后端新增 GET /admin/statistics 接口，查询各业务表的真实数量及近6个月用户注册趋势；
   前端 api/admin.js 中去掉 mock，改为真实请求；前端组件无需改动（数据结构保持一致）。

3. 前端要做什么：
   - src/api/admin.js：将 getStatistics() 的 mockResolve 替换为 request.get('/admin/statistics')

4. 后端要做什么：
   - 新建 api/admin_statistics.py，实现 GET /admin/statistics 接口
   - 统计：总用户数、活跃用户（status=1）、已上线动作数、已上线文章数、已上线课程数、预约总数
   - 用户增长趋势：按注册月份统计近6个月每月新增用户数
   - main.py 注册新路由

5. 接口设计：
   GET /api/admin/statistics
   权限：admin
   返回：
   {
     "code": 200,
     "msg": "success",
     "data": {
       "total_users": 100,
       "active_users": 80,
       "total_actions": 20,
       "total_articles": 15,
       "total_courses": 10,
       "total_reservations": 50,
       "user_growth": [
         { "month": "11月", "count": 10 },
         ...
       ]
     }
   }

6. 数据表结构：无需新建表，查询现有表：
   - users：total_users(is_deleted=0), active_users(status=1, is_deleted=0)
   - actions：status=1, is_deleted=0
   - diet_articles：status=1, is_deleted=0
   - courses：status in (1,2,3), is_deleted=0（已上线/满员/已结束）
   - reservations：is_deleted=0
   - users.created_at：近6个月按月分组统计新注册用户数
