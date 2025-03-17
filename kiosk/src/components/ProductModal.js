import React from 'react';
import { FaTimes } from 'react-icons/fa'; // Import the close icon from react-icons

const ProductModal = ({ product, isOpen, onClose, onAddToCart }) => {
    if (!isOpen || !product) return null;

    const handleBackdropClick = (event) => {
        // Check if the clicked target is the backdrop
        if (event.target === event.currentTarget) {
            onClose(); // Close the modal
        }
    };

    return (
        <div
            className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm"
            onClick={handleBackdropClick} // Add click handler to the backdrop
        >
            <div className="bg-white rounded-lg p-4 w-1/2">
                {/* Header Section */}
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-4xl font-bold">View Product</h2>
                    <button className="text-white bg-red-500 rounded-lg p-1" onClick={onClose}>
                        <FaTimes size={40} />
                    </button>
                </div>

                <div className="flex">
                    {/* Image Section */}
                    <div className="w-1/2">
                        <img
                            src={product.product_image ? `http://localhost:8000${product.product_image}` : "https://via.placeholder.com/150"}
                            alt={product.product_name}
                            className="w-full h-auto object-cover border-2 border-black rounded-md"
                        />
                    </div>

                    {/* Vertical Separator */}
                    <div className="w-px bg-gray-300 mx-4"></div> {/* Adjust width and color as needed */}

                    {/* Information Section */}
                    <div className="flex flex-col justify-between h-full w-1/2">
                        <div className="flex-grow space-y-2">
                            <h2 className="text-3xl font-bold">{product.product_name}</h2>
                            <p className="text-2xl"><strong>Brand:</strong> {product.product_brand}</p>
                            <p className="text-2xl"><strong>Color:</strong> {product.product_color}</p>
                            <p className="text-2xl"><strong>Size:</strong> {product.product_size}</p>
                            <p className="text-2xl">
                                <strong>Availability:</strong>
                                <span className={product.product_quantity > 0 ? 'text-green-500 font-semibold' : 'text-red-500 font-semibold'}>
                                    {product.product_quantity > 0 ? ' In Stock' : ' Out of Stock'}
                                </span>
                            </p>
                        </div>

                        {/* Add to Cart Button at the bottom */}
                        <div className="flex flex-col items-center mt-6">
                            <p className="text-5xl font-bold">₱{product.product_price}</p>
                            <button
                                onClick={product.product_quantity > 0 ? onAddToCart : null}
                                className={`mt-4 text-3xl font-bold h-20 w-full p-2 rounded ${product.product_quantity > 0 ? 'bg-blue-500 text-white hover:bg-blue-700' : 'bg-gray-400 text-gray-700 cursor-not-allowed'}`}
                                disabled={product.product_quantity === 0}
                            >
                                {product.product_quantity > 0 ? 'Add to Cart' : 'Out of Stock'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductModal;