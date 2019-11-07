const Joi = require('joi');

// require and configure dotenv, will load vars in .env in PROCESS.ENV
require('dotenv').config();

// define validation for all the env vars
const envVarsSchema = Joi.object({
  NODE_ENV: Joi.string()
    .allow(['development', 'production', 'test', 'provision'])
    .default('development'),
  PORT: Joi.number()
    .default(4040),
  MONGOOSE_DEBUG: Joi.boolean()
    .when('NODE_ENV', {
      is: Joi.string().equal('development'),
      then: Joi.boolean().default(true),
      otherwise: Joi.boolean().default(false)
    })
}).unknown()
  .required();

const { error, value: envVars } = Joi.validate(process.env, envVarsSchema);
if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

let mongo_host = envVars.MONGO_HOST;
let mongo_user,
  mongo_pass;
if (envVars.NODE_ENV === 'production') {
  mongo_host = envVars.MONGO_HOST_PRO;
  mongo_user = envVars.MONGO_USER;
  mongo_pass = envVars.MONGO_PASS;
}

const config = {
  env: envVars.NODE_ENV,
  port: envVars.PORT,
  mongooseDebug: envVars.MONGOOSE_DEBUG,
  jwtSecret: envVars.JWT_SECRET,
  mongo: {
    host: mongo_host,
    user: mongo_user,
    pass: mongo_pass
  },
  upyun: {
    serverPrefix: 'https://image.cnuip.com',
    bucketName: 'bucket-cnuip',
    operator: 'cnuipadmin',
    password: 'CA2203!A',
    maxFieldsSize: 100 * 1024 * 1024
  }
};

module.exports = config;
