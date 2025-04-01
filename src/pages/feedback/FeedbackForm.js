import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import {
  createFeedbackData,
  getFeedbackDetailData,
  updateFeedbackData,
} from "../../network/feedback_api";
import Loader from "../../components/loader";

const FeedbackForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = Boolean(id);

  const [formData, setFormData] = useState({
    customerName: "",
    phoneNumber: "",
    image: "",
    feedback: "",
  });
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(false);

  useEffect(() => {
    if (isEditMode) {
      fetchFeedback();
    }
  }, [id]);

  const fetchFeedback = async () => {
    try {
      setFetchLoading(true);
      const response = await getFeedbackDetailData(id);
      if (response.data) {
        setFormData({
          customerName: response.data.customerName || "",
          phoneNumber: response.data.phoneNumber || "",
          image: response.data.image || "",
          feedback: response.data.feedback || "",
        });
      }
      setFetchLoading(false);
    } catch (error) {
      toast.error("Failed to load feedback data");
      setFetchLoading(false);
      navigate("/admin/feedback");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isEditMode) {
        await updateFeedbackData(id, formData);
        toast.success("Feedback updated successfully");
      } else {
        await createFeedbackData(formData);
        toast.success("Feedback created successfully");
      }
      navigate("/admin/feedback");
    } catch (error) {
      toast.error(`Failed to ${isEditMode ? "update" : "create"} feedback`);
    } finally {
      setLoading(false);
    }
  };

  if (isEditMode && fetchLoading) {
    return <Loader isShow={true} />;
  }

  return (
    <div className="bg-gray-50 antialiased mt-10">
      <Loader isShow={loading} />
      
      <section className="mx-auto max-w-screen-xl px-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900">
              {isEditMode ? "Edit Feedback" : "Create New Feedback"}
            </h2>
            <p className="text-gray-500 mt-1">
              {isEditMode ? "Update existing feedback information" : "Add a new customer feedback to the system"}
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate("/admin/feedback")}
            className="text-white bg-gray-600 hover:bg-gray-700 focus:ring-4 focus:ring-gray-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center"
          >
            <svg className="w-4 h-4 mr-2 -ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
            </svg>
            Back to List
          </button>
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Form Details */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit}>
              {/* Customer Information Card */}
              <div className="bg-white shadow-md rounded-lg mb-6">
                <div className="border-b px-6 py-4">
                  <h3 className="text-lg font-semibold text-gray-900">Customer Information</h3>
                  <p className="text-sm text-gray-500">Contact details of the feedback provider</p>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="customerName" className="block mb-2 text-sm font-medium text-gray-900">
                        Customer Name <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                          <svg className="w-5 h-5 text-gray-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"></path>
                          </svg>
                        </div>
                        <input
                          type="text"
                          id="customerName"
                          name="customerName"
                          className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-2.5"
                          placeholder="Enter customer name"
                          value={formData.customerName}
                          onChange={handleChange}
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <label htmlFor="phoneNumber" className="block mb-2 text-sm font-medium text-gray-900">
                        Phone Number <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                          <svg className="w-5 h-5 text-gray-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                            <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"></path>
                          </svg>
                        </div>
                        <input
                          type="text"
                          id="phoneNumber"
                          name="phoneNumber"
                          className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-2.5"
                          placeholder="Enter phone number"
                          value={formData.phoneNumber}
                          onChange={handleChange}
                          required
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Feedback Content Card */}
              <div className="bg-white shadow-md rounded-lg mb-6">
                <div className="border-b px-6 py-4">
                  <h3 className="text-lg font-semibold text-gray-900">Feedback Content</h3>
                  <p className="text-sm text-gray-500">Message from the customer</p>
                </div>
                <div className="p-6">
                  <div>
                    <label htmlFor="feedback" className="block mb-2 text-sm font-medium text-gray-900">
                      Feedback Message <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      id="feedback"
                      name="feedback"
                      rows="6"
                      className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                      placeholder="Enter customer feedback"
                      value={formData.feedback}
                      onChange={handleChange}
                      required
                    ></textarea>
                  </div>
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="bg-white shadow-md rounded-lg mb-6">
                <div className="border-b px-6 py-4">
                  <h3 className="text-lg font-semibold text-gray-900">Actions</h3>
                </div>
                <div className="p-6 flex gap-3 justify-end">
                  <button
                    type="button"
                    onClick={() => navigate("/admin/feedback")}
                    className="text-gray-500 bg-white hover:bg-gray-100 focus:ring-4 focus:outline-none focus:ring-gray-200 rounded-lg border border-gray-200 text-sm font-medium px-5 py-2.5 hover:text-gray-900 focus:z-10"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className={`text-white focus:ring-4 focus:outline-none font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center ${
                      isEditMode 
                        ? "bg-yellow-500 hover:bg-yellow-600 focus:ring-yellow-300" 
                        : "bg-blue-600 hover:bg-blue-700 focus:ring-blue-300"
                    }`}
                  >
                    {loading && (
                      <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    )}
                    {isEditMode 
                      ? loading ? "Updating..." : "Update Feedback" 
                      : loading ? "Saving..." : "Save Feedback"}
                  </button>
                </div>
              </div>
            </form>
          </div>
          
          {/* Right Column - Image */}
          <div className="lg:col-span-1">
            <div className="bg-white shadow-md rounded-lg mb-6">
              <div className="border-b px-6 py-4">
                <h3 className="text-lg font-semibold text-gray-900">Feedback Image</h3>
                <p className="text-sm text-gray-500">{formData.image ? "Preview of uploaded image" : "No image provided yet"}</p>
              </div>
              <div className="p-6">
                <div>
                  <label htmlFor="image" className="block mb-2 text-sm font-medium text-gray-900">
                    Image URL
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <svg className="w-5 h-5 text-gray-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                        <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd"></path>
                      </svg>
                    </div>
                    <input
                      type="text"
                      id="image"
                      name="image"
                      form="feedbackForm"
                      className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-2.5"
                      placeholder="Enter image URL"
                      value={formData.image}
                      onChange={handleChange}
                    />
                  </div>
                </div>
                
                <div className="mt-6">
                  {formData.image ? (
                    <div className="flex flex-col items-center">
                      <img
                        src={formData.image}
                        alt="Preview"
                        className="max-h-60 object-contain border rounded-lg"
                      />
                      <p className="text-sm text-gray-500 mt-2">Image Preview</p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-48 bg-gray-100 rounded-lg border border-dashed border-gray-300">
                      <svg className="w-12 h-12 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                      </svg>
                      <p className="text-sm text-gray-500">No image provided</p>
                      <p className="text-xs text-gray-400 mt-1">Enter a URL in the field above to see a preview</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      <ToastContainer />
    </div>
  );
};

export default FeedbackForm;
