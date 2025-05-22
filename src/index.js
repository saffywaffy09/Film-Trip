import fs from "fs";
import Papa from "papaparse";
import axios from "axios";
import * as cheerio from "cheerio";
import sqlite3 from "sqlite3";

const db = new sqlite3.Database('./movies.db', (err) => {
    if (err) {
        console.error(err.message);
    }
    console.log('Connected to the database.');
});

const csvFile = fs.readFileSync('public/top_100_movies.csv', 'utf8');
const file = Papa.parse(csvFile);


db.exec(`
    CREATE TABLE IF NOT EXISTS locations(movieName, movieId, locationString, lat, lon, UNIQUE(movieName, movieId, locationString, lat, lon));
    `);

// db.exec(`DELETE FROM locations;`);

console.log("RIGHT HERE");
const info = file.data.map(row => ({
    "id": row[1],
    "movieName": row[5]
}));
async function getMovieLocations (movieName, movieId) {
    let response;
    try {

        response = await axios.get(`https://www.imdb.com/title/${movieId}/locations`, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) ' +
                'AppleWebKit/537.36 (KHTML, like Gecko) ' +
                            'Chrome/122.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.9',
                'Referer': 'https://www.imdb.com/',
                'Connection': 'keep-alive'
            }
        });
    } catch (err) {
        console.log(err);
        return null;
    }
    const $ = cheerio.load(response.data);
    const locations = [];
    $('a.ipc-link.ipc-link--base.sc-781c1bad-2.jZxGAW').each((i, elem) => {
        let text = $(elem).text().trim();
        let command = `INSERT INTO locations(movieName, movieId, locationString)
                 VALUES("${movieName}", "${movieId}", "${text}")`;
        db.exec(command);
        locations.push(text);
    });
    return locations;
}

async function getCoordinates (location) {
    const API_KEY = "682738b15459f735953277ptwe3c780";
    let response;
    try {
        response = await axios.get(`https://geocode.maps.co/search?q=${location}&api_key=${API_KEY}`);
    } catch (err) {
        console.log("man fuck you");
        return null;
    }
    if (response.data[0]) {
        return {"latitude": response.data[0].lat, "longitude": response.data[0].lon};
    } else {
        return null;
    }
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}


// locationResults = locationResults.map(loc => {
//     const afterDash = loc.replace(/^.*-\s*/, '');

//     return afterDash
//         .replace(/,/g, '')     // remove commas
//         .split(/\s+/)          // split by any whitespace
//         .filter(Boolean)       // remove empty strings
//         .join('+');     
// });

// console.log("SHAWSHANK REDEMPTION")
// console.log(locationResults.length);
// // console.log(locationResults);
// for (let i = 0; i < locationResults.length; i++) {
//     console.log(locationResults[i]);
//     let geocodeResults = await getCoordinates(locationResults[i]); 
//     console.log(geocodeResults);
//     await sleep(1000);
//     // if (geocodeResults) {
//     //     console.log(`Location: ${locationResults[i]} and latitude ${geocodeResults.latitude} and longitude ${geocodeResults.longitude}`);
//     // }
// }


// for (let i = 1; i < info.length; i++) {
//     await getMovieLocations(info[i].movieName, info[1].id);
// }



db.all('SELECT * FROM locations', [], async (err, rows) => {
        for (let i = 0; i < 1; i++) {
        let loc = rows[i].locationString.replace(/^.*-\s*/, '').replace(/,/g, '')     // remove commas
                .split(/\s+/)          // split by any whitespace
                .filter(Boolean)       // remove empty strings
                .join('+');     
        console.log(loc);
        let geocodeResults = await getCoordinates(loc);
        db.exec(`UPDATE locations SET lat=${geocodeResults.latitude} long=${geocodeResults.longitude} WHERE locationString=${rows[i].locationString} `)
        console.log(geocodeResults);
    }
});