const { MongoClient } = require('mongodb');

const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_PORT = process.env.DB_PORT || 27017;

const CONNECTION_STRING = `mongodb://${DB_HOST}:${DB_PORT}/dogs`;

/*
 {
            "name": "Bibi",
            "img": "https://www.tierschutzverein-muenchen.de/fileadmin/Webdata/AnimalDatabase/160301-klein.jpg",
            "bread": "Mix",
            "colour": "schwarz,kleiner weißer Brustfleck",
            "gender": "Weiblich",
            "castrated": "Nein",
            "birthdate": "01.01.06",
            "height": "Mittel"
        }
*/

const write = (institution, dog) =>
    MongoClient
        .connect(CONNECTION_STRING)
        .then((db) => {
            //DB wird erzeugt und in "collection" aufgefangen
            const collection = db.collection(institution);

            const {name, img, bread, colour, gender, castrated, birthdate, height} = dog;

            const document = {
                name,
                img,
                bread,
                colour,
                gender,
                castrated,
                birthdate,
                height,
            };

            return collection
                .insertOne(document)
                .then(() => 
                    db.close()
                );
        });

module.exports = write;