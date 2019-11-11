关于阿里云 OSS 的介绍请参考官方文档：[阿里云 OSS](https://help.aliyun.com/document_detail/31817.html?spm=a2c4g.11174283.2.2.1ee57da2B2809C)。

出于账号安全的考虑，前端使用 OSS 服务需要走临时授权，即拿一个临时凭证（STS Token）去调用 aliyun-oss SDK。关于临时授权请参考：[RAM 和 STS 介绍](https://help.aliyun.com/document_detail/102082.html?spm=a2c4g.11186623.3.3.5cb51388OvZZUX)，[RAM 子账号](https://help.aliyun.com/document_detail/100602.html?spm=a2c4g.11186623.6.655.b38744fdJgsicc)，[STS 临时授权访问 OSS](https://help.aliyun.com/document_detail/100624.html?spm=a2c4g.11186623.6.656.72b24cf7VmpLx7)。

以 NodeJs 为例，后端给前端颁发临时凭证的实现可参考：[Node STS 授权访问](https://help.aliyun.com/document_detail/32077.html?spm=a2c4g.11186623.6.1181.7d341a9asC4enK)

前端上传文件到阿里云的相关操作可参考：[浏览器端上传文件](https://help.aliyun.com/document_detail/64047.html?spm=a2c4g.11174283.6.1195.1ee57da2srMUQS)

了解以上概念之后，接下来可以去阿里云 OSS 的控制台进行相关的设置了（前提是开通了 OSS 服务）。

# 阿里云 OSS 控制台配置

## 1. 创建 Bucket

首先，我们创建一个 bucket，一个存储文件的容器：

![add bucket](http://lc-jOYHMCEn.cn-n1.lcfile.com/9a534cb162ad68141efb/add%20bucket.png)

接着，我们需要给 bucket 设置跨域，这样我们才能在网页中调用 Aliyun OSS 服务器的接口：

![bucket set cros](http://lc-jOYHMCEn.cn-n1.lcfile.com/6a53e49f988565422478/bucket%20set%20cros.png)

## 2. 创建 RAM 用户

接下来，前往 [RAM 控制台](https://ram.console.aliyun.com)进行子账号和权限的配置。

首先，我们创建一个用户，并给该用户分配调用 STS 服务 AssumeRole 接口的权限，这样待会儿后端就能以该用户的身份给前端分配 STS 凭证了：

![ram use sts assume role](http://lc-jOYHMCEn.cn-n1.lcfile.com/807803984458ece2f64a/RAM%20user%20STS%20Assume%20Role.png)

我们需要保存一下该用户的 access key 和 access key secret，后端需要以此核实用户的身份。

![ram user access key](http://lc-jOYHMCEn.cn-n1.lcfile.com/bf7ff17a3c799cdd3f74/ram%20user%20acess%20key.png)

## 3. 创建 RAM 角色

该角色即有权限在前端调用 aliyun-oss SDK 上传文件的用户角色，例如我们创建一个只有上传权限的角色，命名为 uploader：

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

由于是前端负责上传，所以后端的任务比较简单，就是提供一个 STS Token 给前端。本文以 NodeJs 为例实现如下。

## 1. 安装 aliyun-oss SDK

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
    const { credentials } = await sts.assumeRole(
      'acs:ram::1582938330607257:role/uploader',  // role arn
      null, // policy
      15 * 60, // expiration
      'web-client' // session name
    );
    req.result = credentials;
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

<!-- 本文的前端实现基于 React + Ant design pro。最终效果如下：

![preview](http://lc-jOYHMCEn.cn-n1.lcfile.com/31f41d355e72a67091e5/1.preview.png)

针对 Andt 的 [Upload](https://ant.design/components/upload-cn/)控件进行了简单的封装，当添加文件的时候不会立即上传，而要等到点击“提交”按钮时再上传。 -->

本文前端实现使用原生 JS，另外还有 ant design pro 的版本请参考 github 项目。

前端实现有几个关键点：

1. 调用 aliyun-oss SDK 之前获取 STS Token
1. 定义上传分片大小，如果文件小于分片大小则使用普通上传，否则使用分片上传
1. 上传过程中能展示上传进度
1. 上传过程中，如果 STS Token 快过期了，则先暂停上传重新获取 Token，接着进行断点续传
1. 支持手动暂停、续传功能
1. 上传完成后返回文件对应的下载地址

## 1. 引入 aliyun-oss SDK

参考 [引入 aliyun-oss SDK](https://help.aliyun.com/document_detail/64041.html?spm=a2c4g.11186623.6.1190.6bec10d58JDHOp)

## 2. HTML

HTML 中包含文件选择器，上传、暂停、续传按钮，状态显示：

```
<div>
  <input type="file" id='fileInput' multiple='true'>
  <button id="uploadBtn" onclick="upload()">Upload</button>
  <button id="stopBtn" onclick="stop()">Stop</button>
  <button id="resumeBtn" onclick="resume()">resume</button>
  <h2 id='status'></h2>
</div>
```

## 3. 定义变量

```
let credentials = null; // STS凭证
let ossClient = null; // oss客户端实例
const fileInput = document.getElementById('fileInput'); // 文件选择器
const status = document.getElementById('status'); // 状态显示元素
const bucket = 'mudontire-test'; // bucket名称
const region = 'oss-cn-shanghai'; // oss服务区域名称
const partSize = 1024 * 1024; // 每个分片大小(byte)
const parallel = 3; // 同时上传的分片数
const checkpoints = {}; // 所有分片上传文件的检查点
```

## 4. 获取 STS 凭证，创建 OSS Client

```
// 获取STS Token
function getCredential() {
  return fetch('http://localhost:5050/api/upload/credential')
    .then(res => {
      return res.json()
    })
    .then(res => {
      credentials = res.result;
    })
    .catch(err => {
      console.error(err);
    });
}

// 创建OSS Client
async function initOSSClient() {
  const { AccessKeyId, AccessKeySecret, SecurityToken } = credentials;
  ossClient = new OSS({
    accessKeyId: AccessKeyId,
    accessKeySecret: AccessKeySecret,
    stsToken: SecurityToken,
    bucket,
    region
  });
}
```

## 5. 点击上传按钮事件

```
async function upload() {
  status.innerText = 'Uploading';
  // 获取STS Token
  await getCredential();
  const { files } = fileInput;
  const fileList = Array.from(files);
  const uploadTasks = fileList.forEach(file => {
    // 如果文件大学小于分片大小，使用普通上传，否则使用分片上传
    if (file.size < partSize) {
      commonUpload(file);
    } else {
      multipartUpload(file);
    }
  });
}
```

## 6. 普通上传

```
// 普通上传
async function commonUpload(file) {
  if (!ossClient) {
    await initOSSClient();
  }
  const fileName = file.name;
  return ossClient.put(fileName, file).then(result => {
    console.log(`Common upload ${file.name} succeeded, result === `, result)
  }).catch(err => {
    console.log(`Common upload ${file.name} failed === `, err);
  });
}
```

## 7. 分片上传

```
// 分片上传
async function multipartUpload(file) {
  if (!ossClient) {
    await initOSSClient();
  }
  const fileName = file.name;
  return ossClient.multipartUpload(fileName, file, {
    parallel,
    partSize,
    progress: onMultipartUploadProgress
  }).then(result => {
    // 生成文件下载地址
    const url = `http://${bucket}.${region}.aliyuncs.com/${fileName}`;
    console.log(`Multipart upload ${file.name} succeeded, url === `, url)
  }).catch(err => {
    console.log(`Multipart upload ${file.name} failed === `, err);
  });
}
```

## 9. 断点续传

```
// 断点续传
async function resumeMultipartUpload() {
  Object.values(checkpoints).forEach((checkpoint) => {
    const { uploadId, file, name } = checkpoint;
    ossClient.multipartUpload(uploadId, file, {
      parallel,
      partSize,
      progress: onMultipartUploadProgress,
      checkpoint
    }).then(result => {
      console.log('before delete checkpoints === ', checkpoints);
      delete checkpoints[checkpoint.uploadId];
      console.log('after delete checkpoints === ', checkpoints);
      const url = `http://${bucket}.${region}.aliyuncs.com/${name}`;
      console.log(`Resume multipart upload ${file.name} succeeded, url === `, url)
    }).catch(err => {
      console.log('Resume multipart upload failed === ', err);
    });
  });
}
```

## 10. 分片上传进度

在 progress 回调中我们可以判断 STS Token 是否快过期了，如果快过期了则先取消上传获取新 Token 后在从之前的断点开始续传。

```
// 分片上传进度改变回调
async function onMultipartUploadProgress(progress, checkpoint) {
  console.log(`${checkpoint.file.name} 上传进度 ${progress}`);
  checkpoints[checkpoint.uploadId] = checkpoint;
  // 判断STS Token是否将要过期，过期则重新获取
  const { Expiration } = credentials;
  const timegap = 1;
  if (Expiration && moment(Expiration).subtract(timegap, 'minute').isBefore(moment())) {
    console.log(`STS token will expire in ${timegap} minutes，uploading will pause and resume after getting new STS token`);
    if (ossClient) {
      ossClient.cancel();
    }
    await getCredential();
    await resumeMultipartUpload();
  }
}
```

## 11. 暂停、续传按钮点击事件

```
// 暂停上传
function stop() {
  status.innerText = 'Stopping';
  if (ossClient) ossClient.cancel();
}

// 续传
function resume() {
  status.innerText = 'Resuming';
  if (ossClient) resumeMultipartUpload();
}
```

# github 示例项目

项目地址：https://github.com/MudOnTire/aliyun-oss-upload-demo。如果对大家有帮助，star一下吧。
