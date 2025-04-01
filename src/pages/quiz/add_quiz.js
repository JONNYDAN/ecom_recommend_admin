import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useFormik } from 'formik';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { createQuizData } from "../../network/quiz_api";
import { getAllQuizCategoriesData } from "../../network/quiz_category_api";
import Loader from "../../components/loader";

const AddQuiz = () => {
    const { id } = useParams();
    const [quizCategoryListResult, setQuizCategoryListResult] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        getQuizCategoryList();
    }, [])

    const getQuizCategoryList = async () => {

        setLoading(true);

        try {
            const response = await getAllQuizCategoriesData();
            setQuizCategoryListResult(response.quiz_categories);

        } catch (error) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    const formik = useFormik({
        initialValues: { title: '', questionCount: 0, duration: 0, audioPreview: '' },
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

            if (values.audioPreview instanceof File) {
                formData.append('audio', values.audioPreview); 
            }

            handleSubmit(formData);
            setSubmitting(false);
        },
    });

    const handleSubmit = async (formData) => {

        setLoading(true);

        try {
            const response = await createQuizData(id, formData);
            toast.success(response.message);
            formik.resetForm();
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
                <section className=" mx-auto bg-white shadow-md mt-10">
                    <div className="py-8 px-4 mx-auto">
                        <h2 className="mb-4 text-xl font-bold text-gray-900">Add a new quiz</h2>
                        <form className="mt-10" onSubmit={formik.handleSubmit}>
                            <div className="grid gap-4 grid-cols-2">
                                <div className="w-full">
                                    <label htmlFor="title" className="block mb-2 text-sm font-medium text-gray-900">Title</label>
                                    <input
                                        type="text"
                                        name="title"
                                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
                                        placeholder="Nghe hiểu"
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
                                    {/* <div className="w-full">
                                        <label htmlFor="questionCount" className="block mb-2 text-sm font-medium text-gray-900">Question Count</label>
                                        <input
                                            type="number"
                                            name="questionCount"
                                            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
                                            onChange={formik.handleChange}
                                            value={formik.values.questionCount || 0}
                                        />
                                        {formik.touched.questionCount && formik.errors.questionCount && (
                                            <div className="text-red-500">{formik.errors.questionCount}</div>
                                        )}
                                    </div> */}
                                    <div className="w-full">
                                        <label htmlFor="duration" className="block mb-2 text-sm font-medium text-gray-900">Question Duration</label>
                                        <input
                                            type="number"
                                            name="duration"
                                            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
                                            onChange={formik.handleChange}
                                            value={formik.values.duration || 0}
                                        />
                                        {formik.touched.duration && formik.errors.duration && (
                                            <div className="text-red-500">{formik.errors.duration}</div>
                                        )}
                                    </div>
                                </div>

                                {/* Hiển thị audio hiện tại hoặc xem trước */}
                                <div className="w-full mt-4">
                                    <label className="block mb-2 text-sm font-medium text-gray-900">Current Audio</label>
                                    
                                    {formik.values.audio ? (
                                        <audio controls crossOrigin="anonymous">
                                            <source src={formik.values.audioPreview} type="audio/mpeg" />
                                            Your browser does not support the audio element.
                                        </audio>
                                    ) : (
                                        <p className="text-gray-500">Chưa có audio</p>
                                    )}
                                </div>

                                {/* Input file để upload audio mới */}
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
                                            }
                                        }}
                                    />

                                    {formik.touched.audio && formik.errors.audio && (
                                        <div className="text-red-500 mt-1">{formik.errors.audio}</div>
                                    )}
                                </div>

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

            {/*<!-- End block -->*/}

            {/*<!-- Toast -->*/}
            <ToastContainer />
        </div>
    )
};

export default AddQuiz;