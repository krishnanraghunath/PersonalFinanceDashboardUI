const path = require('path')
const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const compression = require('compression')


const app = express()
const router = express.Router()
router.use(compression())
router.use(cors())
//router.use(express.static('public'))
router.use(bodyParser.json())
router.use(bodyParser.urlencoded({ extended: true }))
router.use('perfinui',express.static(path.join(__dirname,'/public')))
router.use('/static',express.static(path.join(__dirname,'/public/static')))

router.get('/*', (req, res) => {
  // res.sendFile(`${__dirname}/public/index.html`)

  console.log(req.path)
  if (req.path == '/') {res.sendFile(`${__dirname}/public/index.html`)}
  else {res.sendFile(`${__dirname}/public${req.path}`)}
})



// The serverless-express library creates a server and listens on a Unix
// Domain Socket for you, so you can remove the usual call to app.listen.
// app.listen(3000)
app.use('/', router)

// Export your express server so you can import it in the lambda function.
module.exports = app