import dotenv from 'dotenv';

dotenv.config();

import axios from 'axios';
import https from 'https';
import http from 'http';
import dns from 'dns';

// Globally disable TLS certificate validation (the LK21 site has SSL issues)
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

// Bypass ISP DNS block (XL Axiata redirects LK21 to blockpage)
// Use Cloudflare and Google DNS resolvers instead of ISP DNS
dns.setServers(['1.1.1.1', '8.8.8.8', '1.0.0.1', '8.8.4.4']);

// Create HTTPS agent that bypasses ISP DPI/SNI blocking
const httpsAgent = new https.Agent({
    rejectUnauthorized: false,
    keepAlive: true,
});
axios.defaults.httpsAgent = httpsAgent;
axios.defaults.httpAgent = new http.Agent({ keepAlive: true });
axios.defaults.timeout = 15000;
// Prevent axios from following redirects to ISP block pages
axios.defaults.maxRedirects = 5;
// Use a browser-like User-Agent to avoid bot detection
axios.defaults.headers.common['User-Agent'] = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36';
axios.defaults.headers.common['Accept'] = 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8';
axios.defaults.headers.common['Accept-Language'] = 'en-US,en;q=0.9,id;q=0.8';

import express, { Application, Request, Response } from 'express';
import morgan from 'morgan';
import cors from 'cors';
import routes from '@/routes';

const app: Application = express();

// middlewares
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(morgan('tiny'));
app.use(cors({ origin: '*' }));

app.use(routes);

app.get('/', (req: Request, res: Response) => {
    res.status(200).json({
        message: 'Unofficial LK21 (LayarKaca21) and NontonDrama APIs',
        data: {
            LK21_URL: process.env.LK21_URL,
            ND_URL: process.env.ND_URL,
        },
    });
});

export default app;
