import React, { useState, useEffect } from "react";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useParams, useNavigate } from "react-router-dom";
import DeleteModal from "../../components/delete_modal";
import { getQuestionDetailData, deleteQuestionDetailData } from "../../network/question_api";
import Loader from "../../components/loader";


const ShowQuestionDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [questionResult, setQuestionResult] = useState({});
    const [deletingQuestion, setDeletingQuestion] = useState(null);
    const options = ["A", "B", "C", "D"];

    useEffect(() => {
        getQuestionDetail()
    }, []);

    const openEditQuestion = (question) => {
        navigate(`/admin/update-question/${question._id}`);
    };

    const handleDeleteClick = (question) => {
        setDeletingQuestion(question);
    };

    const handleCloseModal = () => {
        setDeletingQuestion(null)
    };

    const confirmDelete = async () => {
        if (!deletingQuestion) return;

        try {
            setLoading(true);
            await deleteQuestionDetailData(deletingQuestion._id); // Gọi API xóa bài viết
            toast.success("Question deleted successfully");
            setDeletingQuestion(null);
            navigate(`/admin/questions/${id}`); // Lấy lại danh sách bài viết sau khi 
        } catch (error) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    const getQuestionDetail = async () => {

        setLoading(true);

        try {

            const response = await getQuestionDetailData(id);
            setQuestionResult(response.question);
            toast.success("Quiz Detail Fetched successfully");
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

                        <div className="w-full flex flex-row mb-1">
                            <div className="w-full flex flex-col">
                                <h2 className="mb-2 font-semibold leading-none text-gray-900">Question Id</h2>
                                <p className="mb-4 font-medium text-gray-600 flex flex-row space-x-2 items-cente">{questionResult._id}</p>
                            </div>
                            <div className="w-full flex flex-col">
                                <h2 className="mb-2 font-semibold leading-none text-gray-900">Quiz Name</h2>
                                <p className="mb-4 font-medium text-gray-600 flex flex-row space-x-2 items-center">{questionResult.quiz ? questionResult.quiz.title : ""}</p>
                            </div>
                        </div>

                        <div className="w-full flex flex-row mb-1">
                            <div className="w-full flex flex-col">
                                <h2 className="mb-2 font-semibold leading-none text-gray-900">Group</h2>
                                <p className="mb-4 font-medium text-gray-600 flex flex-row space-x-2 items-cente">{questionResult.group}</p>
                            </div>
                            <div className="w-full flex flex-col">
                                <h2 className="mb-2 font-semibold leading-none text-gray-900">Point</h2>
                                <p className="mb-4 font-medium text-gray-600 flex flex-row space-x-2 items-center">{questionResult.point}</p>
                            </div>
                        </div>

                        <div className="w-full flex flex-row mb-1">
                            <div className="w-full flex flex-col">
                                <h2 className="mb-2 font-semibold leading-none text-gray-900">Question</h2>
                                <p className="mb-4 font-medium text-gray-600 flex flex-row space-x-2 items-cente">
                                <div
                                className=" text-justify "
                                style={{ wordWrap: "break-word", overflowWrap: "break-word", whiteSpace: "normal" }}
                                dangerouslySetInnerHTML={{ __html: questionResult.question }}
                                /></p>
                            </div>
                        </div>

                        <div className="w-full flex flex-row mb-1">
                            <div className="w-full flex flex-col">
                                <h2 className="mb-2 font-semibold leading-none text-gray-900">Options</h2>
                                <ol start="1" className="mb-4 font-medium text-gray-600 space-y-4">
                                    {questionResult.options && questionResult.options.map((option, index) => (
                                        <li key={index}>{options[index]}. {option}</li>
                                    ))}
                                </ol>
                            </div>
                        </div>

                        <div className="w-full flex flex-row mb-1">
                            <div className="w-full flex flex-col">
                                <h2 className="mb-2 font-semibold leading-none text-gray-900">Correct Answer</h2>
                                <p className="mb-4 font-medium text-gray-600 flex flex-row space-x-2 items-center">{options[questionResult.correctOptionIndex]}</p>
                            </div>
                        </div>

                        <div className="flex flex-row space-x-4 mt-8">
                            <button onClick={() => openEditQuestion(questionResult)} type="button" className="text-white inline-flex items-center bg-primary-700 hover:bg-primary-800 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center">
                                <svg aria-hidden="true" className="mr-1 -ml-1 w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z"></path><path fill-rule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clip-rule="evenodd"></path></svg>
                                Edit
                            </button>
                            <button onClick={() => handleDeleteClick(questionResult)} type="button" className="inline-flex items-center text-white bg-red-600 hover:bg-red-700 focus:ring-4 focus:outline-none focus:ring-red-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center">
                                <svg aria-hidden="true" className="w-5 h-5 mr-1.5 -ml-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd"></path></svg>
                                Delete
                            </button>
                        </div>
                    </div>) : null}
                </section>
            </div >
            {/*<!-- End block -->*/}

            {/*<!-- Delete modal -->*/}
            <DeleteModal title={"Are you sure you want to delete this question"} isOpen={deletingQuestion} onCancel={handleCloseModal}
                onConfirm={confirmDelete} />

            {/*<!-- Toast -->*/}
            <ToastContainer />
        </div >

    );
}

export default ShowQuestionDetails;