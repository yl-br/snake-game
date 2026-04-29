const ScoresList = {
    props:['score', 'all_scores'],
    data(){
        return {
            score_display:[]
        };
    },
    async created() {
    },
    computed:{
        scores_display(){
            const top_scores_count = 10; 
            const relative_scores_count = 4;
            let out_display= {top:[], relative:[], bottom:[]};

            let user_score_index = this.all_scores.findIndex(item => item.points < this.score.points);

            if((user_score_index <= top_scores_count && user_score_index >= 0) || this.all_scores.length < top_scores_count){
                out_display.relative = this.all_scores.slice(0, top_scores_count);
                user_score_index = user_score_index === -1 ? this.all_scores.length: user_score_index;
                out_display.relative.splice(user_score_index, 0, this.score);
            }
            else{
                out_display.top = this.all_scores.slice(0, top_scores_count);
                if(user_score_index === -1 || user_score_index >= this.all_scores.length - 2){
                    out_display.relative = this.all_scores.slice(-relative_scores_count);
                    out_display.relative.push(this.score);
                }
                else{
                    out_display.relative = this.all_scores.slice(user_score_index-2, user_score_index+2);
                    out_display.relative.splice(2,0,this.score);
                }
            }
            if(this.all_scores.length > top_scores_count + relative_scores_count){

               out_display.bottom = this.all_scores.slice(this.all_scores.length - top_scores_count + relative_scores_count, this.all_scores.length)

               const bottmon_slice_index = this.all_scores.slice().reverse().lastIndexOf(1);
               out_display.bottom = this.all_scores.slice(bottmon_slice_index, this.all_scores.length)

            }

            return out_display;
        }
    },
    methods:{
        animate_user_score(){
            let elements = document.getElementsByClassName('highlight-score');
            if(elements.length === 0){
                return;
            }
            elements[0].classList.add('blink');
        }
    },
    template: `
        <ul id="scores-list" style="list-style-type:none;">

            <li v-for="curr_score in scores_display.top">
                <span style="width:40px;">{{curr_score.position? curr_score.position + ')' :''}}</span>
                <span style="width:120px;">{{curr_score.username}}</span>
                <span style="width:40px;"><b>{{curr_score.points}}</b></span>
            </li>

            <hr v-if="scores_display.top.length > 0">
            <li v-for="curr_score in scores_display.relative" :class="{'highlight-score' : (curr_score === score)}">
                <span style="width:40px;">{{curr_score.position? curr_score.position + ')' :''}}</span>
                <span style="width:120px;">{{curr_score.username}}</span>
                <span style="width:40px;"><b>{{curr_score.points}}</b></span>
            </li>

            <hr v-if="scores_display.bottom.length > 0">
                <li v-for="curr_score in scores_display.bottom" :class="{'highlight-score' : (curr_score === score)}">
                <span style="width:40px;">{{curr_score.position? curr_score.position + ')' :''}}</span>
                <span style="width:120px;">{{curr_score.username}}</span>
                <span style="width:40px;"><b>{{curr_score.points}}</b></span>
            </li>

        </ul>
    `
};

export default ScoresList;