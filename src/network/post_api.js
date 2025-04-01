import axiosClient from "../utils/api_client";

export function createPostData(data) {
    return axiosClient.post('/post/', data);
}

export function getAllPostsData(search) {
    return axiosClient.get('/post/', { params: { search: search } });
}

export function getPostDetailData(id) {
    return axiosClient.get(`/post/${id}`);
}

export function deletePostDetailData(id) {
    return axiosClient.delete(`/post/${id}`);
}

export function updatePostDetailData(id, data) {
    return axiosClient.put(`/post/${id}`, data);
}


