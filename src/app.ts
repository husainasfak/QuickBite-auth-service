import express from 'express'

const app = express()

app.get('/', (req, res) => {
    res.send('Auth Services')
})

export default app
