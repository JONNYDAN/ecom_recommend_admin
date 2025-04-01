import axiosClient from "../utils/api_client";

export function createOrderData(data) {
    return axiosClient.post('/orders', data);
}

export function getAllOrdersData(search, status, page) {
    return axiosClient.get('/orders', { params: { search: search, status: status, page: page } });
}

export function getOrderDetailData(id) {
    return axiosClient.get(`/orders/${id}`);
}

export function deleteOrderData(id) {
    return axiosClient.delete(`/orders/${id}`);
}

export function updateOrderData(id, data) {
    return axiosClient.put(`/orders/${id}`, data);
}
