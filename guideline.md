


# please follow some rule when gen code
1. file name and folder name should be in snake case
2. for the api call, please implement in folder src/network
3. for the routes of app, please define in src/app/App.js file
4. for each resource management, it should create 4 file in the resource folder same name. example for management post, it should be gôd to have 4 file add_post.js, post_list.js, show_post_details.js, update_post_details.js in dir src/pages/post

5. for the api, please code following format
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

6. for the route of app, it should define like this in src/app/App.js
<Route path='feedback' element={<FeedbackList />} />
<Route path='feedback/add' element={<FeedbackForm />} />
<Route path='show-feedback-details/:id' element={<FeedbackDetail />} />
<Route path='update-feedback/:id' element={<FeedbackForm />} />

