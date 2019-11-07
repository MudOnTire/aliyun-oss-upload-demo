const OSS = require('ali-oss');
const STS = OSS.STS;

const sts = new STS({
  accessKeyId: process.env.ALIYUN_OSS_RULE_ASSUMER_ACCESS_KEY,
  accessKeySecret: process.env.ALIYUN_OSS_RULE_ASSUMER_ACCESS_KEY_SECRET
});

async function assumeRole() {
  let res = await sts.assumeRole(
    'acs:ram::1582938330607257:role/uploader', null, 15 * 60, 'web-client');
  const { credentials } = res;
  return credentials;
}

async function getCredential(req, res, next) {
  try {
    const credential = await assumeRole();
    req.result = credential;
    next();
  } catch (err) {
    next(err);
  }
}

function upload(req, res, next) {
  next();
}

module.exports = { getCredential, upload };