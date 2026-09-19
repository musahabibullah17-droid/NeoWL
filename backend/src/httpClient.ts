import axios from 'axios';

export const httpClient = {
    get: async (url: string) => {
        try {
            const response = await axios.get(url);
            return { data: response.data };
        } catch (error) {
            throw error;
        }
    }
};
