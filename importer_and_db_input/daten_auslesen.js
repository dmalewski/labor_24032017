const moment = require('moment');
const Xray = require('x-ray');
const x = Xray();

//service "writer" einbinden
const write = require('./lib/services/writer');

//Tierheim Oldenburg filtern
x('http://www.tierheim-ol.de/vermittlung/hunde/index.php','.info-list li',
    [{ 
       name: '.ttl-area h2',
       img: '.img-box img@src',
       bread: '.add-lst li:first-child .txt',
       colour_row: x('.ttl h3 a@href', '.add-lst li:nth-child(2) .ttl'),
       colour: x('.ttl h3 a@href', '.add-lst li:nth-child(2) .txt'),
       birthdate: '.add-lst li:nth-child(2) .txt',
       gender: '.add-lst li:nth-child(3) .txt',
       row4_title: '.add-lst li:nth-child(4) .ttl',
       height: '.add-lst li:nth-child(4) .txt',
       row5: '.add-lst li:nth-child(5) .txt',
       how_found: x('.ttl h3 a@href', '.add-lst li:last-child .txt'),
       since_when: 'p'
    }]  
    
)((err, results) => {
    if(err) {
        return console.error(err);
    }
    
    results = results
        //Mapping der Ergebnisse
        .map(result => {
            const [value, unit] = result.birthdate.match(/\d+\s.+/ig).shift().split(' ');
            const today = moment();

            // TODO: Check if there's another unit
            const birthdate_new = today.subtract(value, unit === 'Monate' ? 'months' : 'years');

            //seit wann im Tierheim String
            const string_since_when = result.since_when.match(/seit\s\w+\s\d+/ig);
            const string_since_when_new = string_since_when + " im Tierheim Oldenburg";

            //4. Eintrag kastriert oder Größe?
            let castrated;
            
            if(result.row4_title.toLowerCase().indexOf("kastriert") !== -1) {
                castrated = "Ja";   
            }
            else {
                 castrated = "Nein";
            }

            //Farbe
            let colour = "keine Angabe";
            if(result.colour_row.toLowerCase().indexOf("farbe") !== -1) {
                colour = result.colour;
            }
            
            //Größe
            let size;
            if(result.row4_title.toLowerCase().indexOf("schulterhöhe") !== -1) {
                size = result.height;
            }
            else {
                size = result.row5;
            }

            return Object.assign({}, result, {
                birthdate: birthdate_new.format('DD.MM.YY'),
                height: size,
                colour: colour,
                castrated: castrated,
                since_when: string_since_when_new
            });
        });

        //in die Datenbank schreiben
        Promise
        .all(results)
        .then((result) => {
           const institution = 'oldenburg';

            for (const result of results) {
                write(institution, result)
            }

        })
        .then(() => {
            console.log('Written into database for "Oldenburg"');
        })
        .catch((err) =>
            console.error(err)
        );
        //console.log("--------------------------OLDENBURG-------------------------");    
        //console.log(results);
})  


//---------------------------------------------------------------------------------------------------------------------------------------------------


//Tierheim München filtern
const scrapePage = (page) => new Promise((resolve, reject) => {
    x(`https://www.tierschutzverein-muenchen.de/das-tun-wir/tiervermittlung/hunde/tier-seite/${page}.html`, '.column50p .gallery-cell .list.clearfix',
        [{
                name: '.animal-data .nameNno .name',
                img: '.preview-image a img@src',
                bread: '.animal-data .art',
                colour: '.animal-data .color',
                gender: '.animal-data .gender',
                castrated: '.animal-data .castrated',
                birthdate: '.animal-data .date-of-birth',
                height: '.animal-data .height'
    }])
    ((err, results) => {
        if(err) {
            return reject(err);
        }

        const dogs = results
            //Mapping der Ergebnisse
            .map(result => {

                //Name mit Kleinbuchstaben versehen
                const nameLowercased = result.name.toLowerCase();

                const name_new = `${nameLowercased[0].toUpperCase()}${nameLowercased.substring(1, nameLowercased.length - 1)}`;

                //Rasse
                const bread_cache = result.bread.replace(/(\n|\t)/ig, "");
                const bread_new = bread_cache.split(',')[1];

                //Farbe
                const colour_cache = result.colour.replace(/(\n|\t)/ig, "");
                const colour_new = colour_cache.split(':')[1];
            
                //Gender
                const gender_cache = result.gender.replace(/(\n|\t)/ig, "");
                const gender_new = gender_cache.split(':')[1];

                //Kastriert
                const castrated_cache = result.castrated.replace(/(\n|\t)/ig, "");
                const castrated_new = castrated_cache.split(':')[1];

                //Geburtstag
                const birthdate_cache = result.birthdate.replace(/(\n|\t)/ig, "");
                let birthdate_new = birthdate_cache.split(' ')[1];
                birthdate_new = birthdate_new.replace(/-/ig, ".");

                //Größe
                const height_cache = result.height.replace(/(\n|\t)/ig, "");
                const height_new = height_cache.split(':')[1];

        return Object.assign({}, result, {
                    name: name_new,
                    bread: bread_new,
                    colour: colour_new,
                    gender: gender_new,
                    castrated: castrated_new,
                    birthdate: birthdate_new,
                    height: height_new
                });
            });
        //console.log("--------------------------MÜNCHEN-------------------------");    
        //console.log(results);

        resolve(dogs);
    });

});

x('https://www.tierschutzverein-muenchen.de/das-tun-wir/tiervermittlung/hunde/tier-seite/1.html', ['.f3-widget-paginator li:not(.next)'])((err, items) => {
    if (err) {
        return console.error(err);
    }

    //holt die Anzahl der Seiten raus und erstellt ein Array mit dessen Anzahl als Länge (item = 1 Seite)
    const fetches = Array.apply(null, Array(items.length))
        .map((item, index) =>
            scrapePage(index + 1)
        );

    //alle Seiten "fetchen" und in die Datenbank schreiben 
    Promise
        .all(fetches)
        .then((pages) => {
           const institution = 'muenchen';

           const writers = [];

           for (const page of pages) {
                for (const dog of page) {
                    writers.push(write(institution, dog))
                }
           }

           return Promise.all(writers);
        })
        .then(() => {
            console.log('Written into database for "München');
        })
        .catch((err) =>
            console.error(err)
        );
})

