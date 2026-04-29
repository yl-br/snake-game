
const UsernameBlocker = {
	data(){
		return {
			
			input_username:'',
			is_username_received: false
		}
	},
	mounted(){
		this.$refs.text_input.focus();
	},
	methods:{
		async set_username(input_username){
			this.$refs.text_input.focus();
			if(input_username !== '')
			{
				this.$emit('on-set-username', input_username);
				this.is_username_received = true;
				this.$refs.blocker_container.style.visibility = "hidden";
			}
			if(!this.is_username_received){
				await this.$nextTick();
				
			}
			
		}

	},
	template: `
	<div id="username-blocker" ref="blocker_container">
	<div v-if="!is_username_received" v-on:keyup.enter="set_username(input_username)">

	<label for="input-username" style="font-size: 2em;">Enter nickname:</label>
	<input id="input-username" v-model="input_username" ref="text_input" type="text" maxlength="15"/>
	<hr>
	</div>
	</div>
	`
}


export default UsernameBlocker;


