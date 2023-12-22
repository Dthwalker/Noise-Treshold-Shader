export default class VideoLoader {

    constructor(input, video) {
        this.input  = input;
        this.block  = video;
        this.file   = null;
        this.size   = {w: 0, h: 0}
        this.img    = this.createImg();
    }

    getSize() {
        return this.size;
    }

    createImg() {
        this.img?.remove()
        let img = new Image();
        document.querySelector('.render-block').append(img);
        img.className = 'raw-img';
        img.style.display = 'none';
        return img
    }

    init(canvas, main) {
        this.input.addEventListener('change', () => {
            this.file = this.input.files[0];
            
            let url = URL.createObjectURL(this.file);
            if (!this.file.type.includes('video')) {
                this.img = this.createImg();
                this.img.src = url;
                this.img.onload = () => {
                    let p = this.img.height / this.img.width

                    this.size.w = this.img.width;
                    this.size.h = this.img.width * p;

                    this.img.width = this.size.w;
                    this.img.height = this.size.h;

                    canvas.resize(this.getSize(),this.img);

                    this.img.width = canvas.w;
                    this.img.height = canvas.h;

                    main.renderType = 'img';
                    canvas.draw(main.renderType);
                }
            } else {
                this.block.setAttribute("src", url);
                setTimeout(() => {
                    this.size.w = this.block.videoWidth
                    this.size.h = this.block.videoHeight
    
                    this.block.width = this.size.w;
                    this.block.height = this.size.h;
    
                    canvas.resize(this.getSize())
    
                    this.block.width = canvas.w;
                    this.block.height = canvas.h;               
                    
                    main.controls.time.max = this.block.duration
                    main.renderType = 'video';
                    console.log
                }, 2000);
            }
        })

        this.block.addEventListener('play', () => {
            console.log('play');
            main.process();
        })

        document.querySelectorAll('.resizing button').forEach((e,i) => {
            e.addEventListener('click', () => {
                if (main.renderType == 'video') {
                    if (i == 1) {
                        canvas.w = this.block.width  = Math.floor(this.block.width * 1.1)
                        canvas.h = this.block.height = Math.floor(this.block.height * 1.1)
                    } else {
                        canvas.w = this.block.width  = Math.floor(this.block.width * 0.9)
                        canvas.h = this.block.height = Math.floor(this.block.height * 0.9)
                    }
                } else {
                    if (i == 1) {
                        canvas.w = this.img.width  = Math.floor(this.img.width * 1.1)
                        canvas.h = this.img.height = Math.floor(this.img.height * 1.1)
                    } else {
                        canvas.w = this.img.width  = Math.floor(this.img.width * 0.9)
                        canvas.h = this.img.height = Math.floor(this.img.height * 0.9)
                    }
                }
                canvas.draw(main.renderType);
            });
        });
    }

}