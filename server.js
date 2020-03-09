import Koa from 'koa'
import socket from 'socket.io'
import { createServer } from 'http'

export class Server {
    static Initialize(serverInstance) {
        serverInstance._server = createServer(serverInstance._app.callback())
        serverInstance._io = socket(serverInstance._server)
        serverInstance._server.listen(serverInstance._DEFAULT_PORT, () => {
            console.log(`Application is starting on port ${serverInstance._DEFAULT_PORT}`)
        })

        serverInstance._io.on('connection', socket => {
            console.log('Socket connected.')
            const existingSocket = serverInstance._activeSockets.find(
                existingSocket => existingSocket === socket.id
            )

            if (!existingSocket) {
                serverInstance._activeSockets.push(socket.id)

                socket.emit('update-user-list', {
                    users: serverInstance._activeSockets.filter(
                        existingSocket => existingSocket !== socket.id
                    )
                })

                socket.broadcast.emit('update-user-list', {
                    users: [socket.id]
                })
            }

            socket.on('call-user', data => {
                socket.to(data.to).emit('call-made', {
                    offer: data.offer,
                    socket: socket.id
                })
            })

            socket.on('make-answer', data => {
                socket.to(data.to).emit('answer-made', {
                    socket: socket.id,
                    answer: data.answer
                })
            })

            socket.on('reject-call', data => {
                socket.to(data.from).emit('call-rejected', {
                    socket: socket.id
                })
            })

            socket.on('disconnect', () => {
                serverInstance._activeSockets = serverInstance._activeSockets.filter(
                    existingSocket => existingSocket !== socket.id
                )
                socket.broadcast.emit('remove-user', {
                    socketId: socket.id
                })
            })

        })
    }
    constructor({ port } = {}) {
        this._DEFAULT_PORT = port || process.env.DEFAULT_PORT
        this._app = new Koa()
        this._server = null //
        this._activeSockets = []
        this._io = null //socket is set in the Server.Initialize function

        Server.Initialize(this)
    }
    use(fn) {
        this._app.use(fn)
    }
    get io() {
        return this._io
    }
}