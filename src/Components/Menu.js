import React from 'react'
import { useAuth } from './../Contexts/AuthContext'

export default function Menu() {
    const auth = useAuth()
    return (
        <>
            <aside className="main-sidebar sidebar-dark-primary elevation-4">
                <a href="#" className="brand-link">
                    <img src="dist/img/AdminLTELogo.png" alt="AdminLTE Logo" className="brand-image img-circle elevation-3" style={{opacity: '.8'}} />
                    <span className="brand-text font-weight-light">AdminLTE 3</span>
                </a>
                <div className="sidebar">
                    <div className="user-panel mt-3 pb-3 mb-3 d-flex">
                        <div className="image">
                            <img src="dist/img/user2-160x160.jpg" className="img-circle elevation-2" alt="User Image" />
                        </div>
                        <div className="info">
                            <a href="#" className="d-block">Alexander Pierce</a>
                        </div>
                    </div>
                    <div className="form-inline">
                        <div className="input-group" data-widget="sidebar-search">
                            <input className="form-control form-control-sidebar" type="search" placeholder="Search" aria-label="Search" />
                            <div className="input-group-append">
                                <button className="btn btn-sidebar">
                                    <i className="fas fa-search fa-fw" />
                                </button>
                            </div>
                        </div>
                    </div>
                    <nav className="mt-2">
                        <ul className="nav nav-pills nav-sidebar flex-column" data-widget="treeview" role="menu" data-accordion="false">
                            <li className="nav-item">
                                <a href="/" className={`nav-link ${window.location.pathname === '/' && 'active'}`}>
                                    <i className="nav-icon fas fa-th" />
                                    <p>
                                        Dashboard
                                    </p>
                                </a>
                            </li>
                            <li className="nav-item">
                                <a href="#" className={`nav-link ${window.location.pathname.indexOf('/categories') >= 0  && 'active'}`}>
                                    <i className="nav-icon fas fa-th-list" />
                                    <p>
                                        Category
                                        <i className="fas fa-angle-left right" />
                                    </p>
                                </a>
                                <ul className="nav nav-treeview">
                                    <li className="nav-item">
                                        <a href="/categories/add" className="nav-link">
                                            <i className="far fa-circle nav-icon" />
                                            <p>Add Category</p>
                                        </a>
                                    </li>
                                    <li className="nav-item">
                                        <a href="/categories/view" className="nav-link">
                                            <i className="far fa-circle nav-icon" />
                                            <p>View Category</p>
                                        </a>
                                    </li>
                                </ul>
                            </li>

                            <li className="nav-item">
                                <a href="#" className={`nav-link ${window.location.pathname.indexOf('/forum-categories') >= 0  && 'active'}`}>
                                    <i className="nav-icon fas fa-copy" />
                                    <p>
                                        Forum Category
                                        <i className="fas fa-angle-left right" />
                                    </p>
                                </a>
                                <ul className="nav nav-treeview">
                                    <li className="nav-item">
                                        <a href="/forum-categories/add" className="nav-link">
                                            <i className="far fa-circle nav-icon" />
                                            <p>Add Category</p>
                                        </a>
                                    </li>
                                    <li className="nav-item">
                                        <a href="/forum-categories/view" className="nav-link">
                                            <i className="far fa-circle nav-icon" />
                                            <p>View Category</p>
                                        </a>
                                    </li>
                                    <li className="nav-item">
                                        <a href="/forum-categories/unapproved-questions" className="nav-link">
                                            <i className="far fa-circle nav-icon" />
                                            <p>Unapproved Questions</p>
                                        </a>
                                    </li>
                                    <li className="nav-item">
                                        <a href="/forum-categories/unapproved-replies" className="nav-link">
                                            <i className="far fa-circle nav-icon" />
                                            <p>Unapproved Replies</p>
                                        </a>
                                    </li>
                                </ul>
                            </li>

                            <li className="nav-item active">
                                <a href="/customers" className={`nav-link ${window.location.pathname.indexOf('/customers') >= 0  && 'active'}`}>
                                    <i className="nav-icon fas fa-users" />
                                    <p>
                                        Customers
                                    </p>
                                </a>
                            </li>
                            
                            
                            <li className="nav-header">SETTINGS</li>
                            <li className="nav-item">
                                <a href="/profile" className="nav-link">
                                    <i className="nav-icon fas fa-user" />
                                    <p>Profile</p>
                                </a>
                            </li>
                            <li className="nav-item">
                                <a href="#" className="nav-link" onClick={(e) => {
                                    e.stopPropagation();
                                    localStorage.removeItem('dentist_user');
                                    sessionStorage.removeItem('dentist_user');
                                    auth.setUser(null);
                                    window.location.reload()
                                }}>
                                    <i className="nav-icon fas fa-sign-out-alt" />
                                    <p>Log Out</p>
                                </a>
                            </li>
                            
                            {/* <li className="nav-header">QUESTIONS</li>
                            <li className="nav-item">
                                <a href="#" className="nav-link">
                                    <i className="fas fa-circle nav-icon" />
                                    <p>Question</p>
                                </a>
                            </li> */}
                        </ul>
                    </nav>
                </div>
            </aside>
        </>
    )
}
