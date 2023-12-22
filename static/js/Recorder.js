export default class Recorder {

    constructor(canvas, main) {
        this.init(canvas, main);
    }
    
    init(canvas, main) {
        this.chanks   = [];
        this.canvas   = canvas;
        this.stream   = this.canvas.captureStream(25);
        this.options  = {
            audioBitsPerSecond: 128000,
            videoBitsPerSecond: 600*1024*1024,
            mimeType: "video/webm; codecs=vp9",
        };
        this.recorder = new MediaRecorder(this.stream, this.options);
        this.rec      = false;
        this.main     = main;
        this.sound    = true;
    
        this.constrols();

    }

    stop(callback) {
        this.rec = false;
        document.querySelector('#recRec').style.cssText = !this.rec ? '' : 'background-color: white; color: rgb(10,10,10)';
        this.recorder.stop();
        this.video ? this.main.video.pause() : null;
        this.main.playData = false;
    }

    createVideo() {
        const video = document.createElement("video");
        video.controls = true;
        const blob = new Blob(this.chanks, { type: "video/webm", });
        const videoURL = URL.createObjectURL(blob);
        video.src = videoURL;
        document.querySelector('.render_v').append(video)
        console.log("recorder stopped");
    }

    save() {
        const blob = new Blob(this.chanks, { type: "video/webm", });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        document.body.appendChild(a);
        a.style = "display: none";
        a.href = url;
        a.download = "test.webm";
        a.click();
        window.URL.revokeObjectURL(url);
    }

    constrols() {
        let btnClick = (btn, stage) => {
            btn.style.cssText = !stage ? '' : 'background-color: white; color: rgb(10,10,10)';
        }

        document.querySelector('#recSound').onclick = (e) => {
            this.sound = !this.sound;
            e.target.innerHTML = this.sound ? 'Sound On': 'Sound Off'
        }

        document.querySelector('#recRec').onclick = (e) => {
            if (this.rec) return
            this.rec = !this.rec;
            btnClick(e.target, this.rec);
            console.log('start rec');

            
            this.recorder.start();
            this.main.renderI = this.main.canvas.startLoop;
            this.main.playData ? null : this.main.playData = true;
            this.main.playRender();
            if (this.sound) {
                this.audio    = this.main.video.captureStream(25)
                console.log(this.audio.getAudioTracks())
                this.stream.addTrack(this.audio.getAudioTracks()[0]);
                this.main.video.currentTime = this.main.vidStart;
                this.main.video.play();
            }
        }

        document.querySelector('#recStop').onclick = this.stop.bind(this);

        this.recorder.ondataavailable = (e) => {
            this.chanks.push(e.data);
            this.createVideo()
        };

        document.querySelector('#recSave').onclick = this.save.bind(this);

        document.querySelector('#recClear').onclick = () => {
            this.chanks   = null;
            this.chanks   = [];
            this.init(this.canvas, this.main);
            document.querySelector('.render_v').innerHTML = '';
        }

    }

}