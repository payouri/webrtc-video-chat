import { templates } from './loadHtmlFiles'
import { assets, readAsset } from './assetsIndex'

const Routes = {
    socketConnect: {
        path: '/join',
        method: 'GET',
        action: ctx => {
            ctx.body = 'hello world'
        }
    },
}

for (const template in templates) {
    Routes[`${template}Page`] = {
        path: `/${template}`,
        method: 'GET',
        action: ctx => {
            ctx.response.type = 'text/html'
            ctx.body = templates[template]
        }
    }
}
const assetsPathsArrays = assets.map(asset => {
    asset = asset.split('/')
    asset.splice(0, 1)
    return asset
})
const assetExists = pathArray => {
    // console.log('pathArray', pathArray)
    const possibleAssets = assetsPathsArrays.filter(assetArr => assetArr.length === pathArray.length)
    // console.log('possibleAssets', possibleAssets)
    if(possibleAssets.length === 0) return false
    for(let i = 0, n = possibleAssets.length; i < n; i++) {
        const asset = possibleAssets[i]
        for(let j = 0, m = asset.length; j < m; j++) {
            const assetSegment = asset[j]
            const pathSegment = pathArray[j]
            // console.log(assetSegment === pathSegment)
            if(assetSegment === pathSegment) {
                if(j === m - 1) {
                    return true
                }
            } else 
                break
        }
    }
    return false
}

export const Router = async (ctx, next) => {
    const { request: { method, url } } = ctx
    if(url.substring(0, '/socket'.length) === '/socket') await next()
    // console.log(method, ctx.request)
    const currentRoute = Object.values(Routes).find(route => route.path === url && route.method === method)
    if (currentRoute) {
        /* typeof currentRoute.action === 'function' && */ await currentRoute.action(ctx)
        await next()
    } else if (assetExists(ctx.pathLocation)) {
        const { file, mime } = await readAsset(ctx.pathLocation.join('/'))
        ctx.response.type = mime
        ctx.response.body = file
    } else {
        ctx.response.status = 404
    }
}