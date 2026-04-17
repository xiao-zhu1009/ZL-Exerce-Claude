<template>
  <div>
    <div style="display:flex;gap:12px;margin-bottom:16px">
      <el-input
        :value="keyword"
        placeholder="搜索教练昵称"
        clearable
        style="width:220px"
        @input="$emit('update:keyword', $event)"
        @keyup.enter.native="$emit('search')"
      />
      <el-button type="primary" @click="$emit('search')">搜索</el-button>
    </div>

    <el-row :gutter="16" v-loading="loading">
      <el-col v-for="c in coaches" :key="c.id" :span="6" style="margin-bottom:16px">
        <el-card shadow="hover" body-style="padding:16px;text-align:center">
          <el-avatar :size="64" :src="c.avatar" style="margin-bottom:8px">
            <i class="el-icon-user" />
          </el-avatar>
          <div style="font-weight:bold;font-size:15px;margin-bottom:4px">{{ c.nickname }}</div>
          <div style="color:#909399;font-size:12px;min-height:32px;padding:0 4px;overflow:hidden;
            text-overflow:ellipsis;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical">
            {{ c.signature || '暂无简介' }}
          </div>
          <div style="margin-top:10px;display:flex;gap:6px;justify-content:center">
            <el-button size="mini" @click="$emit('view-detail', c.id)">查看详情</el-button>
            <el-button
              size="mini"
              type="primary"
              :disabled="!!bindStatusMap[c.id]"
              @click="$emit('apply', c)"
            >{{ bindStatusMap[c.id] || '申请绑定' }}</el-button>
          </div>
        </el-card>
      </el-col>
      <el-col v-if="!loading && coaches.length === 0" :span="24">
        <el-empty description="暂无教练" />
      </el-col>
    </el-row>

    <el-pagination
      v-if="total > pageSize"
      background
      layout="prev,pager,next"
      :total="total"
      :page-size="pageSize"
      :current-page="page"
      style="margin-top:16px;text-align:right"
      @current-change="$emit('page-change', $event)"
    />
  </div>
</template>

<script>
export default {
  name: 'FindCoach',
  props: {
    loading: { type: Boolean, default: false },
    coaches: { type: Array, default: () => [] },
    keyword: { type: String, default: '' },
    page: { type: Number, default: 1 },
    pageSize: { type: Number, default: 12 },
    total: { type: Number, default: 0 },
    bindStatusMap: { type: Object, default: () => ({}) },
  },
}
</script>
