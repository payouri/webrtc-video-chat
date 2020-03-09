import fs, { readFile } from 'fs'
import path from 'path'
import { fromFile } from 'file-type'

export const fileType = Symbol('fileType')

const directory = path.join(process.cwd(), '/public')

function walk(dir, callback) {
    const files = fs.readdirSync(dir)
    files.forEach(function (file) {
        const filepath = path.join(dir, file)
        const stats = fs.statSync(filepath)
        if (stats.isDirectory()) {
            walk(filepath, callback)
        } else if (stats.isFile()) {
            callback(filepath, stats)
        }
    })
}
export let assets = []

const jsRegExp = /\.js$/
const cssRegExp = /\.css$/

walk(directory, async (path, stats) => {
    // path = new String(path)
    const rootPath = path.substring(path.indexOf('public') + 'public'.length).replace(/\\/g, '/')
    assets.push(rootPath)
})

export const readAsset = async relativePath => new Promise(async resolve => {
    const fullPath = path.join(directory, relativePath)
    const fileInfo = {}
    if(cssRegExp.test(relativePath)) {
        fileInfo.mime = 'text/css'
    } else if(jsRegExp.test(relativePath)) {
        fileInfo.mime = 'text/javascript'
    } else {
        const type = await fromFile(fullPath)
        fileInfo.mime = type.mime
    }
    readFile(fullPath, (err, file) => {
        fileInfo.file = file
        resolve(fileInfo)
    })
})
