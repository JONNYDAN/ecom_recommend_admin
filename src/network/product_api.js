import axiosClient from "../utils/api_client";

export function createProductData(data) {
    return axiosClient.post('/products', data ,{
        headers: {
        'Content-Type': 'multipart/form-data', // Đảm bảo header đúng
      },
    });
}

export function getAllProductsData(search) {
    return axiosClient.get('/products', { params: { search: search } });
}

export function getProductDetailData(id) {
    return axiosClient.get(`/products/${id}`);
}

export function deleteProductData(id) {
    return axiosClient.delete(`/products/${id}`);
}

export function updateProductData(id, data) {
    return axiosClient.put(`/products/${id}`, data);
}
