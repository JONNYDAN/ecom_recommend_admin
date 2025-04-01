import axiosClient from "../utils/api_client";

export function createCourseData(data) {
    return axiosClient.post('/course/create', data);
}

export function getAllCoursesData(search) {
    return axiosClient.get('/course/all-courses', { params: { search: search } });
}

export function getCourseDetailData(id) {
    return axiosClient.get(`/course/${id}`);
}

export function deleteCourseDetailData(id) {
    return axiosClient.delete(`/course/delete/${id}`);
}

export function updateCourseDetailData(id, data) {
    return axiosClient.put(`/course/update/${id}`, data);
}


