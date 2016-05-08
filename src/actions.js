export const WEBSOCKET_CONNECTED = 'WEBSOCKET_CONNECTED'
export const CLASH_CREATED = 'CLASH_CREATED'

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

function addClash(clash) {
  return {
    type: CLASH_CREATED,
    clash
  }
}

function messageHandler(dispatch, {data}) {
  const action = JSON.parse(data)
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
