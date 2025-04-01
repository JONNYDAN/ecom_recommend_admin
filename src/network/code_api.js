import axiosClient from "../utils/api_client";

export function createCodeData(data) {
    return axiosClient.post('/code/create', data);
}

export function getAllCodesData(search) {
    return axiosClient.get('/code/all-codes', { params: { search: search } });
}

export function getCodeDetailData(id) {
    return axiosClient.get(`/code/${id}`);
}

export function deleteCodeDetailData(id) {
    return axiosClient.delete(`/code/delete/${id}`);
}

export function updateCodeDetailData(id, data) {
    return axiosClient.put(`/code/update/${id}`, data);
}


