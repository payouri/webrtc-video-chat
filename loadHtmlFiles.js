import { readFileSync, readdirSync } from 'fs'
import { join } from 'path'

const regExp = /\.html$/
// console.log(process.cwd())
const directory = join(process.cwd(), '/html')
// console.log(directory)
export let templates = []

const loadHTMLFiles = () => {
    const htmlFiles = readdirSync(directory).filter(filename => regExp.test(filename)).map(filename => join(directory, filename))
    console.log(`loaded ${htmlFiles.length} html files`)
    templates = htmlFiles.reduce((obj, filePath) => {
        const templateName = filePath.substring(directory.length + 1, filePath.length - 5)
        obj[templateName] = readFileSync(filePath)
        return obj
    }, {})
}

loadHTMLFiles()