import { combineReducers } from 'redux'
import {
  WEBSOCKET_CONNECTED,
  CLASH_CREATED,
  ADD_QUESTION_SUCCESS
} from './actions'

function clashes(state = {}, action) {
  switch(action.type) {
  case CLASH_CREATED:
    return {...state, [action.clash.id]: action.clash}
  default:
    return state
  }
}

function questions(state = {}, action) {
  switch(action.type) {
  case ADD_QUESTION_SUCCESS:
    return {...state, [action.question.id]: action.question}
  default:
    return state
  }
}

function socket(state = null, action) {
  switch(action.type) {
  case WEBSOCKET_CONNECTED:
    return action.ws
  default:
    return state
  }
}

const rootReducer = combineReducers({
  clashes,
  socket,
  questions
})

export default rootReducer
