import CanvasPainter from './canvas-painter.js'

class GameRunner{
    constructor(canvas, number_of_rows, number_of_columns, cell_size) {
        this.number_of_rows = number_of_rows;
        this.number_of_columns = number_of_columns;
        this.cell_size = cell_size;

        let context = canvas.getContext('2d');
        this.canvasPainter = new CanvasPainter(context, cell_size);

        this.interval_duration = 150;
        this.interval_token = null;

        this.snake = [];
        this.apple = {x:null, y:null};
        this.direction = 'right';
        this.last_direction = 'right';
    }
    
    async initialize(on_apple_eaten_cb, on_game_over_cb){
        await this.canvasPainter.load_images();

        this.on_apple_eaten_cb = on_apple_eaten_cb;
        this.on_game_over_cb = on_game_over_cb;

        this.snake = [{x:2, y:0}, {x:1, y:0},{x:0, y:0}];
        this.apple = this.calculate_apple_position();

        this.canvasPainter.paint_snake(this.snake);
        this.canvasPainter.paint_apple(this.apple);

        document.body.addEventListener('keydown',function (event){
            switch (event.code) {
                case "ArrowUp": this.set_direction('up'); break;
                case "ArrowDown": this.set_direction('down'); break;
                case "ArrowRight": this.set_direction('right'); break;
                case "ArrowLeft": this.set_direction('left'); break;
            }
        }.bind(this));
    }

    reset_game(){
        this.snake = [{x:2, y:0}, {x:1, y:0},{x:0, y:0}];
        this.apple = this.calculate_apple_position();

        this.direction = 'right';
        this.last_direction = 'right';

        this.canvasPainter.erase_board();

        this.canvasPainter.paint_snake(this.snake);
        this.canvasPainter.paint_apple(this.apple);
    }

    set_direction(direction){
        let is_switched_to_opposite_direction =
            this.last_direction === 'left' && direction === 'right' ||
            this.last_direction === 'right' && direction === 'left' ||
            this.last_direction === 'up' && direction === 'down' ||
            this.last_direction === 'down' && direction === 'up';

        if(is_switched_to_opposite_direction){
            return;
        }

        this.direction = direction;

        if(this.interval_token && this.direction !== this.last_direction){
            window.clearInterval(this.interval_token);
            this.move_snake();
            this.interval_token = window.setInterval(this.move_snake.bind(this), this.interval_duration);    
        }
    }

    start_game(){
        this.interval_token = window.setInterval(this.move_snake.bind(this), this.interval_duration);
    }

    move_snake(){
        let new_head = this.calculate_new_snake_head();

        if(this.is_game_over(new_head)){
            this.stop_game();
            this.canvasPainter.paint_snake_game_over(this.snake).then(()=>{
                if(this.on_game_over_cb){
                    this.on_game_over_cb();
                }
            });
            return;
        }

        let is_apple_eaten = new_head.x === this.apple.x && new_head.y === this.apple.y;
        let is_hungry_head = Math.abs(new_head.x - this.apple.x) <= 1 && Math.abs(new_head.y - this.apple.y) <= 1;

        this.snake.unshift(new_head);
        this.canvasPainter.paint_snake(this.snake, is_hungry_head);

        if(is_apple_eaten){
            if(this.on_apple_eaten_cb){
                this.on_apple_eaten_cb();
            }
            this.apple = this.calculate_apple_position();
            this.canvasPainter.paint_apple(this.apple);
        }
        else{
            let cell_to_remove = this.snake.pop();
            this.canvasPainter.erase_cell(cell_to_remove);
        }

        this.last_direction = this.direction;
    }

    is_game_over(new_head){
        return this.snake.findIndex(snake_cell=> snake_cell.x === new_head.x && snake_cell.y === new_head.y) > -1;
    }

    calculate_new_snake_head(){
        let old_head = this.snake[0];
        let new_head = {x:old_head.x, y:old_head.y};

        switch (this.direction){
            case "right": new_head.x++; break;
            case "left": new_head.x--; break;
            case "up": new_head.y--; break;
            case "down": new_head.y++; break;
        }
        if(new_head.x >= this.number_of_columns){
            new_head.x = 0;
        }
        else if(new_head.y >= this.number_of_rows){
            new_head.y = 0;
        }
        else if(new_head.x < 0){
            new_head.x = this.number_of_columns - 1;
        }
        else if(new_head.y < 0){
            new_head.y = this.number_of_rows -1;
        }
        return new_head;
    }

    calculate_apple_position(){
        let apple_options = [];

        for(let i=0; i< this.number_of_columns;i++){
            for(let j=0; j<this.number_of_rows; j++){
                apple_options.push({x:i, y:j});
            }
        }

        this.snake.forEach((snake_cell)=>{
            let index_to_remove = apple_options.findIndex(cell=> cell.x === snake_cell.x && cell.y === snake_cell.y);
            if(index_to_remove > -1){
                apple_options.splice(index_to_remove, 1);
            }
        });

        let random_index = Math.floor(Math.random() * apple_options.length);

        return apple_options[random_index];
    }

    stop_game(){
        window.clearInterval(this.interval_token);
        this.interval_token = null;
    }
}

export default GameRunner;