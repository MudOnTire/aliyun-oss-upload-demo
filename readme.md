关于阿里云 OSS 的介绍请参考官方文档：[阿里云 OSS](https://help.aliyun.com/document_detail/31817.html?spm=a2c4g.11174283.2.2.1ee57da2B2809C)。

出于账号安全的考虑，前端使用 OSS 服务需要走临时授权，即拿一个临时凭证去 OSS SDK。关于临时授权请参考：[RAM 和 STS 介绍](https://help.aliyun.com/document_detail/102082.html?spm=a2c4g.11186623.3.3.5cb51388OvZZUX)，[RAM 子账号](https://help.aliyun.com/document_detail/100602.html?spm=a2c4g.11186623.6.655.b38744fdJgsicc)，[STS 临时授权访问 OSS](https://help.aliyun.com/document_detail/100624.html?spm=a2c4g.11186623.6.656.72b24cf7VmpLx7)。

以 NodeJs 为例，后端给前端颁发临时凭证的实现可参考：[Node STS 授权访问](https://help.aliyun.com/document_detail/32077.html?spm=a2c4g.11186623.6.1181.7d341a9asC4enK)

前端上传文件到阿里云的相关操作可参考：[浏览器端上传文件](https://help.aliyun.com/document_detail/64047.html?spm=a2c4g.11174283.6.1195.1ee57da2srMUQS)

了解以上概念之后，接下来我们可以去阿里云 OSS 的控制台进行相关的设置（前提开通了 OSS 服务）。

# 创建 Bucket
