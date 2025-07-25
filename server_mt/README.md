### PM2 Nodejs ECOSYSTEM

### pm2 进程管理

###### 开发环境

```
pm2 start ecosystem.config.js
```

###### 生产环境

```
pm2 start ecosystem.config.js --env production
```

### 1.常用命令

```shell
# 查看应用状态
pm2 list

# 监控资源使用
pm2 monit

# 查看日志
pm2 logs

# 重启应用
pm2 restart my-node-app

# 停止应用
pm2 stop my-node-app

# 删除应用
pm2 delete my-node-app

# 保存当前进程列表
pm2 save

# 设置开机自启
pm2 startup
pm2 save
```

### 2.多环境

```javascript
// ecosystem.config.js
module.exports = {
  apps: [
    {
      name: 'api-server',
      script: './server.js',
      env: {
        APP_ROLE: 'api',
        PORT: 3000
      }
    },
    {
      name: 'worker-server',
      script: './worker.js',
      env: {
        APP_ROLE: 'worker',
        PORT: 3001
      }
    }
  ]
};
```

### 3.环境变量

```shell
# 安装 dotenv 模块
npm install dotenv
```

```javascript
// server.js
require('dotenv').config();
console.log(process.env.APP_ROLE);
console.log(process.env.PORT);
```

```environment
# .env
DB_HOST=localhost
DB_USER=root
DB_PASS=s1mpl3
```

```environment
env: {
  DB_HOST: process.env.DB_HOST,
  DB_USER: process.env.DB_USER,
  DB_PASS: process.env.DB_PASS
}
```

### 4.日志轮转

```shell
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 100M
pm2 set pm2-logrotate:retain 30
pm2 set pm2-logrotate:compress true
```

### 5.监控与告警

```shell
# 安装监控模块
pm2 install pm2-server-monit

# 设置告警
pm2 set pm2-server-monit:thresholds.cpu 80
pm2 set pm2-server-monit:thresholds.mem 70
pm2 set pm2-server-monit:notify.email "admin@example.com"
```

### 其他优化

```javascript
// 在应用中添加健康检查端点
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'UP',
    timestamp: new Date(),
    uptime: process.uptime()
  });
});
```

### Docker集成

```dockerfile
FROM node:18-alpine

# 创建工作目录
WORKDIR /app

# 复制依赖文件
COPY package*.json ./

# 安装依赖
RUN npm install --production

# 复制应用代码
COPY . .

# 暴露端口
EXPOSE 3000

# 启动命令
CMD ["pm2-runtime", "ecosystem.config.js", "--env", "production"]
```

```shell
docker build -t my-node-app .
docker run -d -p 3000:3000 --name my-app my-node-app
```
