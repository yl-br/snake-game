import GameRunner from './game-runner.js'

const GameBoard = {
    props:['score'],
    data(){
        return {
            game_status:'stop', // stop/play/game-over
            input_username:'',
            is_username_received:false
        };
    },
    emits:['on-increase-score', 'on-game-over', 'on-set-username'],
    created(){
        this.number_of_rows = 15;
        this.number_of_columns = 25;
        this.cell_size = 30;
    },
    async mounted(){
        this.gameRunner = new GameRunner(document.getElementById('game-canvas'), this.number_of_rows, this.number_of_columns, this.cell_size);
        await this.gameRunner.initialize(this.on_apple_eaten, this.on_game_over);

        document.body.addEventListener('keydown',  (event)=>{
            let is_arrow_pressed = ["ArrowUp", "ArrowDown", "ArrowRight", "ArrowLeft"].indexOf(event.code) > -1;

            if(is_arrow_pressed && !this.is_username_received && this.input_username.length > 0){
                this.set_username(this.input_username);
            }


            if(is_arrow_pressed && this.game_status === 'game-over'){
                this.$emit('on-game-over');
                this.gameRunner.reset_game();
                this.game_status = 'play';
                this.gameRunner.start_game();
            }
            else if(is_arrow_pressed  && this.game_status === 'stop'){
                this.game_status = 'play';
                this.gameRunner.start_game();
            }
            else if(!is_arrow_pressed && this.game_status === 'play'){
                this.game_status = 'stop';
                this.gameRunner.stop_game();
            }
        });

        if(!this.is_username_received){
            await this.$nextTick();
            this.$refs.text_input.focus();
        }
    },
    methods:{
        async on_apple_eaten(){
            this.$emit('on-increase-score');
        },
        async on_game_over(){
            this.game_status = 'game-over';
            if(!this.is_username_received){
                await this.$nextTick();
                this.$refs.text_input.focus();
            }
        },
        set_username(input_username){
            if(input_username !== '')
            {
                this.$emit('on-set-username', input_username);
                this.is_username_received = true;
            }
        }
    },
    template: `
    <div id="canvas-wrap">
        <canvas id="game-canvas" style="border: 3px solid #000000;" :width="number_of_columns * cell_size" :height="number_of_rows * cell_size"></canvas>
        <div v-if="game_status != 'play'" id="overlay">
            <div v-if="game_status === 'game-over'">
                <p>
                    <span style="font-size: 3em;">Game Over</span><br>
                    <span style="font-size: 2em;">You scored <b>{{this.score.points}}</b> points</span>
                </p>
            </div>
            
            <div v-if="!is_username_received" v-on:keyup.enter="set_username(input_username)">
                
                <label for="input-username" style="font-size: 2em;">Enter nickname:</label>
                <input id="input-username" v-model="input_username" ref="text_input" type="text" maxlength="15"/>
                <hr>
            </div>
            
            <div v-if="game_status === 'stop' || game_status === 'game-over'">
                
                <span style="font-size: 1.5em;">Press arrows keys to play.</span>
                <br>
                <img src="img/arrows.png" alt="Arrows keys" style="height:80px">
            </div>
        </div>
    </div>
    `
}

export default GameBoard;