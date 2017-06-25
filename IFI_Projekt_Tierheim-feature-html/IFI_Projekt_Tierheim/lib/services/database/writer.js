const { MongoClient } = require('mongodb');

const DB_HOST = process.env.DB_HOST || '192.168.99.100';
const DB_PORT = process.env.DB_PORT || 32768;

const CONNECTION_STRING = `mongodb://${DB_HOST}:${DB_PORT}/loginapp`;

/* Dokument-Aufbau
 {
            "id": 46fcfa4e85081704e63a6969081d5ce38d56c802
            "name": "Bibi",
            "img": "https://www.tierschutzverein-muenchen.de/fileadmin/Webdata/AnimalDatabase/160301-klein.jpg",
            "bread": "Mix",
            "colour": "schwarz,kleiner weißer Brustfleck",
            "gender": "Weiblich",
            "castrated": "Nein",
            "birthdate": "01.01.06",
            "height": "Mittel",
            "since_when": "..."
        }
*/

const write = (register) =>
    MongoClient
        .connect(CONNECTION_STRING)
        .then((db) => {
                //DB wird erzeugt und in "collection" aufgefangen
                const collection = db.collection("register");

                const { name, username, email, password, confirmpassword } = register;

                const document = {
                    name,
                    username,
                    email,
                    password,
                    confirmpassword
                };
console.log('test');
                return collection
                    .insertOne(document)
                    .then(() =>
                        db.close()
                    );
            });

module.exports = write;