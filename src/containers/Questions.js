import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'

import { postQuestion } from '../actions'

class Questions extends Component {
  render() {
    const { postQuestion } = this.props
    return (
      <div>
        <input type="text" ref="question"/>
        <input type="button" onClick={() => postQuestion({question: "HEY"})}/>
      </div>
    )
  }
}


function mapStateToProps(state, props) {
  return state
}

export default connect(mapStateToProps, {postQuestion})(Questions)
