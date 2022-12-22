import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from "react-router-dom";
import { useParams } from 'react-router';
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

export default function Category() {
    const [categories, setCategories] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [limit, setLimit] = useState(20);
    const [pageNumber, setPageNumber] = useState(0);
    const [totalCategories, setTotalCategories] = useState(0);
    let navigate = useNavigate();
    let params = useParams();

    const changePage = ({ selected }) => setPageNumber(selected);

    const getCategories = () => { 
        let type = "question"
        if(params.type === "forum-categories") type = "forum"
        let dataParams = {
            limit: limit,
            page: pageNumber * limit,
            type: type
        };

        // converting (json --> form-urlencoded)
        const data = Object.keys(dataParams)
        .map((key) => `${key}=${encodeURIComponent(dataParams[key])}`)
        .join('&');

        getAxiosInstance()
        .post("/admin/category-list-test", data,{
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
                }
            })
        .then((res) => {
            // Validating form
            setIsLoading(false);
            if(res.data.status === 'success'){
                // console.log(res.data.totalCount);
                setTotalCategories(res.data.totalCount);
                setCategories(res.data.result);
            }else if(res.data.status === "error") Toast.fire({ icon: 'error', title: res.data.message })
            else Toast.fire({ icon: 'error', title: "Cannot process request" })
        })
        .catch((err) => {
            setIsLoading(false);
            console.log(err);
        });
    }

    useEffect(() => {
        getCategories();
    }, [limit, pageNumber]);

    const deleteCategory = (id) => {
        Swal.fire({
            icon: 'warning',
            title: 'Are you sure?',
            html: '<h5>This category will be deleted?</h5>',
            showCancelButton: true,
            confirmButtonText: `Delete`,
            confirmButtonColor: '#D14343',
        }).then((result) => {
            if (result.isConfirmed) {
                setIsLoading(true);
                const dataParams = { id: id }
        
                // converting (json --> form-urlencoded)
                const data = Object.keys(dataParams)
                .map((key) => `${key}=${encodeURIComponent(dataParams[key])}`)
                .join('&');

                getAxiosInstance()
                .post("/admin/delete-category", data, {
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
                    })
                .then((res) => {
                    // Validating form
                    setIsLoading(false);
                    if(res.data.status === 'success'){
                        Toast.fire({ icon: 'success', title: "Successfully deleted category" })
                        getCategories();
                    }else{
                        console.log(res.data);
                        Toast.fire({ icon: 'error', title: "Unable to delete category" })
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

    return (
        <div>
            <div className="content-wrapper">
                <div className="content-header">
                    <div className="container-fluid">
                        <div className="row mb-2">
                            <div className="col-sm-6">
                                <h1 className="m-0">{params.type === "forum-categories" && "Forum "}Category</h1>
                            </div>
                            <div className="col-sm-6">
                                <ol className="breadcrumb float-sm-right">
                                    <li className="breadcrumb-item"><Link to="/">Dashboard</Link></li>
                                    <li className="breadcrumb-item active">{params.type === "forum-categories" && "Forum "}Category</li>
                                </ol>
                            </div>
                        </div>
                        <div className="row justify-content-center mt-5">
                            <div className="col-md-12">
                                <div className="card">
                                    <div className="card-header">
                                        <h3 className="card-title">{params.type === "forum-categories" && "Forum "}Category List</h3>
                                    </div>
                                    <div className="card-body">
                                        <table className="table table-bordered">
                                            <thead>
                                                <tr>
                                                    <th style={{width: 10}}>#</th>
                                                    <th>Image</th>
                                                    <th>{params.type === "forum-categories" && "Forum "}Category</th>
                                                    {params.type === "categories" && <th>Questions</th>}
                                                    {params.type === "categories" && <th>Answers</th>}
                                                    {params.type === "forum-categories" && <th>Question</th>}
                                                    <th style={{width: 40}}>Action</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {isLoading && <tr style={{ textAlign: 'center' }}>
                                                    <td colSpan={7}>Loading Questions ...</td>
                                                </tr>}
                                                {!isLoading && totalCategories === 0 && <tr style={{ textAlign: 'center' }}>
                                                    <td colSpan={7}>No Questions Found</td>
                                                </tr>}
                                                {categories?.map((category, i) => (
                                                    <tr key={i}>
                                                        <td>{i+1}.</td>
                                                        <td>
                                                            <img src={category.file} alt={category.name} style={{ maxHeight:50, maxWidth:50 }}/>
                                                        </td>
                                                        <td>{category.name}</td>
                                                        {params.type === "categories" && <th>
                                                            <button type="button" class="btn btn-primary btn-sm ml-1" onClick={() => navigate(`/categories/${category._id}/questions`)}>
                                                                Manage
                                                            </button>
                                                        </th>}
                                                        {params.type === "categories" && <th>
                                                            <button type="button" class="btn btn-primary btn-sm ml-1" onClick={() => navigate(`/categories/${category._id}/answers`)}>
                                                                Manage
                                                            </button>
                                                        </th>}
                                                        {params.type === "forum-categories" && <th>
                                                            <button type="button" class="btn btn-primary btn-sm ml-1" onClick={() => navigate(`/forum-categories/${category._id}/questions`)}>
                                                                Manage
                                                            </button>
                                                        </th>}
                                                        <td>
                                                            <div style={{ display: 'flex' }}>
                                                                {/* <button type="button" class="btn btn-primary btn-sm">
                                                                    <i className="fas fa-pen"></i>
                                                                </button> */}
                                                                <button type="button" class="btn btn-danger btn-sm ml-1" onClick={() => deleteCategory(category._id)}>
                                                                    <i className="fas fa-trash"></i>
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                    <div className="card-footer clearfix">
                                        {(totalCategories > limit)?
                                            <ReactPaginate 
                                                previousLabel={"«"}
                                                nextLabel={"»"}
                                                pageCount={Math.ceil(totalCategories / limit)}
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
