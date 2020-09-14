const mysql = require('mysql')


const connection =  mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'test'
})

connection.connect((err) => {
    if (!err) {
        console.log('Connection SuccessFul')
    } else {
        console.error(err)
    }
})

module.exports = connection
