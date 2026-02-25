import axiosClient from './axiosClient';

export const chatInterview = (data) => {
    return axiosClient.post('/interview/chat', data);
};

export const getInterviewHistory = (id) => {
    return axiosClient.get(`/interview/${id}`);
};
