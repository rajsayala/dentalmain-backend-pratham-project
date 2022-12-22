import React, { useState, useEffect } from 'react'
import FileBase64 from 'react-file-base64';
import { BASE_URL } from '../env'

export default function AddUpdateQuestion({ type, category, getAxiosInstance, Toast, questionUp, getQuestions }) {
    const [IsShowing, setIsShowing] = useState(false)
    const [question, setQuestion] = useState("");
    const [explaination, setExplaination] = useState("");
    const [questionType, setQuestionType] = useState("text");
    const [answerType, setAnswerType] = useState("text");
    const [answer, setAnswer] = useState({
        title: "",
        is_correct: false
    });
    const [answers, setAnswers] = useState([]);
    const [deleteList, setDeleteList] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    const handleCheckbox = () => {
        if(answer.is_correct){
            setAnswer({...answer, is_correct: false });
        }else{
            setAnswer({...answer, is_correct: true });
        }
    }

    useEffect(() => {
        if(questionUp){
            setQuestion(questionUp.question);
            setExplaination(questionUp.explaination);
            setAnswers(questionUp.answers);
            setQuestionType(questionUp.type)
            if(questionUp.answers.length > 0) setAnswerType(questionUp.answers[0].type)
        }
    }, [questionUp])

    const addQuestion = () => {
        if(question.trim() === "") return Toast.fire({ icon: 'error', title: 'Question cannot be empty.' })
        else if(answers.length <= 1) return Toast.fire({ icon: 'error', title: 'More than one option required' })
        
        setIsLoading(true);
        let link = "/admin/add-question"
        let params = {
            category: category,
            question: question,
            explaination: explaination,
            type: questionType,
            answerType: answerType,
            answers: JSON.stringify(answers)
        }
        if(questionUp) {
            params = {
                id: questionUp._id,
                question: question,
                explaination: explaination,
                type: questionType,
                answerType: answerType,
                deleteList: JSON.stringify(deleteList),
                answers: JSON.stringify(answers)
            }
            link = "/admin/update-question"
        }

        const data = Object.keys(params)
            .map((key) => `${key}=${encodeURIComponent(params[key])}`)
            .join('&');

        getAxiosInstance()
            .post(link, data,{
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
                })
            .then((res) => {
                // Validating form
                setIsLoading(false);
                if(res.data.status === 'success'){
                    Toast.fire({ icon: 'success', title: `Question ${type === "add"?"added":"updated"} successfully.` })
                    handleClose()
                    getQuestions()
                } else if (res.data.status === "error") Toast.fire({ icon: 'error', title: res.data.message })
                else Toast.fire({ icon: 'error', title: 'Cannot Process Request' })
            })
            .catch((err) => {
                setIsLoading(false);
                if(err.response.status === 401) Toast.fire({ icon: 'error', title: 'Unauthorized Access' })
                console.log(err);
            });
    }

    const addOption = () => {
        if(answer.title === "") return Toast.fire({ icon: 'error', title: 'Answer cannot be empty.' })
        setAnswers([...answers, answer]);
        setAnswer({
            title: "",
            is_correct: false
        })
    }

    const removeOption = (title) => {
        if(answerType === "image" && title.includes(BASE_URL)) setDeleteList([...deleteList, title])
        setAnswers(answers.filter(item => item.title !== title))
    }

    const simpleRemove = (title) => setAnswers(answers.filter(item => item.title !== title))

    const handleEditPrevAnswer = (prevAnswer) => {
        if(answer.title === ""){
            setAnswer(prevAnswer);
            simpleRemove(prevAnswer.title);
        }
    }

    function toDataUrl(element) {
        let file = element.target.files[0];
        let size = file.size / (1024 ** 2)
        // console.log(size)
        if(size > 1) return Toast.fire({ icon: 'error', title: 'File size too large.' })
        let reader = new FileReader();
        reader.onloadend = function() {
            // console.log('RESULT', reader.result)
            if(answer.title !== "" && !answer.title.includes(';base64,')) setDeleteList([...deleteList, answer.title])
            setAnswer({ ...answer, title: reader.result })
        }
        reader.readAsDataURL(file);
    }

    function handleClose() {
        setIsShowing(false)
        setDeleteList([])
        setAnswers([])
        setAnswer({
            title: "",
            is_correct: false
        })
        setQuestion("")
        setExplaination("")
        window.location.reload()
    }

    return (
        <>
            {type === "add" && <button type="button" class="btn btn-primary btn-sm ml-1" onClick={() => setIsShowing(true)}>
                <i className="fas fa-plus"></i> Add Question
            </button>}
            {type !== "add" && <button type="button" class="btn btn-primary btn-sm ml-1" onClick={() => setIsShowing(true)}>
                <i className="fas fa-pen"></i>
            </button>}
            {IsShowing && <div className={`modal fade show`} id="modal-default" style={{ display: 'block', paddingRight: 17 }} aria-modal="true" role="dialog">
                <div className="modal-dialog modal-lg">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title">Question Modal</h5>
                            <button type="button" className="close" data-dismiss="modal" aria-label="Close" onClick={(e) => handleClose()}>
                                <span aria-hidden="true">×</span>
                            </button>
                        </div>
                        <div className="modal-body" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
                            <div className="row">
                                <div className="col-md-6">
                                    <div className="form-group">
                                        <label htmlFor="question" className="form-label">Question</label>
                                        <select className="custom-select form-control-border" value={questionType} onChange={(e) => { setQuestionType(e.target.value); setQuestion(""); }} id="questionType">
                                            <option value="text">Question Type Text</option>
                                            <option value="image">Question Type Image</option>
                                        </select>
                                        {questionType === "text" && <textarea className="form-control mt-1" id="question" value={question} onChange={(e) => setQuestion(e.target.value)} />}
                                        {questionType === "image" && <div className="mt-1"><FileBase64 multiple={false} onDone={(e) => setQuestion(e.base64)} /></div>}
                                    </div>
                                </div>
                                <div className="col-md-6">
                                    <div className="form-group">
                                        <label htmlFor="explaination" className="form-label">Answer Explaination</label>
                                        <textarea className="form-control" id="explaination" value={explaination} onChange={(e) => setExplaination(e.target.value)} />
                                        <select className="custom-select form-control-border" value={answerType} onChange={(e) => { setAnswerType(e.target.value); setAnswer({ title: "", is_correct: false }); setAnswers([]); }} id="questionType">
                                            <option value="text">Answer Type Text</option>
                                            <option value="image">Answer Type Image</option>
                                        </select>
                                    </div>
                                </div>
                                {questionType === "image" && question !== "" && <div className="col-md-3">
                                    <div className="card mb-2 bg-gradient-dark">
                                        <img className="card-img-top" src={question} alt="Selected Image" />
                                        <div className="card-img-overlay d-flex flex-column justify-content-end">
                                            <button type="button" className="btn btn-outline-danger btn-block" onClick={(e) => setQuestion("")}>Remove</button>
                                        </div>
                                    </div>
                                </div>}
                            </div>
                            
                            <div className="row">
                                <div className="form-group col-md-6">
                                    <label htmlFor="question" className="form-label">Option {answers.length + 1}</label>
                                    {answerType === 'image' && <div className="input-group">
                                        <div className="input-group-prepend">
                                            <div className="input-group-text"><input type="checkbox" onChange={() => handleCheckbox()} checked={answer.is_correct}/></div>
                                        </div>
                                        <div className="custom-file">
                                            <input type="file" className="custom-file-input" id="exampleInputFile" onChange={(e) => toDataUrl(e)} />
                                            <label className="custom-file-label" htmlFor="exampleInputFile">Choose Option File {answers.length + 1}</label>
                                        </div>
                                        <div className="input-group-append" onClick={() => addOption()}>
                                            <div className="input-group-text"><i className="fa fa-plus"></i></div>
                                        </div>
                                    </div>}
                                    {answerType === 'image' && <code className="mt-1">Max file size 1MB</code>}

                                    {answerType === 'text' && <div className="input-group mb-2">
                                        <div className="input-group-prepend">
                                            <div className="input-group-text"><input type="checkbox" onChange={() => handleCheckbox()} checked={answer.is_correct}/></div>
                                        </div>
                                        <input type="text" className="form-control" id="inlineFormInputGroup" placeholder={`Option ${answers.length + 1}`} value={answer.title} onChange={(e) => setAnswer({ ...answer, title: e.target.value })} />
                                        <div className="input-group-append" onClick={() => addOption()}>
                                            <div className="input-group-text"><i className="fa fa-plus"></i></div>
                                        </div>
                                    </div>}
                                </div>
                                <div className="col-md-3"></div>
                                {answerType === "image" && answer.title !== "" && <div className="col-md-3">
                                    <div className="card mb-2 bg-gradient-dark">
                                        <img className="card-img-top" src={answer.title} alt="Selected Image" />
                                        <div className="card-img-overlay d-flex flex-column justify-content-end">
                                            <div className="row">
                                                <div className="col-2">
                                                    <input type="checkbox" style={{ marginTop: 10 }} onChange={() => handleCheckbox()} checked={answer.is_correct}/>
                                                </div>
                                                <div className="col-10">
                                                    <button type="button" className="btn btn-outline-danger btn-block" onClick={(e) => setAnswer({ ...answer, title: "" })}>Remove</button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>}
                            </div>
                            <div className="row">
                                {answerType === "text" && (answers.length > 0)? 
                                    answers.map((item,i) => (
                                        <div className="form-group col-md-6" key={i}>
                                            <div className="input-group mb-2">
                                                <div className="input-group-prepend">
                                                    <div className="input-group-text"><input type="checkbox" checked={item.is_correct}/></div>
                                                </div>
                                                <input type="text" className="form-control" id="inlineFormInputGroup" value={item.title} onClick={() => handleEditPrevAnswer(item)}/>
                                                <div className="input-group-append" onClick={() => removeOption(item.title)}>
                                                    <div className="input-group-text"><i className="fa fa-minus"></i></div>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                :null}
                                {answerType === "image" && (answers.length > 0)? 
                                    answers.map((item,i) => (
                                        <div className="col-md-3">
                                            <div className="card mb-2 bg-gradient-dark" onClick={() => handleEditPrevAnswer(item)}>
                                                <img className="card-img-top" src={item.title} alt="Selected Image" />
                                                <div className="card-img-overlay d-flex flex-column justify-content-end">
                                                    <div className="row">
                                                        <div className="col-2">
                                                            <input type="checkbox" style={{ marginTop: 10 }} onChange={() => handleEditPrevAnswer(item)} checked={item.is_correct}/>
                                                        </div>
                                                        <div className="col-10">
                                                            <button type="button" className="btn btn-outline-danger btn-block" onClick={(e) => {
                                                                e.stopPropagation();
                                                                removeOption(item.title)
                                                            }}>Remove</button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                :null}
                            </div>
                        </div>
                        <div className="modal-footer justify-content-between">
                            <button type="button" className="btn btn-default" data-dismiss="modal" onClick={(e) => handleClose()}>Close</button>
                            <button type="button" className="btn btn-primary" onClick={(e) => addQuestion()}>{type === "add"?"Add Question":"Save changes"}</button>
                        </div>
                    </div>
                </div>
            </div>}
        </>
    )
}
