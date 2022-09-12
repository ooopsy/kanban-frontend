module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
  proxyTable: {
    '/api/v1': {
       target: "http://local.opsnow.com:8080",
      // target: target,
      changeOrigin: true,
    }
  },
};
