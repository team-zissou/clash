import React, { Component } from 'react'
import { connect } from 'react-redux'
import { humanTime } from '../utils'
import { browserHistory } from 'react-router'

class RecentClashes extends Component {
  render() {
    const { clashes } = this.props
    const now = Date.now()
    return (
      <div>
        <ul>
          { clashes.map(({created, id}, i) => {
              return (
                <div className="item" key={i} onClick={() => browserHistory.push(`/clash/${id}`)}>
                  <li>{id}</li>
                  <li>{humanTime(created, now)}</li>
                </div>
              )
            })
          }
        </ul>
      </div>
    )
  }
}

function mapStateToProps(state, props) {
  return state
}

export default connect(mapStateToProps, {})(RecentClashes)
