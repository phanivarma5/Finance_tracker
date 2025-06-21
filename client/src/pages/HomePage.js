import React, { useState, useEffect } from 'react';
import { Input, message, Modal, Select, Table, DatePicker } from "antd";
import { UnorderedListOutlined, AreaChartOutlined, EditOutlined,DeleteOutlined } from "@ant-design/icons";
import Layout from '../components/Layout/Layout';
import { Form } from 'antd';
import axios from 'axios';
import Spinner from '../components/Layout/Spinner';
import moment from "moment";
import Analytics from '../components/Analytics';

const { RangePicker } = DatePicker;

const HomePage = () => {
    const [showModal, setShowModal] = useState(false);
    const [loading, setLoading] = useState(false);
    const [allTransection, setAllTransection] = useState([]);
    const [frequency, setFrequency] = useState("7");
    const [selectedDate, setSelectedDate] = useState([]);
    const [type, setType] = useState("all"); 
    const [viewData, setViewData] = useState("table");
    const [editable, setEditable] = useState(null);

    const columns = [
        {
            title: "Date",
            dataIndex: "date",
            render: (text) => <span>{moment(text).format("YYYY-MM-DD")}</span>
        },
        {
            title: "Amount",
            dataIndex: "amount",
        },
        {
            title: "Type",
            dataIndex: "type",
        },
        {
            title: "Category",
            dataIndex: "category",
        },
        {
            title: "Reference",
            dataIndex: "reference",
        },
        {
            title: "Actions",
            render: (text,record) => (
                <div>
                    <EditOutlined onClick={() => {
                        setEditable(record);
                        setShowModal(true);
                    }} />
                    <DeleteOutlined className="mx-2" onClick={() => {handleDelete(record)}} />
                </div>
            ) 
        },
    ];

    useEffect(() => {
        const getAllTransections = async () => {
            try {
                const userData = localStorage.getItem('user');

                if (!userData) {
                    message.error("User  not found! Please log in again.");
                    return;
                }

                const user = JSON.parse(userData);
                setLoading(true);

                const url = "http://localhost:8080/api/v1/transections/get-transection";
                console.log("Request URL:", url);
                console.log("Params:", { userid: user._id, frequency: frequency, type: type });

                // Convert selectedDate to Date objects if it's not empty
                const formattedSelectedDate = selectedDate.length ? [
                    selectedDate[0].toDate(), // Start date
                    selectedDate[1].toDate()  // End date
                ] : [];

                // Only fetch transactions if frequency is not "custom" or if both dates are selected
                if (frequency !== "custom" || (formattedSelectedDate.length === 2)) {
                    const res = await axios.get(url, {
                        params: { 
                            userid: user._id, 
                            frequency: frequency, 
                            selectedDate: formattedSelectedDate,
                            type,
                        },
                    });

                    setLoading(false);
                    setAllTransection(res.data.data);
                    console.log("Response:", res.data);
                } else {
                    // If custom filter is selected but no dates are chosen, clear the transactions
                    setLoading(false);
                    setAllTransection([]); // Clear transactions
                }
            } catch (error) {
                setLoading(false);
                console.log("Error:", error.response?.data || error.message);
                message.error("Fetch issue with Transaction: " + (error.response?.data?.error || error.message));
            }
        };
        getAllTransections();
    }, [frequency, selectedDate, type]);

    const handleDelete = async (record) => {
        try {
            setLoading(true);
            await axios.post("http://localhost:8080/api/v1/transections/delete-transection", {transactionId: record._id} );
            setLoading(false);
            message.success("Transaction Deleted");
        } catch (error) {
            setLoading(false);
            console.log(error);
            message.error("Unable to delete");
        }
    };

    const handleSubmit = async (values) => {
        try {
            const userData = localStorage.getItem('user');
            if (!userData) {
                message.error("User  not found! Please log in again.");
                return;
            }
            const user = JSON.parse(userData);
            setLoading(true);
            if(editable){
                await axios.post('http://localhost:8080/api/v1/transections/edit-transection', {
                    payload:{
                        ...values,
                        userId:user._id,
                    },
                    transactionId: editable._id,
                });  
                setLoading(false);
                message.success("Transaction Updated Successfully");
            }else{
                await axios.post('http://localhost:8080/api/v1/transections/add-transection', {
                    ...values,
                    userid: user._id,
                });
                setLoading(false);
                message.success("Transaction Added Successfully");
            }
            setShowModal(false);
            setEditable(null);
        } catch (error) {
            setLoading(false);
            message.error("Failed to add transaction");
        }
    };

    return (
        <Layout>
            {loading && <Spinner />}
            <div className="filters">
                <div>
                    <h6>Select Frequency</h6>
                    <Select value={frequency} onChange={(values) => setFrequency(values)}>
                        <Select.Option value="7">Last 1 Week</Select.Option>
                        <Select.Option value="30">Last 1 Month</Select.Option>
                        <Select.Option value="365">Last 1 Year</Select.Option>
                        <Select.Option value="custom">Custom</Select.Option>
                    </Select>
                    {frequency === "custom" && (
                        <RangePicker value={selectedDate} onChange={(values) => setSelectedDate(values)} />
                    )}
                </div>
                <div>
                    <h6>Select Type</h6>
                    <Select value={type} onChange={(value) => setType(value)}> {/* Correctly set type */}
                        <Select.Option value="all">All</Select.Option>
                        <Select.Option value="income">Income</Select.Option>
                        <Select.Option value="expense">Expense</Select.Option> 
                    </Select>
                </div>
                <div className="switch-icons">
                        <UnorderedListOutlined className= {`mx-2 ${viewData === "table" ? "active-icon" : "inactive-icon"}`} onClick={() => setViewData("table")} />
                        <AreaChartOutlined className= {`mx-2 ${viewData === "analytics" ? "active-icon" : "inactive-icon"}`} onClick={() => setViewData("analytics")} />
                    </div>
                <div>
                    <button className="btn btn-primary" onClick={() => setShowModal(true)}>Add New</button>
                </div>
            </div>
            <div className="content">
                {viewData === "table" ? (<Table columns={columns} dataSource={allTransection} rowKey="_id" />) : (<Analytics allTransection = {allTransection} />) }
            </div>
            <Modal title= {editable ? "Edit Transaction" : "Add Transaction"} open={showModal} onCancel={() => setShowModal(false)} footer={false}>
                <Form layout="vertical" onFinish={handleSubmit} initialValues={editable} >
                    <Form.Item label="Amount" name="amount">
                        <Input type="text" />
                    </Form.Item>
                    <Form.Item label="Type" name="type">
                        <Select>
                            <Select.Option value="income">Income</Select.Option>
                            <Select.Option value="expense">Expense</Select.Option>
                        </Select>
                    </Form.Item>
                    <Form.Item label="Category" name="category">
                        <Select>
                            <Select.Option value="salary">Salary</Select.Option>
                            <Select.Option value="tip">Tip</Select.Option>
                            <Select.Option value="project">Project</Select.Option>
                            <Select.Option value="food">Food</Select.Option>
                            <Select.Option value="movie">Movie</Select.Option>
                            <Select.Option value="bills">Bills</Select.Option>
                            <Select.Option value="medical">Medical</Select.Option>
                            <Select.Option value="fee">Fee</Select.Option>
                            <Select.Option value="tax">Tax</Select.Option>
                        </Select>
                    </Form.Item>
                    <Form.Item label="Date" name="date">
                        <Input type="date" />
                    </Form.Item>
                    <Form.Item label="Reference" name="reference">
                        <Input type="text" />
                    </Form.Item>
                    <Form.Item label="Description" name="description">
                        <Input type="text" />
                    </Form.Item>
                    <div className="d-flex justify-content-end">
                        <button className="btn btn-primary">Submit</button>
                    </div>
                </Form>
            </Modal>
        </Layout>
    );
};

export default HomePage;