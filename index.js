const express = require('express')
var cors = require('cors')
const app = express()
const server = require('http').createServer(app)
const io = require('socket.io')(server)
const router  = express.Router();
const fs = require('fs');
const port = process.env.PORT || 3000;

app.use(cors())
app.use(router);
app.set("view engine", "ejs");

app.get("/", (req,res) => {
    res.render('app')
});

router.get('/video', (req, res) => {
    // video static path
    const path = 'public/video.mp4';

fs.stat(path, (err, stat) => {
    //include video in nodejs
    if (err !== null && err.code === 'ENOENT') {
        res.sendStatus(404);
    }

    const fileSize = stat.size
    const range = req.headers.range

    if (range) {

        const parts = range.replace(/bytes=/, "").split("-");

        const start = parseInt(parts[0], 10);
        const end = parts[1] ? parseInt(parts[1], 10) : fileSize-1;
        
        const chunksize = (end-start)+1;
        const file = fs.createReadStream(path, {start, end});
        const head = {
            'Content-Range': `bytes ${start}-${end}/${fileSize}`,
            'Accept-Ranges': 'bytes',
            'Content-Length': chunksize,
            'Content-Type': 'video/mp4',
        }
        
        res.writeHead(206, head);
        file.pipe(res);
    } else {
        const head = {
            'Content-Length': fileSize,
            'Content-Type': 'video/mp4',
        }

        res.writeHead(200, head);
        fs.createReadStream(path).pipe(res);
    }
});
});


server.listen(port, () => {
    console.log(`Server running at port ${port}`)
})

io.on('connection', (socket) => {
    console.log("User connected: "+ socket.id)

    socket.on("message", (data) => {
        socket.broadcast.emit('message', data)
    })
})

module.exports = app;
