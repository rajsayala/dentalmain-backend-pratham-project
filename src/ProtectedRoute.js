import { Navigate, Outlet } from 'react-router-dom';
import React from 'react';
import Header from './Components/Header';
import Menu from './Components/Menu';
import Footer from './Components/Footer';

export const ProtectedRoute = () => {
    const isLocalAuth = localStorage.getItem('dentist_user');
    const isSessionAuth = sessionStorage.getItem('dentist_user');
    if(isLocalAuth || isSessionAuth) {
        return (<>
            <Header />
            <Menu />
            <Outlet />
            <Footer />
        </>)
    }else{
        return <Navigate to="/sign-in"/>;
    }
}