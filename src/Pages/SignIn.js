import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'
import Swal from 'sweetalert2'
import axios from 'axios';
import { BASE_URL } from './../env'

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

export default function SignIn() {
    const [Email, setEmail] = useState("")
    const [Password, setPassword] = useState("")
    const [RememberMe, setRememberMe] = useState(false)
    const [IsLoading, setIsLoading] = useState(false)
    let navigate = useNavigate();

    useEffect(() => {
        // Check if is Logged in
        let isLocalAuth = localStorage.getItem('dentist_user')
        let isSessionAuth = sessionStorage.getItem('dentist_user');

        if(isLocalAuth || isSessionAuth) navigate("/")
    }, [])

    const signUserIn = (e) => {
        e.preventDefault()
        if(Email === "") return Toast.fire({ icon: 'error', title: 'Email required' })
        if(Password === "") return Toast.fire({ icon: 'error', title: 'Password required' })
        
        const params = {
            email: Email,
            password: Password
        }
    
        // converting (json --> form-urlencoded)
        const data = Object.keys(params)
        .map((key) => `${key}=${encodeURIComponent(params[key])}`)
        .join('&');
    
        setIsLoading(true)
        axios
            .post(BASE_URL+"/admin/login", data,{
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                    }
                })
            .then((res) => {
                // Validating form
                setIsLoading(false)
                if(res.data.status === 'success'){
                    if(RememberMe) localStorage.setItem('dentist_user', res.data.token);
                    else sessionStorage.setItem('dentist_user', res.data.token);
                    // console.log(res.data);
                    // navigate("/")
                    Toast.fire({ icon: 'success', title: 'Signed in successfully' })
                    window.location.reload()
                } else if(res.data.status === "error") Toast.fire({ icon: 'error', title: res.data.message })
                else Toast.fire({ icon: 'error', title: 'Cannot process request' })
            })
            .catch((err) => {
                setIsLoading(false)
                console.log(err);
                Toast.fire({ icon: 'error', title: 'Please Try Again' })
            })
    }

    return (
        <>
            <div className="row justify-content-center mt-5">
                <div className="col-md-5">
                    <div className="card card-info">
                        <div className="card-header">
                            <h3 className="card-title">Sign In</h3>
                        </div>
                        <form className="form-horizontal">
                            <div className="card-body">
                                <div className="form-group row">
                                    <label htmlFor="emailField" className="col-sm-2 col-form-label">Email</label>
                                    <div className="col-sm-10">
                                        <input type="email" className="form-control" id="emailField" placeholder="example@email.com" value={Email} onChange={(e) => setEmail(e.target.value)} />
                                    </div>
                                </div>
                                <div className="form-group row">
                                    <label htmlFor="passwordField" className="col-sm-2 col-form-label">Password</label>
                                    <div className="col-sm-10">
                                        <input type="password" className="form-control" id="passwordField" placeholder="Password" value={Password} onChange={(e) => setPassword(e.target.value)} />
                                    </div>
                                </div>
                                <div className="form-group row">
                                    <div className="offset-sm-2 col-sm-10">
                                        <div className="form-check">
                                            <input type="checkbox" className="form-check-input" id="rememberMe" onChange={(e) => setRememberMe(!RememberMe)} defaultChecked={RememberMe} />
                                            <label className="form-check-label" htmlFor="rememberMe">Remember me</label>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="card-footer">
                                <button type="submit" className="btn btn-info" onClick={(e) => signUserIn(e)}>Sign in</button>
                                {/* <button type="submit" className="btn btn-default float-right">Cancel</button> */}
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </>
    );
}
