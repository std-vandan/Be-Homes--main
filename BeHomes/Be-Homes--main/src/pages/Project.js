import React, { useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Select from "react-select"; // Add this at the top with your other imports
import UpwardHead from "../components/UpwardHead";

export default function Project() {
  const [managers, setManagers] = useState([]);
  const [formData, setFormData] = useState({
    projectName: "",
    projectType: "",
    startDate: "",
    endDate: "",
    assigned: "",
    fullAddress: "",
    pincode: "",
    city: "",
    clientName: "",
    clientType: "",
    emailAddress: "",
    contactNumber: "",
    referral: "",
    architectName: "",
    companyName: "",
    architectEmail: "",
    architectPhone: "",
    aboutProject: "",
    termsAndConditions: "",
    estimatedValue: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchManagers = async () => {
      try {
        const response = await fetch("https://behomes-1.onrender.com/user/manager");
        if (!response.ok) {
          throw new Error("Failed to fetch managers");
        }
        const data = await response.json();
        setManagers(data.files);
      } catch (error) {
        console.error("Error fetching managers:", error);
      }
    };

    fetchManagers();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleDateChange = (date, field) => {
    setFormData({ ...formData, [field]: date });
  };

  const handleSubmit = async () => {
    const requiredFields = [
      "projectName",
      "projectType",
      "startDate",
      "endDate",
      "assigned",
      "fullAddress",
      "pincode",
      "city",
      "clientName",
      "clientType",
      "emailAddress",
      "contactNumber",
      "referral",
      "architectName",
      "companyName", // Updated field name
      "architectEmail",
      "architectPhone",
      "aboutProject",
      "termsAndConditions",
      "estimatedValue",
    ];

    for (const field of requiredFields) {
      if (!formData[field]) {
        alert(`Please fill in the ${field.replace(/([A-Z])/g, " $1")} field.`);
        return;
      }
    }

    // Build payload while converting pincode to number and dates to ISO strings
    const payload = {
      ...formData,
      pincode: Number(formData.pincode), // Convert pincode to Number
      startDate:
        formData.startDate && formData.startDate instanceof Date
          ? formData.startDate.toISOString()
          : formData.startDate,
      endDate:
        formData.endDate && formData.endDate instanceof Date
          ? formData.endDate.toISOString()
          : formData.endDate,
    };

    try {
      setIsSubmitting(true);
      const response = await fetch("https://behomes-1.onrender.com/project/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const result = await response.json();
        alert(result.msg || "Error creating project.");
        setIsSubmitting(false);
        return;
      }

      if (response.status === 204) {
        alert("Project created successfully!");
      } else {
        const result = await response.json();
        alert(result.msg || "Project created successfully!");
      }
      
      setFormData({
        projectName: "",
        projectType: "",
        startDate: "",
        endDate: "",
        assigned: "",
        fullAddress: "",
        pincode: "",
        city: "",
        clientName: "",
        clientType: "",   // Reset clientType as well
        emailAddress: "",
        contactNumber: "",
        referral: "",
        architectName: "",
        companyName: "",
        architectEmail: "",
        architectPhone: "",
        aboutProject: "",
        termsAndConditions: "",
        estimatedValue: "",
      });
      setIsSubmitting(false);
    } catch (error) {
      console.error("Error submitting form:", error);
      alert("Server error. Please try again later.");
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <UpwardHead pageTitle="Project Details" />
      <div className="padd-common-16">
        <div className="general-details-container">
          <h5>General Details</h5>
          <div className="row">
            {/* General Details Fields */}
            <div className="col-md-6">
              <label className="project-form-label">Project Name:* </label>
              <input
                type="text"
                className="form-control project-form-control"
                placeholder="Enter Project Name"
                name="projectName"
                value={formData.projectName}
                onChange={handleInputChange}
              />
            </div>
            <div className="col-md-6">
              <label className="project-form-label">Project Type:* </label>
              <select
                className="project-form-control"
                name="projectType"
                value={formData.projectType}
                onChange={handleInputChange}
              >
                <option value="" disabled>
                  Select Project Type
                </option>
                <option value="Residential">Residential</option>
                <option value="Office">Office</option>
                <option value="Commercial">Commercial</option>
                <option value="Retail">Retail</option>
                <option value="Hospitality">Hospitality</option>
              </select>
            </div>
            <div className="col-md-6">
              <label className="project-form-label">Start Date:* </label>
              <DatePicker
                className="project-form-control"
                selected={formData.startDate}
                onChange={(date) => handleDateChange(date, "startDate")}
                dateFormat="yyyy/MM/dd"
                placeholderText="Select a date"
              />
            </div>
            <div className="col-md-6">
              <label className="project-form-label">End Date:* </label>
              <DatePicker
                className="project-form-control"
                selected={formData.endDate}
                onChange={(date) => handleDateChange(date, "endDate")}
                dateFormat="yyyy/MM/dd"
                placeholderText="Select a date"
              />
            </div>
            <div className="col-md-6">
              <label className="project-form-label">Assigned To:* </label>
              <Select
                options={managers
                  .sort((a, b) => a.username.localeCompare(b.username))
                  .map((manager) => ({
                    value: manager.username,
                    label: manager.username,
                  }))}
                value={
                  formData.assigned
                    ? { value: formData.assigned, label: formData.assigned }
                    : null
                }
                onChange={(selectedOption) =>
                  setFormData({ ...formData, assigned: selectedOption.value })
                }
                placeholder="Search or select manager..."
                isClearable
              />
            </div>
            <div className="col-md-6">
              <label className="project-form-label">Estimated Value:* </label>
              <input
                type="text"
                className="form-control project-form-control"
                placeholder="Enter a Estimated Value"
                name="estimatedValue"
                value={formData.estimatedValue}
                onChange={handleInputChange}
              />
            </div>
            <div className="col-md-12">
              <div className="my-2">
                <label className="project-form-label">Address:*</label>
                <textarea
                  className="project-form-control"
                  placeholder="Enter a project site full projectAddress"
                  name="fullAddress"
                  value={formData.fullAddress}
                  onChange={handleInputChange}
                  rows="2"
                />
              </div>
            </div>
            <div className="col-md-6">
              <div className="my-2">
                <label className="project-form-label">Pincode:*</label>
                <input
                  type="text"
                  className="form-control project-form-control"
                  placeholder="Enter a Pincode"
                  name="pincode"
                  value={formData.pincode}
                  onChange={handleInputChange}
                />
              </div>
            </div>
            <div className="col-md-6">
              <div className="my-2">
                <label className="project-form-label">City:*</label>
                <input
                  type="text"
                  className="form-control project-form-control"
                  placeholder="City / District / Town"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Client Details */}
        <div className="general-details-container mt-4">
          <h5>Client Details</h5>
          <div className="row">
            <div className="col-md-6">
              <label className="project-form-label">Client Name:* </label>
              <input
                type="text"
                className="form-control project-form-control"
                placeholder="Enter Client Name"
                name="clientName"
                value={formData.clientName}
                onChange={handleInputChange}
              />
            </div>
            <div className="col-md-6">
              <label className="project-form-label">Client Type:* </label>
              <select
                className="form-control project-form-control"
                name="clientType"
                value={formData.clientType}
                onChange={handleInputChange}
              >
                <option value="" disabled>
                  Select Client Type
                </option>
                <option value="corporate">Corporate</option>
                <option value="individual">Individual</option>
              </select>
            </div>
            <div className="col-md-6">
              <label className="project-form-label">Client Email:* </label>
              <input
                type="email"
                className="form-control project-form-control"
                placeholder="Enter Client Email"
                name="emailAddress"
                value={formData.emailAddress}
                onChange={handleInputChange}
              />
            </div>
            <div className="col-md-6">
              <label className="project-form-label">Client Phone:* </label>
              <input
                type="text"
                className="form-control project-form-control"
                placeholder="Enter Client Phone"
                name="contactNumber"
                value={formData.contactNumber}
                onChange={handleInputChange}
              />
            </div>
            <div className="col-md-6">
              <label className="project-form-label">Referred By: </label>
              <input
                type="text"
                className="form-control project-form-control"
                placeholder="Referral Source"
                name="referral"
                value={formData.referral}
                onChange={handleInputChange}
              />
            </div>
          </div>
        </div>

        {/* Architect Details */}
        <div className="general-details-container mt-4">
          <h5>Architect Details</h5>
          <div className="row">
            <div className="col-md-6">
              <label className="project-form-label">Architect Name:* </label>
              <input
                type="text"
                className="form-control project-form-control"
                placeholder="Enter Architect Name"
                name="architectName"
                value={formData.architectName}
                onChange={handleInputChange}
              />
            </div>
            <div className="col-md-6">
              <label className="project-form-label">Company Name:* </label>
              <input
                type="text"
                className="form-control project-form-control"
                placeholder="Enter Company Name"
                name="companyName"
                value={formData.companyName}
                onChange={handleInputChange}
              />
            </div>
            <div className="col-md-6">
              <label className="project-form-label">Architect Email:* </label>
              <input
                type="email"
                className="form-control project-form-control"
                placeholder="Enter Architect Email"
                name="architectEmail"
                value={formData.architectEmail}
                onChange={handleInputChange}
              />
            </div>
            <div className="col-md-6">
              <label className="project-form-label">Architect Phone:* </label>
              <input
                type="text"
                className="form-control project-form-control"
                placeholder="Enter Architect Phone"
                name="architectPhone"
                value={formData.architectPhone}
                onChange={handleInputChange}
              />
            </div>
          </div>
        </div>

        {/* Project Details */}
        <div className="general-details-container mt-4">
          <h5>Project Details</h5>
          <label className="project-form-label">About Project:* </label>
          <textarea
            className="project-form-control"
            placeholder="About the Project"
            name="aboutProject"
            value={formData.aboutProject}
            onChange={handleInputChange}
            rows="4"
          />
          <label className="project-form-label">Terms and Conditions:* </label>
          <textarea
            className="project-form-control"
            placeholder="Terms and Conditions"
            name="termsAndConditions"
            value={formData.termsAndConditions}
            onChange={handleInputChange}
            rows="4"
          />
        </div>

        <div className="my-4">
          <button onClick={handleSubmit} className="gradient-button" disabled={isSubmitting}>
            {isSubmitting ? "Creating Project..." : "Create Project"}
          </button>
        </div>
      </div>
    </>
  );
}