import React, { useState } from 'react'
import { Link, useNavigate } from "react-router-dom";
import { useParams } from 'react-router';
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

export default function AddCategory() {
    const [name, setName] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [image, setImage] = useState({
        image: null,
        base: null
    });
    let navigate = useNavigate();
    let params = useParams();

    const handleFileUpload = (e) => {
        let image_as_base64 = URL.createObjectURL(e.target.files[0]);
        let image_as_file = e.currentTarget.files[0];

        setImage({
            image: image_as_file,
            base: image_as_base64
        });
    }

    function handleSubmit(event) 
    {
        event.preventDefault();
        if(name !== "" && image.image !== null){
            setIsLoading(true);
            let type = "question"
            if(params.type === "forum-categories") type = "forum"
            let formData = new FormData();
            formData.append('upload', image.image);
            formData.append('name', name);
            formData.append('type', type);

            getAxiosInstance()
            .post("/admin/add-category", formData,{
                headers: {
                    'Content-Type': 'multipart/form-data'
                    }
                })
            .then((res) => {
                // Validating form
                setIsLoading(false);
                if(res.data.status === 'success') {
                    Toast.fire({ icon: 'success', title: "Category added successfully" })
                    // console.log(res.data);
                    navigate(`/${params.type}/view`);
                } else if (res.data.status === "error") Toast.fire({ icon: 'error', title: res.data.message })
                else Toast.fire({ icon: 'error', title: "Cannot process request" })
            })
            .catch((err) => {
                setIsLoading(false);
                if(err.response.status === 401) Toast.fire({ icon: 'error', title: "Unauthorized access" })
                console.log(err);
            });
        }else{
            Toast.fire({ icon: 'error', title: "Please fill all fields" })
        }
    }

    return (
        <div>
            <div className="content-wrapper">
                <div className="content-header">
                    <div className="container-fluid">
                        <div className="row mb-2">
                            <div className="col-sm-6">
                                <h1 className="m-0">Add{params.type === "forum-categories" && " Forum"} Category</h1>
                            </div>
                            <div className="col-sm-6">
                                <ol className="breadcrumb float-sm-right">
                                    <li className="breadcrumb-item"><Link to="/">Dashboard</Link></li>
                                    <li className="breadcrumb-item"><Link to={`/${params.type}/view`}>{params.type === "forum-categories" && "Forum "}Category</Link></li>
                                    <li className="breadcrumb-item active">Add</li>
                                </ol>
                            </div>
                        </div>
                        <div className="row justify-content-center mt-5">
                            <div className="col-md-6">
                                <div className="card card-primary">
                                    <div className="card-header">
                                        <h3 className="card-title">Add New {params.type === "forum-categories" && "Forum "}Category</h3>
                                    </div>
                                    <form onSubmit={handleSubmit}>
                                        <div className="card-body">
                                            <div className="form-group">
                                                <label htmlFor="Category">{params.type === "forum-categories" && "Forum "}Category</label>
                                                <input type="text" className="form-control" id="Category" placeholder="Enter category name" value={name} onChange={(e) => setName(e.target.value)} />
                                            </div>
                                            {/* <div className="form-group">
                                                <label htmlFor="exampleInputPassword1">Password</label>
                                                <input type="password" className="form-control" id="exampleInputPassword1" placeholder="Password" />
                                            </div> */}
                                            <div className="form-group">
                                                <div className="custom-file">
                                                    <input type="file" className="custom-file-input" id="customFile" onChange={e => handleFileUpload(e)} />
                                                    <label className="custom-file-label" htmlFor="customFile">Choose file</label>
                                                </div>
                                            </div>
                                            {image.base && <div className="card mb-2 bg-gradient-dark">
                                                <img className="card-img-top" src={image.base} alt="Selected Image" />
                                                <div className="card-img-overlay d-flex flex-column justify-content-end">
                                                    <button type="button" className="btn btn-outline-danger btn-block" onClick={(e) => setImage({ image: null, base: null })}>Remove</button>
                                                </div>
                                            </div>}
                                        </div>
                                        <div className="card-footer">
                                            <button type="submit" className="btn btn-primary">Submit</button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
