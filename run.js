const express = require("express");
const path = require("path");
const fs = require('fs');
const bodyParser = require('body-parser');
const multer = require('multer');
const ImageDataURI = require('image-data-uri');
const GIFEncoder = require('gifencoder');
const { createCanvas, loadImage } = require('canvas');


const app = express();
const urlencodedParser = bodyParser.urlencoded({extended: false});

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const upload = multer({
  dest: path.join(__dirname, 'uploads')
});

app.use(express.static(__dirname + '/static'));



app.get('/', function (request, response) {
    response.sendFile(path.resolve(__dirname, 'static', 'index.html'))
});

app.get('/getPatterns', function (request, response) {
    fs.readdir('./static/pattern/', (err, files) => {
        if (err) throw err;
        response.json({ 'patterns': files });
    });
});


app.post('/saveFrames', upload.fields([{name: 'fileEmailTo'}, {name: 'fileMessageTo'}]), function (request, response) {
    if(!request.body) return response.sendStatus(400);
    let p = (__dirname + '\\SavesFrames')
    let n = fs.readdirSync(p).map(e => Number(e)).sort((a,b)=>a-b);
    n = n.length ?  n.at(-1) + 1 : 1
    fs.mkdirSync((p+'\\'+n), (error) => {return console.log(error)});

    let files = request.body.img
    for (let i = 0; i < files.length; i++) {
        ImageDataURI.outputFile(files[i], `${p}/${n}/img-`+i);
    }

    //setTimeout(() => {
    //    createGif(request.body.w, request.body.h, (`${p}/${n}`))
    //}, 2000);

    response.send({ message: 'Files is created!' });
});

function createGif(w,h,path) {
    console.log(w, h)
    
    const encoder = new GIFEncoder(w, h);
    encoder.createReadStream().pipe(fs.createWriteStream(path + '/result.gif'));

    encoder.start();
    encoder.setRepeat(0);
    encoder.setDelay(500);
    encoder.setQuality(10);

    const canvas = createCanvas(w, h);
    const ctx = canvas.getContext('2d');
    
    const imgList = fs.readdirSync(path+'\\');
    console.log(path, imgList)
    imgList.forEach(async (f) => {
        const image = await loadImage(path + `\\${f}`);
        ctx.drawImage(image, 0, 0, w, h, 0, 0, w, h);
        encoder.addFrame(ctx);
    });
    encoder.finish();
}


app.listen(3000);

console.log('Server is start');