const { subscribe, createClash } = require('./clashes')

module.exports = function websocketHandler (ws) {

  subscribe({ws})

  ws.on('message', msg => {
    const action = JSON.parse(msg);
    switch(action.type) {
    }
  });
}
