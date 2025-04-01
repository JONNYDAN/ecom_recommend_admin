import React, { useState, useEffect } from "react";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useParams, useNavigate } from "react-router-dom";
import DeleteModal from "../../components/delete_modal";
import { getPostDetailData, deletePostDetailData } from "../../network/post_api";
import Loader from "../../components/loader";


const ShowPostDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [postResult, setPostResult] = useState({});
    const [deletingPost, setDeletingPost] = useState(null);

    useEffect(() => {
        getPostDetail()
    }, []);

    const openEditPost = (user) => {
        navigate(`/admin/update-post-details/${user._id}`);
    };

    const handleDeleteClick = (user) => {
        setDeletingPost(user);
    };

    const handleCloseModal = () => {
        setDeletingPost(null)
    };

    const confirmDelete = async () => {
        if (!deletingPost) return;

        try {
            setLoading(true);
            await deletePostDetailData(deletingPost._id); // Gọi API xóa bài viết
            toast.success("Post deleted successfully");
            setDeletingPost(null);
            navigate("/admin/posts"); // Lấy lại danh sách bài viết sau khi 
        } catch (error) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    const getPostDetail = async () => {

        setLoading(true);

        try {
            const response = await getPostDetailData(id);
            setPostResult(response.data); // Set the userResult state with the data
            toast.success("Post Detail Fetched successfully");
        } catch (error) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (

        <div>
            {/*<!-- Loader -->*/}
            <Loader isShow={loading} />

            {/*<!-- Start block -->*/}
            <div className="bg-gray-50 h-screen">
                <section className="bg-white shadow-md mt-10">
                    {!loading ? (<div className="py-8 px-4 mx-auto ">
                        <div className="grid gap-2 grid-cols-2">
                            <div className="d-flex flex-column gap-2">
                                <div className="w-full flex flex-row mb-1">
                                    <div className="w-full flex flex-col">
                                        <h2 className="mb-2 font-semibold leading-none text-gray-900">Post Id</h2>
                                        <p className="mb-4 font-medium text-gray-600 flex flex-row space-x-2 items-center"><svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-gray-600 fill-current bi bi-person-fill" viewBox="0 0 16 16">
                                            <path d="M3 14s-1 0-1-1 1-4 6-4 6 3 6 4-1 1-1 1H3Zm5-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
                                        </svg><span>{postResult._id}</span></p>
                                    </div>
                                </div>
                                <div className="w-full flex flex-col">
                                    <h2 className="mb-2 font-semibold leading-none text-gray-900">Title</h2>
                                    <p className="mb-4 font-medium text-gray-600 flex flex-row space-x-2 items-center"><span>{postResult.title}</span></p>
                                </div>
                            </div>
                            <div className="flex flex-row mb-5">
                                <img
                                    className="w-64 h-48 rounded-xl bg-gray-300"
                                    src={postResult.thumbnail}
                                    alt="post"
                                />
                            </div>
                        </div>

                        

                        <div className="grid gap-5 grid-cols-2 ">
                            
                            <div className="w-full flex flex-col ">
                                <h2 className="mb-2 font-semibold leading-none text-gray-900">Description</h2>
                                <p className="mb-4 font-medium text-gray-600 flex flex-row space-x-2 items-center"><svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-gray-600 fill-current bi bi-person-fill" viewBox="0 0 16 16">
                                    <path d="M3 14s-1 0-1-1 1-4 6-4 6 3 6 4-1 1-1 1H3Zm5-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
                                </svg><span className="text-justify ">{postResult.description}</span></p>
                            </div>
                            <div className="w-full flex flex-col">
                                <h2 className="mb-2 font-semibold leading-none text-gray-900">Content</h2>
                                <p className="mb-4 font-medium text-gray-600 flex flex-row space-x-2 items-center">
                                    <div
                                        className=" text-justify "
                                        style={{ wordWrap: "break-word", overflowWrap: "break-word", whiteSpace: "normal" }}
                                        dangerouslySetInnerHTML={{ __html: postResult.content }}
                                    />
                                </p>
                                
                            </div>
                            
                            <div className="w-full flex flex-col">
                                <h2 className="mb-2 font-semibold leading-none text-gray-900">Status</h2>
                                <p className="mb-4 font-medium text-gray-600 flex flex-row space-x-2 items-center">
                                    <svg class="w-4 h-4 text-gray-600 fill-current" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 18 20">
                                        <path d="M16 0H4a2 2 0 0 0-2 2v1H1a1 1 0 0 0 0 2h1v2H1a1 1 0 0 0 0 2h1v2H1a1 1 0 0 0 0 2h1v2H1a1 1 0 0 0 0 2h1v1a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2Zm-5.5 4.5a3 3 0 1 1 0 6 3 3 0 0 1 0-6ZM13.929 17H7.071a.5.5 0 0 1-.5-.5 3.935 3.935 0 1 1 7.858 0 .5.5 0 0 1-.5.5Z" />
                                    </svg><span>{postResult.isPublished ? 'Published' : 'Not Published'}</span>
                                </p>
                            </div>
                        </div>
                        <div className="d-flex gap-3">
                            <button onClick={() => openEditPost(postResult)} type="button" className="text-white inline-flex items-center bg-primary-700 hover:bg-primary-800 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center ">
                                <svg aria-hidden="true" className="mr-1 -ml-1 w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z"></path><path fill-rule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clip-rule="evenodd"></path></svg>
                                Edit
                            </button>
                            <button onClick={() => handleDeleteClick(postResult)} type="button" className="inline-flex items-center text-white bg-red-600 hover:bg-red-700 focus:ring-4 focus:outline-none focus:ring-red-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center">
                                <svg aria-hidden="true" className="w-5 h-5 mr-1.5 -ml-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd"></path></svg>
                                Delete
                            </button>
                        </div>

                    </div>) : null}
                </section>
            </div >
            {/*<!-- End block -->*/}
            {/*<!-- Delete modal -->*/}
            <DeleteModal title={"Are you sure you want to delete this user"} isOpen={deletingPost} onCancel={handleCloseModal}
                onConfirm={confirmDelete} />

            {/*<!-- Toast -->*/}
            <ToastContainer />
        </div >

    );
}

export default ShowPostDetails;