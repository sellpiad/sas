const {createProxyMiddleware} = require("http-proxy-middleware")


module.exports = function(app) {

  const apiTarget = process.env.REACT_APP_API_TARGET || 'http://127.0.0.1:8080'; // 기본값으로 로컬 호스트 설정

  app.use(
    "/api",
    createProxyMiddleware({
      target: apiTarget,	
      changeOrigin: true,
    })
  );


};
