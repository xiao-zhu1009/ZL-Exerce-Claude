# 任务书：饮食中心（DietCenter）与训练中心对齐的 Tab + 子组件拆分

## 一、背景与目标

- **现状**：`src/views/user/DietCenter/index.vue` 体量较大（约 375 行），三个 Tab 中「我的饮食计划」「食物库」的逻辑、弹窗、样式都堆在入口页；仅「饮食记录」已拆为 `DietRecordPanel.vue`，目录不清晰。
- **目标**：参照 **`src/views/user/Training/index.vue`** 的写法：
  - 入口 `index.vue` **只负责**：外层容器、`el-tabs`（建议 `type="border-card"` 与训练中心视觉一致）、`activeTab`、`$route.query.tab` 同步、`tab-click` 时更新路由。
  - **每个 Tab 对应一个独立子组件**，业务、接口请求、专属弹窗与样式尽量下沉到子组件文件。
- **路由**：保持 **`router/index.js` 仍以单路由** `path: 'diet'` → `DietCenter/index.vue`（与训练 `training` 一致），**不**为三个 Tab 拆成三条独立路由，避免与「训练中心」模式不一致。

## 二、参照标准（训练中心）

| 项目 | 训练中心做法 | 饮食中心应对齐 |
|------|----------------|------------------|
| 布局 | 根节点 `class="training-center"` + `el-tabs` `border-card` | 根节点如 `diet-center` + 同样 `border-card` |
| 子页 | 各 `el-tab-pane` 内 `<workout-log />` 等独立组件 | 三 Tab 各对应一个 PascalCase 组件 |
| 懒加载 | 多数 Tab `lazy` + `destroy-on-hide`（动作库例外按需） | 计划 / 记录 / 食物库可按需 `lazy`，与性能权衡一致即可 |
| 路由 | `applyRouteTab` + `onMainTabClick` 写回 `query`（如 `tab=actions`） | 扩展 `query.tab`：**记录**、**食物库** 可深链；默认无参或 `tab` 缺省为「我的饮食计划」 |

## 三、目标目录与文件职责

```
src/views/user/DietCenter/
├── index.vue          # 壳：Tabs + 路由同步 + 注册子组件
├── DietRecord.vue     # 已存在：饮食记录（可微调 props/事件，尽量少改）
├── DietPlan.vue       # 新建：我的饮食计划（列表、筛选、详情弹窗及原 Tab1 相关样式）
└── FoodLibrary.vue    # 新建：食物库（搜索、分类、卡片列表、快速加入今日记录弹窗及样式）
```

**说明（文案）**：当前产品文案为「**我的饮食计划**」。若业务要求显示为「我的训练计划」，仅改 `el-tab-pane` 的 `label`，不改动接口与 `name` 即可。

## 四、拆分边界（从现有 `index.vue` 迁出）

### 4.1 `DietPlan.vue`（对应 Tab：`name="dietPlans"`）

- 迁入：`dietPlanStatus`、筛选 `el-radio-group`、`dietPlanList`、`dietPlanLoading`、`fetchDietPlans`、`openDietPlanDetail`、`dietPlanDetail*`、`dietPlanDetailVisible`、`DIET_PLAN_STATUS` 及 `getDietPlans` / `getDietPlanDetail` 调用。
- 迁入模板：原第一个 `el-tab-pane` 内全部内容 + **饮食计划详情** `el-dialog`（整块与计划强相关）。
- 迁入样式：`.plan-card`、`.plan-desc`、`.meal-*` 等仅用于计划详情的 scoped 样式。

### 4.2 `FoodLibrary.vue`（对应 Tab：`name="foods"`）

- 迁入：`foodKeyword`、`foodCategory`、`foodList`、`foodCategories`、`foodLoading`、`fetchFoods`、`openQuickAdd`、`quickVisible`、`quickForm`、`quickSubmitting`、`submitQuick`、`quickCalc`（可保留为子组件 `computed`）、`searchFoods` / `addDietRecord`。
- 迁入模板：原第三个 `el-tab-pane` 内卡片列表 + **快速添加** `el-dialog`。
- 迁入样式：`.food-card`、`.nutrient-*`、`.quick-preview` 等。

### 4.3 跨 Tab 行为（添加记录成功后刷新「饮食记录」）

- **现状**：`submitQuick` 内通过 `this.$refs.dietRecord` 若当日则 `fetchRecords()`。
- **拆分后推荐**：
  - `FoodLibrary` 在添加成功时 **`$emit('record-added', { record_date })`**（或仅 `emit('record-added')`）。
  - `index.vue` 监听：`@record-added="onFoodRecordAdded"`，在方法内 `this.$refs.dietRecord && this.$refs.dietRecord.fetchRecords(...)`（需与 `DietRecord` 的日期字段约定一致，与现逻辑相同即可）。
  - 避免子组件间硬 ref 兄弟组件。

### 4.4 `DietRecord.vue`

- 保持为主内容组件；若需被父级 ref 调用 `fetchRecords`，确保方法名与参数与现有一致或文档化。

### 4.5 `index.vue`（瘦身後）

- `template`：与 `Training/index.vue` 结构类似的三块 `el-tab-pane`，内分别为 `<diet-plan />`、`<diet-record ref="dietRecord" />`、`<food-library @record-added="..." />`。
- `data`：仅保留 `activeTab`（及若需父级持有的极简状态）。
- `watch`：`$route.query.tab` → `applyRouteTab`。
- `methods`：`applyRouteTab`（支持 `record`、`foods`，缺省为 `dietPlans`）、`onMainTabClick`（同步 `router.replace`，规则见下节）。
- **删除**：已下沉到子组件的 data / methods / 弹窗 / 样式。

## 五、路由与 `query.tab` 约定（建议）

| URL 示例 | `activeTab` |
|----------|-------------|
| `/user/diet` | `dietPlans` |
| `/user/diet?tab=record` | `record` |
| `/user/diet?tab=foods` | `foods` |

- `onMainTabClick`：切到「饮食记录」时 `query.tab=record`；切到「食物库」时 `query.tab=foods`；切回「我的饮食计划」时 **删除** `tab`（与训练中心非特殊 Tab 时删 `tab` 一致）。
- `router/index.js`：已有 `diet/record` → redirect 带 `tab=record`；**可选**增加 `diet/foods` → `redirect` 到 `/user/diet?tab=foods`，便于收藏夹（非必须）。

## 六、实施步骤 checklist

1. [ ] 新建 `DietPlanPanel.vue`，从 `index.vue` 剪切计划 Tab + 详情弹窗及相关逻辑样式，自测列表与详情。
2. [ ] 新建 `FoodLibraryPanel.vue`，剪切食物库 Tab + 快速添加弹窗及相关逻辑样式；实现 `record-added` 事件。
3. [ ] 重写 `index.vue`：对齐训练中心的 `el-tabs` 写法、注册三个子组件、实现 `applyRouteTab` / `onMainTabClick`、连接 `record-added`。
4. [ ] 联调：默认 Tab、从外链进入 `?tab=record` / `?tab=foods`、食物库快速添加后饮食记录在「今日」下刷新。
5. [ ]（可选）`router/index.js` 增加 `diet/foods` 重定向。
6. [ ] 全局搜索对 `DietCenter` 的引用（若有跳转 `/user/diet`）确认无需改路径。

## 七、验收标准

- 饮食中心三个 Tab 功能与拆分前一致（计划筛选/详情、记录、食物搜索/快速添加）。
- `index.vue` 行数显著减少，职责仅为 Tab 壳 + 路由同步 + 必要跨子组件协调。
- 与训练中心在 **Tabs 类型、路由同步模式** 上观感与行为一致（允许合理差异如 `lazy` 策略）。

## 八、风险与注意

- **Element UI `lazy`**：首次切换 Tab 才挂载子组件；若 `record-added` 依赖 `recordPanel`，仅在用户打开过记录 Tab 时 ref 才存在——与当前「先打开记录 Tab 再添加」边缘场景一致；若需「未打开记录 Tab 也能静默刷新」，可改为事件总线或 Vuex，本任务书默认保持与现逻辑等价即可。
- **样式 scoped**：拆出后类名若依赖父级，需随组件带走或改为 BEM，避免样式丢失。

---

**文档版本**：与实现前评审用；实现完成后可在本文件末尾追加「变更记录」与 PR 链接。
