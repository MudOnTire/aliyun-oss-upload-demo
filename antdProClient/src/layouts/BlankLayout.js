import React, { Component } from 'react'

export default class BlankLayout extends Component {
  render() {
    const { children } = this.props;
    return (
      <div id='root'>
        {children}
      </div>
    )
  }
}

