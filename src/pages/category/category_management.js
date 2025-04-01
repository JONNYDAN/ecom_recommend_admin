import React, { useState, useEffect } from "react";
import {
  getAllCategoriesData,
  createCategoryData,
  updateCategoryData,
  deleteCategoryData,
  getCategoryDetailData,
} from "../../network/category_api";
import { FiPlus, FiEdit2, FiTrash2, FiChevronDown, FiChevronRight, FiFolder, FiFolderPlus, FiSearch } from "react-icons/fi";
import Loader from "../../components/loader";

const CategoryManagement = () => {
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState({});
  const [currentCategory, setCurrentCategory] = useState(null);
  const [parentId, setParentId] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch categories on load
  useEffect(() => {
    fetchCategories();
  }, []);

  // Fetch categories with hierarchical structure
  const fetchCategories = async () => {
    setIsLoading(true);
    try {
      const response = await getAllCategoriesData(searchTerm);
      // Process to create a hierarchical structure
      const categoriesWithChildren = processCategoryHierarchy(response.data);
      setCategories(categoriesWithChildren);
      setError(null);
    } catch (err) {
      setError("Failed to fetch categories. Please try again later.");
      console.error("Error fetching categories:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Process flat category list into hierarchical structure
  const processCategoryHierarchy = (flatCategories) => {
    const categoryMap = {};
    const rootCategories = [];

    // First pass: create map of id -> category with empty subCategories array
    flatCategories.forEach(category => {
      categoryMap[category._id] = { 
        ...category, 
        subCategories: category.subCategories || [] 
      };
    });

    // Second pass: build the hierarchy if not already provided
    // This is a fallback in case the API doesn't provide properly nested subCategories
    if (!flatCategories.some(cat => cat.subCategories && cat.subCategories.length > 0)) {
      flatCategories.forEach(category => {
        if (category.parentId && categoryMap[category.parentId]) {
          // This is a child category
          if (!categoryMap[category.parentId].subCategories) {
            categoryMap[category.parentId].subCategories = [];
          }
          categoryMap[category.parentId].subCategories.push(categoryMap[category._id]);
        } else {
          // This is a root level category
          rootCategories.push(categoryMap[category._id]);
        }
      });
    } else {
      // If API provides proper hierarchy with subCategories
      flatCategories.forEach(category => {
        if (!category.parentId) {
          rootCategories.push(categoryMap[category._id]);
        }
      });
    }

    return rootCategories;
  };

  // Toggle category expansion
  const toggleExpand = (categoryId) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }));
  };

  // Reset and initialize the form
  const resetForm = (parentCategoryId = null) => {
    setFormData({
      name: "",
      description: "",
    });
    setCurrentCategory(null);
    setParentId(parentCategoryId);
  };

  // Open modal to add a new category
  const handleAddCategory = (parentCategoryId = null) => {
    resetForm(parentCategoryId);
    setShowAddModal(true);
  };

  // Open modal to edit a category
  const handleEditCategory = async (category) => {
    try {
      // Fetch the latest data for the category
      const response = await getCategoryDetailData(category._id);
      setCurrentCategory(response.data);
      setFormData({
        name: response.data.name || "",
        description: response.data.description || "",
      });
      setShowEditModal(true);
    } catch (error) {
      console.error("Error fetching category details:", error);
      setError("Failed to fetch category details. Please try again.");
    }
  };

  // Open delete confirmation modal
  const handleDeleteClick = (category) => {
    setCurrentCategory(category);
    setShowDeleteConfirm(true);
  };

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Validate form inputs
  const validateForm = () => {
    if (!formData.name.trim()) {
      setError("Category name is required");
      return false;
    }
    return true;
  };

  // Helper functions for updating state without fetching all data

  // Find a category by id in the hierarchical structure
  const findCategoryById = (categoryId, categoryList = categories) => {
    for (const category of categoryList) {
      if (category._id === categoryId) {
        return { category, parent: null };
      }
      
      if (category.subCategories && category.subCategories.length > 0) {
        const result = findCategoryById(categoryId, category.subCategories);
        if (result.category) {
          return { category: result.category, parent: category };
        }
      }
    }
    return { category: null, parent: null };
  };

  // Update a specific category in the hierarchy
  const updateCategoryInState = (categoryId, newData) => {
    const { category, parent } = findCategoryById(categoryId);
    
    if (!category) return false;
    
    // Create new category object with updated data
    const updatedCategory = {
      ...category,
      ...newData
    };
    
    if (!parent) {
      // It's a top-level category
      setCategories(prev => prev.map(cat => 
        cat._id === categoryId ? updatedCategory : cat
      ));
    } else {
      // It's a nested category, first we need to update the parent
      setCategories(prev => {
        // Create a deep copy to avoid direct state mutation
        const newCategories = JSON.parse(JSON.stringify(prev));
        
        // Find and update the parent in the copied state
        const updateParentCategory = (cats, parentId) => {
          return cats.map(cat => {
            if (cat._id === parentId) {
              return {
                ...cat,
                subCategories: cat.subCategories.map(subCat => 
                  subCat._id === categoryId ? updatedCategory : subCat
                )
              };
            }
            if (cat.subCategories && cat.subCategories.length > 0) {
              return {
                ...cat,
                subCategories: updateParentCategory(cat.subCategories, parentId)
              };
            }
            return cat;
          });
        };
        
        return updateParentCategory(newCategories, parent._id);
      });
    }
    
    return true;
  };

  // Add a new category to the state
  const addCategoryToState = (newCategory, parentCategoryId = null) => {
    if (!parentCategoryId) {
      // Add as top-level category
      setCategories(prev => [...prev, { ...newCategory, subCategories: [] }]);
    } else {
      // Add as child category to the specified parent
      setCategories(prev => {
        // Create a deep copy to avoid direct state mutation
        const newCategories = JSON.parse(JSON.stringify(prev));
        
        // Find and update the parent in the copied state
        const addToParent = (cats, parentId) => {
          return cats.map(cat => {
            if (cat._id === parentId) {
              return {
                ...cat,
                subCategories: [...(cat.subCategories || []), { ...newCategory, subCategories: [] }]
              };
            }
            if (cat.subCategories && cat.subCategories.length > 0) {
              return {
                ...cat,
                subCategories: addToParent(cat.subCategories, parentId)
              };
            }
            return cat;
          });
        };
        
        return addToParent(newCategories, parentCategoryId);
      });
    }
  };

  // Remove a category from the state
  const removeCategoryFromState = (categoryId) => {
    const { category, parent } = findCategoryById(categoryId);
    
    if (!category) return false;
    
    if (!parent) {
      // It's a top-level category
      setCategories(prev => prev.filter(cat => cat._id !== categoryId));
    } else {
      // It's a nested category, we need to update the parent
      setCategories(prev => {
        // Create a deep copy to avoid direct state mutation
        const newCategories = JSON.parse(JSON.stringify(prev));
        
        // Find and update the parent in the copied state
        const removeFromParent = (cats, parentId) => {
          return cats.map(cat => {
            if (cat._id === parentId) {
              return {
                ...cat,
                subCategories: cat.subCategories.filter(subCat => subCat._id !== categoryId)
              };
            }
            if (cat.subCategories && cat.subCategories.length > 0) {
              return {
                ...cat,
                subCategories: removeFromParent(cat.subCategories, parentId)
              };
            }
            return cat;
          });
        };
        
        return removeFromParent(newCategories, parent._id);
      });
    }
    
    return true;
  };

  // Submit form to create a new category
  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const newCategory = { 
        name: formData.name,
        description: formData.description,
        status: "active" // Default status to active
      };
      
      if (parentId) {
        newCategory.parentId = parentId;
      }

      // Call API to create category
      const response = await createCategoryData(newCategory);
      
      // Update UI optimistically with the new category
      const createdCategory = response.data; // Assuming API returns the created category with _id
      addCategoryToState(createdCategory, parentId);
      
      setShowAddModal(false);
      setError(null);
    } catch (err) {
      setError("Failed to create category. Please try again.");
      console.error("Error creating category:", err);
    }
  };

  // Submit form to update an existing category
  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm() || !currentCategory) return;

    try {
      // Only update name and description
      const updateData = {
        name: formData.name,
        description: formData.description
      };
      
      // Call API to update category
      await updateCategoryData(currentCategory._id, updateData);
      
      // Update UI optimistically
      updateCategoryInState(currentCategory._id, updateData);
      
      setShowEditModal(false);
      setError(null);
    } catch (err) {
      setError("Failed to update category. Please try again.");
      console.error("Error updating category:", err);
    }
  };

  // Delete a category
  const handleDeleteConfirm = async () => {
    if (!currentCategory) return;

    try {
      // Call API to delete category
      await deleteCategoryData(currentCategory._id);
      
      // Update UI optimistically
      removeCategoryFromState(currentCategory._id);
      
      setShowDeleteConfirm(false);
      setError(null);
    } catch (err) {
      setError("Failed to delete category. Please try again.");
      console.error("Error deleting category:", err);
    }
  };

  // Render category item with its subCategories
  const renderCategoryItem = (category, level = 0, parentIndex = "", index = 0) => {
    const isExpanded = expandedCategories[category._id] || false;
    const hasChildren = category.subCategories && category.subCategories.length > 0;
    const displayIndex = parentIndex ? `${parentIndex}.${index + 1}` : `${index + 1}`;
    
    return (
      <div key={category._id} className="category-item">
        <div 
          className={`flex items-center p-3 border-b hover:bg-gray-50 ${level > 0 ? 'pl-' + (level * 8) : ''}`}
          style={{ paddingLeft: level * 24 + 12 }}
        >
          {/* Order number */}
          <span className="mr-3 font-medium text-gray-500 w-12 text-center">
            {displayIndex}
          </span>
          
          {/* Category icon */}
          <span className="mr-2">
            {hasChildren ? (
              <FiFolder className="text-yellow-500" size={18} />
            ) : (
              <FiFolder className="text-gray-400" size={18} />
            )}
          </span>
          
          {/* Category details */}
          <div className="flex-1 cursor-pointer" onClick={() => hasChildren && toggleExpand(category._id)}>
            <span className="font-medium">{category.name}</span>
            <p className="text-sm text-gray-600 truncate">{category.description}</p>
          </div>
          
          {/* Subcategories count badge */}
          {hasChildren && (
            <span className="px-2 py-1 mr-3 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
              {category.subCategories.length} subcategories
            </span>
          )}
          
          {/* Status indicator */}
          <span className={`mr-4 px-2 py-1 text-xs rounded-full ${
            category.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            {category.status}
          </span>
          
          {/* Expand/Collapse button for categories with children */}
          {hasChildren && (
            <button 
              onClick={() => toggleExpand(category._id)}
              className="mr-2 p-1 rounded-full hover:bg-gray-200 focus:outline-none transition-colors"
              title={isExpanded ? "Collapse" : "Expand"}
            >
              {isExpanded ? (
                <FiChevronDown className="text-blue-600" size={20} />
              ) : (
                <FiChevronRight className="text-blue-600" size={20} />
              )}
            </button>
          )}
          
          {/* Action buttons */}
          <div className="flex space-x-2">
            {/* Only show Add Child button for top-level categories */}
            {level === 0 && (
              <button 
                onClick={() => handleAddCategory(category._id)}
                className="p-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-full transition-colors"
                title="Add Child Category"
              >
                <FiFolderPlus size={16} />
              </button>
            )}
            <button 
              onClick={() => handleEditCategory(category)}
              className="p-1.5 bg-yellow-50 text-yellow-600 hover:bg-yellow-100 rounded-full transition-colors"
              title="Edit Category"
            >
              <FiEdit2 size={16} />
            </button>
            <button 
              onClick={() => handleDeleteClick(category)}
              className="p-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-full transition-colors"
              title="Delete Category"
            >
              <FiTrash2 size={16} />
            </button>
          </div>
        </div>
        
        {/* Render subCategories if expanded */}
        {isExpanded && hasChildren && (
          <div className="children-container border-l-2 border-blue-100 ml-6">
            {category.subCategories.map((child, idx) => 
              renderCategoryItem(child, level + 1, displayIndex, idx)
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div>
      {/*<!-- Loader -->*/}
      <Loader isShow={isLoading} />

      {/*<!-- Start block -->*/}
      <section className="bg-gray-50 antialiased mt-10">
        <div className="relative pt-6 pb-4 px-4 sm:px-6 lg:px-8">
          {/* Page header */}
          <div className="mb-8">
            <div className="sm:flex sm:items-center sm:justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Category Management</h1>
                <p className="mt-1 text-sm text-gray-600">
                  Manage your categories and subcategories
                </p>
              </div>
              <div className="mt-4 sm:mt-0">
                <button
                  onClick={() => handleAddCategory()}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <FiPlus className="mr-2" /> Create Category
                </button>
              </div>
            </div>
          </div>

          {/* Search and filters */}
          <div className="mb-6">
            <div className="flex flex-wrap items-center justify-between">
              <div className="w-full md:w-1/2 mb-4 md:mb-0">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiSearch className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="search"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && fetchCategories()}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Search categories..."
                  />
                </div>
              </div>
              <div className="w-full md:w-auto flex justify-end">
                <button
                  onClick={fetchCategories}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Search
                </button>
              </div>
            </div>
          </div>

          {/* Error message */}
          {error && (
            <div className="mb-6 p-4 text-sm rounded-md bg-red-50 text-red-800" role="alert">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p>{error}</p>
                </div>
                <div className="ml-auto pl-3">
                  <div className="-mx-1.5 -my-1.5">
                    <button
                      onClick={() => setError(null)}
                      className="inline-flex bg-red-50 rounded-md p-1.5 text-red-500 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                      <span className="sr-only">Dismiss</span>
                      <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Loading indicator */}
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            /* Categories list with enhanced styling */
            <div className="bg-white shadow overflow-hidden rounded-lg">
              <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex items-center">
                <FiFolder className="mr-2 text-gray-500" /> 
                <span className="text-sm font-medium text-gray-700">All Categories</span>
              </div>
              
              <div className="overflow-x-auto">
                {categories.length > 0 ? (
                  <div className="min-w-full divide-y divide-gray-200">
                    {categories.map((category, index) => renderCategoryItem(category, 0, "", index))}
                  </div>
                ) : (
                  <div className="p-6 text-center text-gray-500">
                    No categories found. Create one to get started.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Add Category Modal */}
          {showAddModal && (
            <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50">
              <div className="relative mx-auto p-5 border w-full max-w-md shadow-lg rounded-md bg-white">
                <div className="flex justify-between items-center pb-3">
                  <h3 className="text-lg font-medium">
                    {parentId ? "Add Child Category" : "Add Category"}
                  </h3>
                  <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-500">
                    &times;
                  </button>
                </div>
                <form onSubmit={handleCreateSubmit}>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700">Name</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      required
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700">Description</label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      rows="3"
                    />
                  </div>
                  <div className="flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={() => setShowAddModal(false)}
                      className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="bg-blue-600 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Create
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Edit Category Modal */}
          {showEditModal && (
            <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50">
              <div className="relative mx-auto p-5 border w-full max-w-md shadow-lg rounded-md bg-white">
                <div className="flex justify-between items-center pb-3">
                  <h3 className="text-lg font-medium">Edit Category</h3>
                  <button onClick={() => setShowEditModal(false)} className="text-gray-400 hover:text-gray-500">
                    &times;
                  </button>
                </div>
                <form onSubmit={handleUpdateSubmit}>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700">Name</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      required
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700">Description</label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      rows="3"
                    />
                  </div>
                  <div className="flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={() => setShowEditModal(false)}
                      className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="bg-yellow-600 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
                    >
                      Update
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Delete Confirmation Modal */}
          {showDeleteConfirm && (
            <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50">
              <div className="relative mx-auto p-5 border w-full max-w-sm shadow-lg rounded-md bg-white">
                <h3 className="text-lg font-medium mb-4">Confirm Delete</h3>
                <p className="mb-4">Are you sure you want to delete "{currentCategory?.name}"? This action cannot be undone.</p>
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeleteConfirm}
                    className="bg-red-600 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    Delete
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

export default CategoryManagement;
