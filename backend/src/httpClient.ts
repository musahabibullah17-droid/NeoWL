import cloudscraper from 'cloudscraper';

export const httpClient = {
    get: async (url: string) => {
        try {
            let targetUrl = url;
            const headers: any = {};

            const html = await cloudscraper({ method: 'GET', url: targetUrl, headers });
            return { data: html };
        } catch (error) {
            throw error;
        }
    }
};
