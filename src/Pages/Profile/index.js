import React, { useState, useEffect } from 'react'
import { Navigate, useParams } from 'react-router';
import { Link } from 'react-router-dom';
import ReactPaginate from 'react-paginate';
import Swal from 'sweetalert2'
import getAxiosInstance from './../../Utils/axios'
import { useAuth } from './../../Contexts/AuthContext'

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

export default function Profile() {
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [mobile, setMobile] = useState("");

    // const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [isLoading, setIsLoading] = useState(false);

    const auth = useAuth()

    const getUser = () => { 
        getAxiosInstance()
        .post("/admin/get-user", {},{
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
            })
            .then((res) => {
                // Validating form
                if(res.data.status === 'success'){
                    // console.log(res.data.data);
                    setFirstName(res.data.data.first_name)
                    setLastName(res.data.data.last_name)
                    setEmail(res.data.data.email)
                    setMobile(res.data.data.mobile)
                }else if(res.data.status === "error") Toast.fire({ icon: 'error', title: res.data.message })
                else Toast.fire({ icon: 'error', title: "Cannot process request" })
            })
            .catch((err) => {
                setIsLoading(false);
                console.log(err);
            });
    }

    useEffect(() => {
        getUser();
    }, []);

    function saveUser() {
        if(firstName === "") return Toast.fire({ icon: 'error', title: 'First name required' })
        if(lastName === "") return Toast.fire({ icon: 'error', title: 'Last name required' })
        let params = {
            first_name: firstName,
            last_name: lastName
        }

        const data = Object.keys(params)
            .map((key) => `${key}=${encodeURIComponent(params[key])}`)
            .join('&');

        getAxiosInstance()
        .post("/admin/update-user", data,{
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
            })
            .then((res) => {
                // Validating form
                if(res.data.status === 'success'){
                    // console.log(res.data.data);
                    Toast.fire({ icon: 'success', title: "User profile updated." })
                }else if(res.data.status === "error") Toast.fire({ icon: 'error', title: res.data.message })
                else Toast.fire({ icon: 'error', title: "Cannot process request." })
            })
            .catch((err) => {
                console.log(err);
            });
    }

    function updatePassword() {
        if(newPassword === "") return Toast.fire({ icon: 'error', title: 'Password required.' })
        if(confirmPassword === "") return Toast.fire({ icon: 'error', title: 'Confirm password required.' })
        if(newPassword !== confirmPassword) return Toast.fire({ icon: 'error', title: 'Confirm password does not match.' })

        let params = { password: newPassword }

        const data = Object.keys(params)
            .map((key) => `${key}=${encodeURIComponent(params[key])}`)
            .join('&');

        getAxiosInstance()
        .post("/admin/change-password", data,{
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
            })
            .then((res) => {
                // Validating form
                if(res.data.status === 'success'){
                    // console.log(res.data.data);
                    Toast.fire({ icon: 'success', title: "Password updated." })
                    localStorage.removeItem('dentist_user');
                    sessionStorage.removeItem('dentist_user');
                    auth.setUser(null);
                    window.location.reload()
                }else if(res.data.status === "error") Toast.fire({ icon: 'error', title: res.data.message })
                else Toast.fire({ icon: 'error', title: "Cannot process request." })
            })
            .catch((err) => {
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
                                <h1 className="m-0">Profile</h1>
                            </div>
                            <div className="col-sm-6">
                                <ol className="breadcrumb float-sm-right">
                                    <li className="breadcrumb-item"><Link to="/">Dashboard</Link></li>
                                    <li className="breadcrumb-item active">Profile</li>
                                </ol>
                            </div>
                        </div>
                        <div className="row justify-content-center mt-5">
                            <div className="col-md-12">
                                <div className="card">
                                    <div className="card-header">
                                        <h3 className="card-title">User Profile</h3>
                                    </div>
                                    <div className="card-body">
                                        <div className="row">
                                            <div className="col-md-6">
                                                <div className="form-group">
                                                    <label htmlFor="firstName">First Name</label>
                                                    <input type="text" className="form-control" value={firstName} onChange={(e) => setFirstName(e.target.value)} id="firstName" placeholder="First Name" />
                                                </div>
                                            </div>
                                            <div className="col-md-6">
                                                <div className="form-group">
                                                    <label htmlFor="lastName">Last Name</label>
                                                    <input type="text" className="form-control" value={lastName} onChange={(e) => setLastName(e.target.value)} id="lastName" placeholder="Last Name" />
                                                </div>
                                            </div>
                                            <div className="col-md-6">
                                                <div className="form-group">
                                                    <label htmlFor="email">Email</label>
                                                    <input type="email" className="form-control" value={email} id="email" placeholder="example@email.com" disabled />
                                                </div>
                                            </div>
                                            <div className="col-md-6">
                                                <div className="form-group">
                                                    <label htmlFor="mobile">Mobile</label>
                                                    <input type="number" className="form-control" value={mobile} id="mobile" placeholder="XXXXXXXXXXX" disabled />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="card-footer clearfix">
                                        <button type="button" className="btn btn-primary" onClick={(e) => saveUser()}>Save</button>
                                    </div>
                                </div>
                            </div>
                            <div className="col-md-12">
                                <div className="card">
                                    <div className="card-header">
                                        <h3 className="card-title">Change Password</h3>
                                    </div>
                                    <div className="card-body">
                                        {/* <div className="row">
                                            <div className="col-md-6">
                                                <div className="form-group">
                                                    <label htmlFor="currentPass">Current Password</label>
                                                    <input type="text" className="form-control" id="currentPass" placeholder="Current Password" />
                                                </div>
                                            </div>
                                        </div> */}
                                        <div className="row">
                                            <div className="col-md-6">
                                                <div className="form-group">
                                                    <label htmlFor="newPass">New Password</label>
                                                    <input type="password" className="form-control" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} id="newPass" placeholder="New Password" />
                                                </div>
                                            </div>
                                            <div className="col-md-6">
                                                <div className="form-group">
                                                    <label htmlFor="confirmPass">Confirm Password</label>
                                                    <input type="password" className="form-control" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} id="confirmPass" placeholder="Confirm Password" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="card-footer clearfix">
                                        <button type="button" className="btn btn-primary" onClick={(e) => updatePassword()}>Update</button>
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
