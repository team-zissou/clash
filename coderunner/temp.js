const os = require('os')
const fs = require('fs')
const uuid = require('node-uuid')

const tempDir = os.tmpdir()

function makeTemp() {
  return new Promise((resolve, reject) {
    const name = `tempDir/${uuid.v4()}`
    fs.open(name, 'a', (err, fd) => {
      if (err) return reject(err)
        

    })
  }
}
