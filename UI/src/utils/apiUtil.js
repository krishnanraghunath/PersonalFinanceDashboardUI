import configData from "../config.json"
class apiUtil {

    static callApi = async(api,params) => {
        let apiConfig = configData.API_CONFIG.APIS[api]
        let apiUrl = configData.API_CONFIG.APIS[api].url
        let call_params = ''
        let call_config = {method: apiConfig.method}
        Object.entries(params).forEach(entry => {call_params = call_params + entry[0] + '=' + entry[1] + '&'})
        const response =  apiUtil.fetchFromCacheApi(api,call_params)
        if(response){ return response}
        if (apiConfig.method == 'POST') { call_config['body'] = JSON.stringify(params)}   
        if (apiConfig.method == 'GET')  { apiUrl = apiUrl+ '?' + call_params} 
        var apiResponse = await  fetch(apiUrl,call_config)
                .then((res) => res.json())
                .then((json) => { 
                    if(json.error == null) {apiUtil.cacheApi(api,call_params,json)}
                    return json
                })
                .catch(function(error) {
                    return {'error':error}
        });
        return apiResponse
    }

    static cacheApi = (api,params,response) => {
        let apiConfig = configData.API_CONFIG.APIS[api]
        let apiDefaultTime = configData.API_CONFIG.DEFAULT_CACHE_TIME
        if (apiConfig.cache) {
            localStorage.setItem(api+'_'+params,
                JSON.stringify({'response':response,'expiry':Math.floor(Date.now()/1000)+ apiConfig.cache_ttl|apiDefaultTime}))
        }
    }

    static fetchFromCacheApi = (api,params) => {
        const response = JSON.parse(localStorage.getItem(api+'_'+params))
        if(response) {
            if((Math.floor(Date.now()/1000)) < response.expiry) {return response.response }
            localStorage.removeItem(api+'_'+params) //Clearing the expired value
        }    
        return null   
    }

    static  callAsync = async(api,params) => {
        if (api in configData.API_CONFIG.APIS) {
            let apiOutput = await apiUtil.callApi(api,params)
            return apiOutput
        } else {
            return {'error':'API not defined in local'}
        }

    }


}

export default apiUtil