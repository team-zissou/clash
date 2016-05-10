import React, { Component } from 'react'
import { connect } from 'react-redux'
import { humanTime } from '../utils'

const emptyClash = {
  created: 0,
  players: [],
  question: "0"
}

class Clash extends Component {
  render() {
    const { clashId, clashes } = this.props
    const { created, players, question } = clashes[clashId] || emptyClash

    return (
      <div className = "item">
        <ul>
          <li>{ humanTime(created) }</li>
          <li> { "players:" }
            <ul>
              { players.map(({username},i) => <li key={i}>{username}</li>) }
            </ul>
          </li>
          <li>{ question }</li>
        </ul>
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
