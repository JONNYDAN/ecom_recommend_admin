import React, { useState, useEffect } from "react";
import { useFormik } from 'formik';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Link, useParams } from "react-router-dom";
import { getUserDetailData, updateUserDetailData } from "../../network/user_api";
import Loader from "../../components/loader";

const UpdateUserDetails = () => {
    const { id } = useParams();
    const [loading, setLoading] = useState(false);
    const [userResult, setUserResult] = useState({});

    useEffect(() => {
        getUserDetail();
    }, []);


    const formik = useFormik({
        initialValues: {
            name: userResult.name || '',
            email: userResult.email || '',
            email_verified_status: userResult.isEmailVerified ? 'Verified' : 'Not Verified',
            user_blocked_status: userResult.isBlocked ? 'Blocked' : 'Not Blocked',
        },
        enableReinitialize: true,
        validateOnMount: true,
        initialErrors: {
            name: 'Name is required',
            email: 'Email is required',
            mobile: 'Mobile number is required',
        },
        validate: (values) => {
            const errors = {};
            if (!values.name) {
                errors.name = 'name is required';
            }
            if (!values.email) {
                errors.email = 'Email is required';
            } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(values.email)) {
                errors.email = 'Invalid email address';
            }
            return errors;
        },
        onSubmit: (values, { setSubmitting }) => {
            const modifiedValues = {
                name: values.name,
                email: values.email,
                isMobileNumberVerified: values.mobile_number_verified_status === "Verified",
                isEmailVerified: values.email_verified_status === "Verified",
                isBlocked: values.user_blocked_status === "Blocked",
            };
            handleSubmit(modifiedValues);
            setSubmitting(false);
        },
    });

    const getUserDetail = async () => {

        setLoading(true);

        try {

            const response = await getUserDetailData(id);
            setUserResult(response.user); // Set the userResult state with the data
            toast.success("User Detail Fetched successfully");
        } catch (error) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };


    const handleSubmit = async (values) => {

        setLoading(true);

        try {
            const response = await updateUserDetailData(id, values);
            toast.success(response.message);
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
                        <h2 className="mb-4 text-xl font-bold text-gray-900">Update User Details</h2>
                        <form className="mt-10" onSubmit={formik.handleSubmit}>
                            <div className="grid gap-4 grid-cols-2 ">
                                
                                <div className="w-full">
                                    <label htmlFor="name" className="block mb-2 text-sm font-medium text-gray-900">Last Name</label>
                                    <input type="text" name="name" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5" placeholder="Last name" onChange={formik.handleChange}
                                        value={formik.values.name} />
                                    {formik.touched.name && formik.errors.name && (
                                        <div className="text-red-500">{formik.errors.name}</div>
                                    )}
                                </div>

                                <div className="w-full">
                                    <label htmlFor="email" className="block mb-2 text-sm font-medium text-gray-900">Email</label>
                                    <input type="text" name="email" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5" placeholder="Email" onChange={formik.handleChange}
                                        value={formik.values.email} />
                                    {formik.touched.email && formik.errors.email && (
                                        <div className="text-red-500">{formik.errors.email}</div>
                                    )}
                                </div>
                                
                            </div>

                            <div className="grid gap-4 grid-cols-2 mt-4">

                                <div className="w-full">
                                    <label htmlFor="email_verified_status" className="block mb-4 text-sm font-medium text-gray-900">Email Verified</label>

                                    <div class="flex">

                                        <div class="flex items-center mr-4">
                                            <input id="email_verified_status_option_1" type="radio" name="email_verified_status" value="Verified" class="w-5 h-5 border-gray-300 focus:ring-2 focus:ring-blue-300" checked={formik.values['email_verified_status'] === 'Verified'}
                                                onChange={formik.handleChange} />
                                            <label for="email_verified_status_option_1" class="block ml-2 text-sm font-medium text-gray-900">
                                                Verified
                                            </label>
                                        </div>

                                        <div class="flex items-center mr-4">
                                            <input id="email_verified_status_option_2" type="radio" name="email_verified_status" value="Not Verified" class="w-5 h-5 border-gray-300 focus:ring-2 focus:ring-blue-300" checked={formik.values['email_verified_status'] === 'Not Verified'}
                                                onChange={formik.handleChange} />
                                            <label for="email_verified_status_option_2" class="block ml-2 text-sm font-medium text-gray-900">
                                                Not Verified
                                            </label>
                                        </div>

                                    </div>

                                </div>

                                <div className="w-full">
                                    <label htmlFor="user_blocked_status" className="block mb-4 text-sm font-medium text-gray-900">User Blocked</label>

                                    <div class="flex">

                                        <div class="flex items-center mr-4">
                                            <input id="user_blocked_status_option_1" type="radio" name="user_blocked_status" value="Blocked" class="w-5 h-5 border-gray-300 focus:ring-2 focus:ring-blue-300" checked={formik.values['user_blocked_status'] === 'Blocked'}
                                                onChange={formik.handleChange} />
                                            <label for="user_blocked_status_option_1" class="block ml-2 text-sm font-medium text-gray-900">
                                                Blocked
                                            </label>
                                        </div>

                                        <div class="flex items-center mr-4">
                                            <input id="user_blocked_status_option_2" type="radio" name="user_blocked_status" value="Not Blocked" class="w-5 h-5 border-gray-300 focus:ring-2 focus:ring-blue-300" checked={formik.values['user_blocked_status'] === 'Not Blocked'}
                                                onChange={formik.handleChange} />
                                            <label for="user_blocked_status_option_2" class="block ml-2 text-sm font-medium text-gray-900">
                                                Not Blocked
                                            </label>
                                        </div>

                                    </div>

                                </div>
                            </div>

                            <div className="flex justify-center mt-4">
                                <button type="submit" className={`inline-flex items-center px-5 py-2.5 mt-4  text-sm font-medium text-center text-white  rounded-lg focus:ring-4  ${formik.isValid ? 'bg-primary-600 hover:bg-primary-700 focus:ring-primary-300' : 'bg-gray-600 hover:bg-gray-700 focus:ring-gray-300'}`}>
                                    {loading ? "Loading..." : "Update"}
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

export default UpdateUserDetails;