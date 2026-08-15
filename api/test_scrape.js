const fs = require('fs');
const cheerio = require('cheerio');
const $ = cheerio.load(fs.readFileSync('../nontondrama.html'));
console.log('Images:', $('img').map((i, el) => $(el).attr('src')).get().slice(0, 5));
console.log('Episode buttons:', $('a').filter((i, el) => $(el).text().toLowerCase().includes('episode')).length);
console.log('Seasons or Episode wrappers:', $('div').filter((i, el) => { const cls = $(el).attr('class') || ''; return cls.includes('episode') || cls.includes('serial'); }).length);
