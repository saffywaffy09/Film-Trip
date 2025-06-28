import express from "express"
import sqlite3 from "sqlite3";
import cors from "cors";

const app = express();
app.use(cors())

async function readDataFromDb() {
    const db = new sqlite3.Database('./movies.db');
    db.all("SELECT * from locations", [], (err, rows) => {
        console.log(rows);
    })
}
console.log(await readDataFromDb());

// const db = new sqlite3.Database('./movies.db', (err) => {
//     if (err) {
//         console.error(err.message);
//     }
//     console.log('Connected to the database.');
// });

app.get('/', (req, res) => {
    return res.json("from backend side")
})

app.get('/bs', (req, res) => {
    return res.json("stuff here");
})

app.get('/moviedata', (req, res) => {
    const db = new sqlite3.Database('./movies.db');
    db.all('SELECT * from locations', [], (err, rows) => {
        return res.json(rows);
    });
}) 

app.listen(8080, () => {
    console.log("listening");
})