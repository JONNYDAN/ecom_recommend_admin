import axiosClient from "../utils/api_client";

export function createQuizData(course_id, data) {
    return axiosClient.post(`/quiz/create/${course_id}`, data);
}

export function getAllQuizData(search) {
    return axiosClient.get('/quiz/all-quiz', { params: { search: search } });
}

export function getQuizDetailData(id) {
    return axiosClient.get(`/quiz/${id}`);
}

export function updateQuizData(id, data) {
    return axiosClient.put(`/quiz/update/${id}`, data);
}

export function filterQuizListData(id) {
    return axiosClient.get(`/quiz/${id}/quizzes`);
}

export function deleteQuizDetailData(id) {
    return axiosClient.delete(`/quiz/delete/${id}`);
}