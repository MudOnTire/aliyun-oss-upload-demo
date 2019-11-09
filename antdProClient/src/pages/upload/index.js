import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Form, Button, Card, Progress } from 'antd';
import { routerRedux } from 'dva/router';
import moment from 'moment';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import PictureWall from '@/components/Upload/PictureWall';

const FormItem = Form.Item;

@connect(({ upload, loading }) => ({
  upload,
  submitting: loading.effects['upload/upload'],
  gettingCredential: loading.effects['upload/getCredential']
}))
@Form.create()
export default class extends PureComponent {

  state = {
    progress: {}
  }

  checkpoints = {};

  /**
   * handle submit
   */
  handleSubmit = e => {
    e.preventDefault();
    const { form, dispatch } = this.props;
    form.validateFieldsAndScroll((err, values) => {
      if (err) return;
      const { files, largeFiles } = values;
      // normal upload
      if (files && files.length > 0) {
        dispatch({
          type: 'upload/getCredential',
          success: () => {
            const fileObjs = files && files.map(f => f.originFileObj);
            console.log('files ==== ', fileObjs);
            this.upload(fileObjs);
          }
        });
      }

      // multipart upload large files
      if (largeFiles && largeFiles.length > 0) {
        dispatch({
          type: 'upload/getCredential',
          success: () => {
            const fileObjs = largeFiles && largeFiles.map(f => f.originFileObj);
            fileObjs.forEach(file => this.multipartUpload(file));
          }
        });
      }
    });
  };

  onMultipartUploadProgress = (data) => {
    console.log('multipart upload onProgress ===', data);
    const { upload: { credentials, ossClient }, gettingCredential, dispatch } = this.props;
    const { progress, checkpoint } = data;
    this.checkpoints[checkpoint.file.uid] = checkpoint;
    this.setState((state) => {
      return {
        progress: {
          ...state.progress,
          [checkpoint.file.uid]: { progress, fileSize: checkpoint.fileSize }
        }
      }
    }, () => {
      if (gettingCredential) return;
      const { Expiration } = credentials;
      const timegap = 5;
      if (Expiration && moment(Expiration).subtract(timegap, 'minute').isBefore(moment())) {
        console.log(`STS token will expire in ${timegap} minutes，uploading will pause and resume after getting new STS token`);
        if (ossClient) {
          ossClient.cancel();
        }
        dispatch({
          type: 'upload/getCredential',
          success: this.resumeMultipartUpload
        });
      }
    });
  }

  /**
   * 上传普通文件
   */
  upload = (files) => {
    const { dispatch } = this.props;
    dispatch({
      type: 'upload/upload',
      payload: files
    });
  }

  /**
   * 分片上传大文件
   */
  multipartUpload = (file) => {
    const { dispatch } = this.props;
    dispatch({
      type: 'upload/multipartUpload',
      payload: file,
      onProgress: this.onMultipartUploadProgress
    });
  }

  /**
   * 分片上传，断点续传
   */
  resumeMultipartUpload = () => {
    const { dispatch } = this.props;
    Object.values(this.checkpoints).forEach(checkpoint => {
      dispatch({
        type: 'upload/resumeMultipartUpload',
        payload: checkpoint,
        onProgress: this.onMultipartUploadProgress
      });
    })
  }

  render() {
    const { submitting, form } = this.props;
    const { progress } = this.state;
    const totalFileSize = Object.values(progress).map(p => p.fileSize).reduce((prev, curr) => prev + curr, 0);
    const totalUploadedSize = Object.values(progress).map(p => p.progress * p.fileSize).reduce((prev, curr) => prev + curr, 0);
    const totalProgress = totalUploadedSize / totalFileSize;
    console.log('total progress === ', totalProgress);
    const { getFieldDecorator } = form;
    const formItemLayout = {
      labelCol: {
        xs: { span: 24 },
        sm: { span: 3 },
        md: { span: 3 },
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 20 },
        md: { span: 20 },
      },
    };

    const submitFormLayout = {
      wrapperCol: {
        xs: { span: 24, offset: 0 },
        sm: { span: 10, offset: 3 },
      },
    };

    return (
      <PageHeaderWrapper title="文件上传">
        <Card bordered={false}>
          <Form onSubmit={this.handleSubmit} hideRequiredMark style={{ marginTop: 8 }}>
            <FormItem {...formItemLayout} label='普通文件（<100MB）'>
              {getFieldDecorator('files', {
                initialValue: [],
                valuePropName: 'fileList'
              })(
                <PictureWall
                  maxCount={10}
                  multiple={true}
                  lazyUpload={true}
                />
              )}
            </FormItem>
            <FormItem {...formItemLayout} label='大文件（>100MB）'>
              {getFieldDecorator('largeFiles', {
                initialValue: [],
                valuePropName: 'fileList'
              })(
                <PictureWall
                  maxCount={10}
                  multiple={true}
                  lazyUpload={true}
                />
              )}
            </FormItem>
            <FormItem {...formItemLayout} label='上传进度'>
              <Progress
                style={{ width: '50%' }}
                strokeColor={{
                  '0%': '#108ee9',
                  '100%': '#87d068',
                }}
                percent={Number((totalProgress * 100).toFixed(0))}
              />
            </FormItem>
            <FormItem {...submitFormLayout} style={{ marginTop: 32 }}>
              <Button type="primary" size='large' htmlType="submit" loading={submitting}>
                提交
              </Button>
            </FormItem>
          </Form>
        </Card>
      </PageHeaderWrapper>
    );
  }
}
