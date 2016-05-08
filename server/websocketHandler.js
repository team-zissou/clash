module.exports = ws => {

  ws.on('message', msg => {
    const action = JSON.parse(msg);

    switch(action.type) {

    }
  });


};
