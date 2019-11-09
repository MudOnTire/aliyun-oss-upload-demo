import React from 'react';
import { connect } from 'dva';
import { Drawer, Form, message, Button, Input } from 'antd';
import styles from './ChangePassword.less';

const FormItem = Form.Item;

@connect(({ user, loading }) => ({
  user,
  submitting: loading.effects['user/changePassword']
}))
@Form.create()
export default class extends React.Component {

  save = (e) => {
    e.preventDefault();
    const { form, dispatch, onClose } = this.props;
    form.validateFieldsAndScroll((err, fieldsValue) => {
      if (err) return;
      dispatch({
        type: 'user/changePassword',
        payload: fieldsValue,
        callback: (res) => {
          if (res.code === 0) {
            message.success('修改密码成功！', 1, onClose);
          } else {
            message.error(`修改密码失败：${res.message}`);
          }
        }
      })
    })
  }

  render() {

    const { visible, onClose, form, submitting } = this.props;
    const { getFieldDecorator } = form;
    const formItemLayout = {
      labelCol: {
        span: 6
      },
      wrapperCol: {
        span: 18
      }
    };
    return (
      <Drawer
        title="修改密码"
        placement='right'
        closable
        visible={visible}
        onClose={onClose}
        className={styles.main}
        width={500}
      >
        <Form onSubmit={this.save}>
          <FormItem {...formItemLayout} label="当前密码">
            {getFieldDecorator('oldPassword', {
              initialValue: '',
              rules: [
                {
                  required: true,
                  message: '请输入当前密码',
                },
              ]
            })(
              <Input placeholder='请输入当前密码' type='password' />
            )}
          </FormItem>
          <FormItem {...formItemLayout} label="新的密码">
            {getFieldDecorator('newPassword', {
              initialValue: '',
              rules: [
                {
                  required: true,
                  message: '请输入新的密码',
                },
              ]
            })(
              <Input placeholder='请输入新的密码' type='password' />
            )}
          </FormItem>
          <FormItem style={{
            borderBottom: 'none',
            textAlign: 'center',
            marginTop: '100px'
          }}>
            <Button
              htmlType='submit'
              className={styles.saveBtn}
              type='primary'
              loading={submitting}
            >
              保存
            </Button>
          </FormItem>
        </Form>

      </Drawer>
    )
  }
}