import React, { Component } from 'react'
import { connect } from 'react-redux'
import { humanTime } from '../utils'
import { browserHistory } from 'react-router'

class RecentClashes extends Component {
  render() {
    const { clashes } = this.props
    const recentClashes = Object.keys(clashes).map(x => clashes[x])
    const now = Date.now()
    return (
      <div>
        <ul>
          { recentClashes.map(({created, id, players}, i) => {
              return (
                <div className="item" key={i} onClick={() => browserHistory.push(`/clash/${id}`)}>
                  <li>{humanTime(created, now)}</li>
                  <ul>
                    {players.map((x,i) => <li key={i}>{x}</li>)}
                  </ul>
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
