import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import axios from 'axios';
import React, { useState } from 'react';
import { Button, Modal } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router';
import registerImg from "../img/frame_84.webp";

export default function Register() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phonenumber, setPhonenumber] = useState('');

  const [loading, setLoading] = useState(false);
  const [modalInfo, setModalInfo] = useState({
    show: false,
    title: '',
    message: '',
    isError: false,
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'username') setUsername(value);
    else if (name === 'email') setEmail(value);
    else if (name === 'password') setPassword(value);
    else if (name === 'phonenumber') setPhonenumber(value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (password.length < 6) {
      setModalInfo({
        show: true,
        title: 'Validation Error',
        message: 'Password must be at least 6 characters long.',
        isError: true,
      });
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post('http://localhost:5000/auth/register', { username, email, password, phonenumber });
      console.log(response.data.message);
      setModalInfo({
        show: true,
        title: 'Account Created!',
        message: `Welcome, ${username}! Your account has been successfully created. Please log in to continue.`,
        isError: false,
      });
      setLoading(false);
    } catch (error) {
      console.error('Registration failed:', error.response.data.message);
      setModalInfo({
        show: true,
        title: 'Error',
        message: error.response && error.response.data && error.response.data.message ? error.response.data.message : 'Your Account is not created. Please try again to create account.',
        isError: true,
      });
      setLoading(false);
    }
  };

  const handleCloseModal = () => {
    setModalInfo({ ...modalInfo, show: false });
    navigate('/register'); 
  };

  const handleLoginNow = () => {
    setModalInfo({ ...modalInfo, show: false });
    navigate('/login'); 
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
              <label className="register-form-label">Name</label>
              <input
                type="text"
                name="username"
                className="form-control register-form-control"
                placeholder="Enter Your Name"
                value={username}
                onChange={handleChange}
                required
              />
            </div>
            <div className="mb-2">
              <label className="register-form-label">Email ID</label>
              <input
                type="email"
                name="email"
                className="form-control register-form-control"
                placeholder="Enter Email ID"
                value={email}
                onChange={handleChange}
                required
              />
            </div>
            <div className="mb-2">
              <label className="register-form-label">Password</label>
              <input
                type="password"
                name="password"
                className="form-control register-form-control"
                placeholder="Enter Password"
                value={password}
                onChange={handleChange}
                required
              />
            </div>
            <div className="mb-2">
              <label className="register-form-label">Phone Number</label>
              <input
                type="text"
                name="phonenumber"
                className="form-control register-form-control"
                placeholder="Enter Phone Number"
                value={phonenumber}
                onChange={handleChange}
                required
              />
            </div>
            <button
              type="submit"
              className="common-btn"
              disabled={loading}
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
            <div className="text-center my-4 hint-text">
              <h5>
                Member Already? <Link to="/login">Log In!</Link>
              </h5>
            </div>
          </form>
        </div>
      </div>

      <Modal show={modalInfo.show} onHide={handleCloseModal} centered>
        <Modal.Header closeButton>
          <Modal.Title className={modalInfo.isError ? 'text-danger' : 'text-success'}>
            {modalInfo.title}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-center">
          {modalInfo.isError ? (
            <>
              <DotLottieReact
                src="https://lottie.host/b5e65dcb-a9e4-4fbd-ac80-a25aef4623df/EYBj6Kg9Kc.lottie"
                loop
                autoplay
              />
              {modalInfo.message}
            </>
          ) : (
            <>
              <DotLottieReact
                src="https://lottie.host/62a299b2-0e9a-4bb9-b824-371659e36229/59MTRGn0fz.lottie"
                loop
                autoplay
              />
              {modalInfo.message}
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          {modalInfo.isError ? (
            <Button className="common-btn" variant="secondary" onClick={handleCloseModal}>
              Try Again!
            </Button>
          ) : (
            <Button className="common-btn" onClick={handleLoginNow}>
              Login Now
            </Button>
          )}
        </Modal.Footer>
      </Modal>
    </section>
  );
}
