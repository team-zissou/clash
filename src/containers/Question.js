import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'

import { maybeFetchQuestion } from '../actions'

function loadData({maybeFetchQuestion, questionId}) {
  maybeFetchQuestion({questionId})
}

class Question extends Component {
  componentWillMount() {
    loadData(this.props)
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.questionId !== this.props.movieId) {
      loadData(nextProps)
    }
  }

  render() {
    const { questionId, questions } = this.props
    const {id, owner, question} = questions[questionId]
    console.log(question)
    return (
      <div>
        { question }
      </div>
    )
  }
}


function mapStateToProps(state, props) {
  const { questionId } = props.params
  return { ...state, questionId }
}

export default connect(mapStateToProps, {maybeFetchQuestion})(Question)
