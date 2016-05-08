const { subscribe, createClash } = require('./clashes')

module.exports = function websocketHandler (ws) {
  //returns a bluebird promise
  subscribe({ws})

  ws.on('message', msg => {
    const action = JSON.parse(msg);
    switch(action.type) {
    }
  });
}
