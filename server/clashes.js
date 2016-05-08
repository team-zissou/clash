const r = require('rethinkdb');
const uuid = require('node-uuid');

const subscribe = withConnection((conn, {ws}) => {

  const closeConn = () => conn.close()

  const pushClash = (err, row) => {
    if (err) {
      console.error(err)
      return
    }
    ws.send(JSON.stringify(row))
  }

  const pushClashes = (err, cursor) => {
    if (err) {
      console.error(err)
      return
    }
    cursor.each(pushClash, closeConn)
  }

  r.table('clashes')
    .filter(r.row("created").gt(Date.now() - 1000 * 60 * 30))
    .changes({includeInitial: true})
    .run(conn, pushClashes)

})

function withConnection(fn) {
  return function(props) {
    return r.connect({host: '127.0.0.1', db:'test'})
      .then(conn => fn(conn, props))
  }
}

const createClash = withConnection((conn, props) => {
  return r.table('clashes')
    .insert({created: Date.now()})
    .run(conn)
    .then(({generated_keys}) => {
      conn.close()
      return generated_keys[0]
    })
    .catch(err => console.log(err))
})

module.exports = {
  subscribe,
  createClash
}
