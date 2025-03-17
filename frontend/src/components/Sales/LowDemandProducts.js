import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FaArrowDown } from 'react-icons/fa';
import Loader from '../Loader/Loader'; // Import the Loader component

const LowDemandProducts = () => {
    const [products, setProducts] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [intervalId, setIntervalId] = useState(null);
    const [fade, setFade] = useState(false); // State to manage fade effect
    const [loading, setLoading] = useState(true); // State to manage loading

    useEffect(() => {
        const fetchLowDemandProducts = async () => {
            const token = localStorage.getItem('token'); // Retrieve the token from local storage
            try {
                const response = await axios.get('http://localhost:8000/api/low-selling-products/', {
                    headers: {
                        Authorization: `Token ${token}`, // Include the token in the request headers
                    },
                });
                setProducts(response.data);
            } catch (error) {
                console.error("Error fetching low demand products:", error);
                setProducts([]); // Set products to an empty array if there's an error
            } finally {
                setLoading(false); // Set loading to false immediately after fetching
            }
        };

        fetchLowDemandProducts();
    }, []);

    useEffect(() => {
        // Start the automatic product change interval
        if (products.length > 0) {
            const id = setInterval(() => {
                changeProduct((prevIndex) => (prevIndex + 1) % products.length);
            }, 5000);
            setIntervalId(id);

            return () => clearInterval(id); // Cleanup on unmount
        }
    }, [products.length]);

    const changeProduct = (newIndex) => {
        setFade(true); // Trigger fade effect
        setTimeout(() => {
            setCurrentIndex(newIndex);
            setFade(false); // Reset fade effect
        }, 500); // Duration of the fade effect
    };

    const handleProductChange = (index) => {
        if (index !== currentIndex) {
            changeProduct(index); // Change product with fade effect
        }

        // Reset the timer when manually selecting a product
        if (intervalId) {
            clearInterval(intervalId);
        }
        const id = setInterval(() => {
            changeProduct((prevIndex) => (prevIndex + 1) % products.length);
        }, 5000);
        setIntervalId(id);
    };

    if (loading) {
        return (
            <div className="flex flex-col bg-white shadow-md p-4 rounded-lg h-full">
                <h2 className="text-2xl font-bold mb-4 flex items-center">
                    <FaArrowDown className="mr-2 text-red-500 text-3xl" />
                    Low Demand Products
                </h2>
                <Loader /> {/* Show loader below the title */}
            </div>
        ); // Show loader while loading
    }

    // Check if products array has items
    const currentProduct = products[currentIndex];

    return (
        <div className="flex flex-col bg-white shadow-md p-4 rounded-lg h-full">
            {/* Title at the Top */}
            <h2 className="text-2xl font-bold mb-4 flex items-center">
                <FaArrowDown className="mr-2 text-red-500 text-3xl" />
                Low Demand Products
            </h2>

            {/* Show loader only when loading */}
            <div className={`flex flex-row items-center justify-center w-full space-x-6 h-full ${loading ? 'hidden' : 'flex'}`}>
                {currentProduct ? (
                    <>
                        <div className="flex flex-col items-center w-1/2"> {/* Fixed width */}
                            <img
                                src={currentProduct.product_image}
                                alt={currentProduct.product_name}
                                className={`w-72 h-72 rounded object-cover transition-opacity duration-500 ease-in-out ${fade ? 'opacity-0' : 'opacity-100'}`}
                            />
                        </div>

                        <div className={`flex flex-col w-96 transition-opacity duration-500 ease-in-out ${fade ? 'opacity-0' : 'opacity-100'}`}> {/* Fixed width */}
                            <h2 className="text-2xl font-bold">{currentProduct.product_name}</h2>
                            <p className="text-lg text-gray-700">Color: {currentProduct.product_color}</p>
                            <p className="text-lg text-gray-700">Size: {currentProduct.product_size}</p>
                            <p className="text-lg text-gray-700">Type: {currentProduct.product_type}</p>
                            <p className="text-lg text-gray-700 font-bold">Total Sold: <span className="text-green-500 text-3xl">{currentProduct.total_sold}</span></p>
                        </div>
                    </>
                ) : (
                    <div className="text-lg text-gray-700">No data available</div>
                )}
            </div>

            {/* Slideshow Indicators */}
            <div className="flex justify-center mt-4">
                {products.map((_, index) => (
                    <div
                        key={index}
                        onClick={() => handleProductChange(index)} // Navigate to the clicked product
                        className={`w-3 h-3 mx-1 rounded-full cursor-pointer transition-transform duration-300 ease-in-out ${index === currentIndex ? 'bg-red-500 transform scale-125' : 'bg-gray-300'}`}
                    ></div>
                ))}
            </div>
        </div>
    );
};

export default LowDemandProducts;
