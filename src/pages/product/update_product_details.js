import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getProductDetailData, updateProductData } from "../../network/product_api";
import { getAllCategoriesData } from "../../network/category_api";
import { Editor } from '@tinymce/tinymce-react';

const UpdateProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [categories, setCategories] = useState([]);
  const [isCategoriesLoading, setIsCategoriesLoading] = useState(true);
  const descriptionEditorRef = useRef(null);
  const [formData, setFormData] = useState({
    code: "",
    title: "",
    slug: "",
    size: [],
    originalPrice: "",
    salePrice: "",
    images: [""],
    description: "",
    categoryId: ""
  });
  const [errors, setErrors] = useState({});

  // Add TinyMCE script loading effect
  useEffect(() => {
    if (window.tinymce) return;
    
    const script = document.createElement('script');
    script.src = '/tinymce/tinymce.min.js';
    script.async = true;
    script.onload = () => {
      console.log('TinyMCE loaded successfully');
    };
    script.onerror = (err) => {
      console.error('Failed to load TinyMCE:', err);
    };
    document.body.appendChild(script);
    
    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  // Image upload handler
  const handleImageUpload = (blobInfo, progress) => {
    return new Promise((resolve, reject) => {
      try {
        const blob = blobInfo.blob();
        const url = URL.createObjectURL(blob);
        resolve(url);
      } catch (err) {
        reject('Image upload failed: ' + err.message);
      }
    });
  };

  // TinyMCE configuration
  const getTinyMCEConfig = (height = 300) => {
    return {
      height,
      menubar: false,
      plugins: [
        'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
        'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
        'insertdatetime', 'media', 'table', 'help', 'wordcount'
      ],
      toolbar: 'undo redo | formatselect | ' +
        'bold italic forecolor | alignleft aligncenter ' +
        'alignright alignjustify | bullist numlist outdent indent | ' +
        'removeformat | image | help',
      content_style: `
        body { font-family: -apple-system, BlinkMacSystemFont, San Francisco, Segoe UI, Roboto, Helvetica Neue, sans-serif; font-size: 14px }
        table { border-collapse: collapse; width: 100%; }
        table th, table td { border: 1px solid #ddd; padding: 8px; }
        table th { background-color: #f8f9fa; }
        img { max-width: 100%; height: auto; }
      `,
      base_url: '/tinymce',
      suffix: '.min',
      promotion: false,
      skin: 'oxide',
      content_css: 'default',
      images_upload_handler: handleImageUpload,
      image_caption: true,
      image_advtab: true,
      paste_data_images: true,
      automatic_uploads: true,
      file_picker_types: 'image',
      file_picker_callback: function(cb, value, meta) {
        const input = document.createElement('input');
        input.setAttribute('type', 'file');
        input.setAttribute('accept', 'image/*');
        
        input.onchange = function() {
          const file = this.files[0];
          const reader = new FileReader();
          reader.onload = function() {
            const id = 'blobid' + (new Date()).getTime();
            const blobCache = window.tinymce.activeEditor.editorUpload.blobCache;
            const base64 = reader.result.split(',')[1];
            const blobInfo = blobCache.create(id, file, base64);
            blobCache.add(blobInfo);
            cb(blobInfo.blobUri(), { title: file.name });
          };
          reader.readAsDataURL(file);
        };
        
        input.click();
      }
    };
  };

  // Fetch both product details and categories
  useEffect(() => {
    const fetchData = async () => {
      setIsFetching(true);
      setIsCategoriesLoading(true);
      
      try {
        // Fetch product details
        const productResponse = await getProductDetailData(id);
        const product = productResponse.data;
        
        setFormData({
          code: product.code || "",
          title: product.title || "",
          slug: product.slug || "",
          size: product.size || [],
          originalPrice: product.originalPrice?.toString() || "",
          salePrice: product.salePrice?.toString() || "",
          images: product.images?.length ? product.images : [""],
          description: product.description || "",
          // Use category field if present, otherwise fall back to categoryId
          categoryId: product.category || product.categoryId || ""
        });
        
        // Fetch categories
        const categoriesResponse = await getAllCategoriesData();
        setCategories(processCategoryHierarchy(categoriesResponse.data));
        
      } catch (error) {
        console.error("Error fetching data:", error);
        setErrors({ 
          fetch: error.response?.data?.message || "Failed to load data. Please try again." 
        });
      } finally {
        setIsFetching(false);
        setIsCategoriesLoading(false);
      }
    };

    fetchData();
  }, [id]);

  // Process flat category list into hierarchical structure for display
  const processCategoryHierarchy = (flatCategories) => {
    // Create a map of parent categories with their subcategories
    const categoryMap = {};
    const rootCategories = [];
    
    // First create all category objects with empty subcategories arrays
    flatCategories.forEach(category => {
      categoryMap[category._id] = {
        ...category,
        subCategories: [],
        level: 0, // Track nesting level for display
        displayName: category.name
      };
    });
    
    // Then organize them into a hierarchy
    flatCategories.forEach(category => {
      if (category.parentId && categoryMap[category.parentId]) {
        // This is a child category
        const childCategory = categoryMap[category._id];
        const parentCategory = categoryMap[category.parentId];
        
        // Update level and display name to show hierarchy
        childCategory.level = parentCategory.level + 1;
        childCategory.displayName = `${'\u00A0\u00A0\u00A0\u00A0'.repeat(childCategory.level)}${category.name}`;
        
        // Add to parent's subcategories
        parentCategory.subCategories.push(childCategory);
      } else {
        // This is a root level category
        rootCategories.push(categoryMap[category._id]);
      }
    });
    
    // Create a flattened list for the dropdown that maintains visual hierarchy
    const flattenedList = [];
    
    // Recursive function to flatten the hierarchy while maintaining the order
    const flattenHierarchy = (categories) => {
      categories.forEach(category => {
        flattenedList.push(category);
        if (category.subCategories && category.subCategories.length > 0) {
          flattenHierarchy(category.subCategories);
        }
      });
    };
    
    flattenHierarchy(rootCategories);
    return flattenedList;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSizeChange = (size) => {
    const updatedSizes = [...formData.size];
    if (updatedSizes.includes(size)) {
      const index = updatedSizes.indexOf(size);
      updatedSizes.splice(index, 1);
    } else {
      updatedSizes.push(size);
    }
    setFormData({
      ...formData,
      size: updatedSizes,
    });
  };

  const handleImageChange = (index, value) => {
    const updatedImages = [...formData.images];
    updatedImages[index] = value;
    setFormData({
      ...formData,
      images: updatedImages,
    });
  };

  const addImageField = () => {
    setFormData({
      ...formData,
      images: [...formData.images, ""],
    });
  };

  const removeImageField = (index) => {
    const updatedImages = [...formData.images];
    updatedImages.splice(index, 1);
    setFormData({
      ...formData,
      images: updatedImages.length ? updatedImages : [""],
    });
  };

  const generateSlug = () => {
    const slug = formData.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
    
    setFormData({
      ...formData,
      slug,
    });
  };

  const validateForm = () => {
    let valid = true;
    let errors = {};

    if (!formData.code.trim()) {
      errors.code = "Product code is required";
      valid = false;
    }

    if (!formData.title.trim()) {
      errors.title = "Product title is required";
      valid = false;
    }

    if (!formData.slug.trim()) {
      errors.slug = "Product slug is required";
      valid = false;
    }

    if (formData.originalPrice && isNaN(parseFloat(formData.originalPrice))) {
      errors.originalPrice = "Original price must be a valid number";
      valid = false;
    }

    if (formData.salePrice && isNaN(parseFloat(formData.salePrice))) {
      errors.salePrice = "Sale price must be a valid number";
      valid = false;
    }

    if (!formData.categoryId) {
      errors.categoryId = "Please select a category for this product";
      valid = false;
    }

    setErrors(errors);
    return valid;
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setFormData({
      ...formData,
      images: [...formData.images, ...files],
    });
  };

  const removeImage = (index) => {
    const updatedImages = formData.images.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      images: updatedImages,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const productData = new FormData();
    const existingImages = formData.images.filter(img => typeof img === 'string');
    const newImages = formData.images.filter(img => img instanceof File);

    productData.append('existingImages', JSON.stringify(existingImages));
    newImages.forEach(file => {
      productData.append('images', file);
    });

    Object.keys(formData).forEach(key => {
      if (key !== 'images') {
        if (key === 'size') {
          productData.append(key, JSON.stringify(formData[key]));
        } else {
          productData.append(key, formData[key]);
        }
      }
    });

    productData.append('category', formData.categoryId); // Ensure category ID is included

    setIsLoading(true);
    try {
      await updateProductData(id, productData);
      navigate(`/admin/show-product-details/${id}`);
    } catch (error) {
      console.error("Error updating product:", error);
      setErrors({ 
        submit: error.response?.data?.message || "Failed to update product. Please try again." 
      });
    } finally {
      setIsLoading(false);
    }
  };

  // New handler for editor content change
  const handleEditorChange = () => {
    if (descriptionEditorRef.current) {
      setFormData({
        ...formData,
        description: descriptionEditorRef.current.getContent()
      });
    }
  };

  if (isFetching) {
    return (
      <div className="p-4 flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-4 bg-white block sm:flex items-center justify-between border-b border-gray-200 lg:mt-1.5">
      <div className="w-full">
        <div className="mb-4">
          <nav className="flex mb-5" aria-label="Breadcrumb">
            <ol className="inline-flex items-center space-x-1 md:space-x-2">
              <li className="inline-flex items-center">
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    navigate("/admin");
                  }}
                  className="text-gray-700 hover:text-gray-900 inline-flex items-center"
                >
                  <svg
                    className="w-5 h-5 mr-2.5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"></path>
                  </svg>
                  Home
                </a>
              </li>
              <li>
                <div className="flex items-center">
                  <svg
                    className="w-6 h-6 text-gray-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      fillRule="evenodd"
                      d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                      clipRule="evenodd"
                    ></path>
                  </svg>
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      navigate("/admin/products");
                    }}
                    className="text-gray-700 hover:text-gray-900 ml-1 md:ml-2 text-sm font-medium"
                  >
                    Products
                  </a>
                </div>
              </li>
              <li>
                <div className="flex items-center">
                  <svg
                    className="w-6 h-6 text-gray-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      fillRule="evenodd"
                      d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                      clipRule="evenodd"
                    ></path>
                  </svg>
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      navigate(`/admin/show-product-details/${id}`);
                    }}
                    className="text-gray-700 hover:text-gray-900 ml-1 md:ml-2 text-sm font-medium"
                  >
                    Product Details
                  </a>
                </div>
              </li>
              <li>
                <div className="flex items-center">
                  <svg
                    className="w-6 h-6 text-gray-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      fillRule="evenodd"
                      d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                      clipRule="evenodd"
                    ></path>
                  </svg>
                  <span
                    className="text-gray-400 ml-1 md:ml-2 text-sm font-medium"
                    aria-current="page"
                  >
                    Update Product
                  </span>
                </div>
              </li>
            </ol>
          </nav>
          <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">
            Update Product
          </h1>
        </div>

        {errors.fetch && (
          <div className="p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-lg" role="alert">
            {errors.fetch}
            <button 
              className="ml-2 font-medium underline"
              onClick={() => navigate('/admin/products')}
            >
              Return to products
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg p-4 sm:p-6 xl:p-8 mt-4">
          {errors.submit && (
            <div className="p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-lg" role="alert">
              {errors.submit}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label
                htmlFor="code"
                className="block mb-2 text-sm font-medium text-gray-900"
              >
                Product Code <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="code"
                id="code"
                className={`bg-gray-50 border ${
                  errors.code ? "border-red-500" : "border-gray-300"
                } text-gray-900 sm:text-sm rounded-lg focus:ring-blue-600 focus:border-blue-600 block w-full p-2.5`}
                value={formData.code}
                onChange={handleChange}
                placeholder="Enter product code"
              />
              {errors.code && (
                <p className="mt-1 text-sm text-red-600">{errors.code}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="title"
                className="block mb-2 text-sm font-medium text-gray-900"
              >
                Product Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="title"
                id="title"
                className={`bg-gray-50 border ${
                  errors.title ? "border-red-500" : "border-gray-300"
                } text-gray-900 sm:text-sm rounded-lg focus:ring-blue-600 focus:border-blue-600 block w-full p-2.5`}
                value={formData.title}
                onChange={handleChange}
                placeholder="Enter product title"
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-600">{errors.title}</p>
              )}
            </div>
          </div>

          <div className="mb-4">
            <label
              htmlFor="slug"
              className="flex justify-between mb-2 text-sm font-medium text-gray-900"
            >
              <span>Slug <span className="text-red-500">*</span></span>
              <button
                type="button"
                onClick={generateSlug}
                className="text-xs text-blue-600 hover:underline"
              >
                Generate from title
              </button>
            </label>
            <input
              type="text"
              name="slug"
              id="slug"
              className={`bg-gray-50 border ${
                errors.slug ? "border-red-500" : "border-gray-300"
              } text-gray-900 sm:text-sm rounded-lg focus:ring-blue-600 focus:border-blue-600 block w-full p-2.5`}
              value={formData.slug}
              onChange={handleChange}
              placeholder="Enter product slug"
            />
            {errors.slug && (
              <p className="mt-1 text-sm text-red-600">{errors.slug}</p>
            )}
          </div>

          <div className="mb-4">
            <label className="block mb-2 text-sm font-medium text-gray-900">
              Available Sizes
            </label>
            <div className="flex flex-wrap gap-2">
              {["XS", "S", "M", "L", "XL", "XXL"].map((size) => (
                <label key={size} className="inline-flex items-center">
                  <input
                    type="checkbox"
                    className="form-checkbox h-5 w-5 text-blue-600"
                    checked={formData.size.includes(size)}
                    onChange={() => handleSizeChange(size)}
                  />
                  <span className="ml-2 text-gray-700">{size}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label
                htmlFor="originalPrice"
                className="block mb-2 text-sm font-medium text-gray-900"
              >
                Original Price
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <span className="text-gray-500">$</span>
                </div>
                <input
                  type="text"
                  name="originalPrice"
                  id="originalPrice"
                  className={`bg-gray-50 border ${
                    errors.originalPrice ? "border-red-500" : "border-gray-300"
                  } text-gray-900 sm:text-sm rounded-lg focus:ring-blue-600 focus:border-blue-600 block w-full pl-8 p-2.5`}
                  value={formData.originalPrice}
                  onChange={handleChange}
                  placeholder="0.00"
                />
              </div>
              {errors.originalPrice && (
                <p className="mt-1 text-sm text-red-600">{errors.originalPrice}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="salePrice"
                className="block mb-2 text-sm font-medium text-gray-900"
              >
                Sale Price
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <span className="text-gray-500">$</span>
                </div>
                <input
                  type="text"
                  name="salePrice"
                  id="salePrice"
                  className={`bg-gray-50 border ${
                    errors.salePrice ? "border-red-500" : "border-gray-300"
                  } text-gray-900 sm:text-sm rounded-lg focus:ring-blue-600 focus:border-blue-600 block w-full pl-8 p-2.5`}
                  value={formData.salePrice}
                  onChange={handleChange}
                  placeholder="0.00"
                />
              </div>
              {errors.salePrice && (
                <p className="mt-1 text-sm text-red-600">{errors.salePrice}</p>
              )}
            </div>
          </div>

          <div className="mb-4">
            <label className="block mb-2 text-sm font-medium text-gray-900">
              Product Images
              <button
                type="button"
                onClick={() => document.getElementById('imageUpload').click()}
                className="ml-2 bg-blue-100 text-blue-700 text-xs py-1 px-2 rounded"
              >
                + Add Images
              </button>
            </label>
            <input
              type="file"
              id="imageUpload"
              multiple
              className="hidden"
              onChange={handleFileChange}
            />
            <div className="flex flex-wrap gap-4 mt-2">
              {formData.images.length > 0 && formData.images.map((file, index) => (
                <div key={index} className="relative">
                  <img
                    src={file instanceof File ? URL.createObjectURL(file) : file}
                    alt={`Preview ${index}`}
                    className="w-20 h-20 object-cover rounded"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center p-0 transform translate-x-1/2 -translate-y-1/2 hover:bg-red-600 transition-colors duration-200 shadow-md"
                  >
                    &times;
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="mb-4">
            <label
              htmlFor="categoryId"
              className="block mb-2 text-sm font-medium text-gray-900"
            >
              Category <span className="text-red-500">*</span>
            </label>
            <select
              id="categoryId"
              name="categoryId"
              value={formData.categoryId}
              onChange={handleChange}
              className={`bg-gray-50 border ${
                errors.categoryId ? "border-red-500" : "border-gray-300"
              } text-gray-900 sm:text-sm rounded-lg focus:ring-blue-600 focus:border-blue-600 block w-full p-2.5`}
              disabled={isCategoriesLoading}
            >
              <option value="">Select a category</option>
              {categories.map((category) => (
                <option 
                  key={category._id} 
                  value={category._id}
                  style={{ 
                    fontWeight: category.level === 0 ? 'bold' : 'normal'
                  }}
                >
                  {category.displayName}
                </option>
              ))}
            </select>
            {isCategoriesLoading && (
              <p className="mt-1 text-sm text-gray-500">Loading categories...</p>
            )}
            {errors.categories && (
              <p className="mt-1 text-sm text-red-600">{errors.categories}</p>
            )}
            {errors.categoryId && (
              <p className="mt-1 text-sm text-red-600">{errors.categoryId}</p>
            )}
          </div>

          {/* Replace description textarea with TinyMCE Editor */}
          <div className="mb-4">
            <label
              htmlFor="description"
              className="block mb-2 text-sm font-medium text-gray-900"
            >
              Description
            </label>
            <Editor
              onInit={(evt, editor) => descriptionEditorRef.current = editor}
              initialValue={formData.description}
              onEditorChange={handleEditorChange}
              init={getTinyMCEConfig(300)}
              tinymceScriptSrc="/tinymce/tinymce.min.js"
            />
          </div>

          <div className="flex items-center justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate(`/admin/show-product-details/${id}`)}
              className="text-gray-700 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-200 font-medium rounded-lg text-sm px-5 py-2.5"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5"
            >
              {isLoading ? "Updating..." : "Update Product"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpdateProductDetails;
