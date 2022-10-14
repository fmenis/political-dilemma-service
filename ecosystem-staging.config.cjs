module.exports = {
  apps: [
    {
      name: 'dilemma',
      cwd: '/opt/dilemma-staging/dilemma/political-dilemma-service/political-dilemma-service',
      script: 'index.js',
      node_args: '-r dotenv/config',
      exp_backoff_restart_delay: 100,
      max_memory_restart: '500M',
      max_restarts: 10,
      error_file: '/var/log/dilemma/staging/err.log',
      out_file: '/var/log/dilemma/staging/out.log',
      log_file: '/var/log/dilemma/staging/combined.log',
    },
  ],
}
