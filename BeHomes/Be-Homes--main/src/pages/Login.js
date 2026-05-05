import axios from 'axios';
import React, { useContext, useState } from 'react';
import { Button, Modal } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router';
import { AuthContext } from '../components/AuthContext';

import registerImg from "../img/frame_84.webp";

export default function Login() {
  const { setUserFromToken } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
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
      const response = await axios.post('https://behomes-1.onrender.com/auth/login', formData);
      const { token } = response.data;

      localStorage.setItem('token', token);
      setUserFromToken(token);

      setModalInfo({
        show: true,
        title: 'Login Successful!',
        message: response.data.msg,
        isError: false,
      });

      navigate('/');
    } catch (err) {
      console.error('Login failed:', err.response?.data?.msg || 'An error occurred. Please try again.');
      setModalInfo({
        show: true,
        title: 'Error',
        message: err.response?.data?.msg || 'An error occurred. Please try again.',
        isError: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCloseModal = () => {
    setModalInfo({ ...modalInfo, show: false });
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
            <div className="mb-2">
              <label className="register-form-label">Email ID</label>
              <input
                type="email"
                name="email"
                className="form-control register-form-control"
                placeholder="Enter Email ID"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            <div className="mb-2">
              <div className="d-flex justify-content-between">
                <label className="register-form-label">Password</label>
                <Link to="/forgot-password" className="register-form-link">
                  Forgot Password?
                </Link>
              </div>
              <input
                type="password"
                name="password"
                className="form-control register-form-control"
                placeholder="Enter Password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>
            <button
              type="submit"
              className="common-btn"
              disabled={loading}
            >
              {loading ? 'Logging In...' : 'Login'}
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
            {modalInfo.isError ? 'Try Again' : 'Okay'}
          </Button>
        </Modal.Footer>
      </Modal>
    </section>
  );
}
