import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'

class App extends Component {
  render() {
    const { children } = this.props

    return (
      <div style={{width: '100%', height: '100%', backgroundColor: 'lightslategray'}}>
        { children }
      </div>
    )
  }
}

function mapStateToProps(state, props) {
  return state
}

export default connect(mapStateToProps, {})(App)
