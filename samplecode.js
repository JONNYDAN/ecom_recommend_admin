import React, { useState, useEffect, useRef } from "react";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useParams, useNavigate, useLocation } from "react-router-dom"; // Add useLocation
import Loader from "../../components/loader";
import { getAllQuestionsData, getQuestionDetailData, updateQuestionData, deleteQuestionDetailData, createQuestionData } from "../../network/question_api";
import { getAllQuestionsGroupData, createQuestionGroupData, updateQuestionGroupData, deleteQuestionGroupDetailData } from "../../network/question_group_api";
import { optionList, pointData } from "../../utils/constants";

// Replace Draft.js imports with TinyMCE
import { Editor } from '@tinymce/tinymce-react';

// Remove the entire TableButton component as it depends on Draft.js

const ManageQuestions = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation(); // Add this to access the state
    const [loading, setLoading] = useState(false);
    const [questionListResult, setQuestionListResult] = useState({ questions: [] });
    const [questionGroups, setQuestionGroups] = useState([]); // Store question groups
    const [expandedQuestions, setExpandedQuestions] = useState({});
    const [editModes, setEditModes] = useState({});
    const [deleteConfirmation, setDeleteConfirmation] = useState(null);
    
    // Replace editor states with HTML content
    const [editorContents, setEditorContents] = useState({});
    const [feedbackEditorContents, setFeedbackEditorContents] = useState({});
    const [preContentEditorContents, setPreContentEditorContents] = useState({});
    
    const options = ["1", "2", "3", "4"];
    const [showAddForm, setShowAddForm] = useState(false);
    const [newQuestion, setNewQuestion] = useState({
        question: '',
        questionGroup: '', // Changed from group to questionGroup
        point: '1',
        options: ['', '', '', ''],
        correctOptionIndex: '0',
        generalFeedback: '', // Add generalFeedback field
        preContent: '' // Add preContent field
    });
    
    // Replace editor states with HTML content for new question
    const [newQuestionContent, setNewQuestionContent] = useState('');
    const [newFeedbackContent, setNewFeedbackContent] = useState('');
    const [newPreContentContent, setNewPreContentContent] = useState('');
    
    const [expandedGroups, setExpandedGroups] = useState({});
    const [addingToGroup, setAddingToGroup] = useState(null);
    const [creatingGroup, setCreatingGroup] = useState(false);
    const [tempGroupName, setTempGroupName] = useState('');

    // New state for group creation
    const [showAddGroupForm, setShowAddGroupForm] = useState(false);
    const [newGroupName, setNewGroupName] = useState('');
    const [newGroupContent, setNewGroupContent] = useState('');

    // New state for group editing and deletion
    const [editingGroupId, setEditingGroupId] = useState(null);
    const [editGroupName, setEditGroupName] = useState('');
    const [editGroupContent, setEditGroupContent] = useState('');
    const [deleteGroupId, setDeleteGroupId] = useState(null);
    const [courseInfo, setCourseInfo] = useState(location.state?.course || null);
    const [quizInfo, setQuizInfo] = useState(location.state?.quiz || null);

    // Remove Draft.js related state
    const [uploadProgress, setUploadProgress] = useState({});

    useEffect(() => {
        getQuestionList();
    }, []);

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

    // Enhanced TinyMCE configuration with image upload
    const getTinyMCEConfig = (height = 300) => {
        return {
            height,
            menubar: false,
            plugins: [
                'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
                'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
                'insertdatetime', 'media', 'table', 'help', 'wordcount'
            ],
            toolbar: 'undo redo | ' +
                    'blocks | bold italic forecolor | alignleft aligncenter ' +
                    'alignright alignjustify | bullist numlist outdent indent | ' +
                    'image | removeformat | table | help',
            content_style: `
                body { font-family: -apple-system, BlinkMacSystemFont, San Francisco, Segoe UI, Roboto, Helvetica Neue, sans-serif; font-size: 14px }
                table { border-collapse: collapse; width: 100%; }
                table th, table td { border: 1px solid #ddd; padding: 8px; }
                table th { background-color: #f8f9fa; }
                img { max-width: 100%; height: auto; }
            `,
            script_loading_async: true,
            
            // Update image upload configuration for Promise-based handler
            images_upload_handler: handleImageUpload,
            
            // Keep other configuration unchanged
            image_caption: true,
            image_advtab: true,
            image_toolbar: 'alignleft aligncenter alignright | rotateleft rotateright | imageoptions',
            paste_data_images: true,
            automatic_uploads: true,
            file_picker_types: 'image',
            file_picker_callback: function(cb, value, meta) {
                // Create an input element
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

    // Add this useEffect to load TinyMCE script manually
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

    const getQuestionList = async () => {
        setLoading(true);

        try {
            // First fetch question groups, then fetch questions
            const groupsResponse = await getAllQuestionsGroupData(id);
            setQuestionGroups(groupsResponse.data || []);
            
            // After fetching groups, fetch questions
            const questionsResponse = await getAllQuestionsData(id);
            setQuestionListResult(questionsResponse);
            
            // If we don't have quiz info from location state, get it from the response
            if (!quizInfo && questionsResponse.quiz) {
                setQuizInfo(questionsResponse.quiz);
            }
            
            // If we don't have course info from location state, try to get it from the response
            if (!courseInfo && questionsResponse.quiz && questionsResponse.quiz.course) {
                setCourseInfo(questionsResponse.quiz.course);
            }
            
            // Initialize editor contents for each question
            const initialEditorContents = {};
            const initialFeedbackEditorContents = {};
            const initialPreContentEditorContents = {};
            
            questionsResponse.questions.forEach(question => {
                initialEditorContents[question._id] = question.question || '';
                initialFeedbackEditorContents[question._id] = question.generalFeedback || '';
                initialPreContentEditorContents[question._id] = question.preContent || '';
            });
            
            setEditorContents(initialEditorContents);
            setFeedbackEditorContents(initialFeedbackEditorContents);
            setPreContentEditorContents(initialPreContentEditorContents);
        } catch (error) {
            console.log(error);
            toast.error(error || "Failed to load questions");
        } finally {
            setLoading(false);
        }
    };

    // Remove the createEditorState function as it's no longer needed

    const toggleQuestionExpand = (questionId) => {
        setExpandedQuestions(prev => ({
            ...prev,
            [questionId]: !prev[questionId]
        }));
    };

    const toggleEditMode = (questionId) => {
        // If entering edit mode, ensure we have the latest question data
        if (!editModes[questionId]) {
            getQuestionDetailToEdit(questionId);
        }
        
        setEditModes(prev => ({
            ...prev,
            [questionId]: !prev[questionId]
        }));
    };

    const getQuestionDetailToEdit = async (questionId) => {
        try {
            setLoading(true);
            const response = await getQuestionDetailData(questionId);
            
            // Update the question in the list with the latest data
            setQuestionListResult(prev => ({
                ...prev,
                questions: prev.questions.map(q => 
                    q._id === questionId ? response.question : q
                )
            }));
            
            // Update editor content with the latest question text
            setEditorContents(prev => ({
                ...prev,
                [questionId]: response.question.question || ''
            }));
            
            setFeedbackEditorContents(prev => ({
                ...prev,
                [questionId]: response.question.generalFeedback || ''
            }));

            setPreContentEditorContents(prev => ({
                ...prev,
                [questionId]: response.question.preContent || ''
            }));
        } catch (error) {
            toast.error("Failed to load question details");
        } finally {
            setLoading(false);
        }
    };

    const handleQuestionChange = (questionId, field, value) => {
        setQuestionListResult(prev => ({
            ...prev,
            questions: prev.questions.map(q => {
                if (q._id === questionId) {
                    if (field === 'options') {
                        const options = [...q.options];
                        options[value.index] = value.text;
                        return { ...q, options };
                    }
                    return { ...q, [field]: value };
                }
                return q;
            })
        }));
    };

    // Update editor content handlers for TinyMCE
    const handleEditorChange = (questionId, content) => {
        setEditorContents(prev => ({
            ...prev,
            [questionId]: content
        }));
        
        handleQuestionChange(questionId, 'question', content);
    };

    const handleFeedbackEditorChange = (questionId, content) => {
        setFeedbackEditorContents(prev => ({
            ...prev,
            [questionId]: content
        }));
        
        handleQuestionChange(questionId, 'generalFeedback', content);
    };

    const handlePreContentEditorChange = (questionId, content) => {
        setPreContentEditorContents(prev => ({
            ...prev,
            [questionId]: content
        }));
        
        handleQuestionChange(questionId, 'preContent', content);
    };
    
    // Handlers for new question editors
    const handleNewQuestionEditorChange = (content) => {
        setNewQuestionContent(content);
        handleNewQuestionChange('question', content);
    };

    const handleNewFeedbackEditorChange = (content) => {
        setNewFeedbackContent(content);
        handleNewQuestionChange('generalFeedback', content);
    };
    
    const handleNewPreContentEditorChange = (content) => {
        setNewPreContentContent(content);
        handleNewQuestionChange('preContent', content);
    };

    const saveQuestion = async (question) => {
        try {
            setLoading(true);
            const data = {
                question: question.question,
                options: question.options,
                correctOptionIndex: question.correctOptionIndex,
                questionGroup: question.questionGroup, // Changed from group to questionGroup
                point: question.point,
                generalFeedback: question.generalFeedback || '', // Include generalFeedback field
                preContent: question.preContent || '' // Include preContent in API call
            };
            
            const response = await updateQuestionData(question._id, data);
            toast.success("Question updated successfully");
            
            // Exit edit mode
            toggleEditMode(question._id);
        } catch (error) {
            toast.error(error.message || "Failed to update question");
        } finally {
            setLoading(false);
        }
    };

    const confirmDelete = (questionId) => {
        setDeleteConfirmation(questionId);
    };

    const cancelDelete = () => {
        setDeleteConfirmation(null);
    };

    const deleteQuestion = async () => {
        if (!deleteConfirmation) return;
        
        try {
            setLoading(true);
            await deleteQuestionDetailData(deleteConfirmation);
            
            // Remove the question from the list
            setQuestionListResult(prev => ({
                ...prev,
                questions: prev.questions.filter(q => q._id !== deleteConfirmation)
            }));
            
            toast.success("Question deleted successfully");
            setDeleteConfirmation(null);
        } catch (error) {
            toast.error(error.message || "Failed to delete question");
        } finally {
            setLoading(false);
        }
    };

    const backToCourse = () => {
        // Navigate back to the course page
        // Assuming the course page URL pattern is /course/:courseId
        if (courseInfo && courseInfo._id) {
            navigate(`/admin/show-course-details/${courseInfo._id}`);
        }
    };
    
    const backToQuiz = () => {
        // Navigate back to the quiz details page
        navigate(`/admin/quiz/${id}`);
    };

    const toggleAddForm = (groupId = null) => {
        // If closing the form or opening for a specific group
        const isClosing = showAddForm && (addingToGroup === groupId || groupId === null);
        
        if (isClosing) {
            // Reset form when closing
            setShowAddForm(false);
            setAddingToGroup(null);
            setCreatingGroup(false);
            setNewQuestion({
                question: '',
                questionGroup: '', // Changed from group to questionGroup
                point: '1',
                options: ['', '', '', ''],
                correctOptionIndex: '0',
                generalFeedback: '', // Reset generalFeedback
                preContent: '' // Reset preContent
            });
            setNewQuestionContent('');
            setNewFeedbackContent('');
            setNewPreContentContent('');
        } else {
            // Opening the form
            setShowAddForm(true);
            setAddingToGroup(groupId);
            
            // Pre-fill the questionGroup if adding to a specific group
            if (groupId && groupId !== "Ungrouped") {
                setNewQuestion({
                    ...newQuestion,
                    questionGroup: groupId // Store the group ID
                });
            } else {
                // Reset group field if not adding to a specific group
                setNewQuestion({
                    ...newQuestion,
                    questionGroup: ''
                });
            }
        }
    };

    const startCreatingGroup = () => {
        setCreatingGroup(true);
        setTempGroupName('');
    };

    const confirmGroupCreation = () => {
        if (!tempGroupName.trim()) {
            toast.error("Please enter a group name");
            return;
        }
        
        // Start adding a question to this new group
        setCreatingGroup(false);
        toggleAddForm(tempGroupName);
    };

    const handleNewQuestionChange = (field, value) => {
        // Don't allow changing the group if we're adding to a specific group
        if (field === 'questionGroup' && addingToGroup && addingToGroup !== "Ungrouped") {
            return;
        }
        
        if (field === 'options') {
            const updatedOptions = [...newQuestion.options];
            updatedOptions[value.index] = value.text;
            setNewQuestion({
                ...newQuestion,
                options: updatedOptions
            });
        } else {
            setNewQuestion({
                ...newQuestion,
                [field]: value
            });
        }
    };

    const submitNewQuestion = async () => {
        // Basic validation
        if (!newQuestion.question.trim() || newQuestion.options.some(opt => !opt.trim())) {
            toast.error("Please fill in all required fields");
            return;
        }

        try {
            setLoading(true);
            const data = {
                question: newQuestion.question,
                options: newQuestion.options,
                correctOptionIndex: newQuestion.correctOptionIndex,
                questionGroup: newQuestion.questionGroup, // Changed from group to questionGroup
                point: newQuestion.point,
                quiz: id,
                generalFeedback: newQuestion.generalFeedback || '', // Include generalFeedback field
                preContent: newQuestion.preContent || '' // Include preContent in API call
            };
            
            const response = await createQuestionData(data);
            toast.success("Question added successfully");
            
            // Close the form
            toggleAddForm();
            
            // Refetch the entire question list to ensure data consistency
            getQuestionList();
        } catch (error) {
            toast.error(error.message || "Failed to add question");
            setLoading(false);
        }
    };

    // New function for handling group creation
    const handleAddGroup = async (e) => {
        e.preventDefault();
        
        if (!newGroupName.trim()) {
            toast.error("Please enter a group name");
            return;
        }
        
        try {
            setLoading(true);
            const data = {
                name: newGroupName.trim(),
                quiz: id,
                generalContent: newGroupContent
            };
            
            await createQuestionGroupData(data);
            toast.success("Question group added successfully");
            
            // Reset form and refetch groups
            setNewGroupName("");
            setNewGroupContent("");
            setShowAddGroupForm(false);
            
            // Refetch the entire question list and groups
            await getQuestionList();
        } catch (error) {
            toast.error(error.message || "Failed to add question group");
        } finally {
            setLoading(false);
        }
    };

    // Toggle function for add group form
    const toggleAddGroupForm = () => {
        setShowAddGroupForm(!showAddGroupForm);
        if (showAddGroupForm) {
            setNewGroupName("");
            setNewGroupContent("");
        }
    };

    // Modified function to group questions by questionGroup ID from API
    const getGroupedQuestions = () => {
        const grouped = {};
        
        // Create entries for each question group from the API first
        if (questionGroups && questionGroups.length > 0) {
            questionGroups.forEach(group => {
                grouped[group._id] = [];
            });
        }
        
        // Create a special group for questions with no group
        
        // Assign questions to their respective groups
        if (questionListResult.questions) {
            questionListResult.questions.forEach(question => {
                if (question.questionGroup && grouped[question.questionGroup]) {
                    grouped[question.questionGroup].push(question);
                } else {
                }
            });
        }
        
        return grouped;
    };
    
    // Helper function to get group name from group ID
    const getGroupName = (groupId) => {
        if (groupId === "Ungrouped") return "Ungrouped";
        const group = questionGroups.find(g => g._id === groupId);
        return group ? group.name : "Unknown Group";
    };
    
    const toggleGroupExpand = (groupId) => {
        setExpandedGroups(prev => ({
            ...prev,
            [groupId]: !prev[groupId]
        }));
    };

    // Function to start editing a group
    const startEditingGroup = (groupId, currentName, currentContent) => {
        // Don't allow editing the "Ungrouped" pseudo-group
        if (groupId === "Ungrouped") return;
        
        setEditingGroupId(groupId);
        setEditGroupName(currentName);
        setEditGroupContent(currentContent || '');
        
        // Prevent the group from collapsing when clicking the edit button
        // event.stopPropagation();
    };
    
    // Function to cancel editing
    const cancelEditGroup = (event) => {
        setEditingGroupId(null);
        setEditGroupName('');
        setEditGroupContent('');
        event.stopPropagation();
    };
    
    // Function to save edited group
    const saveGroupEdit = async (event) => {
        event.stopPropagation();
        
        if (!editGroupName.trim()) {
            toast.error("Group name cannot be empty");
            return;
        }
        
        try {
            setLoading(true);
            const data = {
                name: editGroupName.trim(),
                quiz: id,
                generalContent: editGroupContent
            };
            
            await updateQuestionGroupData(editingGroupId, data);
            toast.success("Group updated successfully");
            
            // Reset edit state
            setEditingGroupId(null);
            setEditGroupName('');
            setEditGroupContent('');
            
            // Refresh the data
            await getQuestionList();
        } catch (error) {
            toast.error(error.message || "Failed to update group");
        } finally {
            setLoading(false);
        }
    };
    
    // Functions for group deletion
    const confirmGroupDelete = (groupId, event) => {
        // Don't allow deleting the "Ungrouped" pseudo-group
        if (groupId === "Ungrouped") return;
        
        setDeleteGroupId(groupId);
        event.stopPropagation();
    };
    
    const cancelGroupDelete = () => {
        setDeleteGroupId(null);
    };
    
    const deleteGroup = async () => {
        if (!deleteGroupId) return;
        
        try {
            setLoading(true);
            await deleteQuestionGroupDetailData(deleteGroupId);
            
            toast.success("Group deleted successfully");
            setDeleteGroupId(null);
            
            // Refresh the data
            await getQuestionList();
        } catch (error) {
            toast.error(error.message || "Failed to delete group");
        } finally {
            setLoading(false);
        }
    };

    // Helper function to get ordered question list across all groups
    const getOrderedQuestions = () => {
        const allQuestions = [];
        const grouped = getGroupedQuestions();
        
        // Process the groups in a consistent order to ensure stable numbering
        Object.keys(grouped).forEach(groupId => {
            allQuestions.push(...grouped[groupId]);
        });
        
        return allQuestions;
    };
    
    // Function to get the global index of a specific question
    const getQuestionGlobalIndex = (questionId) => {
        const allQuestions = getOrderedQuestions();
        return allQuestions.findIndex(q => q._id === questionId) + 1; // +1 for 1-based indexing
    };

    // Image upload handler function for editor
    const uploadImageCallBack = (file) => {
        // For now, we'll return a mock implementation that doesn't actually upload
        // but prevents the undefined component error
        return new Promise((resolve, reject) => {
            // Mock success response after a short delay
            setTimeout(() => {
                // Create a base64 version of the image for preview purposes only
                const reader = new FileReader();
                reader.readAsDataURL(file);
                reader.onload = () => {
                    resolve({ data: { link: reader.result } });
                };
                reader.onerror = error => reject(error);
            }, 500);
        });
    };
    
    // Fixed editor toolbar options - simplified and removed problematic features
    const editorToolbarOptions = {
        options: ['inline', 'blockType', 'fontSize', 'list', 'textAlign', 'colorPicker', 'link', 'emoji', 'image', 'remove', 'history'],
        inline: {
            options: ['bold', 'italic', 'underline', 'strikethrough'],
        },
        image: {
            uploadCallback: uploadImageCallBack,
            previewImage: true,
            inputAccept: 'image/gif,image/jpeg,image/jpg,image/png,image/svg',
            alt: { present: true, mandatory: false },
            defaultSize: {
                height: 'auto',
                width: 'auto',
            },
        }
    };
    
    // Simplified method to get toolbar with table button
    // const getToolbarWithTable = (editorState, onChange) => ({
    //     options: ['inline', 'blockType', 'fontSize', 'list', 'textAlign', 'colorPicker', 'link', 'emoji', 'image', 'remove', 'history'],
    //     inline: {
    //         options: ['bold', 'italic', 'underline', 'strikethrough'],
    //     },
    //     image: {
    //         uploadCallback: uploadImageCallBack,
    //         previewImage: true,
    //         inputAccept: 'image/gif,image/jpeg,image/jpg,image/png,image/svg',
    //         alt: { present: true, mandatory: false },
    //         defaultSize: {
    //             height: 'auto',
    //             width: 'auto',
    //         },
    //     },
    //     customButtons: [
    //         {
    //           title: 'Insert Table',
    //           icon: 'table',
    //           onClick: onChange, // This is where you add your table insertion function
    //         },
    //     ],
    //     toolbarCustomButtons: [
    //         <TableButton 
    //             editorState={editorState} 
    //             onChange={onChange} 
    //             key="table-button"
    //         />
    //     ]
    // });
    
    // Enhanced editor state change handler with table support

    // Keep the table CSS for when we can re-enable tables
    useEffect(() => {
        // Add custom CSS for tables (still useful even without the table plugin)
        const style = document.createElement('style');
        style.textContent = `
            .bordered-table {
                border-collapse: collapse;
                width: 100%;
                margin-bottom: 1rem;
            }
            .bordered-table th, .bordered-table td {
                border: 1px solid #dee2e6;
                padding: 8px;
                text-align: left;
            }
            .bordered-table th {
                background-color: #f8f9fa;
                font-weight: bold;
            }
            
            /* Make sure tables from HTML content display properly */
            table {
                border-collapse: collapse;
                width: 100%;
                margin-bottom: 1rem;
            }
            table th, table td {
                border: 1px solid #dee2e6;
                padding: 8px;
                text-align: left;
            }
        `;
        document.head.appendChild(style);
        
        return () => {
            document.head.removeChild(style);
        };
    }, []);

    console.log(courseInfo)
    return (
        <div>
            {/* Loader */}
            <Loader isShow={loading} />

            <section className="bg-gray-50 antialiased mt-10 pb-10">
                <div className="flex flex-row items-center justify-between p-4">
                    <h1 className="text-2xl font-medium">
                        {/* Updated breadcrumb navigation with three levels */}
                        {courseInfo && (
                            <span 
                                className="text-primary-700 cursor-pointer" 
                                onClick={backToCourse}
                            >
                                {courseInfo.title}
                            </span>
                        )}
                        
                        {courseInfo && quizInfo && (
                            <span className="inline-block">
                                <i className="fa fa-chevron-right text-lg ml-2 mr-2"></i>
                            </span>
                        )}
                        
                        {quizInfo && quizInfo.title && (
                            <span 
                                className="text-primary-700 cursor-pointer" 
                                onClick={backToQuiz}
                            >
                                {quizInfo.title}
                            </span>
                        )}
                        
                        {quizInfo && quizInfo.title && (
                            <span className="inline-block">
                                <i className="fa fa-chevron-right text-lg ml-2 mr-2"></i>
                                Manage Questions
                            </span>
                        )}
                    </h1>
                    <div className="flex flex-row items-center">
                        <h3 className="mr-8 text-lg font-medium">
                            Total: {questionListResult.questions ? questionListResult.questions.length : 0}
                        </h3>
                    </div>
                </div>

                <div className="mx-auto max-w-screen-xl px-4">
                    {/* Group panels - Updated to remove redundant horizontal lines */}
                    {Object.entries(getGroupedQuestions()).map(([groupId, questions]) => (
                        <div key={groupId} className="mb-6">
                            {/* Group Header */}
                            <div 
                                className="flex justify-between items-center p-4 cursor-pointer bg-gray-100 hover:bg-gray-200 rounded-t-lg border border-gray-300"
                                onClick={() => toggleGroupExpand(groupId)}
                            >
                                {editingGroupId === groupId ? (
                                    /* Edit Mode for Group Name */
                                    <div className="flex flex-col w-full" onClick={(e) => e.stopPropagation()}>
                                        <div className="flex items-center space-x-3 mb-3">
                                            <input
                                                type="text"
                                                value={editGroupName}
                                                onChange={(e) => setEditGroupName(e.target.value)}
                                                className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-60 p-2"
                                                placeholder="Group name"
                                                autoFocus
                                            />
                                        </div>
                                        
                                        <div className="mb-3 w-full">
                                            <label htmlFor="groupContent" className="block mb-2 text-sm font-medium text-gray-900">Group Content</label>
                                            <textarea
                                                id="groupContent"
                                                value={editGroupContent}
                                                onChange={(e) => setEditGroupContent(e.target.value)}
                                                className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
                                                placeholder="Enter general content for this group"
                                                rows="3"
                                            />
                                        </div>
                                        
                                        <div className="flex justify-end space-x-3">
                                            <button
                                                onClick={cancelEditGroup}
                                                className="text-gray-500 bg-gray-200 hover:bg-gray-300 focus:ring-4 focus:outline-none focus:ring-gray-300 font-medium rounded-lg text-sm px-4 py-2"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                onClick={saveGroupEdit}
                                                className="text-white bg-primary-700 hover:bg-primary-800 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-4 py-2"
                                            >
                                                Save
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    /* Normal Display Mode */
                                    <div className="flex-1">
                                        <h2 className="text-xl font-bold text-gray-800">
                                            {getGroupName(groupId)} <span className="text-sm font-normal text-gray-500">({questions.length} questions)</span>
                                        </h2>
                                        {groupId !== "Ungrouped" && questionGroups.find(g => g._id === groupId)?.generalContent && (
                                            <p className="text-sm text-gray-600 mt-1 line-clamp-1">
                                                {questionGroups.find(g => g._id === groupId)?.generalContent}
                                            </p>
                                        )}
                                    </div>
                                )}
                                
                                <div className="flex items-center">
                                    {/* Only show edit/delete buttons for actual groups (not Ungrouped) and when not editing */}
                                    {groupId !== "Ungrouped" && editingGroupId !== groupId && (
                                        <>
                                            <button
                                                onClick={(e) => {
                                                    const group = questionGroups.find(g => g._id === groupId);
                                                    startEditingGroup(
                                                        groupId, 
                                                        getGroupName(groupId), 
                                                        group?.generalContent || '',
                                                        e
                                                    )
                                                }}
                                                className="text-gray-600 hover:text-primary-700 mr-2"
                                                title="Edit Group"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path>
                                                </svg>
                                            </button>
                                            <button
                                                onClick={(e) => confirmGroupDelete(groupId, e)}
                                                className="text-gray-600 hover:text-red-700 mr-4"
                                                title="Delete Group"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                                                </svg>
                                            </button>
                                        </>
                                    )}
                                    
                                    {/* Expand/Collapse Icon - always visible */}
                                    <svg 
                                        className={`w-6 h-6 transition-transform ${expandedGroups[groupId] ? 'transform rotate-180' : ''}`} 
                                        fill="none" 
                                        stroke="currentColor" 
                                        viewBox="0 0 24 24" 
                                        xmlns="http://www.w3.org/2000/svg"
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                                    </svg>
                                </div>
                            </div>
                            
                            {/* Group Content */}
                            {expandedGroups[groupId] && (
                                <div className="border border-gray-300 border-t-0 rounded-b-lg p-4 bg-white">
                                    {/* Display generalContent at the top of the expanded group if it exists */}
                                    {/* {groupId !== "Ungrouped" && questionGroups.find(g => g._id === groupId)?.generalContent && (
                                        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                                            <p className="text-gray-700">
                                                {questionGroups.find(g => g._id === groupId)?.generalContent}
                                            </p>
                                        </div>
                                    )} */}
                                    
                                    {/* Display message when group has no questions */}
                                    {questions.length === 0 ? (
                                        <div className="text-center py-4">
                                            <p className="text-gray-500">No questions in this group yet.</p>
                                        </div>
                                    ) : (
                                        /* Render questions if there are any - Fixed border styling */
                                        questions.map((question, index) => (
                                            <div 
                                                key={question._id} 
                                                className={`bg-white shadow-sm rounded-lg overflow-hidden ${
                                                    index !== questions.length - 1 ? 'mb-4' : ''
                                                }`}
                                            >
                                                {/* Question Header - Updated styling */}
                                                <div 
                                                    className="flex justify-between items-center p-4 cursor-pointer bg-gray-50 hover:bg-gray-100"
                                                    onClick={() => toggleQuestionExpand(question._id)}
                                                >
                                                    <div className="flex-1">
                                                        {/* Added question number */}
                                                        <div className="flex items-center">
                                                            <span className="inline-flex items-center justify-center bg-primary-700 text-white rounded-full h-6 w-6 mr-2 text-sm font-medium">
                                                                {getQuestionGlobalIndex(question._id)}
                                                            </span>
                                                            <div 
                                                                className="font-medium text-gray-900"
                                                                dangerouslySetInnerHTML={{ __html: question.question }}
                                                            />
                                                        </div>
                                                        <div className="text-sm text-gray-500 ml-8">
                                                            Point: {question.point}
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center space-x-2">
                                                        <svg 
                                                            className={`w-5 h-5 transition-transform ${expandedQuestions[question._id] ? 'transform rotate-180' : ''}`} 
                                                            fill="none" 
                                                            stroke="currentColor" 
                                                            viewBox="0 0 24 24" 
                                                            xmlns="http://www.w3.org/2000/svg"
                                                        >
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                                                        </svg>
                                                    </div>
                                                </div>
                                                
                                                {/* Expanded Question Content - Updated border */}
                                                {expandedQuestions[question._id] && (
                                                    <div className="p-4 border-t border-gray-100">
                                                        {/* ...existing expanded question content... */}
                                                        {editModes[question._id] ? (
                                                            /* Edit Mode - Same code as before */
                                                            // ...existing edit mode code...
                                                            <div className="space-y-4">
                                                                {/* Add preContent Editor */}
                                                                <div>
                                                                    <label className="block mb-2 text-sm font-medium text-gray-900">Pre Content</label>
                                                                    <Editor
                                                                        init={{
                                                                            ...getTinyMCEConfig(200),
                                                                            selector: `textarea#${question._id}-precontent`,
                                                                        }}
                                                                        id={`${question._id}-precontent`}
                                                                        textareaName={`${question._id}-precontent`} 
                                                                        value={preContentEditorContents[question._id]}
                                                                        onEditorChange={(content) => handlePreContentEditorChange(question._id, content)}
                                                                    />
                                                                </div>

                                                                <div>
                                                                    <label className="block mb-2 text-sm font-medium text-gray-900">Question</label>
                                                                    <Editor
                                                                        init={{
                                                                            ...getTinyMCEConfig(300),
                                                                            selector: `textarea#${question._id}-question`,
                                                                        }}
                                                                        id={`${question._id}-question`}
                                                                        textareaName={`${question._id}-question`} 
                                                                        value={editorContents[question._id]}
                                                                        onEditorChange={(content) => handleEditorChange(question._id, content)}
                                                                    />
                                                                </div>

                                                                <div className="grid grid-cols-2 gap-4">
                                                                    <div>
                                                                        <label className="block mb-2 text-sm font-medium text-gray-900">Question Group</label>
                                                                        <select
                                                                            value={question.questionGroup || ''}
                                                                            onChange={(e) => handleQuestionChange(question._id, 'questionGroup', e.target.value)}
                                                                            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
                                                                        >
                                                                            <option value="">Ungrouped</option>
                                                                            {questionGroups.map((group) => (
                                                                                <option key={group._id} value={group._id}>
                                                                                    {group.name}
                                                                                </option>
                                                                            ))}
                                                                        </select>
                                                                    </div>
                                                                    <div>
                                                                        <label className="block mb-2 text-sm font-medium text-gray-900">Point</label>
                                                                        <select
                                                                            value={question.point || ''}
                                                                            onChange={(e) => handleQuestionChange(question._id, 'point', e.target.value)}
                                                                            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
                                                                        >
                                                                            {pointData.map((item) => (
                                                                                <option key={item.value} value={item.value}>
                                                                                    {item.label}
                                                                                </option>
                                                                            ))}
                                                                        </select>
                                                                    </div>
                                                                </div>

                                                                <div className="space-y-3">
                                                                    <h3 className="text-sm font-medium text-gray-900">Options</h3>
                                                                    {question.options && question.options.map((option, index) => (
                                                                        <div key={index} className="flex items-center space-x-2">
                                                                            <span className="font-medium">{options[index]}.</span>
                                                                            <input 
                                                                                type="text" 
                                                                                value={option} 
                                                                                onChange={(e) => handleQuestionChange(
                                                                                    question._id, 
                                                                                    'options', 
                                                                                    {index, text: e.target.value}
                                                                                )}
                                                                                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 flex-1 p-2.5"
                                                                            />
                                                                        </div>
                                                                    ))}
                                                                </div>

                                                                <div>
                                                                    <label className="block mb-2 text-sm font-medium text-gray-900">Correct Answer</label>
                                                                    <select
                                                                        value={question.correctOptionIndex || ''}
                                                                        onChange={(e) => handleQuestionChange(question._id, 'correctOptionIndex', e.target.value)}
                                                                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
                                                                    >
                                                                        {optionList.map((data) => (
                                                                            <option key={data.id} value={data.id}>
                                                                                {data.name}
                                                                            </option>
                                                                        ))}
                                                                    </select>
                                                                </div>
                                                                
                                                                {/* Moved General Feedback to the end */}
                                                                <div>
                                                                    <label className="block mb-2 text-sm font-medium text-gray-900">General Feedback</label>
                                                                    <Editor
                                                                        init={{
                                                                            ...getTinyMCEConfig(200),
                                                                            selector: `textarea#${question._id}-feedback`,
                                                                        }}
                                                                        id={`${question._id}-feedback`}
                                                                        textareaName={`${question._id}-feedback`} 
                                                                        value={feedbackEditorContents[question._id]}
                                                                        onEditorChange={(content) => handleFeedbackEditorChange(question._id, content)}
                                                                    />
                                                                </div>

                                                                <div className="flex justify-end space-x-3 pt-3">
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => toggleEditMode(question._id)}
                                                                        className="text-gray-500 bg-gray-200 hover:bg-gray-300 focus:ring-4 focus:outline-none focus:ring-gray-300 font-medium rounded-lg text-sm px-5 py-2.5"
                                                                    >
                                                                        Cancel
                                                                    </button>
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => saveQuestion(question)}
                                                                        className="text-white bg-primary-700 hover:bg-primary-800 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5"
                                                                    >
                                                                        Save Changes
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            /* View Mode - Same code as before */
                                                            // ...existing view mode code...
                                                            <div className="space-y-4">
                                                                {/* Display preContent if exists */}
                                                                {question.preContent && (
                                                                    <div>
                                                                        <h3 className="text-sm font-medium text-gray-500">Pre Content</h3>
                                                                        <div 
                                                                            className="mt-1 text-justify"
                                                                            dangerouslySetInnerHTML={{ __html: question.preContent }}
                                                                        />
                                                                    </div>
                                                                )}

                                                                <div>
                                                                    <h3 className="text-sm font-medium text-gray-500">Question</h3>
                                                                    <div 
                                                                        className="mt-1 text-justify"
                                                                        dangerouslySetInnerHTML={{ __html: question.question }}
                                                                    />
                                                                </div>

                                                                <div className="grid grid-cols-2 gap-4">
                                                                    <div>
                                                                        <h3 className="text-sm font-medium text-gray-500">Group</h3>
                                                                        <p className="mt-1">
                                                                            {question.questionGroup ? getGroupName(question.questionGroup) : "Ungrouped"}
                                                                        </p>
                                                                    </div>
                                                                    <div>
                                                                        <h3 className="text-sm font-medium text-gray-500">Point</h3>
                                                                        <p className="mt-1">{question.point}</p>
                                                                    </div>
                                                                </div>

                                                                <div>
                                                                    <h3 className="text-sm font-medium text-gray-500">Options</h3>
                                                                    <ol className="mt-1 space-y-1">
                                                                        {question.options && question.options.map((option, index) => (
                                                                            <li key={index} className={index.toString() === question.correctOptionIndex ? "font-bold text-green-600" : ""}>
                                                                                {options[index]}. {option} {index.toString() === question.correctOptionIndex && " (Correct)"}
                                                                            </li>
                                                                        ))}
                                                                    </ol>
                                                                </div>
                                                                
                                                                {/* Moved General Feedback to the end */}
                                                                {question.generalFeedback && (
                                                                    <div>
                                                                        <h3 className="text-sm font-medium text-gray-500">General Feedback</h3>
                                                                        <div 
                                                                            className="mt-1 text-justify"
                                                                            dangerouslySetInnerHTML={{ __html: question.generalFeedback }}
                                                                        />
                                                                    </div>
                                                                )}

                                                                <div className="flex justify-end space-x-3 pt-3">
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => confirmDelete(question._id)}
                                                                        className="text-white bg-red-600 hover:bg-red-700 focus:ring-4 focus:outline-none focus:ring-red-300 font-medium rounded-lg text-sm px-5 py-2.5"
                                                                    >
                                                                        Delete
                                                                    </button>
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => toggleEditMode(question._id)}
                                                                        className="text-white bg-primary-700 hover:bg-primary-800 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5"
                                                                    >
                                                                        Edit
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        ))
                                    )}
                                    
                                    {/* Add Question Button within Group */}
                                    <div className="mt-4">
                                        <button
                                            type="button"
                                            onClick={() => toggleAddForm(groupId)}
                                            className={`flex items-center justify-center w-full text-white ${
                                                showAddForm && addingToGroup === groupId
                                                    ? 'bg-gray-600 hover:bg-gray-700'
                                                    : 'bg-primary-700 hover:bg-primary-800'
                                            } focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5`}
                                        >
                                            {showAddForm && addingToGroup === groupId ? 'Cancel' : `Add Question to ${getGroupName(groupId)}`}
                                            {!(showAddForm && addingToGroup === groupId) && (
                                                <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                                                </svg>
                                            )}
                                        </button>
                                    </div>
                                    
                                    {/* Group-specific Add Question Form */}
                                    {showAddForm && addingToGroup === groupId && (
                                        <div className="bg-white shadow-md rounded-lg mt-4 p-6 border border-gray-200">
                                            <h2 className="text-lg font-medium text-gray-900 mb-4">Add Question to {getGroupName(groupId)}</h2>
                                            
                                            <div className="space-y-4">
                                                {/* Add preContent Editor */}
                                                <div>
                                                    <label className="block mb-2 text-sm font-medium text-gray-900">Pre Content</label>
                                                    <Editor
                                                        init={{
                                                            ...getTinyMCEConfig(200),
                                                            selector: `textarea#new-precontent`,
                                                        }}
                                                        id="new-precontent"
                                                        textareaName="new-precontent" 
                                                        value={newPreContentContent}
                                                        onEditorChange={handleNewPreContentEditorChange}
                                                    />
                                                </div>

                                                <div>
                                                    <label className="block mb-2 text-sm font-medium text-gray-900">Question</label>
                                                    <Editor
                                                        init={{
                                                            ...getTinyMCEConfig(300),
                                                            selector: `textarea#new-question`,
                                                        }}
                                                        id="new-question"
                                                        textareaName="new-question" 
                                                        value={newQuestionContent}
                                                        onEditorChange={handleNewQuestionEditorChange}
                                                    />
                                                </div>

                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="block mb-2 text-sm font-medium text-gray-900">Point</label>
                                                        <select
                                                            value={newQuestion.point}
                                                            onChange={(e) => handleNewQuestionChange('point', e.target.value)}
                                                            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
                                                        >
                                                            {pointData.map((item) => (
                                                                <option key={item.value} value={item.value}>
                                                                    {item.label}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                </div>

                                                <div className="space-y-3">
                                                    <h3 className="text-sm font-medium text-gray-900">Options</h3>
                                                    {newQuestion.options.map((option, index) => (
                                                        <div key={index} className="flex items-center space-x-2">
                                                            <span className="font-medium">{options[index]}.</span>
                                                            <input 
                                                                type="text" 
                                                                value={option} 
                                                                onChange={(e) => handleNewQuestionChange(
                                                                    'options', 
                                                                    {index, text: e.target.value}
                                                                )}
                                                                placeholder={`Enter option ${options[index]}`}
                                                                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 flex-1 p-2.5"
                                                            />
                                                        </div>
                                                    ))}
                                                </div>

                                                <div>
                                                    <label className="block mb-2 text-sm font-medium text-gray-900">Correct Answer</label>
                                                    <select
                                                        value={newQuestion.correctOptionIndex}
                                                        onChange={(e) => handleNewQuestionChange('correctOptionIndex', e.target.value)}
                                                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
                                                    >
                                                        {optionList.map((data) => (
                                                            <option key={data.id} value={data.id}>
                                                                {data.name}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>
                                                
                                                {/* Moved General Feedback to the end */}
                                                <div>
                                                    <label className="block mb-2 text-sm font-medium text-gray-900">General Feedback</label>
                                                    <Editor
                                                        init={{
                                                            ...getTinyMCEConfig(200),
                                                            selector: `textarea#new-feedback`,
                                                        }}
                                                        id="new-feedback"
                                                        textareaName="new-feedback" 
                                                        value={newFeedbackContent}
                                                        onEditorChange={handleNewFeedbackEditorChange}
                                                    />
                                                </div>

                                                <div className="flex justify-end pt-3">
                                                    <button
                                                        type="button"
                                                        onClick={submitNewQuestion}
                                                        className="text-white bg-primary-700 hover:bg-primary-800 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5"
                                                    >
                                                        Add Question
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}

                    {/* Message when there are no questions at all */}
                    {questionListResult.questions && 
                     questionListResult.questions.length === 0 && 
                     questionGroups.length === 0 && (
                        <div className="text-center py-10">
                            <p className="text-gray-500">No questions or question groups found.</p>
                        </div>
                    )}
                    
                    {/* Add New Group Button - replaces the global "Add New Question" button */}
                    <div className="mt-6">
                        <button
                            type="button"
                            onClick={toggleAddGroupForm}
                            className="flex items-center justify-center w-full text-white bg-primary-700 hover:bg-primary-800 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5"
                        >
                            {showAddGroupForm ? 'Cancel' : 'Add New Group'}
                            {!showAddGroupForm && (
                                <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                                </svg>
                            )}
                        </button>
                    </div>

                    {/* Add New Group Form */}
                    {showAddGroupForm && (
                        <div className="bg-white shadow-md rounded-lg mt-4 p-6">
                            <h2 className="text-lg font-medium text-gray-900 mb-4">Add New Question Group</h2>
                            
                            <form onSubmit={handleAddGroup} className="space-y-4">
                                <div>
                                    <label htmlFor="groupName" className="block mb-2 text-sm font-medium text-gray-900">Group Name</label>
                                    <input
                                        type="text"
                                        id="groupName"
                                        value={newGroupName}
                                        onChange={(e) => setNewGroupName(e.target.value)}
                                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
                                        placeholder="Enter group name"
                                        required
                                    />
                                </div>
                                
                                <div>
                                    <label htmlFor="newGroupContent" className="block mb-2 text-sm font-medium text-gray-900">Group Content</label>
                                    <textarea
                                        id="newGroupContent"
                                        value={newGroupContent}
                                        onChange={(e) => setNewGroupContent(e.target.value)}
                                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
                                        placeholder="Enter general content for this group"
                                        rows="3"
                                    />
                                </div>
                                
                                <div className="flex justify-end pt-3">
                                    <button
                                        type="submit"
                                        className="text-white bg-primary-700 hover:bg-primary-800 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5"
                                    >
                                        Add Group
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}
                    
                    {/* Remove the global Add Question form that was here previously */}
                </div>
            </section>


            {deleteConfirmation && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white rounded-lg max-w-md w-full p-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Confirm Deletion</h3>
                        <p className="text-gray-500 mb-6">Are you sure you want to delete this question? This action cannot be undone.</p>
                        <div className="flex justify-end space-x-3">
                            <button
                                type="button"
                                onClick={cancelDelete}
                                className="text-gray-500 bg-gray-200 hover:bg-gray-300 focus:ring-4 focus:outline-none focus:ring-gray-300 font-medium rounded-lg text-sm px-5 py-2.5"
                            >  Cancel</button>
                              
                     
                            <button
                                type="button"
                                onClick={deleteQuestion}
                                className="text-white bg-red-600 hover:bg-red-700 focus:ring-4 focus:outline-none focus:ring-red-300 font-medium rounded-lg text-sm px-5 py-2.5"
                            >     Delete</button>
                           
                  
                    </div>
                </div>
                </div>
            )}

            {/* New Group Delete Confirmation Modal */}
            {deleteGroupId && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white rounded-lg max-w-md w-full p-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Delete Group</h3>
                        <p className="text-gray-500 mb-6">
                            Are you sure you want to delete this group? All questions in this group will be moved to "Ungrouped".
                            This action cannot be undone.
                        </p>
                        <div className="flex justify-end space-x-3">
                            <button
                                type="button"
                                onClick={cancelGroupDelete}
                                className="text-gray-500 bg-gray-200 hover:bg-gray-300 focus:ring-4 focus:outline-none focus:ring-gray-300 font-medium rounded-lg text-sm px-5 py-2.5"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={deleteGroup}
                                className="text-white bg-red-600 hover:bg-red-700 focus:ring-4 focus:outline-none focus:ring-red-300 font-medium rounded-lg text-sm px-5 py-2.5"
                            >
                                Delete Group
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Toast notifications */}
            <ToastContainer />
        </div>
    );
};


export default ManageQuestions;
