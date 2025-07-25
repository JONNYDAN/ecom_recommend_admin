import React, { useState, useEffect, useRef } from "react";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Link, useNavigate, useParams } from "react-router-dom";
import Loader from "../../components/loader";
import DeleteModal from "../../components/delete_modal";
import { getAllQuestionsData, deleteQuestionDetailData } from "../../network/question_api";

const QuestionList = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [questionListResult, setQuestionListResult] = useState({});
    const [activeRowDropdown, setActiveRowDropdown] = useState(null);
    const [deletingQuestion, setDeletingQuestion] = useState(null);
    // Ref to store a reference to the dropdown container
    const rowDropdownRef = useRef(null);

    useEffect(() => {
        getQuestionList()

        // Add event listener to the document to close the dropdown on outside click
        function handleClickOutside(event) {
            if (rowDropdownRef.current && !rowDropdownRef.current.contains(event.target)) {
                closeRowDropDown();
            }
        }

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const toggleRowDropdown = (rowId) => {
        setActiveRowDropdown(rowId === activeRowDropdown ? null : rowId);
    };

    const closeRowDropDown = () => {
        //setActiveRowDropdown(null);
    };

    const backToPreviousPage = () => {
        navigate(-1);
    };

    const openQuestionPreview = (question) => {
        navigate(`/admin/show-question-details/${question._id}`);
    };

    const openEditQuestion = (question) => {
        navigate(`/admin/update-question/${question._id}`);
    };

    const getQuestionList = async () => {

        setLoading(true);

        try {
            const response = await getAllQuestionsData(id);
            setQuestionListResult(response);
            // toast.success("List Fetched successfully");
        } catch (error) {
            // Không hiển thị toast lỗi
        } finally {
            setLoading(false);
        }
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
            toast.success("Code deleted successfully");
            setDeletingQuestion(null);
            navigate(`/admin/questions/${id}`);
            window.location.reload(); // Lấy lại danh sách bài viết sau khi 
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
            <section className="bg-gray-50  antialiased mt-10">

                <div className="flex flex-row items-center justify-between space-y-3 p-4">
                    <h1 className="text-2xl font-medium"><span className="text-primary-700" onClick={() => backToPreviousPage()} type="button">{questionListResult.quiz ? questionListResult.quiz.title : ""}</span>
                        {questionListResult.quiz && questionListResult.quiz.title ? (<span className="inline-block">
                            <i className="fa fa-chevron-right text-lg ml-2 mr-2"></i>Questions
                        </span>) : null}
                    </h1>
                    <div className="flex flex-row items-center">
                        <h3 className="mr-8 text-lg font-medium">Total : {questionListResult.questions && questionListResult.questions.length}</h3>
                        <Link
                            to={`/admin/add-question/${questionListResult.quiz && questionListResult.quiz._id}`}
                            type="button"
                            className="flex items-center justify-center text-white bg-primary-700 hover:bg-primary-800 focus:ring-4 focus:ring-primary-300 font-medium rounded-lg text-sm px-4 py-2 focus:outline-none">
                            Create New
                        </Link>

                    </div>
                </div>

                {!loading ? (
                    <div className="mx-auto max-w-screen-xl px-4">

                        <div className="bg-white relative shadow-md rounded-lg">

                            <div className="overflow-x-visible">
                                <table className="w-full text-sm text-left text-gray-500">
                                    <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                                        <tr>
                                            <th scope="col" className="px-4 py-3">Id</th>
                                            <th scope="col" className="px-4 py-3">Title</th>
                                            <th scope="col" className="px-4 py-3">Group</th>
                                            <th scope="col" className="px-4 py-3">Point</th>
                                            <th scope="col" className="px-4 py-3">
                                                <span className="sr-only">Actions</span>
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {questionListResult.questions ? questionListResult.questions.map((question, index) => (
                                            <tr key={question._id} className="border-b relative">
                                                <th type="button" onClick={() => openQuestionPreview(question)} className="px-4 py-3 font-medium text-gray-900 whitespace-nowrap max-w-[8rem] truncate hover:text-primary-700">{question._id}</th>
                                                <td className="px-4 py-3 max-w-[20rem] truncate">{question.question}</td>
                                                <td className="px-4 py-3 max-w-[20rem] truncate"> {question.group}</td>
                                                <td className="px-4 py-3 max-w-[20rem] truncate"> {question.point}</td>
                                                <td className="px-4 py-3 relative">
                                                    <button onClick={() => toggleRowDropdown(question._id)} id={`apple-imac-27-dropdown-button-${question._id}`} className="inline-flex items-center text-sm font-medium hover:bg-gray-100 text-center text-gray-500 hover:text-gray-800 rounded-lg focus:outline-none " type="button">
                                                        <svg className="w-5 h-5" aria-hidden="true" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                                            <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z" />
                                                        </svg>
                                                    </button>

                                                    <div ref={rowDropdownRef} id={`apple-imac-27-dropdown-${question._id}`} className={`z-10 w-44 bg-white rounded divide-y divide-gray-100 shadow absolute right-0 ${activeRowDropdown === question._id ? 'block' : 'hidden'} ${index >= questionListResult.length - 2 ? '-top-28' : 'top-10'}`}>
                                                        <ul className="py-1 text-sm" aria-labelledby={`apple-imac-27-dropdown-button-${question._id}`}>
                                                            <li>
                                                                <button onClick={() => openEditQuestion(question)} type="button" className="flex w-full items-center py-2 px-4 hover:bg-gray-100 text-gray-700 ">
                                                                    <svg className="w-4 h-4 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                                                        <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" />
                                                                        <path fillRule="evenodd" clipRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
                                                                    </svg>
                                                                    Edit
                                                                </button>
                                                            </li>
                                                            <li>
                                                                <button onClick={() => openQuestionPreview(question)} className="flex w-full items-center py-2 px-4 hover:bg-gray-100 text-gray-700">
                                                                    <svg className="w-4 h-4 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                                                        <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                                                                        <path fillRule="evenodd" clipRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" />
                                                                    </svg>
                                                                    Preview
                                                                </button>
                                                            </li>
                                                            <li>
                                                                <button onClick={() => handleDeleteClick(question)} type="button" data-modal-target="deleteModal" data-modal-toggle="deleteModal" className="flex w-full items-center py-2 px-4 hover:bg-gray-100 text-red-500">
                                                                    <svg className="w-4 h-4 mr-2" viewbox="0 0 14 15" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                                                                        <path fill-rule="evenodd" clip-rule="evenodd" fill="currentColor" d="M6.09922 0.300781C5.93212 0.30087 5.76835 0.347476 5.62625 0.435378C5.48414 0.523281 5.36931 0.649009 5.29462 0.798481L4.64302 2.10078H1.59922C1.36052 2.10078 1.13161 2.1956 0.962823 2.36439C0.79404 2.53317 0.699219 2.76209 0.699219 3.00078C0.699219 3.23948 0.79404 3.46839 0.962823 3.63718C1.13161 3.80596 1.36052 3.90078 1.59922 3.90078V12.9008C1.59922 13.3782 1.78886 13.836 2.12643 14.1736C2.46399 14.5111 2.92183 14.7008 3.39922 14.7008H10.5992C11.0766 14.7008 11.5344 14.5111 11.872 14.1736C12.2096 13.836 12.3992 13.3782 12.3992 12.9008V3.90078C12.6379 3.90078 12.8668 3.80596 13.0356 3.63718C13.2044 3.46839 13.2992 3.23948 13.2992 3.00078C13.2992 2.76209 13.2044 2.53317 13.0356 2.36439C12.8668 2.1956 12.6379 2.10078 12.3992 2.10078H9.35542L8.70382 0.798481C8.62913 0.649009 8.5143 0.523281 8.37219 0.435378C8.23009 0.347476 8.06631 0.30087 7.89922 0.300781H6.09922ZM4.29922 5.70078C4.29922 5.46209 4.39404 5.23317 4.56282 5.06439C4.73161 4.8956 4.96052 4.80078 5.19922 4.80078C5.43791 4.80078 5.66683 4.8956 5.83561 5.06439C6.0044 5.23317 6.09922 5.46209 6.09922 5.70078V11.1008C6.09922 11.3395 6.0044 11.5684 5.83561 11.7372C5.66683 11.906 5.43791 12.0008 5.19922 12.0008C4.96052 12.0008 4.73161 11.906 4.56282 11.7372C4.39404 11.5684 4.29922 11.3395 4.29922 11.1008V5.70078ZM8.79922 4.80078C8.56052 4.80078 8.33161 4.8956 8.16282 5.06439C7.99404 5.23317 7.89922 5.46209 7.89922 5.70078V11.1008C7.89922 11.3395 7.99404 11.5684 8.16282 11.7372C8.33161 11.906 8.56052 12.0008 8.79922 12.0008C9.03791 12.0008 9.26683 11.906 9.43561 11.7372C9.6044 11.5684 9.69922 11.3395 9.69922 11.1008V5.70078C9.69922 5.46209 9.6044 5.23317 9.43561 5.06439C9.26683 4.8956 9.03791 4.80078 8.79922 4.80078Z" />
                                                                    </svg>
                                                                    Delete
                                                                </button>
                                                            </li>
                                                        </ul>
                                                    </div>
                                                    
                                                </td>
                                            </tr>
                                        )) : null}
                                    </tbody>

                                </table>
                            </div>
                        </div>
                    </div>
                ) : null}

            </section>
            {/*<!-- End block -->*/}

            {/*<!-- Delete modal -->*/}
            <DeleteModal isOpen={deletingQuestion} onCancel={handleCloseModal}
                    onConfirm={confirmDelete} />

            {/*<!-- Toast -->*/}
            <ToastContainer />
        </div>
    )
};

export default QuestionList;