const r = require('rethinkdb');
const uuid = require('node-uuid');

const subscribe = withConnection((conn, {ws}) => {
  const pushClash = (err, row) => {
    if (err) {
      console.log(err)
      return
    }

    const { new_val } = row
    if (!new_val) {
      console.error("clash missing new_val")
      return
    }

    ws.send(JSON.stringify(Object.assign({}, {clash: new_val}, {type: "CLASH_CREATED"})))
  }

  const pushClashes = (err, cursor) => {
    if (err) {
      console.error(err)
      return
    }

    const closeConn = () => {
      console.log("closed rethinkdb conn")
      cursor.close()
      conn.close()
    }

    //when socket d/cs we need to stop the cursor before the connection
    ws.on('close', closeConn)
    cursor.each(pushClash, closeConn)
  }

  r.table('clashes')
    .filter(r.row("created").gt(Date.now() - 1000 * 60 * 30))
    .changes({includeInitial: true})
    .run(conn, pushClashes)

})

function withConnection(fn) {
  return function(props) {
    return r.connect({host: '127.0.0.1', db:'clash'})
      .then(conn => fn(conn, props))
  }
}

function withRethink(fn) {
  return function(props) {
    return r.connect({host: '127.0.0.1', db:'clash'})
      .then(conn => {
        return fn(conn, props)
        //run result before conn close
          .then(result => {
            conn.close()
            return result
          })
      })
      .catch(err => {
        console.log(err)
      })
  }
}

const joinClash = withRethink((conn, {clashId, user}) => {
  return r.table('clashes')
    .get(clashId)
    .update({players: r.row('players').append(user)})
    .run(conn)
})

const leaveClash = withRethink((conn, {clashId, userId}) => {
  return r.table('clashes')
    .get(clashId)
    .update({players: r.row('players').filter((player) => player('id').ne(userId))})
    .run(conn)
})

const createClash = withConnection((conn, {id, question}) => {
  return r.table('clashes')
    .insert({id, created: Date.now(), players: [], question})
    .run(conn)
    .then(() => conn.close())
    .catch(err => console.log(err))
})

const getClash = withConnection((conn, {id}) => {
  return r.table('clashes')
    .get(id)
    .run(conn)
})

module.exports = {
  subscribe,
  createClash,
  getClash,
  joinClash,
  leaveClash,
}
