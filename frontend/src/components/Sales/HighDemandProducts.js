import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FaArrowUp } from 'react-icons/fa';
import Loader from '../Loader/Loader'; // Import the Loader component

const HighDemandProducts = () => {
    const [products, setProducts] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [intervalId, setIntervalId] = useState(null);
    const [fade, setFade] = useState(false);
    const [loading, setLoading] = useState(true); // State to manage loading

    useEffect(() => {
        const fetchHighDemandProducts = async () => {
            const token = localStorage.getItem('token');
            try {
                const response = await axios.get('http://localhost:8000/api/top-selling-products/', {
                    headers: {
                        Authorization: `Token ${token}`,
                    },
                });
                setProducts(response.data);
            } catch (error) {
                // Instead of logging the error, we handle it gracefully
                setProducts([]); // Set products to an empty array if there's an error
            } finally {
                // Set loading to false immediately after fetching
                setLoading(false);
            }
        };

        fetchHighDemandProducts();
    }, []);

    useEffect(() => {
        const id = setInterval(() => {
            changeProduct((prevIndex) => (prevIndex + 1) % products.length);
        }, 5000);
        setIntervalId(id);

        return () => clearInterval(id);
    }, [products.length]);

    const changeProduct = (newIndex) => {
        setFade(true);
        setTimeout(() => {
            setCurrentIndex(newIndex);
            setFade(false);
        }, 500);
    };

    const handleProductChange = (index) => {
        if (index !== currentIndex) {
            changeProduct(index);
        }

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
                    <FaArrowUp className="mr-2 text-green-500 text-3xl" />
                    High Demand Products
                </h2>
                <Loader /> {/* Show loader below the title */}
            </div>
        ); // Show loader while loading
    }

    // Check if products array has items
    const currentProduct = products[currentIndex];

    return (
        <div className="flex flex-col bg-white shadow-md p-4 rounded-lg h-full">
            <h2 className="text-2xl font-bold mb-4 flex items-center">
                <FaArrowUp className="mr-2 text-green-500 text-3xl" />
                High Demand Products
            </h2>

            {/* Show loader only when loading */}
            <div className={`flex flex-row items-center justify-center w-full space-x-6 h-full ${loading ? 'hidden' : 'flex'}`}>
                {currentProduct ? (
                    <>
                        <div className="flex flex-col items-center w-1/2">
                            <img
                                src={currentProduct.product_image}
                                alt={currentProduct.product_name}
                                className={`w-72 h-72 rounded object-contain transition-opacity duration-500 ease-in-out ${fade ? 'opacity-0' : 'opacity-100'}`}
                            />
                        </div>

                        <div className={`flex flex-col w-96 transition-opacity duration-500 ease-in-out ${fade ? 'opacity-0' : 'opacity-100'}`}>
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

            <div className="flex justify-center mt-4">
                {products.map((_, index) => (
                    <div
                        key={index}
                        onClick={() => handleProductChange(index)}
                        className={`w-3 h-3 mx-1 rounded-full cursor-pointer transition-transform duration-300 ease-in-out ${index === currentIndex ? 'bg-blue-500 transform scale-125' : 'bg-gray-300'}`}
                    ></div>
                ))}
            </div>
        </div>
    );
};

export default HighDemandProducts;