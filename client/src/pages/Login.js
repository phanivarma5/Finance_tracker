import React, {useState, useEffect} from 'react';
import {Form, Input, message} from "antd";
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Spinner from '../components/Layout/Spinner';

const Login = () => {
    const [loading,setLoading] = useState(false);
    const navigate = useNavigate();
    const submitHandler = async (values) => {
        try {
            setLoading(true);
            const {data} = await axios.post(`${process.env.REACT_APP_API_URL}/api/v1/users/login`, values);
            setLoading(false);
            message.success("Login Successful");
            localStorage.setItem("user", JSON.stringify({...data.user,password:""}));
            navigate("/");
        } catch (error) {
            setLoading(false);
            message.error("Somingthing went wrong");
        }
    };

    useEffect(() => {
        if(localStorage.getItem("user")){
            navigate("/");
        }
    },[navigate]);

  return (
    <div>
        <div className="register-page">
            {loading && <Spinner/>}
            <Form layout="vertical" onFinish={submitHandler}>
                <h1> Login Form </h1>
                <Form.Item label="Email" name="email">
                    <Input type="email" />
                </Form.Item>
                <Form.Item label="Password" name="password">
                    <Input type="password" />
                </Form.Item>
                <div className="d-flex justify-content-between">
                    <Link to="/register">Not a user ? Click here to register</Link>
                    <button className="btn btn-primary"> Login </button>
                </div>
            </Form>
        </div>
    </div>
  );
};

export default Login;
