import { combineReducers } from 'redux'
import {
  WEBSOCKET_CONNECTED,
  CLASH_CREATED
} from './actions'

function clashes(state = [], action) {
  switch(action.type) {
  case CLASH_CREATED:
    return state.concat(action.clash)
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
  socket
})

export default rootReducer
