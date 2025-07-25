// ecosystem.config.js
const os = require('os');

module.exports = {
  apps: [{
    name: 'my-node-app',
    script: './server.js',
    cwd: __dirname,

    // 根据CPU核心数自动调整实例数
    instances: os.cpus().length,

    // 高级监听配置
    watch: process.env.NODE_ENV === 'development',
    watch_options: {
      usePolling: true,
      interval: 1000,
      binaryInterval: 3000
    },

    // 环境变量配置
    env: {
      NODE_ENV: 'development',
      PORT: 3000,
      DEBUG: 'app:*,middleware:*',
      LOG_LEVEL: 'debug'
    },

    env_staging: {
      NODE_ENV: 'staging',
      PORT: 8080,
      DEBUG: 'app:*',
      LOG_LEVEL: 'info'
    },

    env_production: {
      NODE_ENV: 'production',
      PORT: 80,
      DEBUG: false,
      LOG_LEVEL: 'warn'
    },

    // 日志配置
    log_date_format: 'YYYY-MM-DD HH:mm:ss.SSS',
    error_file: './logs/pm2-error.log',
    out_file: './logs/pm2-combined.log',
    pid_file: './logs/pm2.pid',

    // 高级重启策略
    min_uptime: '60s',
    max_restarts: 10,
    restart_delay: 5000,
    exp_backoff_restart_delay: 100,

    // 性能监控
    max_memory_restart: '800M',

    // 集群配置
    exec_mode: 'cluster',
    instance_var: 'INSTANCE_ID',

    // 优雅关闭
    listen_timeout: 8000,
    kill_timeout: 16000,
    wait_ready: true,
    shutdown_with_message: true,

    // 源映射支持
    source_map_support: true,

    // 高级功能
    vizion: true,           // 版本控制集成
    autorestart: true,
    cron_restart: '0 3 * * *', // 每天凌晨3点重启
    time: true
  }]
};
