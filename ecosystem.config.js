module.exports = {
  apps: [
    {
      name: "naksharix",
      script: ".next/standalone/server.js",
      instances: "max",
      exec_mode: "cluster",
      max_memory_restart: "750M",
      time: true,
      env: {
        NODE_ENV: "production",
        PORT: 3000,
        HOSTNAME: "0.0.0.0",
        NEXT_PUBLIC_APP_NAME: "Naksharix",
        NEXT_PUBLIC_APP_URL: "https://naksharix.com"
      },
      error_file: "./logs/naksharix-error.log",
      out_file: "./logs/naksharix-out.log",
      merge_logs: true,
      kill_timeout: 5000,
      wait_ready: false,
      listen_timeout: 10000,
      exp_backoff_restart_delay: 100
    },
    {
      name: "naksharix-migrate",
      script: "node_modules/prisma/build/index.js",
      args: "migrate deploy",
      autorestart: false,
      watch: false,
      env: {
        NODE_ENV: "production"
      }
    }
  ]
};
