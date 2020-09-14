const express = require('express')
const app = express()
const PORT_NO = 5000
const connection = require('./db')

app.get("/", (req, res) => {
    res.send("Everything is working")
})

// Middlware
app.use(express.json())

// Routes

app.use('/api/users', require('./routes/users'))
app.use('/api/notes', require('./routes/notes'))



app.listen(PORT_NO, (res, err) => {
    if (err) {
        console.error(err)
    }
    else {
        console.log(`Server Started Running on PORT ${PORT_NO}`)
    }
})
