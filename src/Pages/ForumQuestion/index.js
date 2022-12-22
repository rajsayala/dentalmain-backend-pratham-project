import React, { useState, useEffect } from 'react'
import { Navigate, useParams } from 'react-router';
import { Link, useNavigate } from 'react-router-dom';
import ReactPaginate from 'react-paginate';
import Swal from 'sweetalert2'
import getAxiosInstance from './../../Utils/axios'

const Toast = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    didOpen: (toast) => {
        toast.addEventListener('mouseenter', Swal.stopTimer)
        toast.addEventListener('mouseleave', Swal.resumeTimer)
    }
})

export default function ForumQuestion() {
    const [questions, setQuestions] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [limit, setLimit] = useState(20);
    const [pageNumber, setPageNumber] = useState(0);
    const [totalQuestions, setTotalQuestions] = useState(0);

    let params = useParams();
    let navigate = useNavigate();

    const getQuestions = () => { 
        let jsonData = {
            category: params.categoryId,
            limit: limit,
            page: pageNumber * limit
        };
        // converting (json --> form-urlencoded)
        const data = Object.keys(jsonData)
        .map((key) => `${key}=${encodeURIComponent(jsonData[key])}`)
        .join('&');

        getAxiosInstance()
        .post("/admin/forum-question-list", data,{
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
            })
            .then((res) => {
                // Validating form
                setIsLoading(false);
                if(res.data.status === 'success'){
                    // console.log(res.data.totalCount);
                    setTotalQuestions(res.data.totalCount);
                    setQuestions(res.data.result);
                }else if(res.data.status === "error") Toast.fire({ icon: 'error', title: res.data.message })
                else Toast.fire({ icon: 'error', title: "Cannot process request" })
            })
            .catch((err) => {
                setIsLoading(false);
                console.log(err);
            });
    }

    useEffect(() => {
        if(params?.categoryId) getQuestions();
    }, [params.categoryId, limit, pageNumber]);

    const changePage = ({ selected }) => setPageNumber(selected);

    const deleteQuestion = (id) => {
        Swal.fire({
            icon: 'warning',
            title: 'Are you sure?',
            html: '<h5>This question will be deleted?</h5>',
            showCancelButton: true,
            confirmButtonText: `Delete`,
            confirmButtonColor: '#D14343',
        }).then((result) => {
            if (result.isConfirmed) {
                setIsLoading(true);

                const params = { id: id }
        
                // converting (json --> form-urlencoded)
                const data = Object.keys(params)
                .map((key) => `${key}=${encodeURIComponent(params[key])}`)
                .join('&');

                getAxiosInstance()
                .post("/admin/delete-forum-question", data, {
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
                    })
                .then((res) => {
                    // Validating form
                    setIsLoading(false);
                    if(res.data.status === 'success'){
                        Toast.fire({ icon: 'success', title: "Successfully deleted question" })
                        getQuestions();
                    }else{
                        console.log(res.data);
                        Toast.fire({ icon: 'error', title: "Unable to delete question" })
                    }
                })
                .catch((err) => {
                    Toast.fire({ icon: 'error', title: "Unexpected Error" })
                    setIsLoading(false);
                    console.log(err);
                });
            }
        })
    }

    const approveQuestion = (id) => {
        const params = { id: id }
        
        // converting (json --> form-urlencoded)
        const data = Object.keys(params)
        .map((key) => `${key}=${encodeURIComponent(params[key])}`)
        .join('&');

        getAxiosInstance()
        .post("/admin/approve-forum-question", data, {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
            })
        .then((res) => {
            // Validating form
            setIsLoading(false);
            if(res.data.status === 'success'){
                Toast.fire({ icon: 'success', title: "Successfully approved question" })
                getQuestions();
            }else{
                console.log(res.data);
                Toast.fire({ icon: 'error', title: "Unable to approve question" })
            }
        })
        .catch((err) => {
            Toast.fire({ icon: 'error', title: "Unexpected Error" })
            setIsLoading(false);
            console.log(err);
        });
    }

    return (
        <div>
            <div className="content-wrapper">
                <div className="content-header">
                    <div className="container-fluid">
                        <div className="row mb-2">
                            <div className="col-sm-6">
                                <h1 className="m-0">Forum Question</h1>
                            </div>
                            <div className="col-sm-6">
                                <ol className="breadcrumb float-sm-right">
                                    <li className="breadcrumb-item"><Link to="/">Dashboard</Link></li>
                                    <li className="breadcrumb-item"><Link to="/forum-categories/view">Forum Category</Link></li>
                                    <li className="breadcrumb-item active">Forum Questions</li>
                                </ol>
                            </div>
                        </div>
                        <div className="row justify-content-center mt-5">
                            <div className="col-md-12">
                                <div className="card">
                                    <div className="card-header">
                                        <h3 className="card-title">Forum Question List</h3>
                                    </div>
                                    <div className="card-body">
                                        <table className="table table-bordered">
                                            <thead>
                                                <tr>
                                                    <th style={{width: 10}}>#</th>
                                                    <th>Customer</th>
                                                    <th>Question</th>
                                                    <th>Answers</th>
                                                    <th style={{width: 40}}>Action</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {isLoading && <tr style={{ textAlign: 'center' }}>
                                                    <td colSpan={5}>Loading Forum Questions ...</td>
                                                </tr>}
                                                {!isLoading && totalQuestions === 0 && <tr style={{ textAlign: 'center' }}>
                                                    <td colSpan={5}>No Forum Questions Found</td>
                                                </tr>}
                                                {questions?.map((question, i) => (
                                                    <tr key={i}>
                                                        <td>{i+1}.</td>
                                                        <td>{question.user?.first_name} {question.user?.last_name}</td>
                                                        <td>{question.question}</td>
                                                        <td>
                                                            {question.active === 1 ? <button type="button" class="btn btn-primary btn-sm ml-1" onClick={() => navigate(`/forum-categories/${params.categoryId}/questions/${question._id}`)}>
                                                                Manage
                                                            </button>:<span className="badge badge-danger">Inactive</span>}
                                                        </td>
                                                        <td>
                                                            {question.active === 0 && <div style={{ display: 'flex' }}>
                                                                <button type="button" class="btn btn-success btn-sm ml-1" onClick={() => approveQuestion(question._id)}>
                                                                    <i className="fas fa-thumbs-up"></i>
                                                                </button>
                                                                <button type="button" class="btn btn-danger btn-sm ml-1" onClick={() => deleteQuestion(question._id)}>
                                                                    <i className="fas fa-thumbs-down"></i>
                                                                </button>
                                                            </div>}
                                                            {question.active === 1 && <div style={{ display: 'flex' }}>
                                                                <button type="button" class="btn btn-danger btn-sm ml-1" onClick={() => deleteQuestion(question._id)}>
                                                                    <i className="fas fa-trash"></i>
                                                                </button>
                                                            </div>}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                    <div className="card-footer clearfix">
                                        {(totalQuestions > limit)?
                                            <ReactPaginate 
                                                previousLabel={"«"}
                                                nextLabel={"»"}
                                                pageCount={Math.ceil(totalQuestions / limit)}
                                                onPageChange={changePage}
                                                containerClassName={"pagination pagination-sm m-0 float-right"}
                                                pageClassName={"page-item"}
                                                pageLinkClassName={"page-link"}
                                                // previousClassName={"previous"}
                                                previousLinkClassName={"page-link"}
                                                // nextClassName={"next"}
                                                nextLinkClassName={"page-link"}
                                                disabledClassName={"disabled"}
                                                activeClassName={"active"}
                                            />
                                        :null}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
