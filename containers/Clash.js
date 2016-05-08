import React, { Component } from 'react'
import { connect } from 'react-redux'

class Clash extends Component {
  render() {
    const { clashId } = this.props
    return (
      <div>
      {clashId}
      </div>
    )
  }
}

function mapStateToProps(state, props) {
  const { clashId } = props.params
  return {
    ...state, clashId
  }
}

export default connect(mapStateToProps, {})(Clash)
