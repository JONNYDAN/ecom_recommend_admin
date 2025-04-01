import axiosClient from "../utils/api_client";

export function createCategoryData(data) {
    return axiosClient.post('/categories', data);
}

export function getAllCategoriesData(search) {
    return axiosClient.get('/categories', { params: { search: search } });
}

export function getCategoryDetailData(id) {
    return axiosClient.get(`/categories/${id}`);
}

export function deleteCategoryData(id) {
    return axiosClient.delete(`/categories/${id}`);
}

export function updateCategoryData(id, data) {
    return axiosClient.put(`/categories/${id}`, data);
}

export function createChildCategoryData(data) {
    return axiosClient.post('/categories', data);
}
