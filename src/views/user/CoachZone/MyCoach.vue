<template>
  <div v-loading="loading">
    <el-card v-if="myCoach" style="max-width:480px">
      <div style="display:flex;align-items:center;gap:20px;margin-bottom:16px">
        <el-avatar :size="72" :src="myCoach.avatar">
          <i class="el-icon-user" />
        </el-avatar>
        <div>
          <div style="font-size:18px;font-weight:bold">{{ myCoach.nickname }}</div>
          <div style="color:#909399;font-size:13px;margin-top:4px">{{ myCoach.signature || '暂无简介' }}</div>
          <div style="color:#67C23A;font-size:12px;margin-top:6px">
            <i class="el-icon-check" /> 绑定于 {{ myCoach.bind_at ? myCoach.bind_at.slice(0,10) : '-' }}
          </div>
        </div>
      </div>
      <div style="display:flex;gap:10px">
        <el-button size="small" @click="$emit('view-detail', myCoach.coach_id)">查看主页</el-button>
        <el-button size="small" type="danger" @click="$emit('unbind')">解除绑定</el-button>
      </div>
    </el-card>

    <el-card v-else-if="pendingApply" style="max-width:480px">
      <div style="display:flex;align-items:center;gap:16px;margin-bottom:16px">
        <el-avatar :size="56">
          <i class="el-icon-user" />
        </el-avatar>
        <div>
          <div style="font-size:16px;font-weight:bold">{{ pendingApply.nickname }}</div>
          <el-tag type="warning" size="small" style="margin-top:6px">
            <i class="el-icon-loading" /> 申请中，等待教练处理
          </el-tag>
        </div>
      </div>
    </el-card>

    <el-empty v-else description="暂未绑定教练，去「找教练」申请吧" />
  </div>
</template>

<script>
export default {
  name: 'MyCoach',
  props: {
    loading: { type: Boolean, default: false },
    myCoach: { type: Object, default: null },
    pendingApply: { type: Object, default: null },
  },
}
</script>
