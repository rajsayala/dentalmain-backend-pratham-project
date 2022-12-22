import React, { useState, useEffect } from 'react'
import { Navigate, useParams } from 'react-router';
import { Link } from 'react-router-dom';
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

export default function UnapprovedAnswer() {
    const [answers, setAnswers] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [limit, setLimit] = useState(20);
    const [pageNumber, setPageNumber] = useState(0);
    const [totalAnswers, setTotalAnswers] = useState(0);

    const getAnswers = () => { 
        let jsonData = {
            inactive: true,
            limit: limit,
            page: pageNumber * limit
        };
        // converting (json --> form-urlencoded)
        const data = Object.keys(jsonData)
        .map((key) => `${key}=${encodeURIComponent(jsonData[key])}`)
        .join('&');

        getAxiosInstance()
        .post("/admin/forum-reply-list", data,{
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
            })
            .then((res) => {
                // Validating form
                setIsLoading(false);
                if(res.data.status === 'success'){
                    // console.log(res.data.totalCount);
                    setTotalAnswers(res.data.totalCount);
                    setAnswers(res.data.result);
                }else if(res.data.status === "error") Toast.fire({ icon: 'error', title: res.data.message })
                else Toast.fire({ icon: 'error', title: "Cannot process request" })
            })
            .catch((err) => {
                setIsLoading(false);
                console.log(err);
            });
    }

    useEffect(() => {
        getAnswers();
    }, [limit, pageNumber]);

    const changePage = ({ selected }) => setPageNumber(selected);

    const deleteReply = (id) => {
        Swal.fire({
            icon: 'warning',
            title: 'Are you sure?',
            html: '<h5>This reply will be deleted?</h5>',
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
                .post("/admin/delete-forum-reply", data, {
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
                    })
                .then((res) => {
                    // Validating form
                    setIsLoading(false);
                    if(res.data.status === 'success'){
                        Toast.fire({ icon: 'success', title: "Successfully deleted reply" })
                        getAnswers();
                    }else{
                        console.log(res.data);
                        Toast.fire({ icon: 'error', title: "Unable to delete reply" })
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

    const approveReply = (id) => {
        const params = { id: id }
        
        // converting (json --> form-urlencoded)
        const data = Object.keys(params)
        .map((key) => `${key}=${encodeURIComponent(params[key])}`)
        .join('&');

        getAxiosInstance()
        .post("/admin/approve-forum-reply", data, {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
            })
        .then((res) => {
            // Validating form
            setIsLoading(false);
            if(res.data.status === 'success'){
                Toast.fire({ icon: 'success', title: "Successfully approved reply" })
                getAnswers();
            }else{
                console.log(res.data);
                Toast.fire({ icon: 'error', title: "Unable to approve reply" })
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
                                <h1 className="m-0">Unapproved Answer</h1>
                            </div>
                            <div className="col-sm-6">
                                <ol className="breadcrumb float-sm-right">
                                    <li className="breadcrumb-item"><Link to="/">Dashboard</Link></li>
                                    <li className="breadcrumb-item"><Link to="/forum-categorie/view">Forum Category</Link></li>
                                    <li className="breadcrumb-item active">Unapproved Replies</li>
                                </ol>
                            </div>
                        </div>
                        <div className="row justify-content-center mt-5">
                            <div className="col-md-12">
                                <div className="card">
                                    <div className="card-header">
                                        <h3 className="card-title">Unapproved Reply List</h3>
                                        {/* <div class="card-tools">
                                        </div> */}
                                    </div>
                                    <div className="card-body">
                                        <table className="table table-bordered">
                                            <thead>
                                                <tr>
                                                    <th style={{width: 10}}>#</th>
                                                    <th>Category</th>
                                                    <th>Customer</th>
                                                    <th>Question</th>
                                                    <th>Answers</th>
                                                    <th style={{width: 40}}>Action</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {isLoading && <tr style={{ textAlign: 'center' }}>
                                                    <td colSpan={7}>Loading Answers ...</td>
                                                </tr>}
                                                {!isLoading && totalAnswers === 0 && <tr style={{ textAlign: 'center' }}>
                                                    <td colSpan={7}>No Answers Found</td>
                                                </tr>}
                                                {answers?.map((answer, i) => (
                                                    <tr key={i}>
                                                        <td>{i+1}.</td>
                                                        <td>{answer.user?.first_name} {answer.user?.last_name}</td>
                                                        <td>{answer.category?.name}</td>
                                                        <td>{answer.question?.question}</td>
                                                        <td>{answer.answers}</td>
                                                        <td>
                                                            {answer.active === 0 && <div style={{ display: 'flex' }}>
                                                                <button type="button" class="btn btn-success btn-sm ml-1" onClick={() => approveReply(answer._id)}>
                                                                    <i className="fas fa-thumbs-up"></i>
                                                                </button>
                                                                <button type="button" class="btn btn-danger btn-sm ml-1" onClick={() => deleteReply(answer._id)}>
                                                                    <i className="fas fa-thumbs-down"></i>
                                                                </button>
                                                            </div>}
                                                            {answer.active === 1 && <div style={{ display: 'flex' }}>
                                                                <button type="button" class="btn btn-danger btn-sm ml-1" onClick={() => deleteReply(answer._id)}>
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
                                        {(totalAnswers > limit)?
                                            <ReactPaginate 
                                                previousLabel={"«"}
                                                nextLabel={"»"}
                                                pageCount={Math.ceil(totalAnswers / limit)}
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
