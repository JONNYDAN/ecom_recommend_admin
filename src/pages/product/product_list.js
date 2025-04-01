import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getAllProductsData, deleteProductData } from "../../network/product_api";
import Loader from "../../components/loader";

const ProductList = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async (query = "") => {
    setLoading(true);
    try {
      const response = await getAllProductsData(query);
      setProducts(response.data || []);
      setError(null);
    } catch (err) {
      console.error("Error fetching products:", err);
      setError("Failed to load products. Please try again.");
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchProducts(searchQuery);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        await deleteProductData(id);
        fetchProducts(searchQuery); // Refresh the list
      } catch (err) {
        console.error("Error deleting product:", err);
        alert("Failed to delete the product. Please try again.");
      }
    }
  };

  return (
    <div>
      {/*<!-- Loader -->*/}
      <Loader isShow={loading} />

      {/*<!-- Start block -->*/}
      <section className="bg-gray-50 antialiased mt-10">
        <div className="p-4 bg-white block sm:flex items-center justify-between border-b border-gray-200 lg:mt-1.5">
          <div className="mb-1 w-full">
            <div className="mb-4">
              <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">All Products</h1>
            </div>
            <div className="sm:flex align-items-center">
              <div className="flex items-center sm:mb-0">
                <form className="sm:pr-3" onSubmit={handleSearch}>
                  <label htmlFor="products-search" className="sr-only">Search</label>
                  <div className="relative w-48 sm:w-64 xl:w-96">
                    <input
                      type="text"
                      id="products-search"
                      className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                      placeholder="Search for products"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <button
                      type="submit"
                      className="absolute inset-y-0 right-0 flex items-center pr-3"
                    >
                      <svg
                        className="w-5 h-5 text-gray-500"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          fillRule="evenodd"
                          d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                          clipRule="evenodd"
                        ></path>
                      </svg>
                    </button>
                  </div>
                </form>
              </div>
              <div className="flex items-center ml-auto space-x-2 sm:space-x-3">
                <button
                  type="button"
                  onClick={() => navigate("/admin/add-product")}
                  className="inline-flex items-center py-2.5 px-5 text-sm font-medium text-white bg-blue-700 rounded-lg hover:bg-blue-800 focus:ring-4 focus:ring-blue-300"
                >
                  <svg
                    className="w-5 h-5 mr-2 -ml-1"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                      clipRule="evenodd"
                    ></path>
                  </svg>
                  Add Product
                </button>
              </div>
            </div>

            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : error ? (
              <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-4 mt-4">
                {error}
              </div>
            ) : (
              <div className="overflow-x-auto mt-6">
                <table className="w-full text-sm text-left text-gray-500">
                  <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                    <tr>
                      <th scope="col" className="py-3 px-6">Product</th>
                      <th scope="col" className="py-3 px-6">Code</th>
                      <th scope="col" className="py-3 px-6">Original Price</th>
                      <th scope="col" className="py-3 px-6">Sale Price</th>
                      <th scope="col" className="py-3 px-6">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="py-4 px-6 text-center">
                          No products found.
                        </td>
                      </tr>
                    ) : (
                      products.map((product) => (
                        <tr key={product._id} className="bg-white border-b hover:bg-gray-50">
                          <td className="py-4 px-6">
                            <div className="flex items-center">
                              {product.images && product.images[0] ? (
                                <img 
                                  src={product.images[0]} 
                                  className="w-10 h-10 object-cover rounded mr-3" 
                                  alt={product.title} 
                                />
                              ) : (
                                <div className="w-10 h-10 bg-gray-200 rounded mr-3 flex items-center justify-center">
                                  <span className="text-xs text-gray-500">No image</span>
                                </div>
                              )}
                              <div>
                                <div className="font-medium text-gray-900">{product.title}</div>
                                <div className="text-xs">{product.slug}</div>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-6">{product.code}</td>
                          <td className="py-4 px-6">${product.originalPrice?.toFixed(2) || '0.00'}</td>
                          <td className="py-4 px-6">${product.salePrice?.toFixed(2) || '0.00'}</td>
                          <td className="py-4 px-6">
                            <div className="flex space-x-2">
                              <button
                                onClick={() => navigate(`/admin/show-product-details/${product._id}`)}
                                className="font-medium text-blue-600 hover:underline"
                              >
                                View
                              </button>
                              <button
                                onClick={() => navigate(`/admin/update-product-details/${product._id}`)}
                                className="font-medium text-green-600 hover:underline"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDelete(product._id)}
                                className="font-medium text-red-600 hover:underline"
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default ProductList;
