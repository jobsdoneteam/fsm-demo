module.exports = {
  apps: [{
    name: 'fsm-demo',
    script: 'node_modules/.bin/next',
    args: 'start -p 3001',
    cwd: '/var/www/fsm-demo',
    instances: 1,
    autorestart: true,
    watch: false,
    env: { NODE_ENV: 'production', PORT: 3001 },
  }],
}
