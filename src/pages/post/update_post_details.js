import React, { useState, useRef, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useFormik } from 'formik';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { getPostDetailData, updatePostDetailData } from "../../network/post_api";
import { Editor } from '@tinymce/tinymce-react';

const UpdatePostDetails = () => {
    const { id } = useParams();
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);
    const editorContentRef = useRef(null);
    const editorDescriptionRef = useRef(null);
    const navigate = useNavigate();
    
    // Add this useEffect to load TinyMCE script manually if needed
    useEffect(() => {
        // Check if TinyMCE is already loaded
        if (window.tinymce) return;
        
        // Otherwise, load it manually
        const script = document.createElement('script');
        script.src = '/tinymce/tinymce.min.js'; // Adjust path if needed
        script.async = true;
        script.onload = () => {
            console.log('TinyMCE loaded successfully');
        };
        script.onerror = (err) => {
            console.error('Failed to load TinyMCE:', err);
        };
        document.body.appendChild(script);
        
        return () => {
            // Cleanup if component unmounts before script loads
            document.body.removeChild(script);
        };
    }, []);
    
    const formik = useFormik({
        initialValues: {
            title: '',
            description: '',
            content: '',
            image: null, // Existing image
        },
        validate: (values) => {
            const errors = {};
            if (!values.title) errors.title = 'Title is required';
            if (!values.description) errors.description = 'Description is required';
            if (!values.content) errors.content = 'Content is required';
            return errors;
        },
        onSubmit: async (values, { setSubmitting }) => {
            await handleSubmit(values);
            setSubmitting(false);
        },
        enableReinitialize: true, // Allow values to be reset when initialValues changes
    });
    
    // Fetch post data when component mounts
    useEffect(() => {
        const fetchPostData = async () => {
            try {
                setInitialLoading(true);
                const response = await getPostDetailData(id);
                const post = response.data;
                
                // Initialize form with post data
                formik.setValues({
                    title: post.title || '',
                    description: post.description || '',
                    content: post.content || '',
                    image: null, // We don't set the image file here, just keep the existing one
                });
                
                // Update editor content refs when data is loaded
                if (editorDescriptionRef.current) {
                    editorDescriptionRef.current.setContent(post.description || '');
                }
                
                if (editorContentRef.current) {
                    editorContentRef.current.setContent(post.content || '');
                }
                
            } catch (error) {
                toast.error("Failed to load post data");
                console.error(error);
            } finally {
                setInitialLoading(false);
            }
        };
        
        fetchPostData();
    }, [id]);
    
    // Updated Image upload handler function that returns a Promise
    const handleImageUpload = (blobInfo, progress) => {
        return new Promise((resolve, reject) => {
            try {
                // Get the blob from blobInfo
                const blob = blobInfo.blob();
                
                // Create a URL for the blob
                const url = URL.createObjectURL(blob);
                
                // Resolve with the URL
                resolve(url);
                
                // For a real server implementation:
                /*
                const formData = new FormData();
                formData.append('file', blob, blobInfo.filename());
                
                fetch('/api/upload', {
                    method: 'POST',
                    body: formData
                })
                .then(response => response.json())
                .then(result => {
                    resolve(result.location);
                })
                .catch(err => {
                    reject('Image upload failed: ' + err.message);
                });
                */
            } catch (err) {
                reject('Image upload failed: ' + err.message);
            }
        });
    };

    // TinyMCE configuration function - similar to the sample code
    const getTinyMCEConfig = (height = 300) => {
        return {
            height,
            menubar: height > 300, // Only show menu bar for larger editors (like content)
            plugins: [
                'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
                'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
                'insertdatetime', 'media', 'table', 'help', 'wordcount'
            ],
            toolbar: height > 300 
                ? 'undo redo | blocks | bold italic forecolor | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | image | removeformat | table | help'
                : 'undo redo | formatselect | bold italic | alignleft aligncenter alignright | bullist numlist | help',
            content_style: `
                body { font-family: -apple-system, BlinkMacSystemFont, San Francisco, Segoe UI, Roboto, Helvetica Neue, sans-serif; font-size: 14px }
                table { border-collapse: collapse; width: 100%; }
                table th, table td { border: 1px solid #ddd; padding: 8px; }
                table th { background-color: #f8f9fa; }
                img { max-width: 100%; height: auto; }
            `,
            // Self-hosted configuration
            base_url: '/tinymce',
            suffix: '.min',
            promotion: false,
            skin: 'oxide',
            content_css: 'default',
            
            // Image upload configuration
            images_upload_handler: handleImageUpload,
            image_caption: true,
            image_advtab: true,
            image_toolbar: 'alignleft aligncenter alignright | rotateleft rotateright | imageoptions',
            paste_data_images: true,
            automatic_uploads: true,
            file_picker_types: 'image',
            file_picker_callback: function(cb, value, meta) {
                // Create an input element for file selection
                const input = document.createElement('input');
                input.setAttribute('type', 'file');
                input.setAttribute('accept', 'image/*');
                
                // Listen for file selection
                input.onchange = function() {
                    const file = this.files[0];
                    
                    // Create a reader to read the file
                    const reader = new FileReader();
                    reader.onload = function() {
                        const id = 'blobid' + (new Date()).getTime();
                        const blobCache = window.tinymce.activeEditor.editorUpload.blobCache;
                        const base64 = reader.result.split(',')[1];
                        const blobInfo = blobCache.create(id, file, base64);
                        blobCache.add(blobInfo);
                        
                        // Call callback and pass in the URL to the blob
                        cb(blobInfo.blobUri(), { title: file.name });
                    };
                    reader.readAsDataURL(file);
                };
                
                input.click();
            }
        };
    };
    
    const handleSubmit = async (values) => {
        setLoading(true);
        
        try {
            const formData = new FormData();
            formData.append("title", values.title);
            formData.append("description", values.description);
            formData.append("content", values.content);
            if (values.image) {
                formData.append("thumbnail", values.image);
            }
    
            // Check data before submitting
            for (let pair of formData.entries()) {
                console.log(pair[0], pair[1]);
            }

            const response = await updatePostDetailData(id, formData);
            toast.success(response.message || "Post updated successfully");
            navigate("/admin/posts");
        } catch (error) {
            toast.error(error.message || "Error updating post");
        } finally {
            setLoading(false);
        }
    };

    const handleEditorContentChange = () => {
        if (editorContentRef.current) {
            formik.setFieldValue("content", editorContentRef.current.getContent());
        }
    };

    const handleEditorDescriptionChange = () => {
        if (editorDescriptionRef.current) {
            formik.setFieldValue("description", editorDescriptionRef.current.getContent());
        }
    };

    if (initialLoading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
            </div>
        );
    }

    return (
        <div>
            <div className="bg-gray-50 min-h-screen">
                <section className="mx-auto bg-white shadow-md mt-10 p-8">
                    <h2 className="mb-4 text-xl font-bold text-gray-900">Update Post</h2>
                    <form onSubmit={formik.handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-900">Title</label>
                            <input type="text" name="title" placeholder="Enter title" onChange={formik.handleChange} value={formik.values.title}
                                className="w-full p-2.5 border border-gray-300 rounded-lg" />
                            {formik.touched.title && formik.errors.title && <div className="text-red-500">{formik.errors.title}</div>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-900">Description</label>
                            <Editor
                                onInit={(evt, editor) => editorDescriptionRef.current = editor}
                                initialValue={formik.values.description}
                                onEditorChange={handleEditorDescriptionChange}
                                init={getTinyMCEConfig(200)}
                                tinymceScriptSrc="/tinymce/tinymce.min.js"
                            />
                            {formik.touched.description && formik.errors.description && <div className="text-red-500">{formik.errors.description}</div>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-900">Content</label>
                            <Editor
                                onInit={(evt, editor) => editorContentRef.current = editor}
                                initialValue={formik.values.content}
                                onEditorChange={handleEditorContentChange}
                                init={getTinyMCEConfig(500)}
                                tinymceScriptSrc="/tinymce/tinymce.min.js"
                            />
                            {formik.touched.content && formik.errors.content && <div className="text-red-500">{formik.errors.content}</div>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-900">Thumbnail Image</label>
                            <input type="file" name="image" accept="image/*" onChange={(event) => formik.setFieldValue("image", event.currentTarget.files[0])}
                                className="w-full p-2.5 border border-gray-300 rounded-lg" />
                            <p className="text-sm text-gray-500 mt-1">Leave blank to keep the current image</p>
                            {formik.touched.image && formik.errors.image && <div className="text-red-500">{formik.errors.image}</div>}
                        </div>
                        <div className="flex justify-between">
                            <button 
                                type="button" 
                                onClick={() => navigate("/admin/posts")}
                                className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300"
                            >
                                Cancel
                            </button>
                            <button 
                                type="submit" 
                                className="px-5 py-2.5 text-sm font-medium text-white rounded-lg bg-gray-600 hover:bg-gray-700"
                                disabled={loading}
                            >
                                {loading ? "Updating..." : "Update Post"}
                            </button>
                        </div>
                    </form>
                </section>
            </div>
            <ToastContainer />
        </div>
    );
};

export default UpdatePostDetails;