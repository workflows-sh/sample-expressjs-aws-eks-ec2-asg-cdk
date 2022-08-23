const express = require('express')
const mysql = require('mysql')

const PORT = process.env.PORT || 3000
const HOST = '0.0.0.0'

console.log(process.env)

const api = express()
api.get('/', (req, res) => {
  res.send('PROD-193\n')
})

api.listen(PORT, HOST)
console.log(`Running on http://${HOST}:${PORT}`)
