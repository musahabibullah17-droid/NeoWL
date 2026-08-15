import axios from 'axios';
import { httpClient } from '@/httpClient';
import { NextFunction as Next, Request, Response } from 'express';
import { scrapeMovies } from '@/scrapers/movie';
import genres from '@/json/genres.json';

type TController = (req: Request, res: Response, next?: Next) => Promise<void>;

/**
 * Controller for `/genres` route
 * Returns genres from static JSON — no external HTTP call needed.
 * @param {Request} req
 * @param {Response} res
 * @param {Next} next
 */
export const setOfGenres: TController = async (req, res) => {
    try {
        const { protocol, headers: { host } } = req;
        const payload = genres.map((genre: string) => ({
            parameter: genre,
            name: genre.charAt(0).toUpperCase() + genre.slice(1),
            numberOfContents: 0,
            url: `${protocol}://${host}/genres/${genre}`,
        }));

        res.status(200).json(payload);
    } catch (err) {
        console.error(err);

        res.status(400).json(null);
    }
};

/**
 * Controller for `/genres/:genre` route
 * @param {Request} req
 * @param {Response} res
 * @param {Next} next
 */
export const moviesByGenre: TController = async (req, res) => {
    try {
        const { page = 0 } = req.query;
        const { genre } = req.params;

        const axiosRequest = await httpClient.get(
            `${process.env.LK21_URL}/genre/${genre.toLowerCase()}${
                Number(page) > 1 ? `/page/${page}` : ''
            }`
        );

        const payload = await scrapeMovies(req, axiosRequest as any);

        res.status(200).json(payload);
    } catch (err) {
        console.error(err);

        res.status(400).json(null);
    }
};
