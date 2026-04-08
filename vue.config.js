module.exports = {
  devServer: {
    port: 8080,
    // TODO: 对接后端时取消注释，配置代理转发
    // proxy: {
    //   '/api': {
    //     target: 'http://localhost:8000',
    //     changeOrigin: true,
    //     rewrite: path => path.replace(/^\/api/, '')
    //   }
    // }
  }
}
