import axiosClient from './axiosClient';

export const getCourseRecommendations = (data) => {
    return axiosClient.post('/career/recommendations', data);
};
