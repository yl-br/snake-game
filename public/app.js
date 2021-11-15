import GameBoard from './game-board.js';
import ScoresList from './scores-list.js';

const appComponent = {
    data(){
        return {
            score: {
                points:0,
                username:'You',
                id:null,
                token:null
            },
            all_scores:[]
        };
    },
    created(){
        this.load_all_scores();
    },
    methods:{
        async increase_score(){
            if(this.score.points === 0 || !this.score.id || !this.score.token){
                let response = await axios.post('/api/scores', {username:this.score.username});
                this.score.id = response.data.id;
                this.score.token = response.data.token;
                this.score.points = 1;
            }
            else{
                await axios.get(`/api/scores/increase/${this.score.id}/${this.score.token}`);
                this.score.points++;
            }


        },
        set_username(new_username){
            this.score.username = new_username;
            this.$refs.scoresList.animate_user_score();
        },
        async game_over(){
            await axios.put(`/api/scores/${this.score.id}/${this.score.token}`, {username:this.score.username});

            let temp_username = this.score.username;
            this.score = {
                points:0,
                username: temp_username,
                id:null,
                token:null
            };
            this.load_all_scores();
        },
        async load_all_scores(){
            let response = await axios.get('api/scores');
            this.all_scores = response.data;
            // this.all_scores.sort((a,b)=>{return b.points - a.points;});
        }
    }
};


const app = Vue.createApp(appComponent);
app.component('game-board', GameBoard);
app.component('scores-list', ScoresList);
app.mount('#vue-app');