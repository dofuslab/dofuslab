module.exports = {
  apps: [
    {
      name: 'app',
      cwd: '/var/www/production/current/client',
      script: 'node_modules/next/dist/bin/next',
      args: 'start -p 3000',
      interpreter: '/home/jeremy/.nvm/versions/node/v22.19.0/bin/node',

      // Options reference: https://pm2.keymetrics.io/docs/usage/application-declaration/
      instances: 1,
      autorestart: true,
      watch: true,
      env: {
        NODE_ENV: 'development',
      },
      // eslint-disable-next-line
      env_production: {
        NODE_ENV: 'production',
        GRAPHQL_URI: 'https://dofuslab.io/api/graphql',
        NEXT_PUBLIC_GRAPHQL_URI: 'https://dofuslab.io/api/graphql',
        GA_TRACKING_ID: 'UA-104212417-3',
      },
    },
  ],

  deploy: {
    production: {
      key: '/home/jeremy/.ssh/dofuslab_deploy_key',
      user: 'jeremy',
      host: '134.209.168.215',
      ref: 'origin/master',
      repo: 'git@github.com:dofuslab/dofuslab.git',
      path: '/var/www/production',
      ssh_options: 'StrictHostKeyChecking=no',
      'post-deploy':
        'cd client && yarn && yarn build && pm2 reload ecosystem.config.js --env production && pm2 save',
      env: {
        GRAPHQL_URI: 'https://dofuslab.io/api/graphql',
        NEXT_PUBLIC_GRAPHQL_URI: 'https://dofuslab.io/api/graphql',
        GA_TRACKING_ID: 'UA-104212417-3',
      },
    },
    branch: {
      key: '/home/jeremy/.ssh/id_rsa.pub',
      user: 'jeremy',
      host: '134.209.168.215',
      ref: process.env.DEPLOY_BRANCH,
      repo: 'git@github.com:dofuslab/dofuslab.git',
      path: '/var/www/production',
      ssh_options: 'StrictHostKeyChecking=no',
      'post-deploy':
        'cd client && yarn && yarn build && pm2 reload ecosystem.config.js --env branch && pm2 save',
      env: {
        GRAPHQL_URI: 'https://dofuslab.io/api/graphql',
        NEXT_PUBLIC_GRAPHQL_URI: 'https://dofuslab.io/api/graphql',
        GA_TRACKING_ID: 'UA-104212417-3',
      },
    },
  },
};
