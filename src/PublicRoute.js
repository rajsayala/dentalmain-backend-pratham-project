import React from "react";
import { Route, Routes } from "react-router-dom";

import { ProtectedRoute } from "./ProtectedRoute";

import SignIn from './Pages/SignIn';
import Dashboard from "./Pages/Dashboard";
import Category from "./Pages/Category";
import AddCategory from "./Pages/Category/Add";
import Question from "./Pages/Question";
import Customers from "./Pages/Customers";
import Profile from "./Pages/Profile";
import Answers from "./Pages/Answers";
import ForumQuestion from "./Pages/ForumQuestion";
import ForumReply from "./Pages/ForumReply";
import UnapprovedQuestion from "./Pages/ForumQuestion/UnapprovedQuestion";
import UnapprovedAnswer from "./Pages/ForumReply/UnapprovedAnswer";

export default function PublicRoute() {
  return (
    <div className="wrapper" style={{ overflowX: "hidden" }}>
        <Routes>
            <Route path='/sign-in' element={<SignIn/>} />
            <Route element={<ProtectedRoute/>}>
                <Route path='/' element={<Dashboard/>} />

                <Route path='/:type/view' element={<Category />} />
                <Route path='/:type/add' element={<AddCategory />} />
                <Route path='/categories/:categoryId/questions' element={<Question />} />
                <Route path='/categories/:categoryId/answers' element={<Answers />} />
                <Route path='/forum-categories/:categoryId/questions' element={<ForumQuestion />} />
                <Route path='/forum-categories/:categoryId/questions/:questionId' element={<ForumReply />} />
                <Route path='/forum-categories/unapproved-questions' element={<UnapprovedQuestion />} />
                <Route path='/forum-categories/unapproved-replies' element={<UnapprovedAnswer />} />

                <Route path='/customers' element={<Customers />} />
                <Route path='/customers/:userId/answers' element={<Answers />} />

                <Route path='/profile' element={<Profile />} />
            </Route>
            <Route path='/*' element={<div>
                Not Found
            </div>} />
        </Routes>
    </div>
  );
}
