import dotenv from 'dotenv';

dotenv.config();

// Fallback env vars if not set in Vercel Dashboard
process.env.LK21_URL = process.env.LK21_URL || 'https://tv12.lk21official.cc';
process.env.ND_URL = process.env.ND_URL || 'https://tv7.nontondrama.my';
process.env.DL_URL = process.env.DL_URL || 'https://tv12.lk21official.cc';

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
import routes from './routes';

const app: Application = express();

// middlewares
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(morgan('tiny'));
app.use(cors({ origin: '*' }));

app.use('/api', routes);

app.get('/api/proxy-iframe', async (req: Request, res: Response) => {
    try {
        const targetUrl = req.query.url as string;
        if (!targetUrl) return res.status(400).send('URL is required');

        const response = await axios.get(targetUrl, { responseType: 'text' });
        
        // Copy headers except those that block framing
        for (const [key, value] of Object.entries(response.headers)) {
            const lowerKey = key.toLowerCase();
            if (!['x-frame-options', 'content-security-policy', 'content-security-policy-report-only'].includes(lowerKey)) {
                res.setHeader(key, value as string | string[]);
            }
        }
        
        // Inject <base> tag and recursively proxy nested iframes
        const origin = new URL(targetUrl).origin;
        let html = response.data;
        if (typeof html === 'string') {
            const proxyBase = req.protocol + '://' + req.get('host') + '/api/proxy-iframe?url=';
            
            // Rewrite all <iframe src="..."> to use the proxy
            html = html.replace(/<iframe([^>]+)src=["']([^"']+)["']/gi, (match, p1, p2) => {
                let absoluteUrl = p2;
                if (p2.startsWith('//')) {
                    absoluteUrl = 'https:' + p2;
                } else if (p2.startsWith('/')) {
                    absoluteUrl = origin + p2;
                } else if (!p2.startsWith('http')) {
                    // Handle weird relative paths or data URIs
                    return match; 
                }
                return `<iframe${p1}src="${proxyBase}${encodeURIComponent(absoluteUrl)}"`;
            });
            
            html = html.replace('<head>', `<head><base href="${origin}/">`);
        }
        
        res.status(response.status).send(html);
    } catch (err: any) {
        res.status(500).send('Proxy error: ' + err.message);
    }
});

app.get('/api', (req: Request, res: Response) => {
    res.status(200).json({
        message: 'Unofficial LK21 (LayarKaca21) and NontonDrama APIs',
        data: {
            LK21_URL: process.env.LK21_URL,
            ND_URL: process.env.ND_URL,
        },
    });
});

export default app;
