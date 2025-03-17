import React, { useState, useRef, useEffect } from 'react';
import { FaTimes, FaBoxOpen } from 'react-icons/fa'; // Import the icon you want to use

const ProductModal = ({ isOpen, onRequestClose, products, selectedMonth }) => {
    const [sortOption, setSortOption] = useState('alphabeticalAsc'); // Default sorting option
    const modalRef = useRef(); // Create a ref for the modal

    useEffect(() => {
        // Close the modal when clicking outside of it
        const handleClickOutside = (event) => {
            if (modalRef.current && !modalRef.current.contains(event.target)) {
                onRequestClose();
            }
        };

        // Attach the event listener
        document.addEventListener('mousedown', handleClickOutside);

        // Cleanup the event listener on component unmount
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [onRequestClose]);

    if (!isOpen) return null; // Don't render anything if the modal is not open

    // Sorting logic
    const sortProducts = (products) => {
        switch (sortOption) {
            case 'alphabeticalAsc':
                return [...products].sort((a, b) => a.product_name.localeCompare(b.product_name));
            case 'alphabeticalDesc':
                return [...products].sort((a, b) => b.product_name.localeCompare(a.product_name));
            case 'soldHighToLow':
                return [...products].sort((a, b) => b.quantity - a.quantity);
            case 'soldLowToHigh':
                return [...products].sort((a, b) => a.quantity - b.quantity);
            default:
                return products;
        }
    };

    const sortedProducts = sortProducts(products);

    return (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
            <div ref={modalRef} className="bg-white rounded-lg shadow-lg p-4 w-1/2">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold flex items-center">
                        <FaBoxOpen className="mr-2" /> {/* Add the icon here */}
                        Products Sold in {selectedMonth} {/* Display the selected month */}
                    </h2>
                    <div className="flex items-center">
                        <label htmlFor="sortOptions" className="mr-2 text-lg font-semibold">Sort:</label>
                        <select
                            id="sortOptions"
                            value={sortOption}
                            onChange={(e) => setSortOption(e.target.value)}
                            className="border rounded-md p-1 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 text-md"
                        >
                            <option value="alphabeticalAsc">Alphabetical Asc</option>
                            <option value="alphabeticalDesc">Alphabetical Desc</option>
                            <option value="soldHighToLow">Sold High to Low</option>
                            <option value="soldLowToHigh">Sold Low to High</option>
                        </select>
                        <button onClick={onRequestClose} className="text-white ml-4 bg-red-500 rounded-full p-1 hover:bg-red-700 transition duration-200 ease-in-out">
                            <FaTimes size={30} />
                        </button>
                    </div>
                </div>
                <div className="overflow-y-auto max-h-96"> {/* Set max height for scrollable area */}
                    <table className="min-w-full border-collapse">
                        <thead className="bg-gray-200 sticky top-0">
                            <tr>
                                <th className="border-b px-4 py-2 text-left text-xl">Product</th>
                                <th className="border-b px-4 py-2 text-center text-xl">Color</th>
                                <th className="border-b px-4 py-2 text-center text-xl">Size</th>
                                <th className="border-b px-4 py-2 text-center text-xl">Sold</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sortedProducts.length > 0 ? (
                                sortedProducts.map((product, index) => (
                                    <tr key={index} className="border-b">
                                        <td className="p-4 flex items-center">
                                            <span className="text-xl">{product.product_name}</span> {/* Display product name */}
                                        </td>
                                        <td className="py-2 px-4 text-center">{product.product_color}</td> {/* Display product color */}
                                        <td className="py-2 px-4 text-center">{product.product_size}</td> {/* Display product size */}
                                        <td className="py-2 px-4 text-center w-1/5"><span className="text-green-500 font-bold text-xl">{product.quantity}</span> sold</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="4" className="text-center text-gray-500 py-2">No products sold for this month.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default ProductModal;