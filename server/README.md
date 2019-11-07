# 上传权限配置

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
