const express = require('express')
const DbAdapter = require('./db-adapter.js');
const {use} = require("express/lib/router");

const app = express();
const port = process.env.PORT || 80;

app.use(express.static(__dirname + '/public'));

app.use(express.urlencoded( {extended: true} ));
app.use(express.json());


const db_uri = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/snake-game';
const use_ssl = process.env.DATABASE_URL ? true : false;
const dbAdapter = new DbAdapter(db_uri, use_ssl);


app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

app.get('/api/scores', async (req, res)=>{
    let all_scores = await dbAdapter.get_all_scores();
    res.json(all_scores);
});

app.post('/api/scores', async (req, res)=>{
    let username = null;
    if(typeof(req.body.username) === 'string'){
        username = req.body.username.slice(0,15);
    }
    let [id, token] = await dbAdapter.create_score(username, 1);
    res.json({id:id, token:token});
});

app.get('/api/scores/increase/:score_id/:token', async (req, res)=>{
    await dbAdapter.increase_score(req.params.score_id, req.params.token);
    res.sendStatus(200);
});

app.put('/api/scores/:score_id/:token', async (req, res)=>{
    await dbAdapter.set_username(req.params.score_id, req.params.token, req.body.username);
    res.sendStatus(200);
});


async function setup(){
    await dbAdapter.connect();
    await dbAdapter.initialize();
    console.log('Setup done.');
}

setup().then(()=>{
    app.listen(port, () => {
        console.log(`Express server listening at http://localhost:${port}`)
    });
})

process.on('exit', function () {
    console.log('Exiting.');
    dbAdapter.close();
});


