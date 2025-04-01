import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from '../pages/login';
import MainLayout from '../components/main_layout';
import AdminList from '../pages/admin_list';

import UserList from '../pages/user/user_list';
import AddUser from '../pages/user/add_user';
import ShowUserDetails from '../pages/user/show_user_details';
import UpdateUserDetails from '../pages/user/update_user_details';

import QuizList from '../pages/quiz/quiz_list';
import AddQuiz from '../pages/quiz/add_quiz';
import ShowQuizDetails from '../pages/quiz/show_quiz_details';
import UpdateQuiz from '../pages/quiz/update_quiz';

import QuestionList from '../pages/question/question_list';
import AddQuestion from '../pages/question/add_question';
import ShowQuestionDetails from '../pages/question/show_question_details';
import UpdateQuestion from '../pages/question/update_question';

import PostList from '../pages/post/post_list';
import AddPost from '../pages/post/add_post';
import ShowPostDetails from '../pages/post/show_post_details';
import UpdatePostDetails from '../pages/post/update_post_details';


// Import Feedback components
import FeedbackList from '../pages/feedback/FeedbackList';
import FeedbackForm from '../pages/feedback/FeedbackForm';
import FeedbackDetail from '../pages/feedback/FeedbackDetail';

// Import Category components
import CategoryManagement from '../pages/category/category_management';

// Import Product components
import ProductList from '../pages/product/product_list';
import AddProduct from '../pages/product/add_product';
import ShowProductDetails from '../pages/product/show_product_details';
import UpdateProductDetails from '../pages/product/update_product_details';

// Import Order components
import OrderList from '../pages/order/order_list';
import AddOrder from '../pages/order/add_order';
import ShowOrderDetails from '../pages/order/show_order_details';
import UpdateOrderDetails from '../pages/order/update_order_details';

function App() {
  return (
    <Router>
      <Routes>
        <Route path='/' element={<Login />} />
        <Route path='/admin' element={<MainLayout />} >
          <Route index element={<AdminList />} />

          <Route path='users' element={<UserList />} />
          <Route path='add-user' element={<AddUser />} />
          <Route path='show-user-details/:id' element={<ShowUserDetails />} />
          <Route path='update-user-details/:id' element={<UpdateUserDetails />} />

          <Route path='quizzes' element={<QuizList />} />
          <Route path='add-quiz/:id' element={<AddQuiz />} />
          <Route path='show-quiz-details/:id' element={<ShowQuizDetails />} />
          <Route path='update-quiz/:id' element={<UpdateQuiz />} />
          
          <Route path='questions/:id' element={<QuestionList />} />
          <Route path='add-question/:id' element={<AddQuestion />} />
          <Route path='show-question-details/:id' element={<ShowQuestionDetails />} />
          <Route path='update-question/:id' element={<UpdateQuestion />} />

          <Route path='posts' element={<PostList />} />
          <Route path='add-post' element={<AddPost />} />
          <Route path='show-post-details/:id' element={<ShowPostDetails />} />
          <Route path='update-post-details/:id' element={<UpdatePostDetails />} />

          {/* Product Routes */}
          <Route path='products' element={<ProductList />} />
          <Route path='add-product' element={<AddProduct />} />
          <Route path='show-product-details/:id' element={<ShowProductDetails />} />
          <Route path='update-product-details/:id' element={<UpdateProductDetails />} />
          
          {/* Category Routes */}
          <Route path='categories' element={<CategoryManagement />} />
          
          {/* Keep these routes for backward compatibility, but they can be removed once the new system is tested */}
          {/* <Route path='categories/add' element={<AddCategory />} />
          <Route path='show-category-details/:id' element={<ShowCategoryDetails />} />
          <Route path='update-category-details/:id' element={<UpdateCategoryDetails />} /> */}
          
          {/* Feedback Routes */}
          <Route path='feedback' element={<FeedbackList />} />
          <Route path='feedback/add' element={<FeedbackForm />} />
          <Route path='show-feedback-details/:id' element={<FeedbackDetail />} />
          <Route path='update-feedback/:id' element={<FeedbackForm />} />

          <Route path='order' element={<OrderList />} />
          <Route path='order/add' element={<AddOrder />} />
          <Route path='show-order-details/:id' element={<ShowOrderDetails />} />
          <Route path='update-order/:id' element={<UpdateOrderDetails />} />
          </Route>
      </Routes>
    </Router>
  );
}

export default App;
