module.exports = {
  apps: [
    {
      name: 'Space Map',
      script: './dist/main.js',
      instances: 0,
      exec_mode: 'cluster',
      mongodburl:
        'TEST/?replicaSet=rs0&readPreference=secondaryPreferred&retryWrites=false',
    },
  ],
};
