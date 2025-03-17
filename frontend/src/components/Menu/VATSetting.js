import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2'; // Import SweetAlert2

const VATSetting = ({ userRole }) => {
    const [vatPercentage, setVatPercentage] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const inputRef = useRef(null); // Reference for the input field

    useEffect(() => {
        // Fetch current VAT setting
        axios.get('http://localhost:8000/api/vat-setting/')
            .then(response => {
                setVatPercentage(response.data.vat_percentage);
            })
            .catch(error => {
                console.error('Error fetching VAT setting:', error);
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Failed to fetch VAT setting.',
                    position: 'top-end',
                    showConfirmButton: false,
                    timer: 1500,
                });
            });
    }, []);

    const handleEdit = () => {
        setIsEditing(true);
        setTimeout(() => {
            inputRef.current?.focus(); // Automatically focus on the input field
        }, 0);
    };

    const handleSave = (e) => {
        e.preventDefault(); // Prevent default form submission behavior
        axios.put('http://localhost:8000/api/vat-setting/', { vat_percentage: vatPercentage })
            .then(response => {
                Swal.fire({
                    icon: 'success',
                    title: 'Success',
                    text: 'VAT setting updated successfully.',
                    position: 'top-end',
                    showConfirmButton: false,
                    timer: 1500,
                });
                setIsEditing(false);
            })
            .catch(error => {
                console.error('Error updating VAT setting:', error);
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Failed to update VAT setting.',
                    position: 'top-end',
                    showConfirmButton: false,
                    timer: 1500,
                });
            });
    };

    return (
        <div className="p-4 bg-white rounded shadow">
            <h2 className="text-2xl font-bold mb-4">VAT Setting</h2>
            {userRole === 'owner' ? (
                <>
                    {isEditing ? (
                        <form
                            className="flex items-center space-x-4"
                            onSubmit={handleSave}
                        >
                            <input
                                ref={inputRef} // Attach the ref to the input field
                                type="number"
                                value={vatPercentage}
                                onChange={(e) => setVatPercentage(e.target.value)}
                                className="border border-gray-300 rounded-md p-2 w-full focus:ring focus:ring-blue-500 focus:outline-none"
                                min="0"
                                max="100"
                                step="0.01"
                                placeholder="Enter VAT percentage"
                            />
                            <button
                                type="submit"
                                className="bg-blue-500 text-white p-2 rounded"
                            >
                                Save
                            </button>
                            <button
                                type="button"
                                onClick={() => setIsEditing(false)}
                                className="bg-gray-500 text-white p-2 rounded"
                            >
                                Cancel
                            </button>
                        </form>
                    ) : (
                        <div className="flex items-center">
                            <p className="mr-2">Current VAT: {vatPercentage}%</p>
                            <button
                                onClick={handleEdit} // Trigger the edit functionality
                                className="bg-blue-500 text-white p-2 rounded"
                            >
                                Edit
                            </button>
                        </div>
                    )}
                </>
            ) : (
                <p>You do not have permission to edit the VAT setting.</p>
            )}
        </div>
    );
};

export default VATSetting;
