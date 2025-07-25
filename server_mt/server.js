const app = require('./app');
const port = process.env.PORT || 3000;
const { logServerEvent, logRequest } = require('./utils/requestLogger');

// 创建HTTP服务器
const server = require('http').createServer(app);

// 启动服务器
server.listen(port, () => {
  // 记录启动日志
  logServerEvent('started', port);

  // 记录服务器启动信息到控制台
  console.log(`服务器运行在 http://localhost:${port}`);

  // 记录服务启动时间
  const startTime = new Date().toISOString();
  console.log('可用接口:');
  console.log(`  GET  http://localhost:${port}/api/public`);
  console.log(`  GET  http://localhost:${port}/api/user (需认证)`);
  console.log(`  POST http://localhost:${port}/api/analytics (需管理员权限)`);
  console.log(`  GET  http://localhost:${port}/api/logs (管理员查看日志)`);
  console.log(`  GET  http://localhost:${port}/api/identity (查看客户端信息)`);

  // 记录版本和环境信息
  console.log(`
================================================
服务版本: 2.0.0
环境: ${process.env.NODE_ENV || 'development'}
启动时间: ${startTime}
服务PID: ${process.pid}
操作系统: ${process.platform}/${process.arch}
Node.js版本: ${process.version}
================================================
`);
});

// 处理退出信号
const shutdownSignals = ['SIGINT', 'SIGTERM'];
shutdownSignals.forEach(signal => {
  process.on(signal, () => {
    console.log(`\n接收到终止信号: ${signal}`);

    // 记录关闭事件
    logServerEvent('stopping', port);

    // 关闭服务器
    server.close(() => {
      logServerEvent('stopped', port);
      console.log('服务器已正常关闭');
      process.exit(0);
    });

    // 设置超时强制关闭
    setTimeout(() => {
      console.error('服务器未及时关闭，强制退出');
      process.exit(1);
    }, 5000);
  });
});

// 处理未捕获异常
process.on('uncaughtException', (err) => {
  console.error('未捕获的异常:', err.stack);

  // 记录异常事件
  logRequest(null, {
    method: 'SYSTEM',
    path: 'UNCAUGHT_EXCEPTION',
    status: 'CRITICAL',
    error: err.message,
    timestamp: new Date().toISOString()
  });

  // 尝试安全退出
  server.close(() => {
    process.exit(1);
  });
});
