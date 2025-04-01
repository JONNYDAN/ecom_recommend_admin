import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import { getFeedbackDetailData, deleteFeedbackData } from "../../network/feedback_api";
import Loader from "../../components/loader";
import DeleteModal from "../../components/delete_modal";

const FeedbackDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [feedback, setFeedback] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    fetchFeedback();
  }, [id]);

  const fetchFeedback = async () => {
    try {
      setLoading(true);
      const response = await getFeedbackDetailData(id);
      setFeedback(response.data);
    } catch (error) {
      toast.error("Failed to load feedback details");
      navigate("/admin/feedback");
    } finally {
      setLoading(false);
    }
  };

  const handleEditFeedback = () => {
    navigate(`/admin/update-feedback/${id}`);
  };

  const handleDeleteClick = () => {
    setShowDeleteModal(true);
  };

  const handleCloseModal = () => {
    setShowDeleteModal(false);
  };

  const confirmDelete = async () => {
    try {
      setLoading(true);
      await deleteFeedbackData(id);
      toast.success("Feedback deleted successfully");
      navigate("/admin/feedback");
    } catch (error) {
      toast.error("Failed to delete feedback");
      setLoading(false);
    }
  };

  if (loading || !feedback) {
    return <Loader isShow={true} />;
  }

  return (
    <div className="bg-gray-50 antialiased mt-10">
      <Loader isShow={loading} />
      
      <section className="mx-auto max-w-screen-xl px-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900">Feedback Details</h2>
            <p className="text-gray-500 mt-1">Complete information about this customer feedback</p>
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
          {/* Left Column - Customer Info & Feedback */}
          <div className="lg:col-span-2">
            {/* Customer Information Card */}
            <div className="bg-white shadow-md rounded-lg mb-6">
              <div className="border-b px-6 py-4">
                <h3 className="text-lg font-semibold text-gray-900">Customer Information</h3>
                <p className="text-sm text-gray-500">Details about the feedback submitter</p>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 mt-1">
                      <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"></path>
                      </svg>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">Customer Name</p>
                      <p className="text-lg font-semibold text-gray-900">{feedback.customerName}</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="flex-shrink-0 mt-1">
                      <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                        <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"></path>
                      </svg>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">Phone Number</p>
                      <p className="text-lg font-semibold text-gray-900">{feedback.phoneNumber}</p>
                    </div>
                  </div>
                </div>
                <div className="mt-6 flex items-start">
                  <div className="flex-shrink-0 mt-1">
                    <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                      <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd"></path>
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Feedback ID</p>
                    <p className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">{feedback._id}</p>
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
                <div className="bg-gray-50 p-4 rounded-lg border">
                  <p className="text-gray-800 whitespace-pre-line">{feedback.feedback}</p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="bg-white shadow-md rounded-lg mb-6">
              <div className="border-b px-6 py-4">
                <h3 className="text-lg font-semibold text-gray-900">Actions</h3>
              </div>
              <div className="p-6 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={handleEditFeedback}
                  className="text-white bg-yellow-500 hover:bg-yellow-600 focus:ring-4 focus:ring-yellow-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center"
                >
                  <svg className="w-4 h-4 mr-2 -ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                  </svg>
                  Edit Feedback
                </button>
                <button
                  type="button"
                  onClick={handleDeleteClick}
                  className="text-white bg-red-600 hover:bg-red-700 focus:ring-4 focus:ring-red-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center"
                >
                  <svg className="w-4 h-4 mr-2 -ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                  </svg>
                  Delete Feedback
                </button>
              </div>
            </div>
          </div>
          
          {/* Right Column - Image */}
          <div className="lg:col-span-1">
            <div className="bg-white shadow-md rounded-lg mb-6">
              <div className="border-b px-6 py-4">
                <h3 className="text-lg font-semibold text-gray-900">Feedback Image</h3>
              </div>
              <div className="p-6">
                {feedback.image ? (
                  <div className="flex flex-col items-center">
                    <img
                      src={feedback.image}
                      alt="Feedback"
                      className="max-w-full h-auto max-h-64 object-contain rounded-lg"
                    />
                    <a 
                      href={feedback.image}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-4 text-sm text-blue-600 hover:text-blue-800 inline-flex items-center"
                    >
                      <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                        <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z"></path>
                        <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z"></path>
                      </svg>
                      View Full Image
                    </a>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-48 bg-gray-100 rounded-lg">
                    <svg className="w-12 h-12 text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                    </svg>
                    <p className="text-gray-500 text-center">No image available</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Delete Confirmation Modal */}
      <DeleteModal 
        title="Are you sure you want to delete this feedback?" 
        isOpen={showDeleteModal} 
        onCancel={handleCloseModal}
        onConfirm={confirmDelete}
      />

      <ToastContainer />
    </div>
  );
};

export default FeedbackDetail;
