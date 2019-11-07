关于阿里云 OSS 的介绍请参考官方文档：[阿里云 OSS](https://help.aliyun.com/document_detail/31817.html?spm=a2c4g.11174283.2.2.1ee57da2B2809C)。

出于账号安全的考虑，前端使用 OSS 服务需要走临时授权，即拿一个临时凭证去 OSS SDK。关于临时授权请参考：[RAM 和 STS 介绍](https://help.aliyun.com/document_detail/102082.html?spm=a2c4g.11186623.3.3.5cb51388OvZZUX)，[RAM 子账号](https://help.aliyun.com/document_detail/100602.html?spm=a2c4g.11186623.6.655.b38744fdJgsicc)，[STS 临时授权访问 OSS](https://help.aliyun.com/document_detail/100624.html?spm=a2c4g.11186623.6.656.72b24cf7VmpLx7)。

以 NodeJs 为例，后端给前端颁发临时凭证的实现可参考：[Node STS 授权访问](https://help.aliyun.com/document_detail/32077.html?spm=a2c4g.11186623.6.1181.7d341a9asC4enK)

前端上传文件到阿里云的相关操作可参考：[浏览器端上传文件](https://help.aliyun.com/document_detail/64047.html?spm=a2c4g.11174283.6.1195.1ee57da2srMUQS)

了解以上概念之后，接下来可以去阿里云 OSS 的控制台进行相关的设置了（前提是开通了 OSS 服务）。

# 阿里云 OSS 控制台配置

## 1. 创建 Bucket

首先，我们创建一个 bucket，一个存储文件的容器：

![add bucket](http://lc-jOYHMCEn.cn-n1.lcfile.com/6a53e49f988565422478/bucket%20set%20cros.png)

接着，我们需要给 bucket 设置跨域，这样我们才能在网页中调用 Aliyun OSS 服务器的接口：

![bucket set cros](http://lc-jOYHMCEn.cn-n1.lcfile.com/6a53e49f988565422478/bucket%20set%20cros.png)

## 2. 创建 RAM 用户

接下来，前往 [RAM 控制台](https://ram.console.aliyun.com)进行子账号和权限的配置。

首先，我们创建一个用户，并给该用户分配调用 STS 服务 AssumeRole 接口的权限，这样待会儿后端就能以该用户的身份给前端分配 STS 凭证了：

![ram use sts assume role](http://lc-jOYHMCEn.cn-n1.lcfile.com/807803984458ece2f64a/RAM%20user%20STS%20Assume%20Role.png)

我们需要保存一下该用户的 access key 和 access key secret，后端需要以此核实用户的身份。

![ram user access key](http://lc-jOYHMCEn.cn-n1.lcfile.com/bf7ff17a3c799cdd3f74/ram%20user%20acess%20key.png)

## 3. 创建 RAM 角色

该角色即有权限在前端调用 ali-oss SDK 上传文件的用户角色，例如我们创建一个只有上传权限的角色，命名为 uploader：

![ram role](http://lc-jOYHMCEn.cn-n1.lcfile.com/ff64b8c57ae0c0d2e3f6/ram%20role.png)

接下来我们需要给该角色分配权限，可以通过创建一条权限策略并分配给角色，该权限策略里面只包含了上传文件、分片上传相关的权限：

![ram role priorities](http://lc-jOYHMCEn.cn-n1.lcfile.com/c57ae09ffabd5588440e/ram%20role%20priorities.png)

**策略具体内容为：**

```
{
  "Version": "1",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "oss:PutObject",
        "oss:InitiateMultipartUpload",
        "oss:UploadPart",
        "oss:UploadPartCopy",
        "oss:CompleteMultipartUpload",
        "oss:AbortMultipartUpload",
        "oss:ListMultipartUploads",
        "oss:ListParts"
      ],
      "Resource": [
        "acs:oss:*:*:mudontire-test",
        "acs:oss:*:*:mudontire-test/*"
      ]
    }
  ]
}
```

然后，把该策略赋予 `uploader` 角色：

![ramrole set strategy](http://lc-jOYHMCEn.cn-n1.lcfile.com/3012a21e6eb9980e1cba/ram%20role%20set%20strategy.png)

到此，阿里云 OSS 后台相关配置结束。接下来，我们来关注前后端的实现。

# 后端实现

由于是前端负责上传，所以后端的任务比较简单，就是提供一个 STS Token 给前端。本文以 NodeJs 为例，展示后端实现。

## 1. 安装 ali-oss SDK

```
npm install ali-oss
```

## 2. 生成 STS Token 并返回

```
const OSS = require('ali-oss');
const STS = OSS.STS;

const sts = new STS({
  accessKeyId: process.env.ALIYUN_OSS_RULE_ASSUMER_ACCESS_KEY,
  accessKeySecret: process.env.ALIYUN_OSS_RULE_ASSUMER_ACCESS_KEY_SECRET
});

async function getCredential(req, res, next) {
  try {
    const { credential } = await sts.assumeRole(
      'acs:ram::1582938330607257:role/uploader', // role arn
      null, // policy
      15 * 60, // expiration(s)
      'web-client' // session-name
    );;
    req.result = credential;
    next();
  } catch (err) {
    next(err);
  }
}
```

其中，access key 和 access key secret 保存在`.env`文件中。`sts.assumeRole()`返回的即为 STS Token，方法接收的四个参数分别为：**role arn**, **policy**, **expiration**, **session name**。

**Role arn** 可以从 RAM 角色的详情页面获取：

![role arn](http://lc-jOYHMCEn.cn-n1.lcfile.com/824fcced9c2c55acd5fc/role%20arn.png)

**Policy** 是自定义的策略，由于已经为角色添加了权限策略，所以可以传`null`。

**Expiration** 是 STS Token 的过期时间，应该在 15min ~ 60min 之间。当 Token 失效时前端需要重新获取。

**Session name** 为自定义的一个会话名称。

后端实现完成！

# 前端实现

本文的前端实现基于 React + ant design pro。
