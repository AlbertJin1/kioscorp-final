import React from 'react';
import Swal from 'sweetalert2';
import axios from 'axios';

const ClearSalesData = ({ handleLogout }) => {
    const passkey = 's%I52|U0.(hGE^;E0FWg'; // Defined passkey

    const clearSalesData = async () => {
        const token = localStorage.getItem('token');

        // First confirmation
        const { value: confirmed1 } = await Swal.fire({
            title: '🤔 Are you really sure?',
            text: 'This action will zap all your sales data into the digital void! Are you ready to unleash the chaos?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#0f3a87',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, let the chaos reign!'
        });

        if (confirmed1) {
            // Second confirmation
            const { value: confirmed2 } = await Swal.fire({
                title: '🔮 Are you absolutely positive?',
                text: 'Once you do this, there’s no going back! It’s like hitting the delete button on your life choices!',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#0f3a87',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Yes, I’m ready for the consequences!'
            });

            if (confirmed2) {
                // Final confirmation
                const { value: confirmed3 } = await Swal.fire({
                    title: '🚀 Final Countdown!',
                    text: 'This is the last chance to back out! Are you sure you want to wipe the slate clean?',
                    icon: 'warning',
                    showCancelButton: true,
                    confirmButtonColor: '#0f3a87',
                    cancelButtonColor: '#d33',
                    confirmButtonText: 'Yes, clear it like my browsing history!'
                });

                if (confirmed3) {
                    // Passkey prompt
                    const { value: enteredPasskey } = await Swal.fire({
                        title: '🔑 Enter Passkey',
                        text: 'Please enter the passkey to confirm the action:',
                        input: 'text',
                        inputAttributes: {
                            autocapitalize: 'off',
                            autofocus: true
                        },
                        showCancelButton: true,
                        confirmButtonColor: '#0f3a87',
                        cancelButtonColor: '#d33',
                        confirmButtonText: 'Confirm'
                    });

                    if (enteredPasskey === passkey) {
                        try {
                            const response = await axios.delete('http://localhost:8000/api/customers/clear/', {
                                headers: { Authorization: `Token ${token}` }
                            });

                            if (response.status === 204) {
                                Swal.fire({
                                    icon: 'success',
                                    title: '🎉 Customer Data Cleared!',
                                    text: 'All customer data has been successfully sent to the digital abyss!',
                                    timer: 2000,
                                    showConfirmButton: false,
                                });
                            }
                        } catch (error) {
                            console.error('Error clearing customer data:', error);
                            Swal.fire({
                                icon: 'error',
                                title: '😱 Error!',
                                text: 'Failed to clear customer data. Please try again later, or consult the tech gods!',
                                timer: 2000,
                                showConfirmButton: false,
                            });
                            if (error.response && error.response.status === 401) {
                                handleLogout(); // Logout if unauthorized
                            }
                        }
                    } else {
                        Swal.fire({
                            icon: 'error',
                            title: '❌ Incorrect Passkey!',
                            text: 'The passkey you entered is incorrect. Action aborted.',
                            timer: 2000,
                            showConfirmButton: false,
                        });
                    }
                }
            }
        }
    };

    const clearCustomerData = async () => {
        const token = localStorage.getItem('token');

        // First confirmation
        const { value: confirmed1 } = await Swal.fire({
            title: '🚨 Caution!',
            text: 'Are you absolutely certain you want to erase all customer data? This action is irreversible!',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#0f3a87',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, obliterate the data!'
        });

        if (confirmed1) {
            // Second confirmation
            const { value: confirmed2 } = await Swal.fire({
                title: '⚠️ This is serious!',
                text: 'Once you proceed, all customer information will be permanently deleted. Do you wish to continue?',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#0f3a87',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Yes, proceed with the deletion!'
            });

            if (confirmed2) {
                // Final confirmation
                const { value: confirmed3 } = await Swal.fire({
                    title: '🔒 Last Chance!',
                    text: 'This is your final opportunity to cancel! Are you sure you want to clear all customer data?',
                    icon: 'warning',
                    showCancelButton: true,
                    confirmButtonColor: '#0f3a87',
                    cancelButtonColor: '#d33',
                    confirmButtonText: 'Yes, clear all customer data!'
                });

                if (confirmed3) {
                    // Passkey prompt
                    const { value: enteredPasskey } = await Swal.fire({
                        title: '🔑 Enter Passkey',
                        text: 'Please enter the passkey to confirm the action:',
                        input: 'text',
                        inputAttributes: {
                            autocapitalize: 'off',
                            autofocus: true
                        },
                        showCancelButton: true,
                        confirmButtonColor: '#0f3a87',
                        cancelButtonColor: '#d33',
                        confirmButtonText: 'Confirm'
                    });

                    if (enteredPasskey === passkey) {
                        try {
                            const response = await axios.delete('http://localhost:8000/api/customers/clear/', {
                                headers: { Authorization: `Token ${token}` }
                            });

                            if (response.status === 204) {
                                Swal.fire({
                                    icon: 'success',
                                    title: '🎉 Customer Data Cleared!',
                                    text: 'All customer data has been successfully sent to the digital abyss!',
                                    timer: 2000,
                                    showConfirmButton: false,
                                });
                            }
                        } catch (error) {
                            console.error('Error clearing customer data:', error);
                            Swal.fire({
                                icon: 'error',
                                title: '😱 Error!',
                                text: 'Failed to clear customer data. Please try again later, or consult the tech gods!',
                                timer: 2000,
                                showConfirmButton: false,
                            });
                            if (error.response && error.response.status === 401) {
                                handleLogout(); // Logout if unauthorized
                            }
                        }
                    } else {
                        Swal.fire({
                            icon: 'error',
                            title: '❌ Incorrect Passkey!',
                            text: 'The passkey you entered is incorrect. Action aborted.',
                            timer: 2000,
                            showConfirmButton: false,
                        });
                    }
                }
            }
        }
    };

    return (
        <div className="p-4 bg-white rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-6">Clear Sales Data</h2>
            <button
                onClick={clearSalesData}
                className="bg-red-600 text-white px-4 py-2 rounded-md transition duration-300 ease-in-out transform hover:bg-red-700 hover:scale-105"
            >
                Clear All Sales Data
            </button>
            <h2 className="text-2xl font-bold mb-6 mt-6">Clear Customer Data</h2>
            <button
                onClick={clearCustomerData}
                className="bg-red-600 text-white px-4 py-2 rounded-md transition duration-300 ease-in-out transform hover:bg-red-700 hover:scale-105"
            >
                Clear All Customer Data
            </button>
        </div>
    );
};

export default ClearSalesData;
