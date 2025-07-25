import React, { useState, useEffect } from "react";
import { useFormik } from 'formik';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from "react-router-dom";
import { loginData } from "../network/admin_api";
import { KEY_LOGIN_RESULT } from "../utils/constants";


const Login = () => {

    useEffect(() => {
        let loginResult = localStorage.getItem(KEY_LOGIN_RESULT)
        if (loginResult && loginResult !== null && loginResult.token !== null) {
            navigate("/admin");
        }
    }, [])
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const formik = useFormik({
        initialValues: { email: '', password: '' },
        initialErrors: {
            email: 'Email is required',
            password: 'Password is required',
        },
        validate: (values) => {
            const errors = {};
            if (!values.email) {
                errors.email = 'email is required';
            }
            if (!values.password) {
                errors.password = 'Password is required';
            }
            return errors;
        },
        onSubmit: (values, { setSubmitting }) => {
            handleSubmit(values);
            setSubmitting(false);
        },
    });

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const handleSubmit = async (values) => {

        setLoading(true);

        try {
            const response = await loginData(values);
            const loginResult = response.result;
            toast.success(response.message);
            formik.resetForm();
            localStorage.setItem(KEY_LOGIN_RESULT, JSON.stringify(loginResult));
            navigate("/admin");
        } catch (error) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <section className="bg-gray-50">
                <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0">
                    <div className="w-3/4 flex flex-row mx-auto bg-white rounded-lg shadow">
                        <div className="w-1/2 bg-gray-200 flex items-center justify-center">
                            <img src="images/welcome.svg" alt="Login" className="max-w-full max-h-full p-6" />
                        </div>
                        <div className="w-1/2 p-6 space-y-4 md:space-y-6">
                            <h1 className="text-3xl font-bold leading-tight tracking-tight text-blue-600 md:text-2xl text-center mb-10">
                                Admin Login
                            </h1>
                            <h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl">
                                Sign in to your account
                            </h1>
                            <form className="space-y-4 md:space-y-6" onSubmit={formik.handleSubmit}>
                                <div>
                                    <label htmlFor="email" className="block mb-2 text-sm font-medium text-gray-900">
                                        Your email
                                    </label>
                                    <input
                                        type="text"
                                        name="email"
                                        id="email"
                                        onChange={formik.handleChange}
                                        value={formik.values.email}
                                        className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
                                        placeholder="admin@gmail.com"
                                    />
                                    {formik.touched.email && formik.errors.email && (
                                        <div className="text-red-500">{formik.errors.email}</div>
                                    )}
                                </div>
                                <div>
                                    <label htmlFor="password" className="block mb-2 text-sm font-medium text-gray-900">
                                        Password
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            name="password"
                                            id="password"
                                            placeholder="••••••••"
                                            onChange={formik.handleChange}
                                            value={formik.values.password}
                                            className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
                                        />
                                        <span
                                            className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer"
                                            onClick={togglePasswordVisibility}
                                        >
                                            {showPassword ? (
                                                <svg
                                                    className="h-5 w-5 text-gray-400"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                    xmlns="http://www.w3.org/2000/svg"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth="2"
                                                        d="M9 5l7 7-7 7"
                                                    />
                                                </svg>
                                            ) : (
                                                <svg
                                                    className="h-5 w-5 text-gray-400"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                    xmlns="http://www.w3.org/2000/svg"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth="2"
                                                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                                    />
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth="2"
                                                        d="M2 12a10 10 0 1120 0 10 10 0 01-20 0z"
                                                    />
                                                </svg>
                                            )}
                                        </span>
                                    </div>
                                    {formik.touched.password && formik.errors.password && (
                                        <div className="text-red-500">{formik.errors.password}</div>
                                    )}
                                </div>

                                <button
                                    type="submit"
                                    className={`w-full ${formik.isValid ? 'bg-primary-600 hover:bg-primary-700 focus:ring-primary-300' : 'bg-gray-600 hover:bg-gray-700 focus:ring-gray-300'} text-white focus:ring-4 focus:outline-none font-medium rounded-lg text-sm px-5 py-2.5 text-center`}
                                    disabled={loading}
                                >
                                    {loading ? "Loading..." : "Sign in"}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </section>
            <ToastContainer />
        </div>

    );
};

export default Login;
