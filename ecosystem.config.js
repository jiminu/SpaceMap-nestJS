module.exports = {
  apps: [
    {
      name: 'Space Map',
      script: './dist/main.js',
      instances: 0,
      exec_mode: 'cluster',
      mongodburl:
        'mongodb://spacemapdb:voronoi1!@docdb-2021-10-07-08-59-30.cluster-cciu2wubcctl.ap-northeast-2.docdb.amazonaws.com:27017/?replicaSet=rs0&readPreference=secondaryPreferred&retryWrites=false',
    },
  ],
};
