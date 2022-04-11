module.exports = Object.freeze({
    //Authentication related constants
    APP_CLIENT_ID: process.env.APP_CLIENT_ID,
    AUTH_ENDPOINT: process.env.AUTH_ENDPOINT,
    LOGIN_ENDPOINT: '/oauth2/authorize?client_id='+process.env.APP_CLIENT_ID+'+&response_type=code&scope=email+openid&redirect_uri=https%3A%2F%2F'+process.env.HOME_ENDPOINT+'%2Flogin',
    TOKEN_ENDPOINT: '/oauth2/token',
    CODE_TOKEN_EXCHANGE_HEADERS : {
        'Content-Type' : 'application/x-www-form-urlencoded',
        'Authorization' : 'Basic '+process.env.B64CLIENTSECRET
    },
    CODE_TOKEN_EXCHANGE_BODY : {
        'grant_type' : 'authorization_code',
        'client_id' : process.env.APP_CLIENT_ID,
        'redirect_uri' :'https://'+process.env.HOME_ENDPOINT+'/login',
        'code' : null //To be filled later based on redirect from auth login
    },
    SESSION_EXPIRY_DEFAULT_TIME : 900,

    //Backend API URL 
    //TODO: Need to setup private apis
    BACKEND_API_URL : process.env.BACKEND_API_URL,


});
