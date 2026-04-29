class CanvasPainter {
    constructor(context, cell_size) {
        this.context = context;

        this.cell_size = cell_size;

        this.cell_color = 'black';
        this.background_color = 'white';

        this.snake_head_normal_image = new Image();
        this.snake_head_hungry_image = new Image();
        this.apple_image = new Image();
    }

    async load_images(){
        let images_to_load = [this.snake_head_normal_image, this.snake_head_hungry_image, this.apple_image];
        let remain_to_load_counter = images_to_load.length;

        this.snake_head_normal_image.src = 'img/snake-head-normal.png';
        this.snake_head_hungry_image.src = 'img/snake-head-hungry.png';
        this.apple_image.src = 'img/apple.png';

        return new Promise((resolve, reject)=>{
            images_to_load.forEach((img)=>{
                if(img.complete){
                    remain_to_load_counter--;
                    if(remain_to_load_counter===0){
                        resolve();
                    }
                }
                else{
                    img.addEventListener('load', ()=>{
                        remain_to_load_counter--;
                        if(remain_to_load_counter===0){
                            resolve();
                        }
                    },false)
                }
            });
        });
    }
    paint_snake_game_over(snake){
        return new Promise((resolve, reject)=>{

            let space = this.cell_size/4;
            let size = this.cell_size/2;

            for(let i=1; i<snake.length; i++){
                window.setTimeout(()=>{
                    this.context.fillStyle = 'orangered';
                    this.context.fillRect(snake[i].x * this.cell_size + space, snake[i].y * this.cell_size + space, size, size);
                    if(i === snake.length -1){
                        resolve();
                    }
                }, 100*i);
            }
        });
    }

    paint_snake(snake, hungry_head = false){
        this.context.fillStyle = this.cell_color;

        let head = snake[0];

        let head_image = hungry_head ? this.snake_head_hungry_image:this.snake_head_normal_image;
        this.context.drawImage(head_image, head.x * this.cell_size, head.y * this.cell_size, this.cell_size, this.cell_size);

        for(let i=1; i<snake.length; i++){
            this.context.fillRect(snake[i].x * this.cell_size, snake[i].y * this.cell_size, this.cell_size, this.cell_size);
        }
    }
    paint_apple(apple){
        this.context.drawImage(this.apple_image, apple.x * this.cell_size, apple.y * this.cell_size, this.cell_size, this.cell_size);
    }
    erase_cell(cell){
        this.context.fillStyle = this.background_color;
        this.context.fillRect(cell.x * this.cell_size, cell.y * this.cell_size, this.cell_size, this.cell_size);
    }
    erase_board(){
        this.context.fillStyle = this.background_color;
        this.context.fillRect(0, 0, this.context.canvas.width, this.context.canvas.height);
    }

}

export default CanvasPainter;