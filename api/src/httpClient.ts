import cloudscraper from 'cloudscraper';

export const httpClient = {
    get: async (url: string) => {
        try {
            let targetUrl = url;
            const headers: any = {};
            if (url.includes('lk21official.cc')) {
                const parsed = new URL(url);
                headers['Host'] = parsed.hostname;
                parsed.hostname = '104.21.59.235';
                targetUrl = parsed.toString();
            }
            const html = await cloudscraper({ method: 'GET', url: targetUrl, headers });
            return { data: html };
        } catch (error) {
            throw error;
        }
    }
};
