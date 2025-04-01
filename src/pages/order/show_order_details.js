import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { getOrderDetailData, updateOrderData } from '../../network/order_api';
import Loader from '../../components/loader';

function ShowOrderDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editingStatus, setEditingStatus] = useState(null);
  
  // Ref to store a reference to the dropdown container
  const rowDropdownRef = useRef(null);

  useEffect(() => {
    fetchOrderDetails();
  }, [id]);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      const response = await getOrderDetailData(id);
      setOrder(response.data);
    } catch (error) {
      toast.error('Failed to fetch order details.');
      console.error('Error fetching order details:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrderDetails();

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

  const closeRowDropDown = () => {
    // setActiveRowDropdown(null);
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

  const getOrderStatus = (status) => {
    return status ? status.toUpperCase() : 'UNKNOWN';
  };

  if (!order && !loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-700">Order not found</h2>
          <button 
            onClick={() => navigate('/admin/order')}
            className="mt-4 px-4 py-2 bg-primary-700 text-white rounded-lg hover:bg-primary-800"
          >
            Back to Orders
          </button>
        </div>
      </div>
    );
  }

  const updateOrderStatus = async (orderId, newStatus) => {
      try {
        setLoading(true);
        await updateOrderData(orderId, { status: newStatus });
        toast.success("Order status updated successfully");
        fetchOrderDetails();
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

      {/*<!-- Start block -->*/}
      <section className="bg-gray-50 antialiased mt-10">

        {/*<!-- Loader -->*/}
        <Loader isShow={loading} />

        {!loading && order && (
          <div className="p-4 sm:p-6 md:p-8">
            <div className="mx-auto max-w-screen-xl">
              {/* Header with action buttons */}
              <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    Order: {order.code}
                  </h2>
                  <div className="mt-1 flex items-center">
                    <p className="text-sm text-gray-500 mr-3">
                      {new Date(order.createdAt).toLocaleString()}
                    </p>
                    {getStatusBadge(order.status)}
                  </div>
                </div>
                <div className="mt-4 sm:mt-0 flex gap-3">
                  <button
                    type="button"
                    onClick={() => navigate("/admin/order")}
                    className="inline-flex items-center px-3 py-2 text-sm font-medium text-center text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-100"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-4 h-4 mr-1"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M10 19l-7-7m0 0l7-7m-7 7h18"
                      />
                    </svg>
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate(`/admin/update-order/${order._id}`)}
                    className="inline-flex items-center px-3 py-2 text-sm font-medium text-center text-white bg-primary-700 rounded-lg hover:bg-primary-800"
                  >
                    <svg
                      className="w-4 h-4 mr-1"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" />
                      <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z"
                      />
                    </svg>
                    Edit
                  </button>
                </div>
              </div>

              {/* Order content */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main order info - spans 2 columns on large screens */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Order summary */}
                  <div className="bg-white rounded-lg shadow-md">
                    <div className="px-6 py-4 border-b border-gray-200">
                      <h3 className="text-lg font-semibold text-gray-900">
                        Order Information
                      </h3>
                    </div>
                    <div className="px-6 py-4">
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div>
                          <p className="flex justify-between py-1">
                            <span className="text-gray-500">Order Code:</span>
                            <span className="font-medium text-gray-900">
                              {order.code}
                            </span>
                          </p>
                          <p className="flex justify-between py-1">
                            <span className="text-gray-500">Status:</span>
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
                                  style={{ marginTop: "210px" }}
                                >
                                  {[
                                    "pending",
                                    "processing",
                                    "shipped",
                                    "delivered",
                                    "cancelled",
                                  ].map((status) => (
                                    <div
                                      key={status}
                                      onClick={() => {
                                        updateOrderStatus(order._id, status);
                                        setEditingStatus(null);
                                      }}
                                      className={`p-2 text-sm cursor-pointer hover:bg-gray-50 bg-white text-gray-800`}
                                    >
                                      {status.charAt(0).toUpperCase() +
                                        status.slice(1)}
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </p>
                          <p className="flex justify-between py-1">
                            <span className="text-gray-500">Payment Type:</span>
                            <span className="font-medium text-gray-900">
                              {getOrderStatus(order.paymentType)}
                            </span>
                          </p>
                          <p className="flex justify-between py-1">
                            <span className="text-gray-500">Shipping Type:</span>
                            <span className="font-medium text-gray-900">
                              {getOrderStatus(order.shippingType)}
                            </span>
                          </p>
                        </div>
                        <div>
                          <p className="flex justify-between py-1">
                            <span className="text-gray-500">Subtotal:</span>
                            <span className="font-medium text-gray-900">
                              ${order.amount.toFixed(2)}
                            </span>
                          </p>
                          <p className="flex justify-between py-1">
                            <span className="text-gray-500">Shipping Cost:</span>
                            <span className="font-medium text-gray-900">
                              ${order.shippingCost.toFixed(2)}
                            </span>
                          </p>
                          <p className="flex justify-between py-1">
                            <span className="text-gray-500">Discount:</span>
                            <span className="font-medium text-gray-900">
                              {order.discountType === "percent"
                                ? `${order.discountValue}%`
                                : `$${order.discountValue.toFixed(2)}`}
                              {order.voucherCode && ` (${order.voucherCode})`}
                            </span>
                          </p>
                          <p className="flex justify-between py-1 border-t border-gray-100 mt-1 pt-2">
                            <span className="text-gray-900 font-medium">
                              Total Amount:
                            </span>
                            <span className="font-bold text-gray-900">
                              ${order.totalAmount.toFixed(2)}
                            </span>
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Customer and Shipping Info */}
                  <div className="grid sm:grid-cols-2 gap-6">
                    {/* Customer Information */}
                    <div className="bg-white rounded-lg shadow-md">
                      <div className="px-6 py-4 border-b border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-900">
                          Customer Information
                        </h3>
                      </div>
                      <div className="px-6 py-4 space-y-2">
                        <p className="flex flex-col">
                          <span className="text-sm text-gray-500">Name</span>
                          <span className="font-medium text-gray-900">
                            {order.customerInfo?.name}
                          </span>
                        </p>
                        <p className="flex flex-col">
                          <span className="text-sm text-gray-500">Email</span>
                          <span className="font-medium text-gray-900">
                            {order.customerInfo?.email}
                          </span>
                        </p>
                        <p className="flex flex-col">
                          <span className="text-sm text-gray-500">Phone</span>
                          <span className="font-medium text-gray-900">
                            {order.customerInfo?.phoneNumber}
                          </span>
                        </p>
                        <p className="flex flex-col">
                          <span className="text-sm text-gray-500">Address</span>
                          <span className="font-medium text-gray-900">
                            {order.customerInfo?.address}
                          </span>
                        </p>
                        <p className="flex flex-col">
                          <span className="text-sm text-gray-500">Location</span>
                          <span className="font-medium text-gray-900">
                            {order.customerInfo?.ward},{" "}
                            {order.customerInfo?.district},{" "}
                            {order.customerInfo?.province}
                          </span>
                        </p>
                      </div>
                    </div>

                    {/* Shipping Information */}
                    <div className="bg-white rounded-lg shadow-md">
                      <div className="px-6 py-4 border-b border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-900">
                          Shipping Information
                        </h3>
                      </div>
                      <div className="px-6 py-4 space-y-2">
                        <p className="flex flex-col">
                          <span className="text-sm text-gray-500">Name</span>
                          <span className="font-medium text-gray-900">
                            {order.shippingInfo?.name}
                          </span>
                        </p>
                        <p className="flex flex-col">
                          <span className="text-sm text-gray-500">Phone</span>
                          <span className="font-medium text-gray-900">
                            {order.shippingInfo?.phoneNumber}
                          </span>
                        </p>
                        <p className="flex flex-col">
                          <span className="text-sm text-gray-500">Address</span>
                          <span className="font-medium text-gray-900">
                            {order.shippingInfo?.address}
                          </span>
                        </p>
                        <p className="flex flex-col">
                          <span className="text-sm text-gray-500">Location</span>
                          <span className="font-medium text-gray-900">
                            {order.shippingInfo?.ward},{" "}
                            {order.shippingInfo?.district},{" "}
                            {order.shippingInfo?.province}
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Side information */}
                <div className="space-y-6">
                  {/* Order Timeline */}
                  <div className="bg-white rounded-lg shadow-md">
                    <div className="px-6 py-4 border-b border-gray-200">
                      <h3 className="text-lg font-semibold text-gray-900">
                        Order Timeline
                      </h3>
                    </div>
                    <div className="px-6 py-4 space-y-3">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            Created
                          </p>
                          <p className="text-sm text-gray-500">
                            {new Date(order.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <p className="text-sm text-gray-500">
                          {new Date(order.createdAt).toLocaleTimeString()}
                        </p>
                      </div>
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            Last Updated
                          </p>
                          <p className="text-sm text-gray-500">
                            {new Date(order.updatedAt).toLocaleDateString()}
                          </p>
                        </div>
                        <p className="text-sm text-gray-500">
                          {new Date(order.updatedAt).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="bg-white rounded-lg shadow-md">
                    <div className="px-6 py-4 border-b border-gray-200">
                      <h3 className="text-lg font-semibold text-gray-900">Order Items</h3>
                    </div>
                    {order.orderItems.map((orderItem, index) => (
                      <div key={index} className="px-6 py-4 space-y-3 border-b border-gray-200">
                        {/* Product Details */}
                        <div className="flex justify-between items-center">
                          <div className="flex items-center space-x-3">
                            {/* Product Image */}
                            <img
                              src={orderItem.productDetails.images[0]} // Lấy hình ảnh đầu tiên
                              alt={orderItem.productDetails.title}
                              className="w-10 h-10 object-cover rounded" // Kích thước 30-50px (w-10 ~ 40px)
                            />
                            {/* Product Name */}
                            <div>
                              <p className="text-sm font-medium text-gray-900">
                                {orderItem.productDetails.title}
                              </p>
                              <p className="text-sm text-gray-500">
                                Code: {orderItem.productDetails.code}
                              </p>
                            </div>
                          </div>
                          <p className="text-sm text-gray-500">
                            {new Date(order.createdAt).toLocaleTimeString()}
                          </p>
                        </div>

                        {/* Quantity and Price */}
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="text-sm font-medium text-gray-900">Quantity</p>
                            <p className="text-sm text-gray-500">{orderItem.quantity}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">Price</p>
                            <p className="text-sm text-gray-500">
                              {orderItem.price.toLocaleString('en-US', {
                                style: 'currency',
                                currency: 'USD',
                              })}
                            </p>
                          </div>
                        </div>

                        {/* Total */}
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="text-sm font-medium text-gray-900">Total</p>
                            <p className="text-sm text-gray-500">
                              {(orderItem.quantity * orderItem.price).toLocaleString('en-US', {
                                style: 'currency',
                                currency: 'USD',
                              })}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Notes Section */}
                  <div className="bg-white rounded-lg shadow-md">
                    <div className="px-6 py-4 border-b border-gray-200">
                      <h3 className="text-lg font-semibold text-gray-900">
                        Notes
                      </h3>
                    </div>
                    <div className="px-6 py-4">
                      {order.note ? (
                        <p className="text-gray-700">{order.note}</p>
                      ) : (
                        <p className="text-gray-500 italic">
                          No notes for this order.
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </section>

      {/*<!-- Toast -->*/}
      <ToastContainer />
    </div>
  );
}

export default ShowOrderDetails;