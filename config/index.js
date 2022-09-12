
try {
  // ../sample_proxy-table.local.json 참조 //
  
} catch (e) {}

module.exports = {
  dev: {

    // Paths
    assetsSubDirectory: './',
    assetsPublicPath: '/',
    proxyTable: {
      '/api/v1': {
         target: "http://localhost:80",
        changeOrigin: true,
      }
    },

    // Various Dev Server settings
    host: 'local.opsnow.com', // can be overwritten by process.env.HOST
    port: 4000, // can be overwritten by process.env.PORT, if port is in use, a free one will be determined
    
  },
}
