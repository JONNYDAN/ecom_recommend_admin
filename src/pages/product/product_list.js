import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getAllProductsData, deleteProductData } from "../../network/product_api";
import Loader from "../../components/loader";
import HeaderWithLink from "../../components/header_with_link";

const ProductList = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async (query = "", page = 1) => {
    setLoading(true);
    try {
      const response = await getAllProductsData(query, page);
      // Update these lines to match the API response structure
      setProducts(response.data || []);
      setTotalCount(response.count || 0);
      setCurrentPage(response.pagination?.page || 1);
      setTotalPages(response.pagination?.pages || 1);
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
  const handlePageChange = (newPage) => {
    fetchProducts(searchQuery, newPage);
  };

  return (
    <div>
      {/*<!-- Loader -->*/}
      <Loader isShow={loading} />

      {/*<!-- Start block -->*/}
      <section className="bg-gray-50 antialiased mt-10">
        <HeaderWithLink
          title={"Products List"}
          total={totalCount}
          linkTo={"/admin/add-product"}
          searchPlcehoder={"Search by product code or customer"}
          onSearch={handleSearch}
        />

        {/* <div className="mx-auto max-w-screen-xl px-4">
          {!loading ? ( */}
        <div className="mx-auto max-w-screen-xl px-4 py-8">
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : error ? (
              <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-4 mt-4">
                {error}
              </div>
            ) : (
              <div className="bg-white relative shadow-md rounded-lg">
                <div className="overflow-x-visible">
                  <table className="w-full text-sm text-left text-gray-500">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                      <tr>
                        <th scope="col" className="py-3 px-6">
                          Product
                        </th>
                        <th scope="col" className="py-3 px-6">
                          Code
                        </th>
                        <th scope="col" className="py-3 px-6">
                          Original Price
                        </th>
                        <th scope="col" className="py-3 px-6">
                          Sale Price
                        </th>
                        <th scope="col" className="py-3 px-6">
                          Actions
                        </th>
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
                          <tr
                            key={product._id}
                            className="bg-white border-b hover:bg-gray-50"
                          >
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
                                    <span className="text-xs text-gray-500">
                                      No image
                                    </span>
                                  </div>
                                )}
                                <div>
                                  <div className="font-medium text-gray-900">
                                    {product.title}
                                  </div>
                                  <div className="text-xs">{product.slug}</div>
                                </div>
                              </div>
                            </td>
                            <td className="py-4 px-6">{product.code}</td>
                            <td className="py-4 px-6">
                              {product.originalPrice?.toLocaleString() || "0"} đ
                            </td>
                            <td className="py-4 px-6">
                              {product.salePrice?.toLocaleString() || "0"} đ
                            </td>
                            <td className="py-4 px-6">
                              <div className="flex space-x-2">
                                <button
                                  onClick={() =>
                                    navigate(
                                      `/admin/show-product-details/${product._id}`
                                    )
                                  }
                                  className="font-medium text-blue-600 hover:underline"
                                >
                                  View
                                </button>
                                <button
                                  onClick={() =>
                                    navigate(
                                      `/admin/update-product-details/${product._id}`
                                    )
                                  }
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
            )}
        </div>
      </section>
    </div>
  );
};

export default ProductList;
