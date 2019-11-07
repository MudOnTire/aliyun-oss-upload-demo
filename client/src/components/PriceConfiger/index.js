import React from 'react';
import PropTypes from 'prop-types';
import { InputNumber, Row, Col, Tag } from 'antd';
import { testTypes, timingTypes } from '../../utils/enums';

import styles from './index.less';

class PriceConfiger extends React.Component {

  state = {
    prices: this.props.value || {}
  }

  onPriceChange = (testType, timingType, priceType, price) => {
    const { onChange } = this.props;
    const { prices } = this.state;
    const newPrices = JSON.parse(JSON.stringify(prices));
    if (!newPrices[testType]) newPrices[testType] = {};
    if (!(newPrices[testType][timingType])) newPrices[testType][timingType] = {};
    newPrices[testType][timingType][priceType] = price;
    this.setState({
      prices: newPrices
    }, () => {
      if (onChange) onChange(newPrices);
    });
  }

  render() {

    const { prices } = this.state;
    return (
      <div>
        {
          testTypes.map(t => {
            return (
              <div key={t.value}>
                {
                  timingTypes.map(tt => {
                    return (
                      <Row key={tt.value}>
                        <Col span={4} style={{ textAlign: 'right' }}>
                          <Tag color="geekblue" className={styles.tag}>
                            {t.label}
                          </Tag>
                        </Col>
                        <Col span={1} style={{ textAlign: 'center' }}>
                          <span style={{ color: '#2f54eb', paddingRight: 8 }}>
                            —
                          </span>
                        </Col>
                        <Col span={4} style={{ textAlign: 'left' }}>
                          <Tag color="geekblue" className={styles.tag}>
                            {tt.label}
                          </Tag>
                        </Col>
                        <Col span={7}>
                          <label>原价：</label>
                          <InputNumber
                            size="large"
                            onChange={(value) => {
                              this.onPriceChange(t.value, tt.value, 'original', value);
                            }}
                            value={prices[t.value] && prices[t.value][tt.value] && prices[t.value][tt.value]['original']}
                          />
                          <label style={{ paddingLeft: 4, fontSize: '16px' }}>
                            ¥
                          </label>
                        </Col>
                        <Col span={7}>
                          <label>现价：</label>
                          <InputNumber
                            size="large"
                            onChange={(value) => {
                              this.onPriceChange(t.value, tt.value, 'current', value);
                            }}
                            value={prices[t.value] && prices[t.value][tt.value] && prices[t.value][tt.value]['current']}
                          />
                          <label style={{ paddingLeft: 4, fontSize: '16px' }}>
                            ¥
                          </label>
                        </Col>
                      </Row>
                    )
                  })
                }
              </div>
            )
          })
        }
      </div>
    )
  }
}

PriceConfiger.propTypes = {
  // value: PropTypes.object,
  // onChange: PropTypes.func
}

PriceConfiger.defaultProps = {
  // value: {},
  // onChange: () => { }
}

export default PriceConfiger;