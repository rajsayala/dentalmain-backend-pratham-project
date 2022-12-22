import React, { useState, useEffect } from 'react'
import getAxiosInstance from './../Utils/axios'

export default function Dashboard() {
    const [customers, setCustomers] = useState(0);
    const [categories, setCategories] = useState(0);
    const [forumsCategory, setForumsCategory] = useState(0);
    const [forumQuestions, setForumQuestions] = useState(0);
    const [forumReplies, setForumReplies] = useState(0);
    const [unapprovedForumQuestions, setUnapprovedForumQuestions] = useState(0);
    const [unapprovedForumReplies, setUnapprovedForumReplies] = useState(0);

    useEffect(() => getData(), []);

    const getData = () => { 
        getAxiosInstance()
        .post("/admin/dashboard", {},{
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
            })
            .then((res) => {
                // Validating form
                if(res.data.status === 'success'){
                    console.log(res.data);
                    setCustomers(res.data.customer)
                    setCategories(res.data.category)
                    setForumsCategory(res.data.forum)
                    setForumQuestions(res.data.forumQuestions)
                    setForumReplies(res.data.forumReplies)
                    setUnapprovedForumQuestions(res.data.unapprovedForumQuestions)
                    setUnapprovedForumReplies(res.data.unapprovedForumReplies)
                }else if(res.data.status === "error") console.log(res.data.message)
                else console.log("ERR")
            })
            .catch((e) => console.log(e))
    }

    return (
        <div>
            <div className="content-wrapper">
                <div className="content-header">
                    <div className="container-fluid">
                        <div className="row mb-2">
                            <div className="col-sm-6">
                                <h1 className="m-0">Dashboard</h1>
                            </div>
                            <div className="col-sm-6">
                                <ol className="breadcrumb float-sm-right">
                                    <li className="breadcrumb-item"><a href="#">Home</a></li>
                                    <li className="breadcrumb-item active">Dashboard v1</li>
                                </ol>
                            </div>
                        </div>
                        <div className="row justify-content-center mt-5">
                            <div className="col-md-12">
                                <div className="card">
                                    <div className="row">
                                        <div className="col-12 col-sm-6 col-md-3">
                                            <div className="info-box">
                                                <span className="info-box-icon bg-info elevation-1"><i className="fas fa-th-list" /></span>
                                                <div className="info-box-content">
                                                    <span className="info-box-text">Categories</span>
                                                    <span className="info-box-number">{categories}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-12 col-sm-6 col-md-3">
                                            <div className="info-box">
                                                <span className="info-box-icon bg-info elevation-1"><i className="fas fa-th-list" /></span>
                                                <div className="info-box-content">
                                                    <span className="info-box-text">Forum Categories</span>
                                                    <span className="info-box-number">{forumsCategory}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-12 col-sm-6 col-md-3">
                                            <div className="info-box mb-3">
                                                <span className="info-box-icon bg-warning elevation-1"><i className="fas fa-users" /></span>
                                                <div className="info-box-content">
                                                    <span className="info-box-text">Customers</span>
                                                    <span className="info-box-number">{customers}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-12 col-sm-6 col-md-3">
                                            <div className="info-box mb-3">
                                                <span className="info-box-icon bg-success elevation-1"><i className="fas fa-question-circle" /></span>
                                                <div className="info-box-content">
                                                    <span className="info-box-text">Forum Questions</span>
                                                    <span className="info-box-number">{forumQuestions}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-12 col-sm-6 col-md-3">
                                            <div className="info-box mb-3">
                                                <span className="info-box-icon bg-success elevation-1"><i className="fas fa-reply" /></span>
                                                <div className="info-box-content">
                                                    <span className="info-box-text">Forum Replies</span>
                                                    <span className="info-box-number">{forumReplies}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-12 col-sm-6 col-md-3">
                                            <div className="info-box mb-3">
                                                <span className="info-box-icon bg-danger elevation-1"><i className="fas fa-thumbs-down" /></span>
                                                <div className="info-box-content">
                                                    <span className="info-box-text">Unapproved Questions</span>
                                                    <span className="info-box-number">{unapprovedForumQuestions}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-12 col-sm-6 col-md-3">
                                            <div className="info-box mb-3">
                                                <span className="info-box-icon bg-danger elevation-1"><i className="fas fa-frown" /></span>
                                                <div className="info-box-content">
                                                    <span className="info-box-text">Unapproved Replies</span>
                                                    <span className="info-box-number">{unapprovedForumReplies}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
