import axiosClient from './axiosClient';

export const uploadResume = (formData) => {
    return axiosClient.post('/resume/upload', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
};

export const getResumes = () => {
    return axiosClient.get('/resume');
};

export const getResumeById = (id) => axiosClient.get(`/resume/${id}`);

export const deleteResume = (id) => axiosClient.delete(`/resume/${id}`);

export const reanalyzeResume = (data) => axiosClient.post('/resume/analyze', data);

export const optimizeResume = (data) => axiosClient.post('/resume/optimize', data);
export const createManualResume = (data) => axiosClient.post('/resume/manual', data);
