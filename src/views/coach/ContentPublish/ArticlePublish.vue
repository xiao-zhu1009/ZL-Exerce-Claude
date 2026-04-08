<template>
  <div>
    <h2 style="margin-bottom:20px">文章投稿</h2>
    <el-row :gutter="20">
      <el-col :span="14">
        <el-card>
          <div slot="header">发布饮食文章</div>
          <el-form :model="form" label-width="90px">
            <el-form-item label="文章标题"><el-input v-model="form.title" /></el-form-item>
            <el-form-item label="文章分类">
              <el-select v-model="form.category" style="width:100%">
                <el-option v-for="c in categories" :key="c" :label="c" :value="c" />
              </el-select>
            </el-form-item>
            <!-- TODO: 对接后端后替换为 el-upload 组件上传封面图 -->
            <el-form-item label="封面图URL"><el-input v-model="form.cover_img" placeholder="暂时填写图片链接" /></el-form-item>
            <!-- TODO: 对接后端后替换为 vue-quill-editor 富文本编辑器 -->
            <el-form-item label="文章正文">
              <el-input v-model="form.content" type="textarea" :rows="10" placeholder="请输入文章内容（对接后端后将替换为富文本编辑器）" />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="submit">提交审核</el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </el-col>

      <el-col :span="10">
        <el-card>
          <div slot="header">我发布的文章</div>
          <el-table :data="myArticles" size="small">
            <el-table-column prop="title" label="标题" show-overflow-tooltip />
            <el-table-column prop="category" label="分类" width="80" />
            <el-table-column label="状态" width="90">
              <template slot-scope="scope">
                <el-tag :type="statusType(scope.row.status)" size="small">{{ statusLabel(scope.row.status) }}</el-tag>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import { publishArticle, getMyArticles } from '../../../api/diet'

export default {
  name: 'ArticlePublish',
  data() {
    return {
      form: { title: '', category: '', cover_img: '', content: '' },
      myArticles: [],
      categories: ['增肌餐', '减脂餐', '均衡饮食', '补剂知识']
    }
  },
  async created() {
    // TODO: 对接后端 GET /diet/articles/mine
    const res = await getMyArticles()
    this.myArticles = res.data
  },
  methods: {
    async submit() {
      if (!this.form.title) return this.$message.warning('请填写文章标题')
      // TODO: 对接后端 POST /diet/articles（教练发布后状态为待审核）
      const res = await publishArticle(this.form)
      this.myArticles.unshift(res.data)
      this.form = { title: '', category: '', cover_img: '', content: '' }
      this.$message.success('提交成功，等待审核')
    },
    statusLabel(s) { return ['待审核', '已上线', '已驳回', '已下架'][s] },
    statusType(s) { return ['warning', 'success', 'danger', 'info'][s] }
  }
}
</script>
