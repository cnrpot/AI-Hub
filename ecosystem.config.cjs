module.exports = {
  apps: [
    {
      name: 'ai-hub',
      script: './dist/server/entry.mjs',
      cwd: './',
      env: {
        NODE_ENV: 'production',
        PORT: 4321,
      },
      env_file: '.env',
      instances: 1,
      autorestart: true,
      max_restarts: 10,
      watch: false,
      exec_mode: 'fork',
    },
  ],
};
