import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getCategoryDetailData, updateCategoryData, createChildCategoryData } from "../../network/category_api";

const UpdateCategoryDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    icon: "",
    status: "active"
  });
  const [errors, setErrors] = useState({});
  const [initialLoading, setInitialLoading] = useState(true);
  const [childCategories, setChildCategories] = useState([]);
  const [addingChild, setAddingChild] = useState(false);
  const [childFormData, setChildFormData] = useState({
    name: "",
    description: "",
    icon: "",
    status: "active"
  });
  const [childErrors, setChildErrors] = useState({});

  useEffect(() => {
    const fetchCategoryDetails = async () => {
      try {
        const response = await getCategoryDetailData(id);
        setFormData({
          name: response.data.name || "Sample Category",
          description: response.data.description || "This is a sample category description for demonstration purposes.",
          icon: response.data.icon || "https://via.placeholder.com/150",
          status: response.data.status || "active",
        });
        
        // If category has children, set them
        if (response.data.children) {
          setChildCategories(response.data.children);
        }
        
        setInitialLoading(false);
      } catch (error) {
        console.error("Error fetching category details:", error);
        setErrors({ fetch: "Failed to fetch category details. Please try again." });
        setInitialLoading(false);
      }
    };

    fetchCategoryDetails();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleChildChange = (e) => {
    const { name, value } = e.target;
    setChildFormData({
      ...childFormData,
      [name]: value,
    });
  };

  const validateForm = () => {
    let valid = true;
    let errors = {};

    if (!formData.name.trim()) {
      errors.name = "Category name is required";
      valid = false;
    }

    setErrors(errors);
    return valid;
  };

  const validateChildForm = () => {
    let valid = true;
    let errors = {};

    if (!childFormData.name.trim()) {
      errors.name = "Child category name is required";
      valid = false;
    }

    setChildErrors(errors);
    return valid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      await updateCategoryData(id, formData);
      
      // Navigate to category details
      navigate(`/admin/show-category-details/${id}`);
    } catch (error) {
      console.error("Error updating category:", error);
      setErrors({ submit: "Failed to update category. Please try again." });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddChildCategory = () => {
    setAddingChild(true);
  };

  const handleCancelChildCategory = () => {
    setAddingChild(false);
    setChildFormData({
      name: "",
      description: "",
      icon: "",
      status: "active"
    });
    setChildErrors({});
  };

  const handleSubmitChildCategory = async (e) => {
    e.preventDefault();
    if (!validateChildForm()) return;

    try {
      // Create child category with parentId set to current category
      const childData = {
        ...childFormData,
        parentId: id
      };
      
      await createChildCategoryData(childData);
      
      // Reset form and update state
      setChildCategories([...childCategories, childData]);
      setAddingChild(false);
      setChildFormData({
        name: "",
        description: "",
        icon: "",
        status: "active"
      });
      
    } catch (error) {
      console.error("Error creating child category:", error);
      setChildErrors({ submit: "Failed to create child category. Please try again." });
    }
  };

  if (initialLoading) {
    return (
      <div className="p-4 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-4 bg-white block sm:flex items-center justify-between border-b border-gray-200 lg:mt-1.5">
      <div className="w-full">
        <div className="mb-4">
          <nav className="flex mb-5" aria-label="Breadcrumb">
            {/* ...existing code... */}
          </nav>
          <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">
            Update Category
          </h1>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 mb-4 sm:grid-cols-2">
            {/* ...existing code... */}
          </div>
          {errors.submit && (
            <p className="mt-2 text-sm text-red-600">{errors.submit}</p>
          )}
          <button
            type="submit"
            className="text-white bg-primary-600 hover:bg-primary-700 focus:ring-4 focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center"
            disabled={isLoading}
          >
            {isLoading ? "Updating..." : "Update Category"}
          </button>
        </form>

        {/* Child Categories Section */}
        <div className="mt-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Child Categories</h2>
          
          {/* List existing child categories */}
          {childCategories.length > 0 && (
            <div className="mb-6">
              <h3 className="text-md font-medium text-gray-700 mb-2">Existing Child Categories</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                {childCategories.map((child, index) => (
                  <div key={index} className="p-3 border rounded bg-gray-50">
                    <p className="font-medium">{child.name}</p>
                    <p className="text-sm text-gray-600">{child.description}</p>
                    <p className="text-xs text-gray-500 mt-1">Status: {child.status}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Add child category form */}
          {addingChild ? (
            <div className="border rounded-lg p-4 bg-gray-50 mb-4">
              <h3 className="text-md font-medium text-gray-700 mb-3">Add New Child Category</h3>
              <form onSubmit={handleSubmitChildCategory}>
                <div className="grid gap-4 mb-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="child-name" className="block mb-2 text-sm font-medium text-gray-900">
                      Child Category Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      id="child-name"
                      value={childFormData.name}
                      onChange={handleChildChange}
                      className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
                      placeholder="Child Category Name"
                    />
                    {childErrors.name && (
                      <p className="mt-1 text-sm text-red-600">{childErrors.name}</p>
                    )}
                  </div>
                  <div>
                    <label htmlFor="child-description" className="block mb-2 text-sm font-medium text-gray-900">
                      Description
                    </label>
                    <textarea
                      name="description"
                      id="child-description"
                      value={childFormData.description}
                      onChange={handleChildChange}
                      className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
                      placeholder="Child Category Description"
                    />
                  </div>
                  <div>
                    <label htmlFor="child-icon" className="block mb-2 text-sm font-medium text-gray-900">
                      Icon URL
                    </label>
                    <input
                      type="text"
                      name="icon"
                      id="child-icon"
                      value={childFormData.icon}
                      onChange={handleChildChange}
                      className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
                      placeholder="Icon URL"
                    />
                  </div>
                  <div>
                    <label htmlFor="child-status" className="block mb-2 text-sm font-medium text-gray-900">
                      Status
                    </label>
                    <select
                      name="status"
                      id="child-status"
                      value={childFormData.status}
                      onChange={handleChildChange}
                      className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                </div>
                {childErrors.submit && (
                  <p className="mt-2 text-sm text-red-600">{childErrors.submit}</p>
                )}
                <div className="flex space-x-3">
                  <button
                    type="submit"
                    className="text-white bg-green-600 hover:bg-green-700 focus:ring-4 focus:ring-green-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center"
                  >
                    Add Child Category
                  </button>
                  <button
                    type="button"
                    onClick={handleCancelChildCategory}
                    className="text-gray-900 bg-white border border-gray-300 hover:bg-gray-100 focus:ring-4 focus:ring-gray-200 font-medium rounded-lg text-sm px-5 py-2.5 text-center"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleAddChildCategory}
              className="flex items-center text-white bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
              </svg>
              Add Child Category
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default UpdateCategoryDetails;