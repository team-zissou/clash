import { browserHistory } from 'react-router'

export const WEBSOCKET_CONNECTED = 'WEBSOCKET_CONNECTED'
export const CLASH_CREATED = 'CLASH_CREATED'
export const ADD_QUESTION_SUCCESS = 'ADD_QUESTION_SUCCESS'

export function connectWebsocket(ws) {
  return (dispatch, getState) => {
    ws.onconnect = e => dispatch(websocketConnected(ws))
    ws.onmessage = connectHandler(dispatch)(messageHandler)
  }
}

function connectHandler(dispatch) {
  return function(handler) {
    return function(e) {
      handler(dispatch, e)
    }
  }
}

//TODO: rename update clash
function addClash(clash) {
  return {
    type: CLASH_CREATED,
    clash
  }
}

function addQuestion(question) {
  return {
    type: ADD_QUESTION_SUCCESS,
    question
  }
}

export function maybeFetchQuestion({questionId}) {
  return (dispatch, getState) => {
    const { questions } = getState()
    if (questions[questionId]) {
      return
    }

  }
}

export function postQuestion({question}) {
  return (dispatch) => {
    fetch('/api/questions', {
      method:'POST',
      body:question,
      headers: new Headers({Authorization: "1e5cdb36acee1e357e8aec1a9967baa1"})
    })
    .then(response => response.json())
    .then(({id, owner, question}) => {
      dispatch(addQuestion({id, owner, question}))
      browserHistory.push(`/questions/${id}`)
    })
    .catch(err => console.error(err))
  }
}

function messageHandler(dispatch, {data}) {
  const action = JSON.parse(data)
  console.log(data)
  switch(action.type) {
  case CLASH_CREATED:
    return dispatch(addClash(action.clash))
  default:
    console.log("what action is this?", action)
  }
}

function websocketConnected(ws) {
  return {
    type: WEBSOCKET_CONNECTED,
    ws
  }
}
