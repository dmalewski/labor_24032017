const Xray = require('x-ray');
const x = Xray();


//Tierheim Oldenburg filtern
x('http://www.tierheim-ol.de/vermittlung/hunde/index.php','li',
    [{
        name: 'h2',
        img: 'img@src',
        rasse:'.txt'
    }]
)
    .write('oldenburg.json');


//Tierheim München filtern
x('https://www.tierschutzverein-muenchen.de/das-tun-wir/tiervermittlung/hunde.html', '.name',
    [{
        name: ''
   }]     
)
    .write('muenchen.json');


//München Hunderassen
x('https://www.tierschutzverein-muenchen.de/das-tun-wir/tiervermittlung/hunde.html','.art',
    [{
        rasse: ''
       // image: 'a.img@src'
    }]
)
    .write('muenchen_rassen.json');


//Beispiel von Google nach Google Images kommen
x('http://google.de', {
  main: 'title',
  image: x('#gbar a@href', 'title'), // follow link to google images
})(function(err, obj) {
/*
  {
    main: 'Google',
    image: 'Google Images'
  }
*/
}) .write('example.json');