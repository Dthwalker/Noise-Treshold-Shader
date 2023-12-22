import Threshold from "./Threshold.js"
import VideoLoader from "./VideoLoader.js"
import Recorder from "./Recorder.js";


class Main {

    constructor(canvas, input, video, nav) {
        this.video      = video;
        this.canvas     = new Threshold(canvas, this.getAutodraw.bind(this), video);
        this.loader     = new VideoLoader(input, video);
        this.recorder   = new Recorder(this.canvas.canvas, this);
        this.renderType = 'video';
        this.nav        = nav;
        this.controls   = {play: null, time: null}
        this.playData   = false;
        this.render     = false;
        this.loopRender = true;
        this.renderTime = document.querySelector('#renderTime');
        this.vidStart   = null;
        this.renderI    = 0;
        this.autodraw   = false;
        this.icons      = {
            play  : '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M8 19V5L19 12L8 19Z" fill="#B4B4B4"/></svg>',
            pause : '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M13 19V5H19V19H13ZM5 19V5H11V19H5Z" fill="#B4B4B4"/></svg>',
            volume: {off : '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M19.7999 22.6L16.7749 19.5751C16.3582 19.8417 15.9166 20.0711 15.4499 20.2631C14.9832 20.4544 14.4999 20.6084 13.9999 20.725V18.675C14.2332 18.5917 14.4626 18.5084 14.6879 18.425C14.9126 18.3417 15.1249 18.2417 15.3249 18.125L11.9999 14.8V20L6.9999 15H2.9999V9.00005H6.1999L1.3999 4.20005L2.7999 2.80005L21.1999 21.2001L19.7999 22.6ZM19.5999 16.8L18.1499 15.35C18.4332 14.8334 18.6459 14.2917 18.7879 13.725C18.9292 13.1584 18.9999 12.575 18.9999 11.975C18.9999 10.4084 18.5416 9.00838 17.6249 7.77505C16.7082 6.54172 15.4999 5.70838 13.9999 5.27505V3.22505C16.0666 3.69172 17.7499 4.73738 19.0499 6.36205C20.3499 7.98738 20.9999 9.85838 20.9999 11.975C20.9999 12.8584 20.8792 13.7084 20.6379 14.525C20.3959 15.3417 20.0499 16.1 19.5999 16.8ZM16.2499 13.45L13.9999 11.2V7.95005C14.7832 8.31672 15.3959 8.86672 15.8379 9.60005C16.2792 10.3334 16.4999 11.1334 16.4999 12C16.4999 12.25 16.4792 12.496 16.4379 12.738C16.3959 12.9794 16.3332 13.2167 16.2499 13.45ZM11.9999 9.20005L9.3999 6.60005L11.9999 4.00005V9.20005Z" fill="#B4B4B4"/></svg>',
                     on  : '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M5 15V9H9L14 4V20L9 15H5ZM16 16V7.95C16.75 8.3 17.354 8.84167 17.812 9.575C18.2707 10.3083 18.5 11.1167 18.5 12C18.5 12.8833 18.2707 13.6833 17.812 14.4C17.354 15.1167 16.75 15.65 16 16Z" fill="#B4B4B4"/></svg>',
                     max : '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M14 20.7251V18.6751C15.5 18.2418 16.7083 17.4084 17.625 16.1751C18.5417 14.9418 19 13.5418 19 11.9751C19 10.4084 18.5417 9.00843 17.625 7.7751C16.7083 6.54176 15.5 5.70843 14 5.2751V3.2251C16.0667 3.69176 17.75 4.73776 19.05 6.3631C20.35 7.98843 21 9.8591 21 11.9751C21 14.0918 20.35 15.9628 19.05 17.5881C17.75 19.2134 16.0667 20.2591 14 20.7251ZM3 15.0001V9.0001H7L12 4.0001V20.0001L7 15.0001H3ZM14 16.0001V7.9501C14.7833 8.31676 15.396 8.86676 15.838 9.6001C16.28 10.3334 16.5007 11.1334 16.5 12.0001C16.5 12.8501 16.279 13.6378 15.837 14.3631C15.395 15.0884 14.7827 15.6341 14 16.0001Z" fill="#B4B4B4"/></svg>'}
        }
    }

    getAutodraw() { return this.autodraw }

    process() {
        if (this.renderType != 'video') return this.canvas.draw(this.renderType);
        if (this.video.paused || this.video.ended) {
            this.controls.play.innerHTML = this.icons.play;
            console.log('stop')
        } else {
            this.controls.time.value = this.video.currentTime

            this.recorder.rec ? null : this.canvas.draw(this.renderType);

            window.requestAnimationFrame(this.process.bind(this));
        }

    }

    navigator() {
        this.controls.play   = this.nav.querySelector('#play-pause');
        this.controls.time   = this.nav.querySelector('#timeline');
        this.controls.volume = this.nav.querySelector('#volume');

        // play/pause


        this.controls.play.addEventListener('click', () => {
            if (this.loader.file) {
                if (this.renderType != 'video') return this.canvas.draw(this.renderType);
                this.controls.play.innerHTML = this.icons.pause;
                this.video.paused || this.video.ended ? this.video.play() :
                                                        this.video.pause()
            } else {
                console.log('video not loaded')
            }
        })

        // timeline
        this.controls.time.addEventListener('input', (e) => {
            if (this.renderType != 'video') return;
            this.video.currentTime = e.target.value
            this.video.oncanplay = () => this.canvas.draw(this.renderType);
        })

        // volume
        let mute = this.nav.querySelector('#vol__icon')
        this.controls.volume.addEventListener('input', (e) => {
            this.video.volume = e.target.value
            e.target.value > 0 ? this.video.muted = false : this.video.muted = true
            if (this.video.muted) {
                mute.innerHTML = this.icons.volume.off
            } else {
                this.video.volume >= 1 ? mute.innerHTML = this.icons.volume.max :
                                         mute.innerHTML = this.icons.volume.on
            }
        })

        mute.addEventListener('click', () => {
            if (this.video.muted) {
                this.video.muted = false;
                this.video.volume >= 1 ? mute.innerHTML = this.icons.volume.max :
                mute.innerHTML = this.icons.volume.on
            } else {
                this.video.muted = true;
                mute.innerHTML = this.icons.volume.off
            }
        })

        let roto = document.getElementById('rotate');

        roto.onclick = () => {
            let space = document.querySelector('.render-block')
            space.style.display == 'block' ? space.style.display = 'flex' :
                                             space.style.display = 'block'
        }

        document.getElementById('show-original').addEventListener('click', (e) => {
            if (e.target.innerHTML == 'show original') {
                e.target.innerHTML = 'hide original';
                this.renderType == 'video' ? this.video.style.display = 'block' : this.loader.img.style.display = 'block';
                roto.style.display = 'block'
            } else {
                e.target.innerHTML = 'show original'
                this.video.style.display = 'none';
                this.loader.img.style.display = 'none';
                roto.style.display = 'none'
            }
        });

        document.querySelector('#createData').onclick = (e) => {
            this.render = !this.render;
            e.target.style.cssText = !this.render? '' : 'background-color: white; color: rgb(10,10,10)';
            if (this.render) {
                this.video.loop = false;
                this.makeRender();
                this.vidStart = this.video.currentTime;
            }
        }

        document.querySelector('#playData').onclick = (e) => {
            this.playData = !this.playData;
            e.target.style.cssText = !this.playData? '' : 'background-color: white; color: rgb(10,10,10)';
            if (this.playData) {
                this.playRender();
            }
        }

        document.querySelector('#clearData').onclick = () => {
            this.canvas.imgData = [];
            this.renderI  = 0;
            this.renderTime.max = 0;
            document.querySelector('#startLoop').max = 0;
            document.querySelector('#endLoop').max = 0;
            console.log('clear data');
        }

        this.renderTime.addEventListener('input', (e) => {
            this.renderI = e.target.value;
            this.canvas.ctx.putImageData(this.canvas.imgData[this.renderI], 0, 0)
            console.log('set data ' + this.renderI);
        });

        document.querySelector('#loopRender').onclick = (e) => {
            this.loopRender = !this.loopRender;
            e.target.innerHTML = this.loopRender ? "Loop" : "Not Loop"
        }

        document.querySelector('#autodraw').onclick = (e) => {
            this.autodraw = !this.autodraw;
            e.target.style.cssText = !this.autodraw ? '' : 'background-color: white; color: rgb(10,10,10)';
        }

        document.querySelector('#download').onclick = this.download.bind(this);

        document.querySelector('#downloadData').onclick = this.downloadData.bind(this);
    }

    download(n = ' ') {
        let data = this.canvas.canvas.toDataURL();
        let a = document.createElement('a');
        a.href = data;
        a.download = 'img' + n;
        a.click();
    }

    async downloadData() {
        let data = this.canvas.imgData
        if (!data.length) return console.log('Data is empty');
        let output = new FormData();
        output.append("title", "newFrames");
        let n = 0;
        for (let i = this.canvas.startLoop; i < this.canvas.endLoop; i++) {
            this.canvas.ctx.putImageData(data[i], 0, 0);
            let img = this.canvas.canvas.toDataURL();
            
            output.append('img', img );

            n++
        }
        output.append('w', this.canvas.canvas.width);
        output.append('h', this.canvas.canvas.height);
        let response = await fetch('/saveFrames', {
            method: "POST",
            body: output,
        });

        let result = await response.json();
        console.log(result.message);
    }

    async makeRender() {
        this.canvas.createData(this.renderType);
        this.renderTime.max = this.canvas.imgData.length - 1;
        this.renderTime.min = 0;
        this.renderTime.value = this.renderI;
        this.canvas.endLoop = this.canvas.imgData.length - 1
        document.querySelector('#startLoop').max = this.canvas.imgData.length - 1;
        document.querySelector('#endLoop').max = this.canvas.imgData.length - 1;
        document.querySelector('#endLoop').value = this.renderTime.max;

        let frame = 1 / this.canvas.frame;

        this.video.currentTime = (this.video.currentTime + frame).toFixed(2)
        this.controls.time.value = this.video.currentTime
        
        this.video.oncanplay = (event) => {
            if (this.video.currentTime < this.controls.time.max && this.render) {
                requestAnimationFrame(this.makeRender.bind(this));
            } else {
                console.log(this.canvas.imgData)
                console.log('ready')
                this.video.loop = true;
                this.render = false;
                document.querySelector('#createData').style.cssText = '';
            }

        };
    }

    playRender() {
        !this.loopRender && this.renderI >= this.canvas.imgData.length ? this.renderI = 0 : null;
        this.canvas.ctx.putImageData(this.canvas.imgData[this.renderI], 0, 0);
        
        this.renderI++;

        if (this.loopRender) {
            this.renderI > this.canvas.endLoop ? this.renderI = this.canvas.startLoop : null
        } else {
            if (this.renderI >= this.canvas.endLoop) {
                this.renderI = 0;
                this.playData = false;
                this.recorder.rec ? this.recorder.stop() : null;
            } 
        }

        this.renderTime.value = this.renderI;
        this.renderTime.previousElementSibling.innerHTML = this.renderI;

        if (this.playData && this.canvas.imgData[this.renderI]) {
            setTimeout(this.playRender.bind(this), Math.floor(1000 / this.canvas.frame))
        } else {
            this.playData = false;
            document.querySelector('#playData').style.cssText = '';
        }
    }

    init() {
        this.loader.init(this.canvas, this);
        this.navigator();
        this.canvas.init(this);
    }

}

const halftone = new Main(document.getElementById('cnv'),
                                  document.getElementById('loader'),
                                  document.getElementById('raw-video'),
                                  document.getElementById('navigator'))

halftone.init();

function getColor() {
    let [v1,v2] = [...document.querySelectorAll('.color input')]
    console.log(v1.value, v2.value)
}