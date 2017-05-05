const moment = require('moment');
const Xray = require('x-ray');
const x = Xray();

//Tierheim Oldenburg filtern
x('http://www.tierheim-ol.de/vermittlung/hunde/index.php','.info-list li',
    [{  
       image: '.img-box img@src',
       name: '.ttl-area h2',
       bread: '.add-lst li:first-child .txt',
       farbe_row: x('.ttl h3 a@href', '.add-lst li:nth-child(2) .ttl'),
       farbe: x('.ttl h3 a@href', '.add-lst li:nth-child(2) .txt'),
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
        .map(result => {
            const [value, unit] = result.birthdate.match(/\d+\s.+/ig).shift().split(' ');
            const today = moment();

            // TODO: Check if there another unit
            const birthdate_new = today.subtract(value, unit === 'Monate' ? 'months' : 'years');

            //seit wann im Tierheim String
            const string_since_when = result.since_when.match(/seit\s\w+\s\d+/ig);
            const string_since_when_new = string_since_when + " im Tierheim Oldenburg";

            //4. Eintrag kastriert oder Größe?
            let castrated;
            
            if(result.row4_title.toLowerCase().indexOf("kastriert") !== -1) {
                castrated = "ja";   
            }
            else {
                 castrated = "nein";
            }

            //Farbe
            let farbe = "unbekannt";
            if(result.farbe_row.toLowerCase().indexOf("farbe") !== -1) {
                farbe = result.farbe;
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
                birthdate: birthdate_new.format('DD.MM.YYYY'),
                height: size,
                farbe: farbe,
                castrated: castrated,
                since_when: string_since_when_new
            });
        });
    console.log(results);
}) 


//Tierheim München filtern
x('https://www.tierschutzverein-muenchen.de/das-tun-wir/tiervermittlung/hunde.html', '.column50p .gallery-cell .list.clearfix',
    [{
             name: '.animal-data .nameNno .name',
             img: '.preview-image a img@src'
             //bread: '.animal-data .nameNno .art',
             //colour: '.animal-data .nameNno .color'
   }] 
 ) .write("muenchen.json");
    


// //München Hunderassen
// x('https://www.tierschutzverein-muenchen.de/das-tun-wir/tiervermittlung/hunde.html','div.art',
//     [{
//         rasse: ''
//        // image: 'a.img@src'
//     }]
// )
//     .write('muenchen_rassen.json');


//Beispiel von Google nach Google Images kommen
// x('http://google.de', {
//   main: 'title',
//   image: x('#gbar a@href', 'title'), // follow link to google images
// })(function(err, obj) {
// /*
//   {
//     main: 'Google',
//     image: 'Google Images'
//   }
// */
// }) .write('example.json');