import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from "react-router-dom";
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

export default function Customers() {
    const [customers, setCustomers] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [limit, setLimit] = useState(20);
    const [pageNumber, setPageNumber] = useState(0);
    const [totalCustomers, setTotalCustomers] = useState(0);
    let navigate = useNavigate();

    const changePage = ({ selected }) => setPageNumber(selected);

    const getCustomers = () => { 
        let params = {
            search: search,
            limit: limit,
            page: pageNumber * limit
        };

        // converting (json --> form-urlencoded)
        const data = Object.keys(params)
        .map((key) => `${key}=${encodeURIComponent(params[key])}`)
        .join('&');

        getAxiosInstance()
        .post("/admin/customer-list", data,{
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        })
        .then((res) => {
            // Validating form
            setIsLoading(false);
            if(res.data.status === 'success'){
                // console.log(res.data.totalCount);
                setTotalCustomers(res.data.totalCount);
                setCustomers(res.data.result);
            }else if(res.data.status === "error") Toast.fire({ icon: 'error', title: res.data.message })
            else Toast.fire({ icon: 'error', title: "Cannot process request" })
        })
        .catch((err) => {
            setIsLoading(false);
            console.log(err);
        });
    }

    useEffect(() => {
        getCustomers();
    }, [limit, pageNumber]);

    const deleteCustomer = (id) => {
        Swal.fire({
            icon: 'warning',
            title: 'Are you sure?',
            html: '<h5>This customer will be deleted?</h5>',
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
                .post("/admin/delete-customer", data, {
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
                    })
                .then((res) => {
                    // Validating form
                    setIsLoading(false);
                    if(res.data.status === 'success'){
                        Toast.fire({ icon: 'success', title: "Successfully deleted customer" })
                        getCustomers();
                    }else{
                        console.log(res.data);
                        Toast.fire({ icon: 'error', title: "Unable to delete customer" })
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
                                <h1 className="m-0">Customers</h1>
                            </div>
                            <div className="col-sm-6">
                                <ol className="breadcrumb float-sm-right">
                                    <li className="breadcrumb-item"><Link to="/">Dashboard</Link></li>
                                    <li className="breadcrumb-item active">Customers</li>
                                </ol>
                            </div>
                        </div>
                        <div className="row justify-content-center mt-5">
                            <div className="col-md-12">
                                <div className="card">
                                    <div className="card-header">
                                        <h3 className="card-title">Customer List</h3>
                                        <div class="card-tools">
                                            <div className="input-group input-group-sm" style={{width: 150}}>
                                                <input type="text" name="table_search" className="form-control float-right" placeholder="Search" onChange={(e) => setSearch(e.target.value)} />
                                                <div className="input-group-append">
                                                    <button type="submit" className="btn btn-default" onClick={() => {
                                                        setPageNumber(0)
                                                        getCustomers()
                                                    }}>
                                                        <i className="fas fa-search" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="card-body">
                                        <table className="table table-bordered">
                                            <thead>
                                                <tr>
                                                    <th style={{width: 10}}>#</th>
                                                    <th>Name</th>
                                                    <th>Email</th>
                                                    <th>Phone</th>
                                                    <th>Status</th>
                                                    <th>Results</th>
                                                    <th style={{width: 40}}>Action</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {customers?.map((customer, i) => (
                                                    <tr key={i}>
                                                        <td>{i+1}.</td>
                                                        <td>{customer.first_name} {customer.last_name}</td>
                                                        <td>{customer.email}</td>
                                                        <td>{customer.mobile}</td>
                                                        <td>{customer.active === 1 ? <span className="badge badge-success">Active</span> : <span className="badge badge-danger">Inactive</span> } </td>
                                                        <th>
                                                            <button type="button" class="btn btn-primary btn-sm ml-1" onClick={() => navigate(`/customers/${customer._id}/answers`)}>
                                                                Manage
                                                            </button>
                                                        </th>
                                                        <td>
                                                            <div style={{ display: 'flex' }}>
                                                                {/* <button type="button" class="btn btn-primary btn-sm">
                                                                    <i className="fas fa-pen"></i>
                                                                </button> */}
                                                                <button type="button" class="btn btn-danger btn-sm ml-1" onClick={() => deleteCustomer(customer._id)}>
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
                                        {(totalCustomers > limit)?
                                            <ReactPaginate 
                                                previousLabel={"«"}
                                                nextLabel={"»"}
                                                pageCount={Math.ceil(totalCustomers / limit)}
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
