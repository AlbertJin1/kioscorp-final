import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Tooltip } from 'react-tooltip';
import { FaBoxes } from 'react-icons/fa';
import Loader from '../Loader/Loader';

const InventoryLevel = () => {
    const [products, setProducts] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [sortOption, setSortOption] = useState('alphabeticalAsc');
    const [loading, setLoading] = useState(true);
    const productsPerPage = 5;

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get('http://localhost:8000/api/products', {
                    headers: {
                        Authorization: `Token ${token}`
                    }
                });
                setProducts(response.data);
                setLoading(false); // Set loading to false after fetching data
            } catch (error) {
                console.error('Error fetching products:', error);
                setLoading(false); // Ensure loading is set to false even if there's an error
            }
        };

        fetchProducts(); // Fetch products immediately on mount

        const interval = setInterval(() => {
            fetchProducts(); // Refetch every 15 seconds without resetting loading
        }, 15000);
        return () => clearInterval(interval);
    }, []);

    const getStockLevel = (quantity) => {
        if (quantity === 0) return 'Out of Stock';
        if (quantity >= 50) return 'High';
        if (quantity >= 35) return 'Medium';
        return 'Low';
    };

    // Sorting logic
    const sortedProducts = [...products].sort((a, b) => {
        // Always show out-of-stock items first
        if (a.product_quantity === 0 && b.product_quantity !== 0) return -1;
        if (b.product_quantity === 0 && a.product_quantity !== 0) return 1;

        // Apply the selected sorting option to the remaining items
        switch (sortOption) {
            case 'alphabeticalAsc':
                return a.product_name.localeCompare(b.product_name);
            case 'alphabeticalDesc':
                return b.product_name.localeCompare(a.product_name);
            case 'quantityHighToLow':
                return b.product_quantity - a.product_quantity;
            case 'quantityLowToHigh':
                return a.product_quantity - b.product_quantity;
            default:
                return 0;
        }
    });

    const indexOfLastProduct = currentPage * productsPerPage;
    const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
    const currentProducts = sortedProducts.slice(indexOfFirstProduct, indexOfLastProduct);

    const totalPages = Math.ceil(products.length / productsPerPage);

    const handleSortChange = (e) => {
        setSortOption(e.target.value);
        setCurrentPage(1); // Reset to page 1 on sort change
    };

    return (
        <div className="container mx-auto p-4 bg-white shadow-md rounded-lg h-full flex flex-col">
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold flex items-center">
                    <FaBoxes className="mr-2 text-3xl text-red-500" />
                    Inventory Levels
                </h1>
                <select
                    value={sortOption}
                    onChange={handleSortChange}
                    className="border rounded-md p-2 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    <option value="alphabeticalAsc">Alphabetical Asc</option>
                    <option value="alphabeticalDesc">Alphabetical Desc</option>
                    <option value="quantityHighToLow">Quantity High to Low</option>
                    <option value="quantityLowToHigh">Quantity Low to High</option>
                </select>
            </div>
            {loading ? (
                <Loader />
            ) : (
                <div className="flex flex-col flex-grow">
                    <div className="overflow-y-auto overflow-x-hidden flex-grow h-56">
                        <table className="min-w-full bg-white rounded ">
                            <thead className="bg-[#022a5e] text-white text-md leading-normal sticky top-0 z-10">
                                <tr>
                                    <th className="py-2 px-4 text-center w-1/4">Product</th>
                                    <th className="py-2 px-4 text-center w-1/3">Quantity</th>
                                    <th className="py-2 px-4 text-center w-1/3">Stock Level</th>
                                </tr>
                            </thead>

                            <tbody className="text-gray-700 text-sm font-light">
                                {products.length === 0 ? (
                                    <tr>
                                        <td colSpan="3" className="py-4 text-center text-gray-700">
                                            No data available
                                        </td>
                                    </tr>
                                ) : (
                                    currentProducts.map((product, index) => (
                                        <tr key={index} className="border-b border-gray-200 hover:bg-gray-50 text-lg font-semibold">
                                            <td className="py-3 px-6 text-center relative">
                                                <div className="flex justify-center items-center h-full relative">
                                                    <img
                                                        src={product.product_image ? `http://localhost:8000${product.product_image}` : "https://via.placeholder.com/150"}
                                                        alt={product.product_name}
                                                        className="w-16 h-16 object-cover rounded mx-auto"
                                                        onError={(e) => {
                                                            e.target.onerror = null;
                                                            e.target.src = "https://via.placeholder.com/150";
                                                        }}
                                                        id={`product-image-${index}`} // Unique ID for the image
                                                        data-tooltip-content={`${product.product_name} (${product.product_color}, ${product.product_size})`} // Updated tooltip content
                                                        data-tooltip-id={`tooltip-${index}`} // Unique ID for the tooltip
                                                    />
                                                    <Tooltip
                                                        id={`tooltip-${index}`} // Corresponding tooltip ID
                                                        className="font-semibold z-50"
                                                        place="right"
                                                        style={{ fontSize: '1rem' }}
                                                    />
                                                </div>
                                            </td>
                                            <td className="py-3 px-6 text-center">
                                                {product.product_quantity === 0 ? 'Out of Stock' : product.product_quantity}
                                            </td>
                                            <td className="py-3 px-6 text-center">{getStockLevel(product.product_quantity)}</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                    <div className="flex justify-center items-center mt-4">
                        {/* Page Number Buttons */}
                        {totalPages > 0 && (
                            <>
                                <button
                                    onClick={() => setCurrentPage(1)}
                                    className={`mx-1 rounded transition duration-300 ${currentPage === 1 ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-600 hover:bg-blue-500 hover:text-white'}`}
                                    style={{ width: '60px', height: '40px' }} // Fixed width and height
                                >
                                    1
                                </button>

                                {currentPage > 3 && <span className="mx-1">...</span>} {/* Show ellipsis if there are pages in between */}

                                {Array.from({ length: Math.min(3, totalPages - 2) }, (_, index) => {
                                    const pageNum = Math.max(2, currentPage - 1) + index; // Start from currentPage - 1
                                    if (pageNum > totalPages - 1) return null; // Avoid rendering pages beyond totalPages

                                    return (
                                        <button
                                            key={pageNum}
                                            onClick={() => setCurrentPage(pageNum)}
                                            className={`mx-1 rounded transition duration-300 ${currentPage === pageNum ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-600 hover:bg-blue-500 hover:text-white'}`}
                                            style={{ width: '60px', height: '40px' }} // Fixed width and height
                                        >
                                            {pageNum}
                                        </button>
                                    );
                                })}

                                {currentPage < totalPages - 2 && <span className="mx-1">...</span>} {/* Show ellipsis if there are pages in between */}

                                {totalPages > 1 && (
                                    <button
                                        onClick={() => setCurrentPage(totalPages)}
                                        className={`mx-1 rounded transition duration-300 ${currentPage === totalPages ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-600 hover:bg-blue-500 hover:text-white'}`}
                                        style={{ width: '60px', height: '40px' }} // Fixed width and height
                                    >
                                        {totalPages}
                                    </button>
                                )}
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default InventoryLevel;