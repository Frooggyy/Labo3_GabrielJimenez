import * as utilities from "./utilities.js";
import * as serverVariables from "./serverVariables.js";

let requestCachesExpirationTime = serverVariables.get("main.requests.CacheExpirationTime");

// Repository file data models cache
global.requestCaches = [];
global.cachedRequestsCleanerStarted = false;

export default class CachedRequestsManager{

    static startCachedRequestsCleaner(){
        
        setInterval(CachedRequestsManager.flushExpired, requestCachesExpirationTime * 1000);
        console.log(BgWhite + FgGreen, "[Periodic requests data caches cleaning process started...]");

    } 
    static add(url, content, ETag=""){
        if (!cachedRepositoriesCleanerStarted) {
            cachedRequestsCleanerStarted = true;
            CachedRequestsManager.startCachedRequestsCleaner();
        }
        if (url != "") {

            CachedRequestsManager.clear(url);
            requestCaches.push({
                url,
                content,
                ETag,
                Expire_Time: utilities.nowInSeconds() + requestCachesExpirationTime
            });
            console.log(BgWhite + FgGreen, `[${url} request has been cached]`);
        }
    }
    static find(url){
        try {
            if (url != "") {
                for (let cache of requestCaches) {
                    if (cache.url == url) {
                        // renew cache
                        cache.Expire_Time = utilities.nowInSeconds() + requestCachesExpirationTime;
                        console.log(BgWhite + FgGreen, `[${cache.url} request retrieved from cache]`);
                        return cache;
                    }
                }
            }
        } catch (error) {
            console.log(BgRed + FgWhite, "[request cache error!]", error);
        }
        return null;
    }
    static clear(url){
        if (url != "") {
            let indexToDelete = [];
            let index = 0;
            for (let cache of requestCaches) {
                if (cache.url == url) indexToDelete.push(index);
                index++;
            }
            utilities.deleteByIndex(requestCaches, indexToDelete);
        }
    }
    static flushExpired(){
        let now = utilities.nowInSeconds();
        for (let cache of requestCaches) {
            if (cache.Expire_Time <= now) {
                console.log(BgWhite + FgGreen, "Cached request " + cache.url + " expired");
            }
        }
        requestCaches = requestCaches.filter( cache => cache.Expire_Time > now);
    }
    static get(HttpContext){
        let req = CachedRequestsManager.find(HttpContext.req.url)
        if(req){
            return HttpContext.response.JSON(req.content, req.ETag , true)
        }
        
        
    }

}