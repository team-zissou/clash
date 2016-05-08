const bcrypt = require('bcrypt-nodejs');
const pg = require('pg');

const dockerhost = process.env.dockerhost;
const psqlstring = `postgres://postgres:postgres@${dockerhost}/postgres`;
const uuid = require('node-uuid');

module.exports = {
  createAccount,
  createLogin
};

function createAccount({email, password, username}) {
  let hashedPassword = bcrypt.hashSync(password);
  pg.connect(psqlstring, function(err, client, done) {
    if (err) {
      console.error("postgres error");
      console.error(err);
      process.exit(1);
    }

    client.query(`INSERT INTO accounts (id, email, password, username)
        VALUES($1, $2, $3, $4)`, [uuid.v4(), email, hashedPassword, username], (err, result) => {
          done();
          if (err) {
            console.log(err);
          } else {
            console.log(result);
          }
        });
  });
}

function getAccount({email}) {
  return new Promise((resolve, reject) => {
    pg.connect(psqlstring, function(err, client, done) {
      client.query('select * from accounts where email = $1', [email], (err, result) => {
        done();
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      });
    });
  });
}

function _createLogin({accountId}) {
  return new Promise((resolve, reject) => {
    pg.connect(psqlstring, function(err, client, done) {
      let id = uuid.v4();
      client.query('insert into logins (id, accountId) values ($1, $2)', [id, accountId], (err, result) => {
        done();
        if (err) {
          reject(err);
        } else {
          resolve({accountId, id});
        }
      });
    });
  });
}

function createLogin({email, password}) {
  return getAccount({email})
    .then(({rows}) => {
      if (rows.length === 0) {
        throw new Error("no account found");
      }
      let account = rows[0];
      if (!bcrypt.compareSync(password, account.password)) {
        throw new Error("invalid password");
      }
      return {accountId: account.id}
    })
    .then(_createLogin)
    .catch(err => console.log(err));
}
