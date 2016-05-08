import React, { Component, PropTypes } from 'react'
import { Provider } from 'react-redux'
import { Router, Route, browserHistory, IndexRedirect } from 'react-router'
import { render } from 'react-dom'
import { createStore, applyMiddleware } from 'redux'
import thunk from 'redux-thunk'
import rootReducer from './reducers'
import { connectWebsocket } from './actions'

import App from './containers/App'
import RecentClashes from './containers/RecentClashes'
import Clash from './containers/Clash'

const store = createStore(rootReducer, applyMiddleware(thunk))
const ws = new WebSocket(`ws://${location.host}/clash.ws`)
store.dispatch(connectWebsocket(ws))

class Root extends Component {
  render() {
    const { store, history } = this.props
    return (
      <Provider store={store}>
        <Router history={history}>
          <Route path="/" component={App}>
            <IndexRedirect to="/clashes"/>
            <Route path="/clashes" component={RecentClashes}/>
            <Route path="/clash/:clashId" component={Clash}/>
          </Route>
        </Router>
      </Provider>
    )
  }
}

render(
  <Root store={store} history={browserHistory}/>,
  document.getElementById('root')
)
