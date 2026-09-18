const urls = [
  'https://tv7.lk21official.cc',
  'https://tv12.lk21official.cc',
  'https://tv13.lk21official.cc',
  'https://lk21official.cc',
  'https://lk21official.love',
  'https://tv10.lk21official.cc'
];

async function check() {
  for (const u of urls) {
    try {
      const res = await fetch(u, { redirect: 'follow' });
      const text = await res.text();
      const titleMatch = text.match(/<title>(.*?)<\/title>/i);
      console.log(u, '=>', res.url, '=> Title:', titleMatch ? titleMatch[1] : 'No title');
    } catch (e) {
      console.log(u, '=> Error:', e.message);
    }
  }
}
check();
