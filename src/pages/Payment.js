import axios from 'axios';
import React, { useEffect, useState } from 'react';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import UpwardHead from "../components/UpwardHead";

export default function Payment() {
    const [projects, setProjects] = useState([]); // List of projects
    const [selectedProjectId, setSelectedProjectId] = useState(''); // Selected project ID
    const [payments, setPayments] = useState([]); // List of payments

    const [formData, setFormData] = useState({
        clientName: "",
        date: "",
        amount: "",
        bank: "",
        branch: "",
        city: "",
        chequeNo: "",
        chequeAt: "",
        paymentType: "cash",
        transactionId: ""
    });

    const [isPaymentTypeSelected, setIsPaymentTypeSelected] = useState(false);

    // Fetch list of projects on mount
    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const response = await axios.get('http://localhost:5000/project/view');
                setProjects(response.data.Datas);
            } catch (error) {
                console.error('Error fetching projects:', error);
            }
        };
        fetchProjects();
    }, []);

    // Fetch payment details when a project is selected
    useEffect(() => {
        const fetchPayments = async () => {
            if (!selectedProjectId) return;
            try {
                const paymentResponse = await fetch(`http://localhost:5000/payment/view/proj/${selectedProjectId}`);
                const paymentData = await paymentResponse.json();
                console.log("Fetched payment data:", paymentData); // should log an object with "files"

                // Use the "files" property from the response
                const paymentsArray = Array.isArray(paymentData.files)
                    ? paymentData.files
                    : (paymentData.files ? [paymentData.files] : []);
                setPayments(paymentsArray);
            } catch (error) {
                console.error("Error fetching payment details:", error);
            }
        };
        fetchPayments();
    }, [selectedProjectId]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleDateChange = (date, field) => {
        setFormData({ ...formData, [field]: date });
    };

    const handlePaymentTypeChange = (e) => {
        setFormData({ ...formData, paymentType: e.target.value });
        setIsPaymentTypeSelected(true);
    };

    const handleProjectChange = (e) => {
        setSelectedProjectId(e.target.value);
    };

    const handleSubmit = async () => {
        const requiredFields = ["clientName", "amount", "paymentType", "date"];
        for (const field of requiredFields) {
            if (!formData[field]) {
                alert(`Please fill in the ${field.replace(/([A-Z])/g, " $1")} field.`);
                return;
            }
        }

        const dataToSend = {
            ProjectId: selectedProjectId,
            paymentType: formData.paymentType,
            createdDate: new Date().toISOString(),
            updatedDate: new Date().toISOString(),
            status: "Pending",
            PaymentMethod: formData.paymentType,
            transactionDetails: {
                amount: formData.amount,
            },
            date: formData.date,
            clientName: formData.clientName,
            bank: formData.bank,
            branch: formData.branch,
            city: formData.city,
            chequeNo: formData.chequeNo,
            chequeAt: formData.chequeAt,
            transactionId: formData.transactionId || ""
        };

        try {
            const response = await fetch(`http://localhost:5000/payment/create/${selectedProjectId}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(dataToSend),
            });

            if (!response.ok) {
                const result = await response.json();
                alert(result.msg || "Error creating project.");
                return;
            }

            const result = await response.json();
            alert("Project created successfully!");

            // Fetch the updated payments using the selectedProjectId endpoint
            const paymentResponse = await fetch(`http://localhost:5000/payment/view/proj/${selectedProjectId}`);
            const paymentData = await paymentResponse.json();
            const paymentsArray = Array.isArray(paymentData.files)
                ? paymentData.files
                : (paymentData.files ? [paymentData.files] : []);
            setPayments(paymentsArray);

            // Reset form data
            setFormData({
                clientName: "",
                date: "",
                amount: "",
                bank: "",
                branch: "",
                city: "",
                chequeNo: "",
                chequeAt: "",
                paymentType: "cash",
                transactionId: ""
            });
        } catch (error) {
            console.error("Error submitting form:", error);
            alert("Server error. Please try again later.");
        }
    };

    const getClientName = (payment) => {
        const dt = payment.transactionDetails;
        if (!dt) return '-';
        if (dt.cashDetails && dt.cashDetails.clientName) return dt.cashDetails.clientName;
        if (dt.chequeDetails && dt.chequeDetails.clientName) return dt.chequeDetails.clientName;
        if (dt.onlineDetails && dt.onlineDetails.clientName) return dt.onlineDetails.clientName;
        return '-';
    };

    const getChequeOrTransactionNo = (payment) => {
        const dt = payment.transactionDetails;
        if (!dt) return '-';
        if (dt.chequeDetails && dt.chequeDetails.chequeNo) return dt.chequeDetails.chequeNo;
        if (dt.onlineDetails && dt.onlineDetails.transactionId) return dt.onlineDetails.transactionId;
        return '-';
    };

    const getBank = (payment) => {
        const dt = payment.transactionDetails;
        if (!dt) return '-';
        if (dt.chequeDetails && dt.chequeDetails.bank) return dt.chequeDetails.bank;
        if (dt.onlineDetails && dt.onlineDetails.bank) return dt.onlineDetails.bank;
        return '-';
    };

    // Define columns for the data table
    const columns = [
        {
            name: 'Amount Received',
            selector: row => row.transactionDetails?.amount || '-',
            sortable: true,
        },
        {
            name: 'Payment Date',
            selector: row =>
                row.transactionDetails?.date
                    ? new Date(row.transactionDetails.date).toLocaleDateString()
                    : '-',
            sortable: true,
        },
        {
            name: 'Payment Method',
            selector: row => row.PaymentMethod || '-',
            sortable: true,
        },
        {
            name: 'Payment Category',
            selector: row => row.paymentType || '-',
            sortable: true,
        },
        {
            name: 'Client Name',
            selector: row => getClientName(row),
        },
        {
            name: 'Cheque/Transaction No.',
            selector: row => getChequeOrTransactionNo(row),
        },
        {
            name: 'Bank',
            selector: row => getBank(row),
        },
        {
            name: 'Status',
            selector: row => row.status || '-',
            sortable: true,
        },
    ];

    return (
        <>
            <UpwardHead pageTitle="Payment"  />
            <div className="padd-common-16 mb-3 px-4">
                <label htmlFor="projectSelect" className="project-form-label">Select Project: </label>
                <select
                    id="projectSelect"
                    className="project-form-control"
                    value={selectedProjectId}
                    onChange={handleProjectChange}
                >
                    <option value="">-- Select a Project --</option>
                    {projects.map((project) => (
                        <option key={project._id} value={project._id}>
                            {project.projectName}
                        </option>
                    ))}
                </select>
            </div>

            {selectedProjectId ? (
                <div className="padd-common-16 px-4">
                    {/* Payment Form */}
                    <div className="payment-type-container">
                        <button
                            className={`payment-type-button ${formData.paymentType === "cash" ? "active" : ""}`}
                            onClick={() => handlePaymentTypeChange({ target: { value: "cash" } })}
                        >
                            Cash
                        </button>
                        <button
                            className={`payment-type-button ${formData.paymentType === "cheque" ? "active" : ""}`}
                            onClick={() => handlePaymentTypeChange({ target: { value: "cheque" } })}
                        >
                            Cheque
                        </button>
                        <button
                            className={`payment-type-button ${formData.paymentType === "online" ? "active" : ""}`}
                            onClick={() => handlePaymentTypeChange({ target: { value: "online" } })}
                        >
                            Online
                        </button>
                    </div>

                    {formData.paymentType === "cash" && (
                        <div>
                            <div className="general-details-container mt-3">
                                <h5>Cash</h5>
                                <div className="row">
                                    <div className="col-md-6">
                                        <label className="project-form-label">Client Name:* </label>
                                        <input
                                            type="text"
                                            className="form-control project-form-control"
                                            placeholder="Enter client name"
                                            name="clientName"
                                            value={formData.clientName}
                                            onChange={handleInputChange}
                                        />
                                    </div>
                                    <div className="col-md-6">
                                        <label className="project-form-label">Date:* </label>
                                        <DatePicker
                                            className="project-form-control"
                                            selected={formData.date}
                                            onChange={(date) => handleDateChange(date, "date")}
                                            dateFormat="yyyy/MM/dd"
                                            placeholderText="Select a date"
                                        />
                                    </div>
                                    <div className="col-md-6">
                                        <label className="project-form-label">Amount:* </label>
                                        <input
                                            type="text"
                                            className="form-control project-form-control"
                                            placeholder="Enter amount received from client"
                                            name="amount"
                                            value={formData.amount}
                                            onChange={handleInputChange}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {formData.paymentType === "cheque" && (
                        <div>
                            <div className="general-details-container mt-3">
                                <h5>Cheque</h5>
                                <div className="row">
                                    <div className="col-md-6">
                                        <label className="project-form-label">Client Name:* </label>
                                        <input
                                            type="text"
                                            className="form-control project-form-control"
                                            placeholder="Enter client name"
                                            name="clientName"
                                            value={formData.clientName}
                                            onChange={handleInputChange}
                                        />
                                    </div>
                                    <div className="col-md-6">
                                        <label className="project-form-label">Bank Name:* </label>
                                        <input
                                            type="text"
                                            className="form-control project-form-control"
                                            placeholder="Enter bank name of cheque"
                                            name="bank"
                                            value={formData.bank}
                                            onChange={handleInputChange}
                                        />
                                    </div>
                                    <div className="col-md-6">
                                        <label className="project-form-label">Branch:* </label>
                                        <input
                                            type="text"
                                            className="form-control project-form-control"
                                            placeholder="Enter bank branch"
                                            name="branch"
                                            value={formData.branch}
                                            onChange={handleInputChange}
                                        />
                                    </div>
                                    <div className="col-md-6">
                                        <label className="project-form-label">City:* </label>
                                        <input
                                            type="text"
                                            className="form-control project-form-control"
                                            placeholder="Enter city where bank is situated"
                                            name="city"
                                            value={formData.city}
                                            onChange={handleInputChange}
                                        />
                                    </div>
                                    <div className="col-md-6">
                                        <label className="project-form-label">Cheque No.:* </label>
                                        <input
                                            type="text"
                                            className="form-control project-form-control"
                                            placeholder="Enter cheque number"
                                            name="chequeNo"
                                            value={formData.chequeNo}
                                            onChange={handleInputChange}
                                        />
                                    </div>
                                    <div className="col-md-6">
                                        <label className="project-form-label">Cheque Date:* </label>
                                        <DatePicker
                                            className="project-form-control"
                                            selected={formData.chequeAt}
                                            onChange={(date) => handleDateChange(date, "chequeAt")}
                                            dateFormat="yyyy/MM/dd"
                                            placeholderText="Select a date"
                                        />
                                    </div>
                                    <div className="col-md-6">
                                        <label className="project-form-label">Amount:* </label>
                                        <input
                                            type="text"
                                            className="form-control project-form-control"
                                            placeholder="Enter amount received from client"
                                            name="amount"
                                            value={formData.amount}
                                            onChange={handleInputChange}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {formData.paymentType === "online" && (
                        <div>
                            <div className="general-details-container mt-3">
                                <h5>Online</h5>
                                <div className="row">
                                    <div className="col-md-12">
                                        <label className="project-form-label">Client Name:* </label>
                                        <input
                                            type="text"
                                            className="form-control project-form-control"
                                            placeholder="Enter client name"
                                            name="clientName"
                                            value={formData.clientName}
                                            onChange={handleInputChange}
                                        />
                                    </div>
                                    <div className="col-md-6">
                                        <label className="project-form-label">Transaction ID:* </label>
                                        <input
                                            type="text"
                                            className="form-control project-form-control"
                                            placeholder="Enter transaction id"
                                            name="transactionId"
                                            value={formData.transactionId}
                                            onChange={handleInputChange}
                                        />
                                    </div>
                                    <div className="col-md-6">
                                        <label className="project-form-label">Amount:* </label>
                                        <input
                                            type="text"
                                            className="form-control project-form-control"
                                            placeholder="Enter amount received from client"
                                            name="amount"
                                            value={formData.amount}
                                            onChange={handleInputChange}
                                        />
                                    </div>
                                    <div className="col-md-6">
                                        <label className="project-form-label">Date:* </label>
                                        <DatePicker
                                            className="project-form-control"
                                            selected={formData.date}
                                            onChange={(date) => handleDateChange(date, "date")}
                                            dateFormat="yyyy/MM/dd"
                                            placeholderText="Select a date"
                                        />
                                    </div>
                                    <div className="col-md-6">
                                        <label className="project-form-label">Bank Name:* </label>
                                        <input
                                            type="text"
                                            className="form-control project-form-control"
                                            placeholder="Enter bank name"
                                            name="bank"
                                            value={formData.bank}
                                            onChange={handleInputChange}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="my-4">
                        <button onClick={handleSubmit} className="gradient-button">
                            Submit
                        </button>
                    </div>

                    {/* Payment List with React Data Table */}
                    {payments && payments.length > 0 ? (
                        <div className="payment-list" style={{ marginTop: '20px' }}>
                            <h5>Payment Details</h5>
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>Amount Received</th>
                                        <th>Payment Date</th>
                                        <th>Payment Method</th>
                                        <th>Payment Category</th>
                                        <th>Client Name</th>
                                        <th>Cheque/Transaction No.</th>
                                        <th>Bank</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {payments.map((payment, idx) => (
                                        <tr key={idx}>
                                            <td>
                                              {payment.transactionDetails && payment.transactionDetails.amount
                                                ? payment.transactionDetails.amount
                                                : '-'}
                                            </td>
                                            <td>
                                              {payment.transactionDetails && payment.transactionDetails.date
                                                ? new Date(payment.transactionDetails.date).toLocaleDateString()
                                                : '-'}
                                            </td>
                                            <td>{payment.PaymentMethod || '-'}</td>
                                            <td>{payment.paymentType || '-'}</td>
                                            <td>
                                              {payment.transactionDetails &&
                                              (payment.transactionDetails.cashDetails?.clientName ||
                                                payment.transactionDetails.chequeDetails?.clientName ||
                                                payment.transactionDetails.onlineDetails?.clientName)
                                                ? payment.transactionDetails.cashDetails?.clientName ||
                                                  payment.transactionDetails.chequeDetails?.clientName ||
                                                  payment.transactionDetails.onlineDetails?.clientName
                                                : '-'}
                                            </td>
                                            <td>
                                              {payment.transactionDetails &&
                                              (payment.transactionDetails.chequeDetails?.chequeNo ||
                                                payment.transactionDetails.onlineDetails?.transactionId)
                                                ? payment.transactionDetails.chequeDetails?.chequeNo ||
                                                  payment.transactionDetails.onlineDetails?.transactionId
                                                : '-'}
                                            </td>
                                            <td>
                                              {payment.transactionDetails &&
                                              (payment.transactionDetails.chequeDetails?.bank ||
                                                payment.transactionDetails.onlineDetails?.bank)
                                                ? payment.transactionDetails.chequeDetails?.bank ||
                                                  payment.transactionDetails.onlineDetails?.bank
                                                : '-'}
                                            </td>
                                            <td>{payment.status || '-'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <p>No payments available for this project.</p>
                    )}
                </div>
            ) : (
                <div>
                    {/* Please select a project to access the payment form. */}
                </div>
            )}
        </>
    );
}
