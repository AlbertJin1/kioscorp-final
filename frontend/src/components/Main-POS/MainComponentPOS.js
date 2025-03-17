import React, { useEffect, useState, useCallback, useRef } from 'react';
import axios from 'axios';
import SidebarPOS from './SidebarPOS';
import TopBarPOS from './TopBarPOS';
import MainPOS from './MainPOS'; // Import the MainPOS component
import Swal from 'sweetalert2';
import Loader from '../Loader/Loader'; // Import the Loader component
import { useNavigate } from 'react-router-dom'; // Import useNavigate

const MainComponentPOS = ({ loggedInUser, handleLogout }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(true);
    const [pendingOrderCount, setPendingOrderCount] = useState(0); // State to hold the count of pending orders
    const [loading, setLoading] = useState(true); // State to handle loading
    const navigate = useNavigate(); // Initialize useNavigate

    useEffect(() => {
        document.title = 'KiosCorp | POS'; // Set the browser title
    }, []);

    const sidebarRef = useRef(null);

    const checkSessionValidity = useCallback(async () => {
        const handleInvalidSession = () => {
            Swal.fire({
                title: 'Session Invalid',
                text: 'Your session is invalid or has expired. Please log in again.',
                icon: 'error',
                confirmButtonColor: '#0f3a87',
                timer: 2000,
                showConfirmButton: false,
            });
            localStorage.clear();
            setIsAuthenticated(false);
            navigate('/'); // Redirect to Auth page on invalid session
        };

        const token = localStorage.getItem('token');
        if (token) {
            try {
                const response = await axios.get('http://localhost:8000/api/validate-session/', {
                    headers: { Authorization: `Token ${token}` }
                });
                if (response.status !== 200) {
                    throw new Error('Unauthorized');
                }
            } catch (error) {
                handleInvalidSession();
            } finally {
                // Add a delay before setting loading to false
                setTimeout(() => {
                    setLoading(false); // Set loading to false after the check
                }, 1000); // Delay for 1 second (1000 milliseconds)
            }
        } else {
            setLoading(false); // Set loading to false if no token
            navigate('/'); // Redirect to Auth page if not authenticated
        }
    }, [navigate]); // No need to include handleInvalidSession

    // Define fetchOrders function
    const fetchOrders = useCallback(async () => {
        const token = localStorage.getItem('token');
        try {
            const response = await axios.get('http://localhost:8000/api/orders/pending/', {
                headers: { Authorization: `Token ${token}` }
            });
            setPendingOrderCount(response.data.length); // Update the count of pending orders
        } catch (error) {
            console.error('Error fetching orders:', error);
        }
    }, []);

    useEffect(() => {
        checkSessionValidity();
        fetchOrders(); // Fetch orders when the component mounts
    }, [checkSessionValidity, fetchOrders]);

    // Function to handle the go back action
    const handleGoBack = () => {
        navigate(-1); // Go back to the previous page
    };

    return (
        <div className="flex h-screen relative"> {/* Make the container relative */}
            {isAuthenticated && (
                <SidebarPOS
                    ref={sidebarRef}
                    handleLogout={handleLogout}
                    setPendingOrderCount={setPendingOrderCount}
                    fetchOrders={fetchOrders} // Pass fetchOrders to SidebarPOS
                    className="fixed top-0 left-0 h-screen overflow-y-auto bg-white border-r"
                    loggedInUser={loggedInUser}
                    handleGoBack={handleGoBack}
                />
            )}
            <div className="flex flex-col flex-grow h-screen bg-gray-100">
                {isAuthenticated && (
                    <TopBarPOS
                        loggedInUser={loggedInUser}
                        pendingOrderCount={pendingOrderCount} // Pass the pending order count
                        className="fixed top-0 w-full h-16 bg-white border-b"
                        handleLogout={handleLogout}
                    />
                )}
                <div className="flex-grow overflow-y-auto">
                    <MainPOS
                        setPendingOrderCount={setPendingOrderCount}
                        fetchOrders={fetchOrders} // Pass fetchOrders to MainPOS
                    />
                </div>
            </div>
            {loading && ( // Conditionally render the loader overlay
                <div className="absolute inset-0 flex items-center justify-center bg-white z-50"> {/* Overlay styling */}
                    <Loader /> {/* Show loader while checking session */}
                </div>
            )}
        </div>
    );
};

export default MainComponentPOS; // Ensure default export