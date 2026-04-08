<template>
  <div style="text-align:center;padding:100px 0">
    <div style="font-size:80px">🚫</div>
    <h2 style="color:#F56C6C;margin:20px 0">403 - 权限不足</h2>
    <p style="color:#999">您没有访问该页面的权限</p>
    <el-button type="primary" @click="$router.push('/login')">返回登录</el-button>
  </div>
</template>

<script>
export default { name: 'Forbidden' }
</script>
