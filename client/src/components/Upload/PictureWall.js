import React, { Component } from 'react';
import { Upload, Icon, Modal } from 'antd';
import PropTypes from 'prop-types';

class PictureWall extends Component {
  constructor(props) {
    super(props);
    const { fileList } = this.props;
    this.state = {
      previewVisible: false,
      previewImage: '',
      fileList: fileList || [],
    };
  }

  componentWillReceiveProps(props) {
    const { fileList } = this.props;
    if (fileList.length !== props.fileList.length) {
      this.setState({
        fileList: props.fileList,
      });
    } else if (props.fileList.length > 0) {
      // eslint-disable-next-line no-plusplus
      for (let i = 0; i < props.fileList.length; i++) {
        const newFile = props.fileList[i];
        const oldFile = fileList.find(file => file.uid === newFile.uid);
        if (typeof oldFile === 'undefined' || newFile.url !== oldFile.url) {
          this.setState({
            fileList: props.fileList,
          });
          break;
        }
      }
    }
  }

  handleCancel = () => this.setState({ previewVisible: false });

  handlePreview = file => {
    this.setState({
      previewImage: file.url || file.thumbUrl,
      previewVisible: true,
    });
  };

  handleChange = ({ fileList }) => {
    const { onChange } = this.props;
    this.setState({ fileList });
    onChange(fileList);
  };

  handleBeforeUpload = (file) => {
    const { lazyUpload } = this.props;
    if (lazyUpload) {
      this.setState(state => ({
        fileList: [...state.fileList, file],
      }));
      return false;
    }
    return true;
  }

  render() {
    const { previewVisible, previewImage, fileList } = this.state;
    const { maxCount, progress } = this.props;
    const uploadButton = (
      <div>
        <Icon type="plus" />
        <div className="ant-upload-text">
          点击上传
        </div>
      </div>
    );

    return (
      <div className="clearfix">
        <Upload
          action="/api/upload"
          listType="picture-card"
          fileList={fileList}
          onPreview={this.handlePreview}
          onChange={this.handleChange}
          beforeUpload={this.handleBeforeUpload}
          multiple={maxCount > 1}
          withCredentials
        >
          {fileList.length >= maxCount ? null : uploadButton}
        </Upload>
        <Modal visible={previewVisible} footer={null} onCancel={this.handleCancel}>
          <img alt="example" style={{ width: '100%' }} src={previewImage} />
        </Modal>
      </div>
    );
  }
}

PictureWall.propTypes = {
  maxCount: PropTypes.number,
  onChange: PropTypes.func,
  lazyUpload: PropTypes.bool
};

PictureWall.defaultProps = {
  maxCount: 1,
  onChange: () => { },
  lazyUpload: false
};

export default PictureWall;
