export const EnvConfiguration = () => ({
  environment: process.env.NODE_ENV || 'dev',
  mongodb: process.env.MONGO_DB || 'mongodb://localhost:27017/pokemon',
  port: process.env.PORT || 3001,
  defaultLimit: process.env.DEFAULT_LIMIT || 10,
});
