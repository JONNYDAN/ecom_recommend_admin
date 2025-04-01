import React, { useState, useEffect } from "react";
import { useFormik } from 'formik';
import { optionList } from "../../utils/constants";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useParams, useNavigate } from "react-router-dom";
import { getQuestionDetailData, updateQuestionData } from "../../network/question_api";
import { getQuizDetailData } from "../../network/quiz_api";
import Loader from "../../components/loader";
import { pointData } from "../../utils/constants";

import { Editor } from "react-draft-wysiwyg";
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";
import { EditorState, convertToRaw, ContentState } from 'draft-js';
import htmlToDraft from 'html-to-draftjs';
import draftToHtml from 'draftjs-to-html';

const UpdateQuestion = () => {
    const { id } = useParams();
    const [loading, setLoading] = useState(false);
    const [questionResult, setQuestionResult] = useState({});
    // const [quizDetailResult, setQuizDetailResult] = useState([]);
    const navigate = useNavigate();
    const [editorState, setEditorState] = useState(EditorState.createEmpty());

    useEffect(() => {
        getQuestionDetail();
    }, [])

    useEffect(() => {
        if (questionResult.question) {
            const contentBlock = htmlToDraft(questionResult.question);
            if (contentBlock) {
                const contentState = ContentState.createFromBlockArray(contentBlock.contentBlocks);
                const editorState = EditorState.createWithContent(contentState);
                setEditorState(editorState);
            }
        }
    }, [questionResult]);

    // const getQuizDetail = async () => {
    //     setLoading(true);

    //     try {
    //         const response = await getQuizDetailData();
    //         setQuizDetailResult(response.quizzes);
    //         await getQuestionDetail();
    //     } catch (error) {
    //         toast.error(error.message);
    //     } finally {
    //         setLoading(false);
    //     }
    // };

    const getQuestionDetail = async () => {

        setLoading(true);

        try {
            const response = await getQuestionDetailData(id);
            setQuestionResult(response.question);
        } catch (error) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    const formik = useFormik({
        initialValues: { question: questionResult.question || '', 
            quiz: (questionResult.quiz && questionResult.quiz._id) || '', 
            option_a: (questionResult.options && questionResult.options[0]) || '', 
            option_b: (questionResult.options && questionResult.options[1]) || '', 
            option_c: (questionResult.options && questionResult.options[2]) || '', 
            option_d: (questionResult.options && questionResult.options[3]) || '', 
            correct_option: questionResult.correctOptionIndex || '',
            group: questionResult.group || '',
            point: questionResult.point || 0
         },
        initialErrors: {
            question: 'Question is required',

            quiz: 'Quiz is required',
            option_a: 'Option 1 is required',
            option_b: 'Option 2 is required',
            option_c: 'Option 3 is required',
            option_d: 'Option 4 is required',
            correct_option: 'Correct option is required',
            group: 'Group is required',
            point: 'Point is required'
        },
        enableReinitialize: true,
        validateOnMount: true,
        validate: (values) => {
            const errors = {};
            if (!values.question) {
                errors.question = 'Question is required';
            }
            if (!values.quiz) {
                errors.quiz = 'Quiz is required';
            }
            if (!values.option_a) {
                errors.option_a = 'Option 1 is required';
            }
            if (!values.option_b) {
                errors.option_b = 'Option 2 is required';
            }
            if (!values.option_c) {
                errors.option_c = 'Option 3 is required';
            }
            if (!values.option_d) {
                errors.option_d = 'Option 4 is required';
            }
            if (!values.correct_option) {
                errors.correct_option = 'Correct option is required';
            }
            if (!values.group) {
                errors.group = 'Group is required';
            }
            if (!values.point) {
                errors.point = 'Point is required';
            }

            return errors;
        },
        onSubmit: (values, { setSubmitting }) => {
            const modifiedValues = {
                question: values.question,
                correctOptionIndex: values.correct_option,
                options: [values.option_a, values.option_b, values.option_c, values.option_d],
                group: values.group,
                point: values.point,
            };
            handleSubmit(modifiedValues);
            setSubmitting(false);
        },
    });

    const handleSubmit = async (values) => {
        console.log('onSubmit', values);

        setLoading(true);

        try {
            const response = await updateQuestionData(id, values);
            toast.success(response.message);
            formik.resetForm();
            navigate(`/admin/questions/${questionResult.quiz._id}`);
        } catch (error) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    const onEditorStateChange = (editorState) => {
        setEditorState(editorState);
        const question = editorState.getCurrentContent();
        const rawQuestionState = convertToRaw(question);
        const htmlQuestion = draftToHtml(rawQuestionState);
        formik.setFieldValue("question", htmlQuestion);
    };

    return (
        <div>
            {/*<!-- Loader -->*/}
            <Loader isShow={loading} />

            {/*<!-- Start block -->*/}
            <div className="bg-gray-50 h-screen">
                <section className=" mx-auto bg-white shadow-md mt-10">
                    <div className="py-8 px-4 mx-auto">
                        <h2 className="mb-4 text-xl font-bold text-gray-900">Update question</h2>
                        <form className="mt-10" onSubmit={formik.handleSubmit}>
                            <div className="grid gap-4 grid-cols-2 ">
                                <div className="w-full">
                                    <label htmlFor="question" className="block mb-2 text-sm font-medium text-gray-900">Question</label>
                                    <Editor
                                        editorState={editorState}
                                        toolbarClassName="toolbarClassName"
                                        wrapperClassName="wrapperClassName"
                                        editorClassName="editorClassName"
                                        onEditorStateChange={onEditorStateChange}
                                    />
                                    {formik.touched.question && formik.errors.question && (
                                        <div className="text-red-500">{formik.errors.question}</div>
                                    )}
                                </div>
                                <div className="w-full">
                                    <label htmlFor="group" className="block mb-2 text-sm font-medium text-gray-900">Group</label>
                                    <input type="text" name="group" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5" placeholder="Who is the prime minister of India?" onChange={formik.handleChange}
                                        value={formik.values.group} />
                                    {formik.touched.group && formik.errors.group && (
                                        <div className="text-red-500">{formik.errors.group}</div>
                                    )}
                                </div>

                                {/* <div className="w-full">
                                    <label htmlFor="quiz" className="block mb-2 text-sm font-medium text-gray-900">
                                        Quiz
                                    </label>
                                    <select
                                        name="quiz"
                                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                                        onChange={formik.handleChange}
                                        value={formik.values.quiz}>
                                        <option value="" disabled>Select a quiz</option>
                                        {quizListResult.map((quiz) => (
                                            <option key={quiz._id} value={quiz._id}>
                                                {quiz.title}
                                            </option>
                                        ))}
                                    </select>
                                    {formik.touched.quiz && formik.errors.quiz && (
                                        <div className="text-red-500">{formik.errors.quiz}</div>
                                    )}
                                </div> */}

                                <div className="w-full">
                                    <label htmlFor="option_a" className="block mb-2 text-sm font-medium text-gray-900">Option A</label>
                                    <input type="text" name="option_a" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5" placeholder="Narendra Modi" onChange={formik.handleChange}
                                        value={formik.values.option_a} />
                                    {formik.touched.option_a && formik.errors.option_a && (
                                        <div className="text-red-500">{formik.errors.option_a}</div>
                                    )}
                                </div>

                                <div className="w-full">
                                    <label htmlFor="option_b" className="block mb-2 text-sm font-medium text-gray-900">Option B</label>
                                    <input type="text" name="option_b" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5" placeholder="Rahul Gandhi" onChange={formik.handleChange}
                                        value={formik.values.option_b} />
                                    {formik.touched.option_b && formik.errors.option_b && (
                                        <div className="text-red-500">{formik.errors.option_b}</div>
                                    )}
                                </div>

                                <div className="w-full">
                                    <label htmlFor="option_c" className="block mb-2 text-sm font-medium text-gray-900">Option C</label>
                                    <input type="text" name="option_c" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5" placeholder="Amit Shah" onChange={formik.handleChange}
                                        value={formik.values.option_c} />
                                    {formik.touched.option_c && formik.errors.option_c && (
                                        <div className="text-red-500">{formik.errors.option_c}</div>
                                    )}
                                </div>

                                <div className="w-full">
                                    <label htmlFor="option_d" className="block mb-2 text-sm font-medium text-gray-900">Option D</label>
                                    <input type="text" name="option_d" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5" placeholder="Arvind Kejriwal" onChange={formik.handleChange}
                                        value={formik.values.option_d} />
                                    {formik.touched.option_d && formik.errors.option_d && (
                                        <div className="text-red-500">{formik.errors.option_d}</div>
                                    )}
                                </div>

                                <div className="w-full">
                                    <label htmlFor="quiz" className="block mb-2 text-sm font-medium text-gray-900">
                                        Correct Option
                                    </label>
                                    <select
                                        name="correct_option"
                                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                                        onChange={formik.handleChange}
                                        value={formik.values.correct_option}>
                                        {optionList.map((data) => (
                                            <option key={data.id} value={data.id}>
                                                {data.name}
                                            </option>
                                        ))}
                                    </select>
                                    {formik.touched.correct_option && formik.errors.correct_option && (
                                        <div className="text-red-500">{formik.errors.correct_option}</div>
                                    )}
                                </div>

                                <div className="w-full">
                                    <label htmlFor="quiz" className="block mb-2 text-sm font-medium text-gray-900">
                                        Point Option
                                    </label>
                                    <select
                                        name="point"
                                        onChange={formik.handleChange}
                                        value={formik.values.point}
                                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                                    >
                                        <option value="">Select point</option>
                                        {pointData.map((item) => (
                                            <option key={item.value} value={item.value}>
                                                {item.label}
                                            </option>
                                        ))}
                                    </select>
                                    {formik.touched.point && formik.errors.point && (
                                        <div className="text-red-500">{formik.errors.point}</div>
                                    )}
                                </div>

                            </div>
                            <div className="flex justify-center mt-4">
                                <button type="submit" className={`inline-flex items-center px-5 py-2.5 mt-4  text-sm font-medium text-center text-white  rounded-lg focus:ring-4  ${formik.isValid ? 'bg-primary-600 hover:bg-primary-700 focus:ring-primary-300' : 'bg-gray-600 hover:bg-gray-700 focus:ring-gray-300'}`}>
                                    {loading ? "Loading..." : "Update Question"}
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

export default UpdateQuestion;