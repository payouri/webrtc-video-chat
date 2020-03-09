import { Server } from './server.js'
import { Router } from './router'

const server = new Server()

const parseQuery = str => {
    const keysVals = str.substring(1).split('&')
    const queryObj = {}
    for(let i = 0, n = keysVals.length; i < n; i ++) {
        const [key, value] = keysVals[i].split('=')
        if(key && value)
            queryObj[key] = value
    } 
    return queryObj
}

server.use(async (ctx, next) => {
    let { request: { url } } = ctx
    url = url.split('/')
    url.splice(0, 1)
    Object.assign(ctx, {
        queryObj: url[url.length - 1].indexOf('?') > -1 ? parseQuery(url[url.length - 1]) : {},
        pathLocation: url
    })
    await next()
})
server.use(Router)

// console.log(server/* , process.env */)