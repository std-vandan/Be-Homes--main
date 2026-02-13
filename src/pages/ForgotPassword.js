import axios from 'axios';
import React, { useState } from 'react';
import { Button, Modal } from 'react-bootstrap';

import { Link, useNavigate } from 'react-router';

import registerImg from "../img/frame_84.webp";

export default function ForgotPassword() {
  const [formData, setFormData] = useState({
    email: '',
  });

  const [loading, setLoading] = useState(false);
  const [modalInfo, setModalInfo] = useState({
    show: false,
    title: '',
    message: '',
    isError: false,
  });

  const navigate = useNavigate();
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

  
      
    try {
         // eslint-disable-next-line 
      const response = await axios.post('http://localhost:5000/auth/sendOTP', {
        email: formData.email,
      });

      setModalInfo({
        show: true,
        title: 'OTP Sent!',
        message: `An OTP has been sent to  ${formData.email} . Please check your email to proceed.`,
        isError: false,
      });
    } catch (err) {
      setModalInfo({
        show: true,
        title: 'Error',
        message: err.response?.data?.msg || 'Failed to send OTP. Please try again.',
        isError: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCloseModal = () => {
    setModalInfo({ ...modalInfo, show: false });
    navigate('/'); // Navigate to the login page
  };

  return (
    <section className="main-container register-bg">
      <div className="row">
        <div className="col-lg-6 d-desktop">
          <div className="register-side-image">
            <img src={registerImg} alt="" className="img-fluid" />
          </div>
        </div>
        <div className="col-lg-6 col-md-12 m-auto px-5">
  <form className="register-form-grp" onSubmit={handleSubmit}>
    <div className="mb-3">
      <label htmlFor="email" className="register-form-label">
        Email ID
      </label>
      <input
        type="email"
        id="email"
        name="email"
        className="form-control register-form-control"
        placeholder="Enter your email address"
        value={formData.email}
        onChange={handleChange}
        autoComplete="email"
        required
      />
    </div>
            <button
              type="submit"
              className="common-btn"
              disabled={loading}
            >
              {loading ? 'Sending OTP...' : 'Send OTP'}
            </button>
            <div className="text-center my-4 hint-text">
              <h5>
                No account yet? Let's get started -{' '}
                <Link to="/register">Sign Up!</Link>
              </h5>
            </div>
          </form>
        </div>
      </div>

      {/* Modal for Success or Error Messages */}
      <Modal show={modalInfo.show} onHide={handleCloseModal} centered>
        <Modal.Header closeButton>
          <Modal.Title className={modalInfo.isError ? 'text-danger' : 'text-success'}>
            {modalInfo.title}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>{modalInfo.message}</Modal.Body>
        <Modal.Footer>
          <Button
            className="common-btn"
            variant={modalInfo.isError ? 'secondary' : 'primary'}
            onClick={handleCloseModal}
          >
            {modalInfo.isError ? 'Try Again' : 'Reset Password'}
          </Button>
        </Modal.Footer>
      </Modal>
    </section>
  );
}
