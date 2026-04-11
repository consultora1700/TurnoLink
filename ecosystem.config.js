module.exports = {
  apps: [
    {
      name: 'turnolink-api',
      script: './apps/api/dist/main.js',
      instances: 2,
      exec_mode: 'cluster',
      max_memory_restart: '512M',
      kill_timeout: 5000,
      listen_timeout: 10000,
      max_restarts: 15,
      min_uptime: '10s',
      restart_delay: 2000,
      env: {
        NODE_ENV: 'production',
        PORT: 3001,
      },
    },
    {
      name: 'web',
      script: './apps/web/.next/standalone/apps/web/server.js',
      instances: 2,
      exec_mode: 'cluster',
      max_memory_restart: '512M',
      kill_timeout: 5000,
      listen_timeout: 10000,
      max_restarts: 15,
      min_uptime: '10s',
      restart_delay: 2000,
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
        HOSTNAME: '0.0.0.0',
      },
    },
  ],
};
