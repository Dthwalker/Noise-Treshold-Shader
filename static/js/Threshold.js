import random from "./Random.js";
import Pattern from "./Pattern.js";


export default class Threshold {

    constructor(canvas, autodraw, video) {
        this.canvas       = canvas;
        this.ctx          = this.canvas.getContext('2d', { willReadFrequently: true });
        this.video        = video;
        this.img          = null;
        this.data         = null;
        this.canvasScale  = 1;
        this.colors       = ['#0a0a0a', '#c8c8c8'];
        this.colored      = false;
        this.opacity      = 0.2;
        this.noisePers    = 98;
        this.size         = 2.4;
        this.w            = null;
        this.h            = null;
        this.bright       = 0;
        this.half         = 34;
        this.colored      = false;
        this.contrast     = -5;
        this.noise        = false;
        this.chaotic      = 17.68;
        this.imgData      = [];
        this.frame        = 24
        this.bg           = false;
        this.startLoop    = 0;
        this.endLoop      = 0;
        this.autodraw     = autodraw;
        this.canvasMulti  = 1;
        this.canvasResize = false;
        this.patternSize  = 0.06;
        this.patternOp    = 0.15;
        this.addPattern   = false;
        this.noiseCount   = 5;
    }

    get pattern() { return Pattern.data }

    resize(v, img) {
        let limit = 0.9;
        this.w = Math.floor(v.w * limit);
        this.h = Math.floor(v.h * limit);
        if (this.w >= innerWidth * limit || this.h >= innerHeight * limit) {
            this.resize({w: this.w, h: this.h},img)
        } else {
            this.img = img;
            this.canvas.width = this.w
            this.canvas.height = this.h

            return
        }
    }

    drawPattern() {
        this.ctx.globalAlpha = this.patternOp;

        let pattern = this.pattern;
        let matrix = new DOMMatrixReadOnly();
        let size = this.patternSize 

        pattern.setTransform(matrix.scale(size));
        
        this.ctx.fillStyle = pattern;
        this.ctx.fillRect(0,0,this.w,this.h);

        this.ctx.globalAlpha = 1;
    }

    addNoise() {
        this.ctx.globalAlpha = this.opacity;

        for (let y = 0; y < this.h; y+=this.noiseCount) {
            for (let x = 0; x < this.w; x+=this.noiseCount) {
                this.ctx.fillStyle = random(0,100) < this.noisePers ? 'rgba(0,0,0)' : 'rgba(255,255,255)';
                this.ctx.fillRect(x + random(-this.chaotic,this.chaotic),
                                  y + random(-this.chaotic,this.chaotic),
                                  random(0,this.size),
                                  random(0,this.size));
            }
        }
        this.ctx.globalAlpha = 1;
    }

    pushPixels() {
        let con = (l,f = false) => {
            let a = l + ( !f ? (this.contrast * 0.4) : -(this.contrast * 0.4) )
            return a = this.contrast < 0 ? f ? a > 255/2 ? 255/2 : a : a < 255/2 ? 255/2 : a : a
        }

        !this.bg ? this.ctx.clearRect(0, 0, this.w, this.h) : null

        let [w, h] = [this.w, this.h].map(e => e * this.canvasMulti);
        if (this.canvasResize) {
            this.canvas.width  = w;
            this.canvas.height = h;
        }

        let [x, y] = [0,0];

        for (let i = 0; i < this.data.data.length; i+=4) {
            let p = Math.max(this.data.data[i],this.data.data[i+1],this.data.data[i+2]) + random(-this.half, this.half);
            
            p = p > 255/2 ? con(p) : con(p, true);

            let r,g,b,a;

            if (p < 255/2 - this.bright) {
                r = this.data.data[i+0] = parseInt(this.colors[0].slice(1, 3), 16);
                g = this.data.data[i+1] = parseInt(this.colors[0].slice(3, 5), 16);
                b = this.data.data[i+2] = parseInt(this.colors[0].slice(5, 7), 16);
                a = this.data.data[i+3] = 255;
            } else {
                r = this.data.data[i+0] = this.colored ? this.data.data[i+0] + this.contrast: parseInt(this.colors[1].slice(1, 3), 16);
                g = this.data.data[i+1] = this.colored ? this.data.data[i+1] + this.contrast: parseInt(this.colors[1].slice(3, 5), 16);
                b = this.data.data[i+2] = this.colored ? this.data.data[i+2] + this.contrast: parseInt(this.colors[1].slice(5, 7), 16);
                a = this.data.data[i+3] = this.colored ? this.data.data[i+3] + this.contrast: 255;
            }

            if (this.canvasResize) {
                this.ctx.fillStyle = `rgba(${[r,g,b,a]})`;
                this.ctx.fillRect(x, y,(1 * this.canvasMulti).toFixed(1),(1 * this.canvasMulti).toFixed(1));
                x += 1 * this.canvasMulti
                if (x >= w) {
                    y += 1 * this.canvasMulti;
                    x = 0;
                }
            }
        }

        this.canvasResize ? null : this.ctx.putImageData(this.data, 0, 0);

    }

    draw(type) {

        this.canvas.width  = this.w;
        this.canvas.height = this.h;
        
        this.ctx.drawImage(type == 'video' ? this.video : this.img, 0, 0, this.w, this.h);

        if (this.noise) this.addNoise();
        if (this.addPattern) this.drawPattern();
        this.data = this.ctx.getImageData(0, 0, this.w, this.h);

        this.pushPixels();
    }

    createData(type) {
        this.draw(type)
        this.imgData.push(this.ctx.getImageData(0, 0, this.w * this.canvasMulti, this.h * this.canvasMulti))

    }

    init(main) {
        this.canvas.imageSmoothingEnabled = false;
        Pattern.init();

        this.addControls(main);

    }

    createColors(colors, main) {
        let space = document.querySelector('.color-presets .color-grid');
        let set = (c) => {this.colors = c; document.querySelectorAll('.color input').forEach((e,i) => e.value = c[i])}
        colors.forEach(e => {
            let block = document.createElement('div');
            block.className = 'preset_p';
            block.innerHTML =  `<svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <rect width="100" height="100" fill="${e[0]}" />
                                    <rect x="25" y="25" width="50" height="50" fill="${e[1]}" />
                                </svg>`;
            space.append(block);
            block.onclick = () => {
                set(e);
                if (this.autodraw()) this.draw(main.renderType);
            }
        });
    }

    addControls(main) {
        let btnClick = (btn, stage) => {
            btn.style.cssText = !stage ? '' : 'background-color: white; color: rgb(10,10,10)';
            if (this.autodraw()) this.draw(main.renderType);
        }

        document.querySelector('#addPattern').onclick = (e) => {
            this.addPattern = !this.addPattern;
            btnClick(e.target, this.addPattern);
        }

        document.querySelector('.canvas-resize input').addEventListener('input', (e) => {
            let val = this.canvasMulti = Number(e.target.value);
            e.target.previousElementSibling.innerHTML = val;
            if (this.autodraw()) this.draw(main.renderType);
        });

        document.querySelector('#canvasResize').onclick = (e) => {
            this.canvasResize = !this.canvasResize;
            e.target.innerHTML = this.canvasResize ? 'Enable' : 'Disable';
            btnClick(e.target, this.canvasResize);
        }

        document.querySelectorAll('.inp_p input').forEach((e,i) => {
            e.addEventListener('input', el => {
                let val = Number(el.target.value);
                el.target.previousElementSibling.innerHTML = val;
                i == 0  ? this.noiseCount  = val :
                i == 1  ? this.opacity     = val :
                i == 2  ? this.size        = val :
                i == 3  ? this.noisePers   = val :
                i == 4  ? this.bright      = val :
                i == 5  ? this.contrast    = val :
                i == 6  ? this.half        = val :
                i == 7  ? this.chaotic     = val :
                i == 8  ? this.patternSize = val :
                i == 9  ? this.patternOp   = val :
                i == 10 ? this.frame       = val :
                i == 11 ? main.renderI     = val :
                i == 12 ? this.startLoop   = val :
                i == 13 ? this.endLoop     = val : null
                
                if (this.autodraw()) this.draw(main.renderType);
                if(i == 10) {
                    this.ctx.putImageData(this.imgData[val], 0, 0);
                }
            });
        });

        document.querySelectorAll('.color input').forEach((e, i) => {
            e.addEventListener('input', (e) => {
                this.colors[i] = e.target.value;
                if (this.autodraw()) this.draw(main.renderType);
            });
        });

        document.querySelector('#colored').onclick = (e) => {
            this.colored = !this.colored;
            e.target.innerHTML = this.colored ? 'Colored' : 'Monochrome';
            btnClick(e.target, this.colored);
        }

        document.querySelector('#noise').onclick = (e) => {
            this.noise = !this.noise;
            btnClick(e.target, this.noise);
        }

        this.createColors([
            ['#0a0a0a', '#c8c8c8'],['#151314', '#FF33A1'],
            ['#F42EA5', '#F4EAEC'],['#1D1616', '#CBD7D6'],
            ['#4B0C2A', '#5CA1D6'],['#670418', '#70A90F'],
            ['#221B1B', '#F00F0F'],['#F95DAB', '#E0CDD6'],
            ['#221915', '#4EB594'],['#18171c', '#57a617'],
            ['#1f1e1e', '#2431eb'],['#15181e', '#ef660b'],
            ['#291c5a', '#0bd4ef'],['#401070', '#ef0bb2'],
            ['#1e1c32', '#c6baac'],['#292b30', '#cfab4a'],
            ['#331b3f', '#acc7b4'],['#0a174e', '#f5d042'],
            ['#07553b', '#ced46a'],['#50586c', '#dce2f0'],
            ['#a4193d', '#ffdfb9'],['#80634c', '#1aafbc'],
            ['#6a7ba2', '#ffdfde'],['#3b1877', '#da5a2a'],
            ['#00203f', '#adefd1'],['#606060', '#d6ed17'],
            ['#00539c', '#eea47f'],['#0063b2', '#9cc3d5'],
            ['#101820', '#fee715'],['#d3687f', '#cbce91'],
            ['#101820', '#f2aa4c'],['#603f83', '#c7d3d4'],
            ['#2bae66', '#fcf6f5'],['#6e6e6d', '#fad0c9'],
            ['#2d2926', '#ed6f63'],['#616247', '#daa03d'],
            ['#990011', '#fcf6f5'],['#364b44', '#d64161'],
            ['#76528b', '#cbce91'],['#c72d1b', '#fdd20e'],
            ['#101820', '#1a7a4c'],['#921416', '#4b878b'],
            ['#1c1c1b', '#ce4a7e'],['#558600', '#ff9967'],
            ['#9fc131', '#eedfe2'],['#f96167', '#fce77d'],
            ['#4831d4', '#ccf381'],['#a04ef6', '#e7d044'],
            ['#262223', '#ddc6b6'],['#ec449b', '#99f443'],
            ['#317773', '#99f443'],['#317773', '#e2d0f9'],
            ['#820300', '#5f8670'],['#7d7c7c', '#ccc8aa'],
            ['#3e001f', '#f11a7b'],['#ff0060', '#00dfa2'],
            ['#30557e', '#fc766a'],['#435e55', '#d64161'],
            ['#2d4e43', '#d7a842'],['#000cc1', '#60615e'],
            ['#0c0c0c', '#00f599'],['#2e2e2e', '#b53d37'],
            ['#252525', '#a740d9'],['#523ebe', '#d3d4cf'],
            ['#0804f2', '#f354e9'],['#1a1a1a', '#702062'],
            ['#e1158e', '#ee93e6'],['#a73691', '#eb8e97'],
            ['#f55ca5', '#f5f5f5'],['#f56e9c', '#f5dad6'],
            ['#b2204d', '#dab8b9'],['#f563bb', '#f4f4f4'],
            ['#7755ab', '#f2a0d3'],['#131115', '#cd85c6'],
            ['#1d1730', '#f5a238'],['#191919', '#88083b'],
            ['#221d1a', '#f5b607'],['#262626', '#908b0d'],
            ['#1f1e1e', '#5ef3ce'],['#2b2d2c', '#d7d4cc'],
        ], main);
    }

}