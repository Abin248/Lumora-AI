import axiosClient from './axiosClient';

export const login = (email, password) => {
    return axiosClient.post('/auth/login', { email, password });
};

export const register = (name, email, password) => {
    return axiosClient.post('/auth/register', { name, email, password });
};

export const googleLogin = (email, name, googleId) => {
    return axiosClient.post('/auth/google', { email, name, googleId });
};