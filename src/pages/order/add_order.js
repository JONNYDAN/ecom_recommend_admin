import React, { useState } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';
import { createOrderData } from '../../network/order_api';
import Loader from "../../components/loader";

function AddOrder() {
  const navigate = useNavigate();
  const [validated, setValidated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState({
    code: '',
    customerInfo: {
      email: '',
      name: '',
      phoneNumber: '',
      address: '',
      province: '',
      district: '',
      ward: '',
    },
    shippingInfo: {
      name: '',
      phoneNumber: '',
      address: '',
      province: '',
      district: '',
      ward: '',
    },
    note: '',
    amount: 0,
    voucherCode: '',
    discountType: 'percent',
    discountValue: 0,
    finalAmount: 0,
    shippingType: 'cod',
    shippingCost: 0,
    paymentType: 'cod',
    status: 'pending',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setOrder({
        ...order,
        [parent]: {
          ...order[parent],
          [child]: value,
        },
      });
    } else {
      setOrder({
        ...order,
        [name]: value,
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    
    if (form.checkValidity() === false) {
      e.stopPropagation();
      setValidated(true);
      return;
    }

    try {
      setLoading(true);
      await createOrderData(order);
      toast.success('Order created successfully!');
      navigate('/admin/order');
    } catch (error) {
      toast.error('Failed to create order.');
      console.error('Error creating order:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/*<!-- Loader -->*/}
      <Loader isShow={loading} />
      
      <section className="bg-gray-50 antialiased p-4 sm:p-6 md:p-8">
        <div className="mx-auto max-w-screen-xl">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Add New Order</h2>
            <button
              type="button"
              onClick={() => navigate("/admin/order")}
              className="inline-flex items-center px-3 py-2 text-sm font-medium text-center text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-100"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Orders
            </button>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <form onSubmit={handleSubmit} noValidate className={validated ? "needs-validation was-validated" : "needs-validation"}>
              
              {/* Basic Order Info */}
              <div className="mb-6">
                <label htmlFor="code" className="block mb-2 text-sm font-medium text-gray-900">Order Code*</label>
                <input
                  type="text"
                  id="code"
                  name="code"
                  value={order.code}
                  onChange={handleChange}
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
                  placeholder="Enter order code"
                  required
                />
              </div>

              {/* Customer Information */}
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Customer Information</h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="customerName" className="block mb-2 text-sm font-medium text-gray-900">Name*</label>
                    <input
                      type="text"
                      id="customerName"
                      name="customerInfo.name"
                      value={order.customerInfo.name}
                      onChange={handleChange}
                      className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
                      placeholder="Customer name"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="customerEmail" className="block mb-2 text-sm font-medium text-gray-900">Email*</label>
                    <input
                      type="email"
                      id="customerEmail"
                      name="customerInfo.email"
                      value={order.customerInfo.email}
                      onChange={handleChange}
                      className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
                      placeholder="Customer email"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="customerPhone" className="block mb-2 text-sm font-medium text-gray-900">Phone Number*</label>
                    <input
                      type="text"
                      id="customerPhone"
                      name="customerInfo.phoneNumber"
                      value={order.customerInfo.phoneNumber}
                      onChange={handleChange}
                      className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
                      placeholder="Customer phone"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="customerAddress" className="block mb-2 text-sm font-medium text-gray-900">Address*</label>
                    <input
                      type="text"
                      id="customerAddress"
                      name="customerInfo.address"
                      value={order.customerInfo.address}
                      onChange={handleChange}
                      className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
                      placeholder="Customer address"
                      required
                    />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-3 mt-4">
                  <div>
                    <label htmlFor="customerProvince" className="block mb-2 text-sm font-medium text-gray-900">Province*</label>
                    <input
                      type="text"
                      id="customerProvince"
                      name="customerInfo.province"
                      value={order.customerInfo.province}
                      onChange={handleChange}
                      className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="customerDistrict" className="block mb-2 text-sm font-medium text-gray-900">District*</label>
                    <input
                      type="text"
                      id="customerDistrict"
                      name="customerInfo.district"
                      value={order.customerInfo.district}
                      onChange={handleChange}
                      className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="customerWard" className="block mb-2 text-sm font-medium text-gray-900">Ward*</label>
                    <input
                      type="text"
                      id="customerWard"
                      name="customerInfo.ward"
                      value={order.customerInfo.ward}
                      onChange={handleChange}
                      className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Shipping Information */}
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Shipping Information</h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="shippingName" className="block mb-2 text-sm font-medium text-gray-900">Name*</label>
                    <input
                      type="text"
                      id="shippingName"
                      name="shippingInfo.name"
                      value={order.shippingInfo.name}
                      onChange={handleChange}
                      className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
                      placeholder="Shipping name"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="shippingPhone" className="block mb-2 text-sm font-medium text-gray-900">Phone Number*</label>
                    <input
                      type="text"
                      id="shippingPhone"
                      name="shippingInfo.phoneNumber"
                      value={order.shippingInfo.phoneNumber}
                      onChange={handleChange}
                      className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
                      placeholder="Shipping phone"
                      required
                    />
                  </div>
                </div>

                <div className="mt-4">
                  <label htmlFor="shippingAddress" className="block mb-2 text-sm font-medium text-gray-900">Address*</label>
                  <input
                    type="text"
                    id="shippingAddress"
                    name="shippingInfo.address"
                    value={order.shippingInfo.address}
                    onChange={handleChange}
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
                    placeholder="Shipping address"
                    required
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-3 mt-4">
                  <div>
                    <label htmlFor="shippingProvince" className="block mb-2 text-sm font-medium text-gray-900">Province*</label>
                    <input
                      type="text"
                      id="shippingProvince"
                      name="shippingInfo.province"
                      value={order.shippingInfo.province}
                      onChange={handleChange}
                      className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="shippingDistrict" className="block mb-2 text-sm font-medium text-gray-900">District*</label>
                    <input
                      type="text"
                      id="shippingDistrict"
                      name="shippingInfo.district"
                      value={order.shippingInfo.district}
                      onChange={handleChange}
                      className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="shippingWard" className="block mb-2 text-sm font-medium text-gray-900">Ward*</label>
                    <input
                      type="text"
                      id="shippingWard"
                      name="shippingInfo.ward"
                      value={order.shippingInfo.ward}
                      onChange={handleChange}
                      className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Payment Details */}
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Payment Details</h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="amount" className="block mb-2 text-sm font-medium text-gray-900">Amount*</label>
                    <input
                      type="number"
                      id="amount"
                      name="amount"
                      value={order.amount}
                      onChange={handleChange}
                      className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="finalAmount" className="block mb-2 text-sm font-medium text-gray-900">Final Amount*</label>
                    <input
                      type="number"
                      id="finalAmount"
                      name="finalAmount"
                      value={order.finalAmount}
                      onChange={handleChange}
                      className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-3 mt-4">
                  <div>
                    <label htmlFor="voucherCode" className="block mb-2 text-sm font-medium text-gray-900">Voucher Code</label>
                    <input
                      type="text"
                      id="voucherCode"
                      name="voucherCode"
                      value={order.voucherCode}
                      onChange={handleChange}
                      className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
                    />
                  </div>
                  <div>
                    <label htmlFor="discountType" className="block mb-2 text-sm font-medium text-gray-900">Discount Type</label>
                    <select
                      id="discountType"
                      name="discountType"
                      value={order.discountType}
                      onChange={handleChange}
                      className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
                    >
                      <option value="percent">Percent</option>
                      <option value="fixed">Fixed Amount</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="discountValue" className="block mb-2 text-sm font-medium text-gray-900">Discount Value</label>
                    <input
                      type="number"
                      id="discountValue"
                      name="discountValue"
                      value={order.discountValue}
                      onChange={handleChange}
                      className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
                      min="0"
                      step="0.01"
                    />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-3 mt-4">
                  <div>
                    <label htmlFor="shippingType" className="block mb-2 text-sm font-medium text-gray-900">Shipping Type</label>
                    <select
                      id="shippingType"
                      name="shippingType"
                      value={order.shippingType}
                      onChange={handleChange}
                      className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
                    >
                      <option value="cod">COD</option>
                      <option value="standard">Standard</option>
                      <option value="express">Express</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="shippingCost" className="block mb-2 text-sm font-medium text-gray-900">Shipping Cost*</label>
                    <input
                      type="number"
                      id="shippingCost"
                      name="shippingCost"
                      value={order.shippingCost}
                      onChange={handleChange}
                      className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="paymentType" className="block mb-2 text-sm font-medium text-gray-900">Payment Type</label>
                    <select
                      id="paymentType"
                      name="paymentType"
                      value={order.paymentType}
                      onChange={handleChange}
                      className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
                    >
                      <option value="cod">COD</option>
                      <option value="credit_card">Credit Card</option>
                      <option value="bank_transfer">Bank Transfer</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Order Status and Note */}
              <div className="mb-6">
                <div className="mb-4">
                  <label htmlFor="status" className="block mb-2 text-sm font-medium text-gray-900">Status</label>
                  <select
                    id="status"
                    name="status"
                    value={order.status}
                    onChange={handleChange}
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
                  >
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="note" className="block mb-2 text-sm font-medium text-gray-900">Note</label>
                  <textarea
                    id="note"
                    name="note"
                    value={order.note}
                    onChange={handleChange}
                    rows="3"
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
                  ></textarea>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex items-center justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => navigate('/admin/order')}
                  className="text-gray-900 bg-white border border-gray-200 hover:bg-gray-100 hover:text-primary-700 focus:ring-4 focus:ring-gray-200 font-medium rounded-lg text-sm px-5 py-2.5 text-center"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="text-white bg-primary-700 hover:bg-primary-800 focus:ring-4 focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center"
                >
                  {loading ? 'Saving...' : 'Save Order'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>

      <ToastContainer />
    </div>
  );
}

export default AddOrder;