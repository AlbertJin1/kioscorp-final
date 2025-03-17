import React, { useState, useEffect, useRef } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Topbar from './Topbar';
import UnifiedProductSelect from './UnifiedProductSelect';
import Feedback from './Feedback';
import Loader from './Loader';

import screensaver1 from '../img/Screensaver/screensaver1.png';
import screensaver2 from '../img/Screensaver/screensaver2.png';
import screensaver3 from '../img/Screensaver/screensaver3.png';

const MainComponent = () => {
    const [token, setToken] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [backendAvailable, setBackendAvailable] = useState(true);
    const [cart, setCart] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [sortOption, setSortOption] = useState('name-asc');
    const [products, setProducts] = useState([]);
    const [isScreensaverActive, setIsScreensaverActive] = useState(false);
    const [backgroundIndex, setBackgroundIndex] = useState(0);
    const [inStockOnly, setInStockOnly] = useState(false);
    const [inactivityTime, setInactivityTime] = useState(90);
    const location = useLocation();
    const [currentPage, setCurrentPage] = useState(1);

    const hasReloaded = useRef(false); // Declare useRef at the top level

    useEffect(() => {
        let serverWasDown = false; // Track if the server was previously unreachable

        const checkBackendHealth = async () => {
            try {
                const response = await fetch('http://localhost:8000/api/ping/', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });

                if (!response.ok) {
                    throw new Error('Backend is not reachable');
                }

                // Backend is reachable
                console.log('Backend is reachable');
                setBackendAvailable(true); // Set backend available
                if (serverWasDown && !hasReloaded.current) {
                    hasReloaded.current = true;
                    serverWasDown = false; // Reset flag
                    console.log('Reloading page due to backend recovery.');
                    window.location.reload(); // Reload once on recovery
                }
            } catch (error) {
                console.error('Backend health check failed:', error);
                serverWasDown = true; // Mark server as down
                setBackendAvailable(false); // Set backend unavailable
            }
        };

        const intervalId = setInterval(checkBackendHealth, 5000); // Check every 5 seconds

        return () => clearInterval(intervalId); // Cleanup interval on unmount
    }, []);

    // Function to reset filters and cart
    const resetFiltersAndCart = () => {
        setSearchQuery('');
        setSortOption('name-asc');
        setInStockOnly(false);
        setCart([]);
        setCurrentPage(1); // Reset current page when filters are reset
    };

    useEffect(() => {
        const loginAndFetchData = async () => {
            try {
                const loginResponse = await fetch('http://localhost:8000/api/login/', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        username: 'owner',
                        password: 'password',
                    }),
                });
                if (!loginResponse.ok) throw new Error('Login failed');
                const loginData = await loginResponse.json();
                setToken(loginData.token);
                localStorage.setItem('token', loginData.token);

                // Removed Swal notification here

                const productsResponse = await fetch('http://localhost:8000/api/products/', {
                    headers: {
                        'Authorization': `Token ${loginData.token}`,
                    },
                });
                const productsData = await productsResponse.json();
                setProducts(productsData);
            } catch (error) {
                console.error('Error:', error);
            } finally {
                setIsLoading(false);
            }
        };

        loginAndFetchData();

        let timeoutId;
        const handleUserActivity = () => {
            setIsScreensaverActive(false);
            setInactivityTime(90);
            clearTimeout(timeoutId);
            startInactivityTimer();
        };

        const startInactivityTimer = () => {
            timeoutId = setTimeout(() => {
                setIsScreensaverActive(true);
                resetFiltersAndCart(); // Reset filters and cart when screensaver activates

                // Close the cart modal if it's open
                setIsCartOpen(false); // Close the cart modal when screensaver activates
            }, 90000);
        };

        startInactivityTimer();
        window.addEventListener('mousemove', handleUserActivity);
        window.addEventListener('keydown', handleUserActivity);

        return () => {
            window.removeEventListener('mousemove', handleUserActivity);
            window.removeEventListener('keydown', handleUserActivity);
            clearTimeout(timeoutId);
        };
    }, []);

    useEffect(() => {
        if (inactivityTime > 0 && !isScreensaverActive) {
            const intervalId = setInterval(() => {
                setInactivityTime((prevTime) => prevTime - 1);
            }, 1000);

            return () => clearInterval(intervalId);
        }
    }, [inactivityTime, isScreensaverActive]);

    useEffect(() => {
        if (isScreensaverActive) {
            const intervalId = setInterval(() => {
                setBackgroundIndex((prevIndex) => (prevIndex + 1) % 3);
            }, 5000);

            return () => clearInterval(intervalId);
        }
    }, [isScreensaverActive]);

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <Loader />
            </div>
        );
    }

    if (!backendAvailable) {
        return (
            <div className="flex flex-col items-center justify-center h-screen bg-gray-800 text-white select-none">
                <h1 className="text-3xl font-bold mb-4">Currently Unavailable</h1>
                <p className="text-lg">We are experiencing technical difficulties. Please try again later.</p>
            </div>
        );
    }

    return (
        <div
            className={`flex h-screen ${isScreensaverActive ? 'screensaver' : ''}`}
            style={{
                backgroundImage: isScreensaverActive
                    ? `url(${[screensaver1, screensaver2, screensaver3][backgroundIndex]})`
                    : 'none',
                backgroundSize: 'cover',
                transition: 'background-image 1s ease-in-out',
            }}
        >
            {isScreensaverActive ? (
                <div className="flex justify-center items-center h-screen"></div>
            ) : (
                <div className={`flex flex-col flex-grow h-screen bg-gray-100`}>
                    {location.pathname !== '/feedback' && (
                        <Topbar
                            searchTerm={searchQuery}
                            setSearchTerm={setSearchQuery}
                            sortOption={sortOption}
                            setSortOption={setSortOption}
                            products={products}
                            token={token}
                            inStockOnly={inStockOnly}
                            setInStockOnly={setInStockOnly}
                            inactivityTime={inactivityTime}
                            setCurrentPage={setCurrentPage}
                        />
                    )}
                    <div className={`flex-grow overflow-y-auto ${location.pathname === '/feedback' ? '' : 'p-4'}`}>
                        <Routes>
                            <Route
                                path="/"
                                element={
                                    <UnifiedProductSelect
                                        token={token}
                                        cart={cart}
                                        setCart={setCart}
                                        setIsCartOpen={setIsCartOpen}
                                        searchQuery={searchQuery}
                                        sortOption={sortOption}
                                        isCartOpen={isCartOpen}
                                        products={products}
                                        setProducts={setProducts}
                                        inStockOnly={inStockOnly}
                                        currentPage={currentPage}
                                        setCurrentPage={setCurrentPage}
                                    />
                                }
                            />
                            <Route path="/feedback" element={<Feedback />} />
                        </Routes>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MainComponent;
