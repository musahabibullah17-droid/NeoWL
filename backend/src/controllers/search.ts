import { NextFunction as Next, Request, Response } from 'express';
import cloudscraper from 'cloudscraper';

type TController = (req: Request, res: Response, next?: Next) => Promise<void>;

export const searchedMoviesOrSeries: TController = async (req, res) => {
    try {
        const { title = '' } = req.params;
        const { page = 1 } = req.query;

        const rawResponse = await cloudscraper({
            method: 'GET',
            url: `https://gudangvape.com/search.php?s=${encodeURIComponent(title as string)}&page=${page}`,
            headers: {
                Referer: `${process.env.LK21_URL || 'https://tv12.lk21official.cc'}/`
            }
        });

        const jsonResponse = JSON.parse(rawResponse);
        const payload = (jsonResponse.data || []).map((item: any) => ({
            _id: item.slug || '',
            title: item.title || '',
            type: item.type === 'series' ? 'series' : 'movie',
            posterImg: item.poster ? `https://poster.assetsy.de/wp-content/uploads/${item.poster}` : '',
            rating: item.rating ? item.rating.toString() : 'N/A',
            year: item.year ? item.year.toString() : ''
        }));

        res.status(200).json(payload);
    } catch (err) {
        console.error('Search API Error:', err);
        res.status(400).json([]);
    }
};
