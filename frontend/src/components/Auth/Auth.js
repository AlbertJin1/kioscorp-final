import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import formBackgroundImage from '../../img/Background/background.png';
import sideImage from '../../img/Background/company.png';

const Auth = ({ setIsAuthenticated, setLoggedInUser }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [isOwnerRegistration, setIsOwnerRegistration] = useState(false);
    const [isResetPassword, setIsResetPassword] = useState(false);
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        confirmPassword: '',
        firstName: '',
        lastName: '',
        gender: '',
        phoneNumber: '',
        email: '',
        secretPasskey: '',
    });
    const [resetFormData, setResetFormData] = useState({
        username: '',
        newPassword: '',
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [showPasskey, setShowPasskey] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [fadeOut, setFadeOut] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleResetChange = (e) => {
        setResetFormData({ ...resetFormData, [e.target.name]: e.target.value });
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const toggleConfirmPasswordVisibility = () => {
        setShowConfirmPassword(!showConfirmPassword);
    };

    const togglePasskeyVisibility = () => {
        setShowPasskey(!showPasskey);
    };

    const showLoading = () => {
        Swal.fire({
            title: 'Processing...',
            html: 'Please wait while we process your request.',
            didOpen: () => {
                Swal.showLoading();
            },
            allowOutsideClick: false,
            showConfirmButton: false,
        });
    };

    const handleLogin = async () => {
        showLoading();

        try {
            const response = await axios.post('http://localhost:8000/api/login/', {
                username: formData.username,
                password: formData.password,
            });

            // Close the processing modal immediately
            Swal.close();
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('firstName', response.data.firstName);
            localStorage.setItem('lastName', response.data.lastName);
            localStorage.setItem('email', response.data.email);
            localStorage.setItem('gender', response.data.gender);
            localStorage.setItem('phoneNumber', response.data.phoneNumber);
            localStorage.setItem('role', response.data.role);
            setIsAuthenticated(true);
            setLoggedInUser({
                firstName: response.data.firstName,
                lastName: response.data.lastName,
                phoneNumber: response.data.phoneNumber,
                role: response.data.role,
            });

            Swal.fire({
                icon: 'success',
                title: 'Login Successful',
                text: response.data.success || response.data.message,
                timer: 2000,
                showConfirmButton: false,
            });

            setIsSubmitting(false);
        } catch (error) {
            // Close the processing modal immediately
            Swal.close();
            Swal.fire({
                icon: 'error',
                title: 'Login Failed',
                text: error.response?.data?.error || 'Something went wrong!',
                timer: 2000,
                showConfirmButton: false,
            });
            setIsSubmitting(false);
        }
    };

    const handleRegistration = async () => {
        showLoading();

        try {
            const response = await axios.post('http://localhost:8000/api/register/', {
                username: formData.username,
                email: formData.email,
                password: formData.password,
                firstName: formData.firstName,
                lastName: formData.lastName,
                gender: formData.gender,
                phoneNumber: formData.phoneNumber,
            });

            // Close the processing modal immediately
            Swal.close();
            setFormData({
                username: '',
                password: '',
                confirmPassword: '',
                firstName: '',
                lastName: '',
                gender: '',
                phoneNumber: '',
                email: '',
                secretPasskey: '',
            });
            setIsLogin(true);

            Swal.fire({
                icon: 'success',
                title: 'Registration Successful',
                text: response.data.success || response.data.message,
                timer: 2000,
                showConfirmButton: false,
            });

            setIsSubmitting(false);
        } catch (error) {
            // Close the processing modal immediately
            Swal.close();
            Swal.fire({
                icon: 'error',
                title: 'Registration Failed',
                text: error.response?.data?.error || 'Something went wrong!',
                timer: 2000,
                showConfirmButton: false,
            });
            setIsSubmitting(false);
        }
    };

    const handleOwnerRegistration = async () => {
        showLoading();

        try {
            const response = await axios.post('http://localhost:8000/api/register-owner/', {
                username: formData.username,
                email: formData.email,
                password: formData.password,
                firstName: formData.firstName,
                lastName: formData.lastName,
                gender: formData.gender,
                phoneNumber: formData.phoneNumber,
                secretPasskey: formData.secretPasskey,
            });

            // Close the processing modal immediately
            Swal.close();
            setFormData({
                username: '',
                password: '',
                confirmPassword: '',
                firstName: '',
                lastName: '',
                gender: '',
                phoneNumber: '',
                email: '',
                secretPasskey: '',
            });
            setIsLogin(true);

            Swal.fire({
                icon: 'success',
                title: 'Owner Registration Successful',
                text: response.data.success || response.data.message,
                timer: 2000,
                showConfirmButton: false,
            });

            setIsSubmitting(false);
        } catch (error) {
            // Close the processing modal immediately
            Swal.close();
            Swal.fire({
                icon: 'error',
                title: 'Owner Registration Failed',
                text: error.response?.data?.error || 'Something went wrong!',
                timer: 2000,
                showConfirmButton: false,
            });
            setIsSubmitting(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (isResetPassword) {
            await handleResetPassword();
            return;
        }

        if (isSubmitting) {
            return;
        }

        setIsSubmitting(true);

        if (isLogin) {
            await handleLogin();
        } else if (isOwnerRegistration) {
            await handleOwnerRegistration();
        } else {
            await handleRegistration();
        }
    };

    const handleResetPassword = async () => {
        if (isSubmitting) {
            return;
        }

        setIsSubmitting(true);

        if (!resetFormData.username || !resetFormData.newPassword) {
            Swal.fire({
                icon: 'error',
                title: 'Incomplete Form',
                text: 'Please fill out all the required fields.',
                timer: 2000,
                showConfirmButton: false,
            });
            setIsSubmitting(false);
            return;
        }

        const regex = /^.{8,}$/;
        if (!regex.test(resetFormData.newPassword)) {
            Swal.fire({
                icon: 'error',
                title: 'Invalid Password',
                text: 'Password must be at least 8 characters long.',
                timer: 2000,
                showConfirmButton: false,
            });
            setIsSubmitting(false);
            return;
        }

        showLoading();

        try {
            const response = await axios.post('http://localhost:8000/api/reset-password/', {
                username: resetFormData.username,
                newPassword: resetFormData.newPassword,
            });

            // Close the processing modal immediately
            Swal.close();
            Swal.fire({
                icon: 'success',
                title: 'Password Reset Successful',
                text: response.data.success,
                timer: 2000,
                showConfirmButton: false,
            });

            setIsResetPassword(false);
            setIsSubmitting(false);
        } catch (error) {
            // Close the processing modal immediately
            Swal.close();
            Swal.fire({
                icon: 'error',
                title: 'Password Reset Failed',
                text: error.response?.data?.error || 'Something went wrong!',
                timer: 2000,
                showConfirmButton: false,
            });
            setIsSubmitting(false);
        }
    };

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            setIsAuthenticated(false);
        }
    }, [setIsAuthenticated]);

    const handleFormSwitch = (formType) => {
        setFadeOut(true);
        setTimeout(() => {
            if (formType === 'login') {
                setIsLogin(true);
                setIsOwnerRegistration(false);
                setIsResetPassword(false);
            } else if (formType === 'register') {
                setIsLogin(false);
                setIsOwnerRegistration(false);
                setIsResetPassword(false);
            } else if (formType === 'owner') {
                setIsLogin(false);
                setIsOwnerRegistration(true);
                setIsResetPassword(false);
            } else if (formType === 'reset') {
                setIsLogin(false);
                setIsOwnerRegistration(false);
                setIsResetPassword(true);
            }
            setFadeOut(false);
        }, 300); // Match this duration with the CSS transition duration
    };

    return (
        <div
            className="flex items-center justify-center min-h-screen bg-cover bg-no-repeat"
            style={{
                backgroundImage: `url(${formBackgroundImage})`,
                backgroundSize: 'cover',
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                overflow: 'hidden',
            }}
        >
            <div className="flex bg-gray-100 rounded-lg shadow-2xl w-[1000px] h-[500px]">
                <div
                    className="hidden md:block md:w-1/2 bg-cover bg-center rounded-l-lg"
                    style={{
                        backgroundImage: `url(${sideImage})`,
                        width: '650px',
                        height: '500px',
                    }}
                ></div>
                <div className="p-8 w-full md:w-1/2 flex flex-col justify-center">
                    <h2 className="text-3xl font-bold text-center mb-6">
                        {isResetPassword ? 'Reset Password' : isLogin ? 'Login' : isOwnerRegistration ? 'Register as Owner' : 'Register'}
                    </h2>
                    <div className={`transition-opacity duration-300 ${fadeOut ? 'opacity-0' : 'opacity-100'}`}>
                        {isResetPassword ? (
                            <form onSubmit={handleSubmit}>
                                <input
                                    type="text"
                                    name="username"
                                    placeholder="Username"
                                    value={resetFormData.username}
                                    onChange={handleResetChange}
                                    required
                                    className="w-full p-2 mb-4 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                <div className="relative mb-4">
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        name="newPassword"
                                        placeholder="New Password"
                                        value={resetFormData.newPassword}
                                        onChange={handleResetChange}
                                        required
                                        className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                    <button
                                        type="button"
                                        onClick={togglePasswordVisibility}
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-600 hover:text-gray-800 focus:outline-none"
                                        tabIndex="-1"
                                    >
                                        <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
                                    </button>
                                </div>
                                <button
                                    type="submit"
                                    className="w-full mt-4 p-2 text-white rounded bg-blue-800 hover:bg-blue-600 transition duration-200 text-xl font-semibold"
                                    disabled={isSubmitting}
                                >
                                    Reset Password
                                </button>
                                <p
                                    className="mt-4 text-center cursor-pointer text-blue-500 hover:text-blue-700 transition duration-200"
                                    onClick={() => handleFormSwitch('login')}
                                >
                                    Back to Login
                                </p>
                            </form>
                        ) : (
                            <form onSubmit={handleSubmit}>
                                {isLogin ? (
                                    <>
                                        <input
                                            type="text"
                                            name="username"
                                            placeholder="Username"
                                            value={formData.username}
                                            onChange={handleChange}
                                            required
                                            className="w-full p-2 mb-4 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                        <div className="relative mb-4">
                                            <input
                                                type={showPassword ? 'text' : 'password'}
                                                name="password"
                                                placeholder="Password"
                                                value={formData.password}
                                                onChange={handleChange}
                                                required
                                                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            />
                                            <button
                                                type="button"
                                                onClick={togglePasswordVisibility}
                                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-600 hover:text-gray-800 focus:outline-none"
                                                tabIndex="-1"
                                            >
                                                <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
                                            </button>
                                        </div>
                                    </>
                                ) : (
                                    <div className="grid grid-cols-2 gap-4">
                                        <input
                                            type="text"
                                            name="username"
                                            placeholder="Username"
                                            value={formData.username}
                                            onChange={handleChange}
                                            required
                                            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                        <input
                                            type="email"
                                            name="email"
                                            placeholder="Email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            required
                                            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                        <div className="relative">
                                            <input
                                                type={showPassword ? 'text' : 'password'}
                                                name="password"
                                                placeholder="Password"
                                                value={formData.password}
                                                onChange={handleChange}
                                                required
                                                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            />
                                            <button
                                                type="button"
                                                onClick={togglePasswordVisibility}
                                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-600 hover:text-gray-800 focus:outline-none"
                                                tabIndex="-1"
                                            >
                                                <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
                                            </button>
                                        </div>
                                        <div className="relative">
                                            <input
                                                type={showConfirmPassword ? 'text' : 'password'}
                                                name="confirmPassword"
                                                placeholder="Confirm Password"
                                                value={formData.confirmPassword}
                                                onChange={handleChange}
                                                required
                                                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            />
                                            <button
                                                type="button"
                                                onClick={toggleConfirmPasswordVisibility}
                                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-600 hover:text-gray-800 focus:outline-none"
                                                tabIndex="-1"
                                            >
                                                <FontAwesomeIcon icon={showConfirmPassword ? faEyeSlash : faEye} />
                                            </button>
                                        </div>
                                        <input
                                            type="text"
                                            name="firstName"
                                            placeholder="First Name"
                                            value={formData.firstName}
                                            onChange={handleChange}
                                            required
                                            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                        <input
                                            type="text"
                                            name="lastName"
                                            placeholder="Last Name"
                                            value={formData.lastName}
                                            onChange={handleChange}
                                            required
                                            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                        <select
                                            name="gender"
                                            value={formData.gender}
                                            onChange={handleChange}
                                            required
                                            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        >
                                            <option value="" disabled>Select Gender</option>
                                            <option value="Male">Male</option>
                                            <option value="Female">Female</option>
                                        </select>
                                        <input
                                            type="tel"
                                            name="phoneNumber"
                                            placeholder="Phone Number (09xxxxxxxxx)"
                                            value={formData.phoneNumber}
                                            onChange={handleChange}
                                            onKeyPress={(e) => {
                                                if (!/[0-9]/.test(e.key)) {
                                                    e.preventDefault();
                                                }
                                            }}
                                            required
                                            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            pattern="[0-9]{11}"
                                            maxLength="11"
                                            minLength="11"
                                            inputMode="numeric"
                                        />
                                        {isOwnerRegistration && (
                                            <div className="relative col-span-2">
                                                <input
                                                    type={showPasskey ? 'text' : 'password'}
                                                    name="secretPasskey"
                                                    placeholder="Secret Passkey"
                                                    value={formData.secretPasskey}
                                                    onChange={handleChange}
                                                    required
                                                    className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={togglePasskeyVisibility}
                                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-600 hover:text-gray-800 focus:outline ```javascript
                                                    none"
                                                    tabIndex="-1"
                                                >
                                                    <FontAwesomeIcon icon={showPasskey ? faEyeSlash : faEye} />
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                )}
                                <button
                                    type="submit"
                                    className="w-full mt-4 p-2 text-white rounded bg-blue-800 hover:bg-blue-600 transition duration-200 text-xl font-semibold"
                                    disabled={isSubmitting}
                                >
                                    {isLogin ? 'Login' : isOwnerRegistration ? 'Register as Owner' : 'Register'}
                                </button>

                                <p
                                    className="mt-4 text-center cursor-pointer hover:text-blue-700 transition duration-200 text-blue-500"
                                    onClick={() => {
                                        if (isLogin) {
                                            handleFormSwitch('register');
                                        } else if (isOwnerRegistration) {
                                            handleFormSwitch('login');
                                        } else {
                                            handleFormSwitch('owner');
                                        }
                                    }}
                                >
                                    {isLogin
                                        ? "Register as Cashier"
                                        : isOwnerRegistration
                                            ? 'Back to Registration'
                                            : 'Register as Owner'}
                                </p>

                                {!isLogin && !isOwnerRegistration && (
                                    <p className="mt-4 text-center">
                                        <span>Already have an account?</span>
                                        <span
                                            className="ml-2 cursor-pointer text-blue-500 hover:text-blue-700 transition duration-200"
                                            onClick={() => {
                                                handleFormSwitch('login');
                                            }}
                                        >
                                            Login
                                        </span>
                                    </p>
                                )}

                                {isResetPassword ? (
                                    <p
                                        className="mt-4 text-center cursor-pointer text-blue-500 hover:text-blue-700 transition duration-200"
                                        onClick={() => handleFormSwitch('login')}
                                    >
                                        Back to Login
                                    </p>
                                ) : (
                                    isLogin && (
                                        <p className="mt-4 text-center">
                                            <span
                                                className="text-black"
                                            >
                                                Forgot Password?
                                            </span>
                                            <span
                                                className="ml-2 cursor-pointer text-blue-500 hover:text-blue-700 transition duration-200"
                                                onClick={() => handleFormSwitch('reset')}
                                            >
                                                Reset
                                            </span>
                                        </p>
                                    )
                                )}
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Auth;