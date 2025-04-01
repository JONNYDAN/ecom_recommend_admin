import React, { useState, useEffect } from "react";
import { useFormik } from 'formik';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useParams, useNavigate } from "react-router-dom";
import { getQuizDetailData, updateQuizData } from "../../network/quiz_api";
import Loader from "../../components/loader";

const UpdateQuiz = () => {
    const { id } = useParams();
    const [loading, setLoading] = useState(false);
    const [quizCategoryListResult, setQuizCategoryListResult] = useState([]);
    const [quizResult, setQuizResult] = useState({});
    const navigate = useNavigate();

    useEffect(() => {
        getQuizDetail();
    }, []);

    // const getQuizCategoryList = async () => {
    //     setLoading(true);
    //     try {
    //         const response = await getAllQuizCategoriesData();
    //         setQuizCategoryListResult(response.quiz_categories);
    //         getQuizDetail();
    //     } catch (error) {
    //         toast.error(error.message);
    //     } finally {
    //         setLoading(false);
    //     }
    // };

    const getQuizDetail = async () => {
        setLoading(true);
        try {
            const response = await getQuizDetailData(id);
            setQuizResult(response.quiz);
        } catch (error) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    const formik = useFormik({
        initialValues: {
            title: quizResult.title || '',
            questionCount: quizResult.questionCount || 0,
            duration: quizResult.duration || 0,
            // Nếu không có audio mới, giữ lại audio cũ
            audio: quizResult.audio || '', 
            audioPreview: quizResult.audio || '',
        },
        enableReinitialize: true,
        validateOnMount: true,
        initialErrors: {
            title: 'Title is required',
        },
        validate: (values) => {
            const errors = {};
            if (!values.title) {
                errors.title = 'Title is required';
            }
            return errors;
        },
        onSubmit: (values, { setSubmitting }) => {
            const formData = new FormData();
            formData.append('title', values.title);
            formData.append('questionCount', values.questionCount);
            formData.append('duration', values.duration);
            // Nếu audio là file (upload mới) thì gửi file, nếu không thì không gửi
            if (values.audio instanceof File) {
                formData.append('audio', values.audio); 
            }
            handleSubmit(formData);
            setSubmitting(false);
        },
    });

    const handleSubmit = async (formData) => {
        setLoading(true);
        try {
            const response = await updateQuizData(id, formData);
            toast.success(response.message);
            formik.resetForm();
            navigate(`/admin/show-quiz-details/${id}`);
        } catch (error) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            {/* Loader */}
            <Loader isShow={loading} />

            {/* Start block */}
            <div className="bg-gray-50 h-screen">
                <section className="mx-auto bg-white shadow-md mt-10">
                    <div className="py-8 px-4 mx-auto">
                        <h2 className="mb-4 text-xl font-bold text-gray-900">Update Quiz</h2>
                        <form className="mt-10" onSubmit={formik.handleSubmit}>
                            <div className="grid gap-4 grid-cols-2">
                                <div className="w-full">
                                    <label htmlFor="title" className="block mb-2 text-sm font-medium text-gray-900">Title</label>
                                    <input
                                        type="text"
                                        name="title"
                                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
                                        placeholder="Static Mathematics Quiz"
                                        onChange={formik.handleChange}
                                        value={formik.values.title}
                                    />
                                    {formik.touched.title && formik.errors.title && (
                                        <div className="text-red-500">{formik.errors.title}</div>
                                    )}
                                </div>
                            </div>
                            
                            <div className="w-full mt-4">
                                <div className="grid gap-4 grid-cols-2">
                                    <div className="w-full">
                                        <label htmlFor="questionCount" className="block mb-2 text-sm font-medium text-gray-900">Question Count</label>
                                        <input
                                            type="number"
                                            name="questionCount"
                                            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
                                            onChange={formik.handleChange}
                                            value={formik.values.questionCount}
                                            disabled
                                        />
                                        {formik.touched.questionCount && formik.errors.questionCount && (
                                            <div className="text-red-500">{formik.errors.questionCount}</div>
                                        )}
                                    </div>
                                    <div className="w-full">
                                        <label htmlFor="duration" className="block mb-2 text-sm font-medium text-gray-900">Question Duration</label>
                                        <input
                                            type="number"
                                            name="duration"
                                            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
                                            onChange={formik.handleChange}
                                            value={formik.values.duration}
                                        />
                                        {formik.touched.duration && formik.errors.duration && (
                                            <div className="text-red-500">{formik.errors.duration}</div>
                                        )}
                                    </div>
                                </div>
                                {/* Hiển thị audio hiện tại hoặc xem trước */}
                                <div className="w-full mt-4">
                                    {/* <label className="block mb-2 text-sm font-medium text-gray-900">Current Audio</label> */}
                                    
                                    {formik.values.audio ? (
                                        <audio controls crossOrigin="anonymous">
                                            <source src={formik.values.audioPreview || formik.values.audio} type="audio/mpeg" />
                                            Your browser does not support the audio element.
                                        </audio>
                                    ) : (null)}
                                </div>
                                {quizResult.title == "Nghe hiểu" ? (
                                    <div className="w-full mt-4">
                                        <label htmlFor="audio" className="block mb-2 text-sm font-medium text-gray-900">Upload New Audio</label>
                                        <input
                                            type="file"
                                            id="audio"
                                            name="audio"
                                            accept="audio/*"
                                            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
                                            onChange={(event) => {
                                                const file = event.target.files[0];
                                                if (file) {
                                                    // Tạo URL xem trước của file audio mới
                                                    formik.setFieldValue("audioPreview", URL.createObjectURL(file));
                                                    formik.setFieldValue("audio", file);
                                                }
                                            }}
                                        />
                                        {formik.touched.audio && formik.errors.audio && (
                                            <div className="text-red-500 mt-1">{formik.errors.audio}</div>
                                        )}
                                    </div>
                                ) : null}
                            </div>
                            <div className="flex justify-center mt-4">
                                <button
                                    type="submit"
                                    className={`inline-flex items-center px-5 py-2.5 mt-4 text-sm font-medium text-center text-white rounded-lg focus:ring-4 ${
                                        formik.isValid
                                            ? 'bg-primary-600 hover:bg-primary-700 focus:ring-primary-300'
                                            : 'bg-gray-600 hover:bg-gray-700 focus:ring-gray-300'
                                    }`}
                                >
                                    {loading ? "Loading..." : "Update Quiz"}
                                </button>
                            </div>
                        </form>
                    </div>
                </section>
            </div>
            <ToastContainer />
        </div>
    );
};

export default UpdateQuiz;
