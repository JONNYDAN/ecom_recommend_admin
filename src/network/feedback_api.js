
import axiosClient from "../utils/api_client";

export function createFeedbackData(data) {
    return axiosClient.post('/feedbacks', data);
}

export function getAllFeedbacksData(search) {
    return axiosClient.get('/feedbacks', { params: { search: search } });
}

export function getFeedbackDetailData(id) {
    return axiosClient.get(`/feedbacks/${id}`);
}

export function deleteFeedbackData(id) {
    return axiosClient.delete(`/feedbacks/${id}`);
}

export function updateFeedbackData(id, data) {
    return axiosClient.post(`/feedbacks/${id}`, data);
}