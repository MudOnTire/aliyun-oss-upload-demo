const Joi = require('joi');

module.exports = {
  // POST /api/accounts
  register: {
    body: {
      username: Joi.string().required().error(() => ({ message: '请填写用户名' })),
      password: Joi.string().min(6).error(() => ({ message: '密码至少为6位' }))
    }
  },
  // POST /api/accounts/login
  login: {
    body: {
      username: Joi.string().required().error(() => ({ message: '请填写用户名' })),
      password: Joi.string().min(6).error(() => ({ message: '密码至少为6位' }))
    }
  },
  // POST /api/accounts/loginWithCode
  loginWithCode: {
    body: {
      username: Joi.string().required().error(() => ({ message: '请填写用户名' })),
      code: Joi.string().min(6).error(() => ({ message: '请填写验证码' }))
    }
  },
  createProject: {
    body: {
      name: Joi.string().required().error(() => ({ message: '请填写项目名称' })),
      thumbnail: Joi.string().required().error(() => ({ message: '请上传项目缩略图' })),
      images: Joi.array().min(1).error(() => ({ message: '请上传项目banner' })),
      detail: Joi.string().required().error(() => ({ message: '请编辑项目详情' })),
      prices: Joi.object().error(() => ({ message: '请编辑项目价格' }))
    }
  },
  createOrder: {
    body: {
      receiver: Joi.string().required().error(() => ({ message: '收件人不能为空' })),
      phone: Joi.string().required().error(() => ({ message: '收件人电话不能为空' })),
      address: Joi.string().required().error(() => ({ message: '收件地址不能为空' })),
      goods: Joi.array().required().min(1).error(() => ({ message: '购买商品不能为空' })),
      totalAmount: Joi.number().min(0).error(() => ({ message: '付款金额不能小于0' }))
    }
  },
  // POST /api/users
  createUser: {
    body: {
      name: Joi.string().required().error(() => ({ message: '请填写昵称' })),
      phone: Joi.string().regex(/^[1-9][0-9]{10}$/).error(() => ({ message: '手机号格式不正确' })),
      password: Joi.string().min(6).error(() => ({ message: '密码至少为6位' })),
      address: Joi.string().required().error(() => ({ message: '请填写地址' })),
      role: Joi.string().valid(['admin', 'user']).required().error(() => ({ message: '请选择用户角色' }))
    }
  },

  // UPDATE /api/users/:userId
  updateUser: {
    body: {
      username: Joi.string().required(),
      mobileNumber: Joi.string().regex(/^[1-9][0-9]{9}$/).required()
    },
    params: {
      userId: Joi.string().hex().required()
    }
  },

  // POST /api/auth/login
  login: {
    body: {
      username: Joi.string().required(),
      password: Joi.string().required()
    }
  }
};
