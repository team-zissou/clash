import React, { Component } from 'react'
import { connect } from 'react-redux'

class RecentClashes extends Component {
  render() {
    const { clashes } = this.props
    return (
      <div>
        <ul>
          { clashes.map(({created, id}, i) => <li key={i}>{id}</li>)}
        </ul>
      </div>
    )
  }
}

function mapStateToProps(state, props) {
  return state
}

export default connect(mapStateToProps, {})(RecentClashes)
