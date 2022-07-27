const path = require('path')
const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const compression = require('compression')
const cookieParser = require('cookie-parser');
const constants = require("./constants");
const authenticationHelper = require("./helpers/authenticationHelper")
const apiHelper = require("./helpers/apiService")
const resourceManager = require('./helpers/resourceManager')
const storageService = require('./helpers/storageService')
const multer = require('multer')
const { callbackify } = require('util')


const app = express()
const router = express.Router()
router.use(compression())
router.use(cors())
app.use(cookieParser());
router.use(bodyParser.json())
router.use(bodyParser.urlencoded({ extended: true }))
//Serving static assets
router.use('/static',express.static(path.join(__dirname,'/public/static')))


/* This is a very basic authentication.
* If sessionId is present in cookies allow and redirect to all page
* If code is not present => Redirect to Login page
* If code is present but failed to get token ==> Sent forbidden
* If code is present and valid fetch the access tokens and find the user id then create an entry in session table with details
* with a session id created with expiry time as 10 minutes. set the sessionId in cookie and redirect
* THINK OF A BETTER WAY TO SECURE. THIS MAY BE JUST SAFE TILL PRODUCTION. FURTHER INVESTIGATION NEEDED ON THIS ONE
*
*/
router.get('/login', (req, res) => {
  authenticationHelper.authenticate(req,function(error,data){
    if(error) {
      let authentication_code = req.query.code
      if (authentication_code == null) {res.redirect(constants.AUTH_ENDPOINT + constants.LOGIN_ENDPOINT);return}
      authenticationHelper.get_token_from_code(authentication_code,function(error,body) {
        if(error) {res.sendStatus(403);return}
        authenticationHelper.add_new_session(req,body,function(error,data){
          if(error) {res.send(502);return}
          res.cookie("_SESSION", data)
          res.redirect('/')
        })
      })
      return
    }
    res.redirect('/')
  })
})

router.get('/pyapi/*',(req,res) =>{
  authenticationHelper.authenticate(req,function(error,data) {
    if(error){res.redirect('/');return}
    req.user_id = data
    apiHelper.call_api(req,function(error,data){
      if(error){res.sendStatus(500);return}
      res.send(data)
    })
  })
})


router.post('/pyapi/*',(req,res) =>{
  authenticationHelper.authenticate(req,function(error,data) {
    if(error){res.redirect('/');return}
    req.user_id = data
    apiHelper.call_api(req,function(error,data){
      if(error){res.sendStatus(500);return}
      res.send(data)
    })
  })
})


router.get('/jsapi/get_available_account_types',(req,res) => {
  authenticationHelper.authenticate(req,function(err,dat) {
    if(err) {res.redirect('/');return} 
    resourceManager.get_available_account_types(function(error,data){
      if(error)res.send({ 'error':error })
      else res.send({'data':data})
    })
  })
})

router.get('/jsapi/get_available_institutions',(req,res) => {
  authenticationHelper.authenticate(req,function(err,dat) {
    if(err) {res.redirect('/');return} 
    let account_type = req.query.account_type
    if(account_type==null){console.log('No account_type param defined');res.send({'error':'Bad Request'});return}
    resourceManager.get_available_institutions_for_account_type(account_type,function(error,data){
      if(error)res.send({ 'error':error })
      else res.send({'data':data})
    })
  })
})

router.post('/jsapi/create_account',(req,res) => {
  authenticationHelper.authenticate(req,function(err,dat) {
    if(err) {res.send({'error':"Not Authenticated"});return} 
    resourceManager.create_account_id_resource_for_user(dat,JSON.parse(req.body),function(error,data){
      if(error){
        if (error == 'ConditionalCheckFailedException') {res.send({'error':'Account already exists'});return}
        res.send({'error':'Internal Server Error'})
        return
      }
      res.send({'data':'Created'})
    })
  })
})

router.post('/jsapi/delete_account',(req,res) => {
  authenticationHelper.authenticate(req,function(err,dat) {
    if(err) {res.send({'error':"Not Authenticated"});return} 
    let accountId = JSON.parse(req.body).accountId
    if(accountId == null){res.send({'error':'Invalid Request'});return}
    resourceManager.delete_account_for_user(dat,accountId,function(error,data){
      if(error){
        res.send({'error':'Internal Server Error'});return
      }
      res.send({'data':'Deleted'})
    })
  })
})

router.get('/jsapi/get_accounts',(req,res) => {
  authenticationHelper.authenticate(req,function(err,dat) {
    if(err) {res.send({'error':"Not Authenticated"});return} 
    resourceManager.get_accounts_for_user(dat,function(error,data){
      if(error){console.log(error);res.send({'error':'Internal Server Error'});return}
      res.send({'data':data})
    })
  })
})


router.post('/jsapi/create_tag',(req,res) => {
  authenticationHelper.authenticate(req,function(err,dat) {
    if(err) {res.send({'error':"Not Authenticated"});return} 
    resourceManager.add_tag_for_user(dat,JSON.parse(req.body),function(error,data){
      if(error){res.send({'error':'Internal Server Error'});return}
      res.send({'data':'Created'})
    })
  })
})


router.post('/jsapi/delete_tag',(req,res) => {
  authenticationHelper.authenticate(req,function(err,dat) {
    if(err) {res.send({'error':"Not Authenticated"});return} 
    resourceManager.delete_tag_for_user(dat,JSON.parse(req.body),function(error,data){
      if(error){res.send({'error':'Internal Server Error'});return}
      res.send({'data':'Removed'})
    })
  })
})

router.get('/jsapi/get_user_tags',(req,res) => {
  authenticationHelper.authenticate(req,function(err,dat) {
    if(err) {res.send({'error':"Not Authenticated"});return} 
    resourceManager.get_tags_for_user(dat,function(error,data){
      if(error){res.send({'error':'Internal Server Error'});return}
      res.send({'data':data})
    })
  })
})

router.get('/jsapi/get_tag_info_by_id',(req,res) => {
  authenticationHelper.authenticate(req,function(err,dat) {
    if(err) {res.send({'error':"Not Authenticated"});return} 
    let tagName = req.query.tagName
    resourceManager.get_tag_by_tag_name(dat,tagName,function(error,data){
      console.log(error)
      console.log(data)
      if(error){res.send({'error':'Internal Server Error'});return}
      res.send({'data':data})
    })
  })
})





router.get('/jsapi/get_attached_accounts_for_tag',(req,res) => {
  authenticationHelper.authenticate(req,function(err,dat) {
    if(err) {res.send({'error':"Not Authenticated"});return} 
    let tagName =  req.query.tagName
    resourceManager.get_attached_accounts_for_tag(dat,tagName,function(error,data){
      if(error){console.log(error);res.send({'error':'Internal Server Error'});return}
      res.send({'data':data})
    })
  })
})







//A temperory function to create resource mapping in backend
router.get('/jsapi/add_resource_relation',(req,res) => {
  authenticationHelper.authenticate(req,function(err,dat) {
    if(err) {res.redirect('/');return}
    let resourceValue = req.query.ResourceValue
    let resourceType = req.query.ResourceType
    let resourceGroup = req.query.ResourceGroup
    resourceManager.add_resource(resourceGroup,resourceType,resourceValue,function(error,data){
        if(error){res.send(400);return}
        res.sendStatus(200)
      })
  })
})


router.post('/jsapi/upload_transactions',storageService.localUpload.single('transactionsFile'),(req,res) => {
  authenticationHelper.authenticate(req,function(err,dat) {
    if(err) {res.send({'error':"Not Authenticated"});return} 
    storageService.s3Upload(dat,req,function(error,data){
       console.log(error)
       if(error){res.send({'error':'Internal Server Error'});return}
       res.send({'data':{}})
    })
  })
})

router.get('/*', (req, res) => {
  authenticationHelper.authenticate(req,function(error,data) {
    if(error) {res.redirect('/login');return}
    if (req.path == '/') {res.sendFile(`${__dirname}/public/index.html`);return}
    res.sendFile(`${__dirname}/public${req.path}`)
  })
})



// The serverless-express library creates a server and listens on a Unix
// Domain Socket for you, so you can remove the usual call to app.listen.
// app.listen(3000)
app.use('/', router)

// Export your express server so you can import it in the lambda function.
module.exports = app
