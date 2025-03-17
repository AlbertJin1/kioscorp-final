import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import Loader from '../Loader/Loader'; // Import the Loader component
import imagePlaceholder from '../../img/logo/placeholder-image.png';

const MyProfile = ({ setIsAuthenticated, handleLogout }) => {
    const [profileData, setProfileData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phoneNumber: '',
        gender: '',
        role: '',
    });

    const [originalProfileData, setOriginalProfileData] = useState({});
    const [editing, setEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [profilePicture, setProfilePicture] = useState(null);
    const [profilePicturePreview, setProfilePicturePreview] = useState(null);
    const [showSaveButton, setShowSaveButton] = useState(false);

    useEffect(() => {
        const firstName = localStorage.getItem('firstName');
        const lastName = localStorage.getItem('lastName');
        const email = localStorage.getItem('email');
        const phoneNumber = localStorage.getItem('phoneNumber');
        const gender = localStorage.getItem('gender');
        const role = localStorage.getItem('role');

        const initialProfileData = {
            firstName: firstName || 'N/A',
            lastName: lastName || 'N/A',
            email: email || 'N/A',
            phoneNumber: phoneNumber || 'N/A',
            gender: gender || 'N/A',
            role: role || 'N/A',
        };

        setProfileData(initialProfileData);
        setOriginalProfileData(initialProfileData);
    }, []);

    useEffect(() => {
        const token = localStorage.getItem('token');
        const fetchProfilePicture = async () => {
            try {
                setLoading(true); // Set loading state to true
                const response = await axios.get('http://localhost:8000/api/profile-picture/', {
                    headers: {
                        'Authorization': `Token ${token}`,
                    },
                    responseType: 'blob',
                });
                const profilePicture = URL.createObjectURL(response.data);
                setProfilePicturePreview(profilePicture);
            } catch (error) {
                // Instead of logging the error, just set the profile picture to the placeholder
                setProfilePicturePreview(imagePlaceholder); // Use the placeholder image
            } finally {
                setLoading(false); // Set loading state to false
            }
        };
        fetchProfilePicture();
    }, []);

    const handleEditToggle = () => {
        if (editing) {
            setProfileData(originalProfileData);
        }
        setEditing(prev => !prev);
    };

    const handleSave = async () => {
        Swal.fire({
            title: 'Processing...',
            allowOutsideClick: false,
            showConfirmButton: false,
            timer: 1500,
            didOpen: () => Swal.showLoading()
        });
        setLoading(true);
        try {
            const token = localStorage.getItem('token');

            // Phone number validation (11 digits)
            if (profileData.phoneNumber.length !== 11) {
                Swal.fire({
                    icon: 'error',
                    title: 'Invalid Phone Number',
                    text: 'Phone number must be exactly 11 digits long.',
                    timer: 2000,
                    showConfirmButton: false,
                });
                return;
            }

            const formData = new FormData();
            formData.append('firstName', profileData.firstName);
            formData.append('lastName', profileData.lastName);
            formData.append('phoneNumber', profileData.phoneNumber);
            if (profilePicture) {
                formData.append('profilePicture', profilePicture);
            }

            await axios.put('http://localhost:8000/api/profile/', formData, {
                headers: {
                    'Authorization': `Token ${token}`,
                    'Content-Type': 'multipart/form-data',
                },
            });

            Swal.fire({
                icon: 'success',
                title: 'Profile Updated',
                text: 'Your profile information has been updated successfully. Please log in again.',
                timer: 2000,
                showConfirmButton: false,
            });

            // Call handleLogout instead of manually clearing local storage
            setTimeout(() => {
                handleLogout(); // Use the handleLogout function
            }, 2000); // Delay of 2 seconds
        } catch (error) {
            console.error('Error saving profile data:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Failed to update profile. Please try again later.',
                timer: 2000,
                showConfirmButton: false,
            });
        } finally {
            setLoading(false);
        }
    };

    const handleProductImageChange = (e) => {
        const image = e.target.files[0];
        if (!image) return; // Ensure an image is selected
        const reader = new FileReader();
        reader.onload = (event) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                const width = img.width;
                const height = img.height;
                const aspectRatio = width / height;
                let newWidth, newHeight;
                // Resize logic based on aspect ratio
                if (aspectRatio > 1) {
                    newWidth = height;
                    newHeight = height;
                } else {
                    newWidth = width;
                    newHeight = width;
                }
                canvas.width = newWidth;
                canvas.height = newHeight;
                ctx.drawImage(img, (width - newWidth) / 2, (height - newHeight) / 2, newWidth, newHeight, 0, 0, newWidth, newHeight);
                // Convert canvas to blob
                canvas.toBlob((blob) => {
                    setProfilePicture(blob);
                    setProfilePicturePreview(URL.createObjectURL(blob));
                    setShowSaveButton(true); // Set showSaveButton to true here
                }, 'image/jpeg', 0.8);
            };
            img.src = event.target.result;
        };
        reader.readAsDataURL(image);
    };

    const handleSaveProfilePicture = async () => {
        const token = localStorage.getItem('token');
        const formData = new FormData();
        formData.append('profilePicture', profilePicture);

        Swal.fire({
            title: 'Processing...',
            allowOutsideClick: false,
            showConfirmButton: false,
            timer: 1500,
            didOpen: () => Swal.showLoading()
        });

        try {
            await axios.put('http://localhost:8000/api/update-profile-picture/', formData, {
                headers: {
                    'Authorization': `Token ${token}`,
                    'Content-Type': 'multipart/form-data',
                },
            });

            // Handle the response from the backend
            Swal.fire({
                icon: 'success',
                title: 'Profile Picture Updated',
                text: 'Your profile picture has been updated successfully.',
                timer: 2000,
                showConfirmButton: false,
            });

            // Hide the save button after successful upload
            setShowSaveButton(false);
        } catch (error) {
            console.error('Error updating profile picture:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Failed to update profile picture. Please try again later.',
                timer: 2000,
                showConfirmButton: false,
            });
        }
    };

    return (
        <div className="flex flex-col bg-blue-900 text-white p-4 rounded-md h-full">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">Profile</h2>
                {!loading && (
                    <button
                        onClick={handleEditToggle}
                        className="bg-blue-700 text-white p-2 rounded hover:bg-blue-800 transition duration-200"
                    >
                        {editing ? 'Cancel' : 'Edit Profile'}
                    </button>
                )}
            </div>

            {/* Loader positioned above the data grid */}
            {loading ? (
                <div className="flex justify-center items-center h-full"> {/* Adjust height as needed */}
                    <Loader />
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                    <div className="flex flex-col items-center">
                        {profilePicturePreview ? (
                            <img
                                src={profilePicturePreview}
                                alt="Profile"
                                className="w-72 h-72 rounded object-cover border-2 border-black shadow-lg"
                            />
                        ) : (
                            <img
                                src={imagePlaceholder} // Replace with actual profile picture URL
                                alt="Profile"
                                className="w-72 h-72 rounded object-cover"
                            />
                        )}
                        <label className="mt-4 bg-blue-700 text-white p-2 rounded hover:bg-blue-800 transition duration-200">
                            Upload Profile Picture
                            <input
                                type="file"
                                onChange={handleProductImageChange}
                                accept=".jpg, .jpeg, .png"
                                className="hidden"
                            />
                        </label>
                        {showSaveButton && (
                            <button
                                onClick={handleSaveProfilePicture}
                                className="mt-4 p-2 bg-green-500 text-white rounded hover:bg-green-600 transition duration-200"
                            >
                                Save Profile Picture
                            </button>
                        )}
                    </div>
                    <div className="col-span-2">
                        {/* First Name */}
                        <div className="mb-4">
                            <label className="block text-md font-medium">First Name</label>
                            <input
                                type="text"
                                value={profileData.firstName}
                                onChange={(e) => setProfileData(prev => ({ ...prev, firstName: e.target.value }))}
                                className={`w-full p-2 rounded-md text-white border bg-blue-700 ${editing ? 'border-green-500' : 'border-transparent'}`}
                                readOnly={!editing}
                            />
                        </div>

                        {/* Last Name */}
                        <div className="mb-4">
                            <label className="block text-md font-medium">Last Name</label>
                            <input
                                type="text"
                                value={profileData.lastName}
                                onChange={(e) => setProfileData(prev => ({ ...prev, lastName: e.target.value }))}
                                className={`w-full p-2 rounded-md text-white border bg-blue-700 ${editing ? 'border-green-500' : 'border-transparent'}`}
                                readOnly={!editing}
                            />
                        </div>

                        {/* Email */}
                        <div className="mb-4">
                            <label className="block text-md font-medium">Email</label>
                            <input
                                type="email"
                                value={profileData.email}
                                className="w-full p-2 rounded-md text-white border border-transparent bg-blue-700"
                                readOnly
                            />
                        </div>

                        {/* Gender */}
                        <div className="mb-4">
                            <label className="block text-md font-medium">Gender</label>
                            <input
                                type="text"
                                value={profileData.gender}
                                className="w-full p-2 rounded-md text-white border border-transparent bg-blue-700"
                                readOnly
                            />
                        </div>

                        {/* Phone Number */}
                        <div className="mb-4">
                            <label className="block text-md font-medium">Phone Number</label>
                            <input
                                type="text"
                                value={profileData.phoneNumber}
                                onChange={(e) => setProfileData(prev => ({ ...prev, phoneNumber: e.target.value }))}
                                className={`w-full p-2 rounded-md text-white border bg-blue-700 ${editing ? 'border-green-500' : 'border-transparent'}`}
                                readOnly={!editing}
                            />
                        </div>

                        {/* Role */}
                        <div className="mb-4">
                            <label className="block text-md font-medium">Role</label>
                            <input
                                type="text"
                                value={profileData.role ? profileData.role.charAt(0).toUpperCase() + profileData.role.slice(1) : 'N/A'}
                                className="w-full p-2 rounded-md text-white border border-transparent bg-blue-700"
                                readOnly
                            />
                        </div>
                    </div>
                </div>
            )}

            {editing && (
                <button
                    onClick={handleSave}
                    className="mt-4 p-2 bg-green-500 text-white rounded hover:bg-green-600 transition duration-200"
                >
                    Save
                </button>
            )}
        </div>
    );
};

export default MyProfile;