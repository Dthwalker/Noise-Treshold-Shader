
export default class Pattern {

    static block   = document.querySelector('.patterns');
    static canvas  = this.block.querySelector('canvas');
    static ctx     = this.canvas.getContext('2d');
    static img     = new Image();
    static data    = null;
    static width   = 100;
    static ppd     = 10;
    static vision  = false;
    static isDown  = false;
    static color   = '#000000';
    static presets = null;

    static init() {
        this.start();
    }
    
    static resize() {
        this.canvas.width = this.canvas.height = this.width;
    }

    static draw(x, y) {
        this.ctx.fillStyle = this.color;
        this.ctx.fillRect(x*this.ppd, y * this.ppd, this.ppd, this.ppd);
    }

    static setPattern() {
        this.data = this.ctx.createPattern(this.canvas, "repeat");
    }
 
    static drawImg(img) {
        this.ctx.drawImage(this.img, 0, 0, this.img.width, this.img.height, 0, 0, this.width, this.width)
    }

    static addPatterns() {
        let space = document.querySelector('#patternPresets');

        fetch('/getPatterns', {method: 'get'})
            .then(res => res.json())
            .then(res => {
                this.presets = res.patterns;
                
                this.presets.forEach(e => {
                    let pattern = document.createElement('option');
                    let name = e.replace(/\..*/ig,'').split('').map(l => l == l.toUpperCase() ? ' ' + l : l).join('').trim();
                    pattern.innerHTML = name;
                    space.append(pattern);
                });

                this.img.src = '/pattern/' + this.presets[0]
                this.img.onload = () => {
                    this.drawImg();
                    this.setPattern();
                }
            });
    }
    
    static async start() {
        this.addPatterns();
        this.resize();
        this.canvas.style.border = '1px solid white';
        this.controls();
    }

    static controls() {
        document.querySelector('#patternBtn').onclick = (e) => {
            this.vision = !this.vision;
            this.block.style.display = this.vision ? 'block' : 'none';
            e.target.style.cssText = !this.vision ? '' : 'background-color: white; color: rgb(10,10,10)';
        }

        document.querySelector('#patternColor').addEventListener('input', (e) => {
            this.color = e.target.value;
        });
        

        document.querySelector('#patternPresets').addEventListener('input', (e) => {
            this.img.src = '/pattern/' + this.presets[e.target.selectedIndex];
            this.img.onload = () => {
                this.drawImg();
            }
        })

        document.querySelector('#clearP').onclick = () => this.resize();

        document.querySelector('#drwImg').onclick = this.drawImg.bind(this)

        document.querySelector('#setPattern').onclick = this.setPattern.bind(this);

        document.querySelector('#loadPattern').addEventListener('change', (e) => {
            let file = e.target.files[0];
            if (!file.type.includes('image')) return console.log('Change image');

            let url = URL.createObjectURL(file);
            this.img.src = url;
            this.img.onload = () => {
                this.ctx.drawImage(this.img, 0, 0, this.img.width, this.img.height, 0, 0, this.width, this.width)
            }
        })

        document.querySelectorAll('.patternResize button').forEach((e,i) => {
            e.onclick = () => {
                let n = i == 0 ? this.width - 10 : this.width + 10;
                n < 1 ? n = 10 : null;
                this.width = n;
                this.resize();
            }
        });

        document.querySelector('#patternPPD').addEventListener('input', (e) => {
                let val = Number(e.target.value);
                e.target.previousElementSibling.innerHTML = val;
                this.ppd = val;
        });

        this.canvas.addEventListener('mousemove', (e) => {
            let [x,y] = [e.offsetX, e.offsetY].map(e => Math.floor(e / this.ppd));
            if (this.isDown) this.draw(x, y);
        });


        this.canvas.addEventListener('mousedown', () => this.isDown = true);
        addEventListener('mouseup', () => this.isDown = false);
    }

}