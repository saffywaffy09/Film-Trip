import fs from "fs";
import Papa from "papaparse";
import axios from "axios";
import * as cheerio from "cheerio";

const csvFile = fs.readFileSync('public/movies.csv', 'utf8');
const file = Papa.parse(csvFile);

const info = file.data.map(row => ({
    "id": row[0],
    "movieName": row[1]
}));

async function getMovieLocations (movieId) {
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

let locationResults = await getMovieLocations('tt0418279');

locationResults = locationResults.map(loc => {
    const afterDash = loc.replace(/^.*-\s*/, '');

    return afterDash
        .replace(/,/g, '')     // remove commas
        .split(/\s+/)          // split by any whitespace
        .filter(Boolean)       // remove empty strings
        .join('+');     
});

console.log("SHAWSHANK REDEMPTION")
console.log(locationResults.length);
// console.log(locationResults);
for (let i = 0; i < locationResults.length; i++) {
    console.log(locationResults[i]);
    let geocodeResults = await getCoordinates(locationResults[i]); 
    console.log(geocodeResults);
    await sleep(1000);
    // if (geocodeResults) {
    //     console.log(`Location: ${locationResults[i]} and latitude ${geocodeResults.latitude} and longitude ${geocodeResults.longitude}`);
    // }
}