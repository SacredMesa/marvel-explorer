// Libraries
const fetch = require('node-fetch');
const withQuery = require('with-query').default;
const cryptoJS = require('crypto-js');

const express = require('express');
const handlebars = require('express-handlebars');

// Instances
const app = express();

// Express configuration
app.use(express.static(__dirname + '/public'));
app.use(express.static(__dirname + '/static'));

// Handlebars configuration
app.engine('hbs', handlebars({
    defaultLayout: 'default.hbs'
}));
app.set('view engine', 'hbs')
app.set('views', __dirname + '/views');

// Environment
const PORT = parseInt(process.argv[2] || process.env.PORT) || 3000;

const API_KEY = process.env.API_KEY || "";
const PRIVATE_KEY = process.env.PRIVATE_KEY || "";

const ENDPOINT = "https://gateway.marvel.com/v1/public/characters";

//For exploring API
//http://gateway.marvel.com/v1/public/characters?ts=2&apikey=8f188521d4a0072171aec14a5984aa77&hash=20c9b8f074b298b96d808ba01fc734e7

// Create md5 Hash
let date = new Date;
let ts = date.getTime();

let preHash = [ts, PRIVATE_KEY, API_KEY].join("");
let md5Hash = cryptoJS.MD5(preHash).toString();

// const md5Hash = "e8b8bb8c12df952416c31bb622db9303"; // FIXED HASH FOR JUST TESTING

// Queries
const getCharacters = async (name) => {
    const url = withQuery(
        ENDPOINT, {
            ts: ts,
            apikey: API_KEY,
            hash: md5Hash,
            nameStartsWith: name || " "
        }
    )

    let result = await fetch(url);
    try {
        let rawResult = await result.json();
        return rawResult
    } catch (e) {
        console.error('ERROR');
        return Promise.reject(e);
    }
}

// Partials
// handlebars.registerPartial('leftSection', '{{leftSide}}');
// handlebars.registerPartial('rightSection', '{{rightSide}}');
// handlebars.registerPartial(__dirname + '/views/partials');

// Request handlers
// Homepage
app.get('/', async (req, res) => {
    res.status(200);
    res.type('text/html');
    res.render('index');
})

app.get('/search', async (req, res) => {
    res.status(200);
    res.type('text/html');

    const rawResult = await getCharacters(req.query.term);

    // const charThumbsArr = rawResult.data.results.map(
    //     i => {
    //         return `${i.thumbnail.path}.${i.thumbnail.extension}`;
    //     }
    // )

    const charThumbsArr = `${rawResult.data.results[0].thumbnail.path}.${rawResult.data.results[0].thumbnail.extension}`;

    console.log(charThumbsArr);

    res.render('thumbs', {
        charThumbsArr
    });
})

// Start Server
if (API_KEY) {
    app.listen(PORT, () => {
        console.log(`Application started on port ${PORT} at ${new Date}`);
        console.log(`With key ${API_KEY}`);
    });
} else {
    console.error('API_KEY is not set');
}