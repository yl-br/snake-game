import GameBoard from './game-board.js';
import ScoresList from './scores-list.js';
import UsernameBlocker from './username-blocker.js';
import { createScore, increaseScore, finalizeScore, getAllScores } from './local-storage-score.js';

const appComponent = {
    data(){
        return {
            score: {
                points: 0,
                username: null,
                id: null,
                token: null
            },
            all_scores: []
        };
    },
    created(){
        this.load_all_scores();
    },
    methods:{
        async increase_score(){
            if(this.score.points === 0 || !this.score.id || !this.score.token){
                const result = createScore(this.score.username);
                this.score.id     = result.id;
                this.score.token  = result.token;
                this.score.points = 1;
            }
            else{
                increaseScore(this.score.id, this.score.token);
                this.score.points++;
            }
        },
        set_username(new_username){
            this.score.username = new_username;
            this.$refs.scoresList.animate_user_score();
        },
        async game_over(){
            finalizeScore(this.score.id, this.score.token, this.score.username);

            const temp_username = this.score.username;
            this.score = {
                points: 0,
                username: temp_username,
                id: null,
                token: null
            };
            this.load_all_scores();
        },
        load_all_scores(){
            this.all_scores = getAllScores();
        }
    }
};


const app = Vue.createApp(appComponent);
app.component('username-blocker', UsernameBlocker);
app.component('game-board', GameBoard);
app.component('scores-list', ScoresList);
app.mount('#vue-app');
