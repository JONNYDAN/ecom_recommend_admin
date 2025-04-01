import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import { getAllFeedbacksData, deleteFeedbackData } from "../../network/feedback_api";
import HeaderWithLink from "../../components/header_with_link";
import Loader from "../../components/loader";
import DeleteModal from "../../components/delete_modal";

const FeedbackList = () => {
  const navigate = useNavigate();
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeRowDropdown, setActiveRowDropdown] = useState(null);
  const [deletingFeedback, setDeletingFeedback] = useState(null);
  const [totalCount, setTotalCount] = useState(0);

  // Ref to store a reference to the dropdown container
  const rowDropdownRef = useRef(null);

  const fetchFeedbacks = async (search = "") => {
    try {
      setLoading(true);
      const response = await getAllFeedbacksData(search);
      console.log(response.data);
      setFeedbacks(response.data || []);
      setTotalCount(response.data?.length || 0);
      setLoading(false);
    } catch (error) {
      console.log(error);
      toast.error("Failed to load feedback data");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedbacks();

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
    // setActiveRowDropdown(null);
  };

  const openFeedbackPreview = (feedback) => {
    navigate(`/admin/show-feedback-details/${feedback._id}`);
  };

  const openEditFeedback = (feedback) => {
    navigate(`/admin/update-feedback/${feedback._id}`);
  };

  const handleDeleteClick = (feedback) => {
    setDeletingFeedback(feedback);
  };

  const handleCloseModal = () => {
    setDeletingFeedback(null);
  };

  const confirmDelete = async () => {
    if (!deletingFeedback) return;

    try {
      setLoading(true);
      await deleteFeedbackData(deletingFeedback._id);
      toast.success("Feedback deleted successfully");
      setDeletingFeedback(null);
      fetchFeedbacks();
    } catch (error) {
      toast.error("Failed to delete feedback");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (searchValue) => {
    fetchFeedbacks(searchValue);
  };

  return (
    <div>
      {/*<!-- Loader -->*/}
      <Loader isShow={loading} />

      {/*<!-- Start block -->*/}
      <section className="bg-gray-50 antialiased mt-10">
        <HeaderWithLink 
          title={"Feedback List"} 
          total={totalCount} 
          linkTo={"/admin/feedback/add"} 
          searchPlcehoder={"Search by customer name"} 
          onSearch={handleSearch} 
        />
        
        {!loading ? (
          <div className="mx-auto max-w-screen-xl px-4">
            <div className="bg-white relative shadow-md rounded-lg">
              <div className="overflow-x-visible">
                <table className="w-full text-sm text-left text-gray-500">
                  <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                    <tr>
                      <th scope="col" className="px-4 py-3">ID</th>
                      <th scope="col" className="px-4 py-3">Image</th>
                      <th scope="col" className="px-4 py-3">Customer Name</th>
                      <th scope="col" className="px-4 py-3">Phone Number</th>
                      <th scope="col" className="px-4 py-3">Feedback</th>
                      <th scope="col" className="px-4 py-3">
                        <span className="sr-only">Actions</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {feedbacks.length > 0 ? (
                      feedbacks.map((feedback, index) => (
                        <tr key={feedback._id} className="border-b relative">
                          <th 
                            type="button" 
                            onClick={() => openFeedbackPreview(feedback)} 
                            className="px-4 py-3 font-medium text-gray-900 whitespace-nowrap max-w-[10rem] truncate hover:text-primary-700"
                          >
                            {feedback._id.substring(0, 8)}...
                          </th>
                          <td className="px-4 py-3 max-w-[10rem] truncate">
                            {feedback.image ? (
                              <img
                                src={feedback.image}
                                alt="Feedback"
                                className="w-16 h-16 object-cover rounded-md"
                              />
                            ) : (
                              <div className="w-16 h-16 bg-gray-200 rounded-md flex items-center justify-center">
                                <span className="text-gray-400">No image</span>
                              </div>
                            )}
                          </td>
                          <td className="px-4 py-3 max-w-[10rem] truncate">{feedback.customerName}</td>
                          <td className="px-4 py-3 max-w-[10rem] truncate">{feedback.phoneNumber}</td>
                          <td className="px-4 py-3 max-w-[15rem] truncate">
                            {feedback.feedback.length > 50 
                              ? `${feedback.feedback.substring(0, 50)}...` 
                              : feedback.feedback}
                          </td>
                          <td className="px-4 py-3 relative">
                            <button 
                              onClick={() => toggleRowDropdown(feedback._id)} 
                              id={`feedback-dropdown-button-${feedback._id}`} 
                              className="inline-flex items-center text-sm font-medium hover:bg-gray-100 text-center text-gray-500 hover:text-gray-800 rounded-lg focus:outline-none" 
                              type="button"
                            >
                              <svg className="w-5 h-5" aria-hidden="true" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z" />
                              </svg>
                            </button>
                            {/* Dropdown */}
                            <div 
                              ref={rowDropdownRef} 
                              id={`feedback-dropdown-${feedback._id}`} 
                              className={`z-10 w-44 bg-white rounded divide-y divide-gray-100 shadow absolute right-0 ${activeRowDropdown === feedback._id ? 'block' : 'hidden'} ${index >= feedbacks.length - 2 ? '-top-28' : 'top-10'}`}
                            >
                              <ul className="py-1 text-sm" aria-labelledby={`feedback-dropdown-button-${feedback._id}`}>
                                <li>
                                  <button 
                                    onClick={() => openEditFeedback(feedback)} 
                                    type="button" 
                                    className="flex w-full items-center py-2 px-4 hover:bg-gray-100 text-gray-700"
                                  >
                                    <svg className="w-4 h-4 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                      <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" />
                                      <path fillRule="evenodd" clipRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
                                    </svg>
                                    Edit
                                  </button>
                                </li>
                                <li>
                                  <button 
                                    onClick={() => openFeedbackPreview(feedback)} 
                                    className="flex w-full items-center py-2 px-4 hover:bg-gray-100 text-gray-700"
                                  >
                                    <svg className="w-4 h-4 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                      <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                                      <path fillRule="evenodd" clipRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" />
                                    </svg>
                                    Preview
                                  </button>
                                </li>
                                <li>
                                  <button 
                                    onClick={() => handleDeleteClick(feedback)} 
                                    type="button" 
                                    className="flex w-full items-center py-2 px-4 hover:bg-gray-100 text-red-500"
                                  >
                                    <svg className="w-4 h-4 mr-2" viewBox="0 0 14 15" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                                      <path fillRule="evenodd" clipRule="evenodd" fill="currentColor" d="M6.09922 0.300781C5.93212 0.30087 5.76835 0.347476 5.62625 0.435378C5.48414 0.523281 5.36931 0.649009 5.29462 0.798481L4.64302 2.10078H1.59922C1.36052 2.10078 1.13161 2.1956 0.962823 2.36439C0.79404 2.53317 0.699219 2.76209 0.699219 3.00078C0.699219 3.23948 0.79404 3.46839 0.962823 3.63718C1.13161 3.80596 1.36052 3.90078 1.59922 3.90078V12.9008C1.59922 13.3782 1.78886 13.836 2.12643 14.1736C2.46399 14.5111 2.92183 14.7008 3.39922 14.7008H10.5992C11.0766 14.7008 11.5344 14.5111 11.872 14.1736C12.2096 13.836 12.3992 13.3782 12.3992 12.9008V3.90078C12.6379 3.90078 12.8668 3.80596 13.0356 3.63718C13.2044 3.46839 13.2992 3.23948 13.2992 3.00078C13.2992 2.76209 13.2044 2.53317 13.0356 2.36439C12.8668 2.1956 12.6379 2.10078 12.3992 2.10078H9.35542L8.70382 0.798481C8.62913 0.649009 8.5143 0.523281 8.37219 0.435378C8.23009 0.347476 8.06631 0.30087 7.89922 0.300781H6.09922ZM4.29922 5.70078C4.29922 5.46209 4.39404 5.23317 4.56282 5.06439C4.73161 4.8956 4.96052 4.80078 5.19922 4.80078C5.43791 4.80078 5.66683 4.8956 5.83561 5.06439C6.0044 5.23317 6.09922 5.46209 6.09922 5.70078V11.1008C6.09922 11.3395 6.0044 11.5684 5.83561 11.7372C5.66683 11.906 5.43791 12.0008 5.19922 12.0008C4.96052 12.0008 4.73161 11.906 4.56282 11.7372C4.39404 11.5684 4.29922 11.3395 4.29922 11.1008V5.70078ZM8.79922 4.80078C8.56052 4.80078 8.33161 4.8956 8.16282 5.06439C7.99404 5.23317 7.89922 5.46209 7.89922 5.70078V11.1008C7.89922 11.3395 7.99404 11.5684 8.16282 11.7372C8.33161 11.906 8.56052 12.0008 8.79922 12.0008C9.03791 12.0008 9.26683 11.906 9.43561 11.7372C9.6044 11.5684 9.69922 11.3395 9.69922 11.1008V5.70078C9.69922 5.46209 9.6044 5.23317 9.43561 5.06439C9.26683 4.8956 9.03791 4.80078 8.79922 4.80078Z" />
                                    </svg>
                                    Delete
                                  </button>
                                </li>
                              </ul>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="6" className="text-center py-10">
                          <div className="flex flex-col items-center justify-center">
                            <svg className="w-12 h-12 text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                            </svg>
                            <p className="text-gray-500 text-lg font-medium">No feedback records found</p>
                            <p className="text-gray-400 mt-1">Create your first feedback record</p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : null}
      </section>
      {/*<!-- End block -->*/}

      {/*<!-- Delete modal -->*/}
      <DeleteModal 
        title={"Are you sure you want to delete this feedback?"} 
        isOpen={deletingFeedback} 
        onCancel={handleCloseModal}
        onConfirm={confirmDelete} 
      />

      {/*<!-- Toast -->*/}
      <ToastContainer />
    </div>
  );
};

export default FeedbackList;
