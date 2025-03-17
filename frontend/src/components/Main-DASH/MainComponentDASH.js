import React, { useCallback, useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import Swal from 'sweetalert2';
import Dashboard from '../Dashboard/Dashboard';
import SalesManagement from '../Sales/SalesManagement';
import Menu from '../Menu/Menu';
import Inventory from '../Inventory/Inventory';
import OrderHistory from '../OrderHistory/OrderHistory';
import Products from '../Products/Products';

const MainComponentWITHauth = ({ loggedInUser, handleLogout }) => {
    const [currentPage, setCurrentPage] = useState('dashboard');
    const [isAuthenticated, setIsAuthenticated] = useState(true); // Assume true since this component is for authenticated users

    const pageTitleMapping = useMemo(() => ({
        dashboard: 'Dashboard',
        menu: 'Menu',
        inventory: 'Inventory',
        'sales-management': 'Sales',
        'order-history': 'Order History',
        product: 'Products',
    }), []);

    useEffect(() => {
        document.title = `KiosCorp | ${pageTitleMapping[currentPage] || 'Dashboard'}`;
    }, [currentPage, pageTitleMapping]);

    const checkSessionValidity = useCallback(async () => {
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
                handleInvalidSession();  // Handle session invalidation
            }
        }
    }, []);

    const handleInvalidSession = () => {
        Swal.fire({
            title: 'Session Invalid',
            text: 'Your session is invalid or has expired. Please log in again.',
            icon: 'error',
            confirmButtonColor: '#0f3a87',
            timer: 2000,
            showConfirmButton: false,
        });
        localStorage.clear();  // Clear any stored session data
        setIsAuthenticated(false);
    };

    // Check session validity when the component mounts
    useEffect(() => {
        checkSessionValidity();
    }, [checkSessionValidity]);

    // Render different pages based on the currentPage state
    const renderPage = () => {
        switch (currentPage) {
            case 'menu':
                return <Menu setIsAuthenticated={setIsAuthenticated} loggedInUser={loggedInUser} handleLogout={handleLogout} />;
            case 'dashboard':
                return <Dashboard />;
            case 'inventory':
                return <Inventory />;
            case 'sales-management':
                return <SalesManagement />;
            case 'order-history':
                return <OrderHistory />;
            case 'product':
                return <Products />;
            default:
                return <Dashboard />;  // Default page if no match
        }
    };

    return (
        <div className="flex h-screen">
            {isAuthenticated && (
                <Sidebar
                    className="fixed top-0 left-0 w-64 h-screen overflow-y-auto bg-white border-r"
                    setCurrentPage={setCurrentPage}
                    currentPage={currentPage}
                    handleLogout={handleLogout} // Pass handleLogout to Sidebar
                />
            )}
            <div className="flex flex-col flex-grow h-screen bg-gray-100">
                {isAuthenticated && (
                    <TopBar
                        className="fixed top-0 w-full h-16 bg-white border-b"
                        currentPage={currentPage}
                        loggedInUser={loggedInUser}
                        handleLogout={handleLogout} // Pass handleLogout to TopBar if needed
                    />
                )}
                <div className="overflow-y-auto custom-scrollbar">
                    {renderPage()}
                </div>
            </div>
        </div>
    );
};

export default MainComponentWITHauth;
