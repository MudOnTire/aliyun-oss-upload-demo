import OSS from 'ali-oss';
import shortid from 'shortid';
import { uploadService } from '@/services/upload';

const bucket = 'mudontire-test';
const region = 'oss-cn-shanghai';

const parallel = 3;
const partSize = 1 * 1024 * 1024; // 每个part 1MB

export default {
  namespace: 'upload',

  state: {
    credentials: {},
    ossClient: null
  },

  effects: {
    *getCredential({ success }, { call, put }) {
      const res = yield call(uploadService.getCredential);
      if (res.code === 0) {
        const credentials = res.result;
        const { AccessKeyId, AccessKeySecret, SecurityToken } = credentials;
        // 创建client并保存
        const ossClient = new OSS({
          accessKeyId: AccessKeyId,
          accessKeySecret: AccessKeySecret,
          stsToken: SecurityToken,
          bucket,
          region
        });
        yield put({
          type: 'save',
          payload: {
            credentials,
            ossClient
          }
        });
        if (success) success();
      }
    },
    /**
     * 普通上传
     */
    *upload({ callback, payload }, { call, put, select }) {
      const { ossClient } = yield select(state => state.upload);
      if (!ossClient) {
        console.log('oss client not exist');
        return;
      }
      const files = payload;
      if (files && files.length > 0) {
        const tasks = files.map(file => {
          return ossClient.put(`${shortid.generate()}-${file.name}`, file);
        });
        Promise.all(tasks).then(result => {
          console.log('upload result ==== ', result);
          if (callback) callback(result);
        }).catch(err => {
          console.log('upload error === ', err);
        });
      }
    },
    /**
     * 分片上传，
     * 为了控制上传进度，只允许单个文件上传
     */
    *multipartUpload({ callback, payload, onProgress, onError }, { call, put, select }) {
      const { ossClient } = yield select(state => state.upload);
      if (!ossClient) {
        console.log('oss client not exist');
        return;
      }
      const file = payload;
      if (file) {
        const progress = (progress, checkpoint) => {
          if (onProgress) onProgress({ progress, checkpoint });
        };
        const fileName = `${shortid.generate()}-${file.name}`;
        ossClient.multipartUpload(fileName, file, {
          parallel,
          partSize,
          progress
        }).then(result => {
          console.log('multipart upload result === ', result);
          const url = `http://${bucket}.${region}.aliyuncs.com/${fileName}`;
          console.log('url === ', url)
          if (callback) callback(url);
        }).catch(err => {
          console.log('multipart upload error === ', err);
          if (onError) onError(err);
        });
      }
    },
    /**
     * 分片上传，断点续传
     */
    *resumeMultipartUpload({ callback, payload, onProgress, onError }, { call, put, select }) {
      const { ossClient } = yield select(state => state.upload);
      if (!ossClient) {
        console.log('oss client not exist');
        return;
      }
      const checkpoint = payload;
      if (checkpoint) {
        const progress = (progress, cp) => {
          if (onProgress) onProgress({ progress, checkpoint: cp });
        };
        ossClient.multipartUpload(checkpoint.uploadId, checkpoint.file, {
          parallel,
          partSize, // 每个part 1MB
          progress,
          checkpoint
        }).then(result => {
          console.log('resume multipart upload result === ', result);
          const url = `http://${bucket}.${region}.aliyuncs.com/${checkpoint.name}`;
          console.log('url === ', url)
          if (callback) callback(url);
        }).catch(err => {
          console.log('resume multipart upload error === ', err);
          if (onError) onError(err);
        });
      }
    },
  },

  reducers: {
    save(state, { payload }) {
      return {
        ...state,
        ...payload
      }
    }
  }
};
