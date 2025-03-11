module.exports = {
  apps: [
    {
      name: "EaseLite",
      script: "./dist/app.js",
      env_production: {
        NODE_ENV: "production",
      },
    },
  ],
};
