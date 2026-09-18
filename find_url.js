const urls = Array.from({length: 20}, (_, i) => `https://tv${i + 1}.lk21official.cc`);
Promise.allSettled(urls.map(u => 
    fetch(u, {method: 'HEAD', redirect: 'manual'})
    .then(r => (r.status === 200 || r.status === 301 || r.status === 302 || r.status === 403) ? u : Promise.reject(u))
    .catch(e => Promise.reject(u))
)).then(res => console.log('Working:', res.filter(r => r.status === 'fulfilled').map(r => r.value)));
