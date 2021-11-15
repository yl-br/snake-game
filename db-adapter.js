const {Client} = require('pg')
const { v4: uuidv4 } = require('uuid');

class DbAdapter {
    constructor(db_uri, use_ssl) {
        this.db_uri = db_uri;
        this.client = new Client({
            connectionString:this.db_uri, 
            ssl: use_ssl ? { rejectUnauthorized: false }: false}
            );
    }
    connect(){
        return this.client.connect();
    }
    close(){
        return this.client.end();
    }
    initialize(){
        return this.client.query("CREATE TABLE IF NOT EXISTS scores (id SERIAL PRIMARY KEY, token TEXT, username TEXT, points INTEGER, timestamp TIMESTAMP);");
    }
    get_all_scores(){
        return this.client.query("SELECT CAST(row_number() over (ORDER BY points desc) AS INTEGER) as position,id, username, points, timestamp FROM scores;").then((result=>{
            return result.rows;
        }));
    }
    create_score(username, points=1) {
            let token = uuidv4();
            return this.client.query("INSERT INTO scores (token, username, points, timestamp) VALUES($1, $2, $3, $4) RETURNING id, token;",
                [token, username, points, new Date()])
                .then(result => {
                return [result.rows[0].id, result.rows[0].token];
            });
    }
    increase_score(score_id, token){
        return this.client.query("UPDATE scores SET points = points + 1 WHERE id = $1 AND token = $2",[score_id, token]);
    }
    set_username(score_id, token, new_username){
        return this.client.query("UPDATE scores SET username = $1 WHERE id = $2 AND token = $3",[new_username, score_id, token]);
    }
}

module.exports = DbAdapter;