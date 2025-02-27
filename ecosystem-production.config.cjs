module.exports = {
  apps: [
    {
      name: 'dilemma-production',
      cwd: '/opt/prod-dilemma/_work/political-dilemma-service/political-dilemma-service',
      script: 'index.js',
      node_args: '-r dotenv/config',
      exp_backoff_restart_delay: 100,
      max_memory_restart: '500M',
      max_restarts: 10,
      error_file: '/var/log/dilemma/err.log',
      out_file: '/var/log/dilemma/out.log',
      log_file: '/var/log/dilemma/combined.log',
    },
  ],
}
