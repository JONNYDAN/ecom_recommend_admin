import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import { getAllOrdersData, deleteOrderData, updateOrderData } from "../../network/order_api";
import HeaderWithLink from "../../components/header_with_link";
import Loader from "../../components/loader";
import DeleteModal from "../../components/delete_modal";

const OrderList = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeRowDropdown, setActiveRowDropdown] = useState(null);
  const [deletingOrder, setDeletingOrder] = useState(null);
  const [totalCount, setTotalCount] = useState(0);
  const [statusFilter, setStatusFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [editingStatus, setEditingStatus] = useState(null);

  // Ref to store a reference to the dropdown container
  const rowDropdownRef = useRef(null);

  const fetchOrders = async (search = "", status = "", page = 1) => {
    try {
      setLoading(true);
      const response = await getAllOrdersData(search, status, page);
      console.log("Orders:", response.data);
      setOrders(response.data || []);
      setTotalCount(response.pagination.total || 0);
      setCurrentPage(response.pagination.page || 1);
      setTotalPages(response.pagination.pages || 1);
    } catch (error) {
      toast.error("Failed to load order data");
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();

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

  const openOrderPreview = (order) => {
    navigate(`/admin/show-order-details/${order._id}`);
  };

  const openEditOrder = (order) => {
    navigate(`/admin/update-order/${order._id}`);
  };

  const handleDeleteClick = (order) => {
    setDeletingOrder(order);
  };

  const handleCloseModal = () => {
    setDeletingOrder(null);
  };

  const confirmDelete = async () => {
    if (!deletingOrder) return;

    try {
      setLoading(true);
      await deleteOrderData(deletingOrder._id);
      toast.success("Order deleted successfully");
      setDeletingOrder(null);
      fetchOrders();
    } catch (error) {
      toast.error("Failed to delete order");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (searchValue) => {
    fetchOrders(searchValue, statusFilter);
  };

  const handleStatusFilterChange = (event) => {
    setStatusFilter(event.target.value);
    fetchOrders("", event.target.value);
  };

  const handlePageChange = (newPage) => {
    fetchOrders("", statusFilter, newPage);
  };

  // Hàm đóng dropdown khi click bên ngoài
  const handleClickOutside = (event) => {
    if (rowDropdownRef.current && !rowDropdownRef.current.contains(event.target)) {
      setEditingStatus(null); // Đóng dropdown
    }
  };

   // Thêm event listener khi component mount
   useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      // Xóa event listener khi component unmount
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleEditStatusClick = (orderId) => {
    setEditingStatus(orderId === editingStatus ? null : orderId);
  };
  
  const handleStatusChange = async (orderId, newStatus) => {
    try {
      setLoading(true);
      await updateOrderData(orderId, { status: newStatus });
      toast.success("Order status updated successfully");
      setEditingStatus(null); // Close the dropdown after updating
      fetchOrders();
    } catch (error) {
      toast.error("Failed to update order status");
      console.error("Error updating order status:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    let bgColor = "bg-gray-100 text-gray-800";
    
    switch (status) {
      case 'pending':
        bgColor = "bg-yellow-100 text-yellow-800";
        break;
      case 'processing':
        bgColor = "bg-blue-100 text-blue-800";
        break;
      case 'shipped':
        bgColor = "bg-indigo-100 text-indigo-800";
        break;
      case 'delivered':
        bgColor = "bg-green-100 text-green-800";
        break;
      case 'cancelled':
        bgColor = "bg-red-100 text-red-800";
        break;
      default:
        break;
    }
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${bgColor}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      setLoading(true);
      await updateOrderData(orderId, { status: newStatus });
      toast.success("Order status updated successfully");
      fetchOrders();
    } catch (error) {
      toast.error("Failed to update order status");
      console.error("Error updating order status:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/*<!-- Loader -->*/}
      <Loader isShow={loading} />

      {/*<!-- Start block -->*/}
      <section className="bg-gray-50 antialiased mt-10">
        <HeaderWithLink 
          title={"Order List"} 
          total={totalCount} 
          linkTo={"/admin/order/add"} 
          searchPlcehoder={"Search by order code or customer"} 
          onSearch={handleSearch} 
        />
        
        <div className="mx-auto max-w-screen-xl px-4">
          {!loading ? (
            <div className="bg-white relative shadow-md rounded-lg">
              <div className="overflow-x-visible">
                <table className="w-full text-sm text-left text-gray-500">
                  <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                    <tr>
                      <th scope="col" className="px-4 py-3">Order Code</th>
                      <th scope="col" className="px-4 py-3">Customer</th>
                      <th scope="col" className="px-4 py-3">Date</th>
                      <th scope="col" className="px-4 py-3">Amount</th>
                      <th scope="col" className="px-4 py-3">
                        <select 
                          value={statusFilter} 
                          onChange={handleStatusFilterChange} 
                          className="border border-gray-300 rounded-md" style={{ padding: "10px 25px 10px 5px"}}
                        >
                          <option value="">All Statuses</option>
                          <option value="pending">Pending</option>
                          <option value="processing">Processing</option>
                          <option value="shipped">Shipped</option>
                          <option value="delivered">Delivered</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </th>
                      <th scope="col" className="px-4 py-3">
                        <span className="sr-only">Actions</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.length > 0 ? (
                      orders.map((order, index) => (
                        <tr key={order._id} className="border-b relative">
                          <th 
                            onClick={() => openOrderPreview(order)} 
                            className="px-4 py-3 font-medium text-gray-900 whitespace-nowrap hover:text-primary-700 cursor-pointer"
                          >
                            {order.code}
                          </th>
                          <td className="px-4 py-3 max-w-[15rem] truncate">
                            {order.customerInfo?.name}
                          </td>
                          <td className="px-4 py-3">
                            {new Date(order.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-3 font-medium">
                            {order.totalAmount.toLocaleString()} đ
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center relative">
                              {getStatusBadge(order.status)}
                              <button
                                onClick={() => setEditingStatus(order._id)}
                                className="ml-2 p-1 hover:bg-gray-100 rounded-full"
                              >
                                <svg
                                  className="w-4 h-4 text-gray-500"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                  xmlns="http://www.w3.org/2000/svg"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                                  />
                                </svg>
                              </button>
                              {editingStatus === order._id && (
                                <div
                                  ref={rowDropdownRef}
                                  className="absolute z-10 bg-white border border-gray-200 rounded-lg shadow-lg"
                                  style={{marginTop: "210px"}}
                                >
                                  {["pending", "processing", "shipped", "delivered", "cancelled"].map(
                                    (status) => (
                                      <div
                                        key={status}
                                        onClick={() => {
                                          updateOrderStatus(order._id, status);
                                          setEditingStatus(null);
                                        }}
                                        className={`p-2 text-sm cursor-pointer hover:bg-gray-50 bg-white text-gray-800`}
                                      >
                                        {status.charAt(0).toUpperCase() + status.slice(1)}
                                      </div>
                                    )
                                  )}
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3 relative">
                            <button 
                              onClick={() => toggleRowDropdown(order._id)} 
                              id={`order-dropdown-button-${order._id}`} 
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
                              id={`order-dropdown-${order._id}`} 
                              className={`z-10 w-44 bg-white rounded divide-y divide-gray-100 shadow absolute right-0 ${activeRowDropdown === order._id ? 'block' : 'hidden'} ${index >= orders.length - 2 ? '-top-28' : 'top-10'}`}
                            >
                              <ul className="py-1 text-sm" aria-labelledby={`order-dropdown-button-${order._id}`}>
                                <li>
                                  <button 
                                    onClick={() => openEditOrder(order)} 
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
                                    onClick={() => openOrderPreview(order)} 
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
                                    onClick={() => handleDeleteClick(order)} 
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
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
                            </svg>
                            <p className="text-gray-500 text-lg font-medium">No orders found</p>
                            <p className="text-gray-400 mt-1">Create your first order</p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
                {/* Pagination */}
                <div className="flex justify-between items-center p-4">
                  <button 
                    onClick={() => handlePageChange(currentPage - 1)} 
                    disabled={currentPage === 1} 
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <span>Page {currentPage} of {totalPages}</span>
                  <button 
                    onClick={() => handlePageChange(currentPage + 1)} 
                    disabled={currentPage === totalPages} 
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </section>
      {/*<!-- End block -->*/}

      {/*<!-- Delete modal -->*/}
      <DeleteModal 
        title={"Are you sure you want to delete this order?"} 
        isOpen={deletingOrder} 
        onCancel={handleCloseModal}
        onConfirm={confirmDelete} 
      />

      {/*<!-- Toast -->*/}
      <ToastContainer />
    </div>
  );
};

export default OrderList;