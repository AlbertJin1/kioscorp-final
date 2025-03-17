import React, { useState, useEffect } from 'react';
import { FaChevronLeft, FaChevronRight, FaTimes } from 'react-icons/fa';
import { IoMdCart } from 'react-icons/io';
import { useSwipeable } from 'react-swipeable';
import CartModal from './CartModal';
import { useNavigate } from 'react-router-dom';

const UnifiedProductSelect = ({ token, cart, setCart, isCartOpen, searchQuery, sortOption, setIsCartOpen, inStockOnly, currentPage, setCurrentPage }) => {
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [mainCategories, setMainCategories] = useState([]);
    const [subCategories, setSubCategories] = useState([]);
    const [selectedMainCategory, setSelectedMainCategory] = useState(null);
    const [selectedSubCategory, setSelectedSubCategory] = useState(null);
    const productsPerPage = 6
    const [currentSubCategoryPage, setCurrentSubCategoryPage] = useState(1);
    const subCategoriesPerPage = 5;

    const [selectedProduct, setSelectedProduct] = useState(null);
    const [isProductModalOpen, setIsProductModalOpen] = useState(false);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const mainCategoriesResponse = await fetch('http://localhost:8000/api/main-categories/', {
                    headers: { 'Authorization': `Token ${token}` },
                });
                const mainCategoriesData = await mainCategoriesResponse.json();
                setMainCategories(mainCategoriesData);

                const subCategoriesResponse = await fetch('http://localhost:8000/api/sub-categories/', {
                    headers: { 'Authorization': `Token ${token}` },
                });
                const subCategoriesData = await subCategoriesResponse.json();
                setSubCategories(subCategoriesData);
            } catch (error) {
                console.error('Error fetching categories:', error);
            }
        };

        fetchCategories();
    }, [token]);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                let url = 'http://localhost:8000/api/products/';
                const params = new URLSearchParams();
                if (selectedMainCategory) {
                    params.append('main_category', selectedMainCategory);
                }
                if (selectedSubCategory) {
                    params.append('sub_category', selectedSubCategory);
                }
                url += `?${params.toString()}`;
                const response = await fetch(url, {
                    headers: { 'Authorization': `Token ${token}` },
                });
                const data = await response.json();
                setProducts(data);
            } catch (error) {
                console.error('Error fetching products:', error);
            }
        };

        // Initial fetch on mount
        fetchProducts();

        // Set up interval to refetch products every 15 seconds
        const intervalId = setInterval(() => {
            fetchProducts();
        }, 15000); // 15000 milliseconds = 15 seconds

        // Cleanup function to clear the interval on component unmount
        return () => clearInterval(intervalId);
    }, [token, selectedMainCategory, selectedSubCategory]);

    const filteredProducts = products.filter(product => {
        const matchesSearchQuery = product.product_name.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesMainCategory = selectedMainCategory
            ? subCategories.some(sub => sub.sub_category_id === product.sub_category && sub.main_category === selectedMainCategory)
            : true;

        const matchesSubCategory = selectedSubCategory ? product.sub_category === selectedSubCategory : true;

        const matchesInStock = inStockOnly ? product.product_quantity > 0 : true; // Check stock condition

        return matchesSearchQuery && matchesMainCategory && matchesSubCategory && matchesInStock;
    });

    useEffect(() => {
        const fetchSubCategories = async () => {
            try {
                const response = await fetch('http://localhost:8000/api/sub-categories/', {
                    headers: { 'Authorization': `Token ${token}` },
                });
                const subCategoriesData = await response.json();
                setSubCategories(subCategoriesData);
            } catch (error) {
                console.error('Error fetching subcategories:', error);
            }
        };

        // Initial fetch on mount
        fetchSubCategories();

        // Set up interval to refetch subcategories every 15 seconds
        const intervalId = setInterval(() => {
            fetchSubCategories();
        }, 15000); // 15000 milliseconds = 15 seconds

        // Cleanup function to clear the interval on component unmount
        return () => clearInterval(intervalId);
    }, [token]);

    // Reset pagination when inStockOnly is toggled
    useEffect(() => {
        setCurrentPage(1);
    }, [setCurrentPage, inStockOnly]); // Add setCurrentPage


    // Reset pagination when the main category changes
    useEffect(() => {
        setCurrentPage(1);
        setCurrentSubCategoryPage(1); // Reset subcategory page only when main category changes
    }, [setCurrentPage, selectedMainCategory]);

    // Reset pagination when the subcategory changes
    useEffect(() => {
        setCurrentPage(1); // Reset product page when subcategory changes
    }, [setCurrentPage, selectedSubCategory]);

    // Add a new useEffect to manage subcategory page changes
    useEffect(() => {
        // If the selectedSubCategory is null, reset the subcategory page
        if (selectedSubCategory === null) {
            setCurrentSubCategoryPage(1);
        }
    }, [selectedSubCategory]);

    // Sort the filtered products
    const sortedProducts = [...filteredProducts].sort((a, b) => {
        if (sortOption === 'name-asc') {
            return a.product_name.localeCompare(b.product_name);
        } else if (sortOption === 'name-desc') {
            return b.product_name.localeCompare(a.product_name);
        } else if (sortOption === 'price-asc') {
            return a.product_price - b.product_price;
        } else if (sortOption === 'price-desc') {
            return b.product_price - a.product_price;
        }
        return 0;
    });

    // Pagination logic
    const totalPages = Math.ceil(sortedProducts.length / productsPerPage);
    const currentProducts = sortedProducts.slice((currentPage - 1) * productsPerPage, currentPage * productsPerPage);

    const handlers = useSwipeable({
        onSwipedLeft: () => setCurrentPage((prev) => Math.min(prev + 1, totalPages)),
        onSwipedRight: () => setCurrentPage((prev) => Math.max(prev - 1, 1)),
        onSwipedUp: () => setCurrentPage((prev) => Math.min(prev + 1, totalPages)),
        onSwipedDown: () => setCurrentPage((prev) => Math.max(prev - 1, 1)),
        preventDefaultTouchmoveEvent: true,
        trackMouse: true,
    });

    const handleAddToCart = (product) => {
        const existingProduct = cart.find(item => item.product_id === product.product_id);
        const currentQuantityInCart = existingProduct ? existingProduct.quantity : 0;

        // Check if adding one more would exceed the available stock
        if (currentQuantityInCart + 1 > product.product_quantity) {
            return; // Exit the function if stock limit is reached
        }

        // If the product is already in the cart, increase the quantity
        if (existingProduct) {
            setCart(prevCart => prevCart.map(item =>
                item.product_id === product.product_id ? { ...item, quantity: (item.quantity || 1) + 1 } : item
            ));
        } else {
            // If the product is not in the cart, add it
            setCart(prevCart => [...prevCart, { ...product, quantity: 1 }]);
        }
    };

    // Sort the subCategories alphabetically (A-Z)
    const sortedSubCategories = subCategories.sort((a, b) =>
        a.sub_category_name.localeCompare(b.sub_category_name)
    );

    // Slice the sorted array for pagination
    const paginatedSubCategories = sortedSubCategories.slice(
        (currentSubCategoryPage - 1) * subCategoriesPerPage,
        currentSubCategoryPage * subCategoriesPerPage
    );

    const handleProductClick = (product) => {
        setSelectedProduct(product);
        setIsProductModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsProductModalOpen(false);
        setSelectedProduct(null);
    };

    // Product Modal JSX
    const ProductModal = ({ product, isOpen, onClose, onAddToCart }) => {
        if (!isOpen || !product) return null;

        const handleBackdropClick = (event) => {
            if (event.target === event.currentTarget) {
                onClose();
            }
        };

        return (
            <div
                className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm"
                onClick={handleBackdropClick}
            >
                <div className="bg-white rounded-lg p-4 w-1/2">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-4xl font-bold">View Product</h2>
                        <button className="text-white bg-red-500 rounded-lg p-1" onClick={onClose}>
                            <FaTimes size={40} />
                        </button>
                    </div>

                    <div className="flex">
                        <div className="w-1/2">
                            <img
                                src={product.product_image ? `http://localhost:8000${product.product_image}` : "https://via.placeholder.com/150"}
                                alt={product.product_name}
                                className="w-full h-auto object-cover border-2 border-black rounded-md"
                            />
                        </div>
                        <div className="w-px bg-gray-300 mx-4"></div>
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
                            <div className="flex flex-col items-center mt-6">
                                <p className="text-5xl font-bold">₱{product.product_price}</p>
                                <button
                                    onClick={() => {
                                        if (product.product_quantity > 0) {
                                            onAddToCart(product); // Call the passed function to add the product to the cart
                                            onClose(); // Optionally close the modal after adding to cart
                                        }
                                    }}
                                    className={`mt-4 text-3xl font-bold h-20 w-full p-2 rounded ${product.product_quantity > 0 ? 'bg-blue-500 text-white hover:bg-blue-700' : 'bg-gray-400 text-gray-700 cursor-not-allowed'}`}
                                    disabled={product.product_quantity === 0}
                                >
                                    {product.product_quantity > 0 ? 'Add to Cart' : 'Out of Stock'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div >
        );
    };

    // Add mouse wheel event listener
    useEffect(() => {
        const handleWheel = (event) => {
            if (event.deltaY < 0) {
                setCurrentPage((prev) => Math.max(prev - 1, 1)); // Scroll up
            } else {
                setCurrentPage((prev) => Math.min(prev + 1, totalPages)); // Scroll down
            }
        };

        window.addEventListener('wheel', handleWheel, { passive: true });

        // Cleanup function to remove the event listener
        return () => {
            window.removeEventListener('wheel', handleWheel);
        };
    }, [totalPages, setCurrentPage]);

    return (
        <div className="flex flex-row flex-grow h-full select-none">
            <div className="w-1/5 p-4 bg-gray-200 rounded-lg h-full flex flex-col">
                {/* Add cart icon below subcategories */}
                <div className="flex flex-col">
                    <div className="relative cursor-pointer flex items-center space-x-2 p-2 bg-blue-600 hover:bg-blue-700 rounded transition duration-300" onClick={() => setIsCartOpen(true)}>
                        <IoMdCart size={50} className="text-yellow-400" />
                        <span className="text-4xl font-bold text-white flex items-center">
                            Cart
                            {cart.length > 0 && (
                                <div className="ml-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xl font-bold">
                                    {cart.length}
                                </div>
                            )}
                        </span>
                    </div>
                </div >

                {/* Cart Modal */}
                < CartModal
                    isCartOpen={isCartOpen}
                    setIsCartOpen={setIsCartOpen}
                    cart={cart}
                    setCart={setCart}
                    token={token}
                    navigate={navigate}
                />
                <h3 className="text-2xl font-bold text-left mt-4 mb-2">Filters</h3>
                <ul>
                    <li key="all" className="w-full">
                        <button
                            onClick={() => {
                                setSelectedMainCategory(null);
                                setSelectedSubCategory(null);
                            }}
                            className={`w-full p-4 text-2xl font-bold rounded transition duration-300 text-left ${selectedMainCategory === null && selectedSubCategory === null ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-600'}`}
                        >
                            Show All
                        </button>
                    </li>
                </ul>
                <div className="mt-4">
                    <h4 className="text-2xl font-bold mb-4 text-left">Main Categories</h4>
                    <ul>
                        {mainCategories.map((category) => (
                            <li key={category.main_category_id} className="w-full">
                                <button
                                    onClick={() => {
                                        if (selectedMainCategory === category.main_category_id) {
                                            setSelectedMainCategory(null);
                                            setSelectedSubCategory(null);
                                        } else {
                                            setSelectedMainCategory(category.main_category_id);
                                            setSelectedSubCategory(null);
                                        }
                                    }}
                                    className={`w-full p-4 text-2xl font-bold rounded transition duration-300 text-left ${selectedMainCategory === category.main_category_id ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-600'}`}
                                >
                                    {category.main_category_name}
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
                <div className="mt-4 flex-grow">
                    <h4 className="text-2xl font-bold mb-4 text-left">Sub Categories</h4>
                    <div className="mb-4">
                        <div className="flex justify-between items-center">
                            <div className="flex items-center">
                                <button
                                    onClick={() => setCurrentSubCategoryPage(prev => Math.max(prev - 1, 1))}
                                    disabled={currentSubCategoryPage === 1 || paginatedSubCategories.length === 0}
                                    className={`px-4 py-2 rounded-l text-2xl font-bold transition duration-300 ${currentSubCategoryPage === 1 || paginatedSubCategories.length === 0 ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-blue-500 text-white hover:bg-blue-700'}`}
                                >
                                    Prev
                                </button>
                                <button
                                    onClick={() => setCurrentSubCategoryPage(prev => Math.min(prev + 1, Math.ceil(subCategories.length / subCategoriesPerPage)))}
                                    disabled={currentSubCategoryPage === Math.ceil(subCategories.length / subCategoriesPerPage) || paginatedSubCategories.length === 0}
                                    className={`px-4 py-2 rounded-r text-2xl font-bold transition duration-300 ${currentSubCategoryPage === Math.ceil(subCategories.length / subCategoriesPerPage) || paginatedSubCategories.length === 0 ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-blue-500 text-white hover:bg-blue-700'}`}
                                >
                                    Next
                                </button>
                            </div>
                            <span className="mx-2 text-2xl font-bold text-gray-600">
                                {paginatedSubCategories.length === 0 ? '0 / 0' : `${currentSubCategoryPage} / ${Math.ceil(subCategories.length / subCategoriesPerPage)}`}
                            </span>
                        </div>
                    </div>
                    <ul>
                        {paginatedSubCategories.map((subCategory) => (
                            <li key={subCategory.sub_category_id} className="w-full">
                                <button
                                    onClick={() => {
                                        if (selectedSubCategory === subCategory.sub_category_id) {
                                            setSelectedSubCategory(null);
                                            setSelectedMainCategory(null);
                                        } else {
                                            setSelectedSubCategory(subCategory.sub_category_id);
                                            setSelectedMainCategory(null);
                                        }
                                    }}
                                    className={`w-full p-4 text-2xl font-bold rounded transition duration-300 text-left ${selectedSubCategory === subCategory.sub_category_id ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-600'}`}
                                >
                                    {subCategory.sub_category_name}
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            </div >

            <div className="flex flex-col h-full flex-grow w-1/2 pl-4">
                <div className="flex flex-col min-h-full">
                    {/* Product List Section */}
                    <div className="flex-grow">
                        <div {...handlers} className="grid grid-cols-3 gap-4">
                            {currentProducts.length === 0 ? (
                                <p className="col-span-3 text-center font-bold text-4xl text-red-500">
                                    No products found.
                                </p>
                            ) : (
                                // Inside the map function for currentProducts
                                currentProducts.map((product) => (
                                    <div
                                        key={product.product_id}
                                        className={`flex flex-col justify-between items-center p-4 shadow-md rounded-lg relative 
                        ${product.product_quantity === 0 ? 'bg-gray-300 border-2 border-red-500' :
                                                cart.some(item => item.product_id === product.product_id) ? 'bg-green-100 border-2 border-green-500' :
                                                    'bg-white'} 
                        ${selectedProduct && selectedProduct.product_id === product.product_id ? 'border-2 border-blue-500' : ''}`} // Add selected styling here
                                        onClick={() => handleProductClick(product)} // Handle product click for showing modal
                                    >
                                        {/* Product Image */}
                                        <div className="relative">
                                            {cart.some(item => item.product_id === product.product_id) && (
                                                <div className="absolute top-2 left-2 bg-green-500 text-white rounded-full px-2 py-1 text-md font-bold">
                                                    In Cart
                                                </div>
                                            )}
                                            <img
                                                src={product.product_image ? `http://localhost:8000${product.product_image}` : "https://via.placeholder.com/150"}
                                                alt={product.product_name}
                                                className="w-36 h-36 object-cover border-2 border-black rounded-md"
                                                onError={(e) => {
                                                    e.target.onerror = null; // Prevents looping
                                                    e.target.src = "https://via.placeholder.com/150"; // Placeholder image
                                                }}
                                            />
                                        </div>

                                        {/* Product Info */}
                                        <div className="mt-4 text-center flex-grow">
                                            <h3 className={`text-xl font-bold ${product.product_quantity === 0 ? 'text-gray-500' : 'text-black'}`}>
                                                {product.product_name}
                                            </h3>
                                            <p className={`font-semibold text-lg ${product.product_quantity === 0 ? 'text-gray-400' : 'text-gray-600'}`}>
                                                {product.product_brand}
                                            </p>
                                            <p className={`font-semibold text-xl ${product.product_quantity === 0 ? 'text-gray-400' : 'text-gray-600'}`}>
                                                {product.product_size}
                                            </p>
                                            <p className={`text-2xl font-bold mt-2 ${product.product_quantity === 0 ? 'text-gray-500' : 'text-black'}`}>
                                                ₱{product.product_price}
                                            </p>
                                        </div>

                                        {/* Add to Cart Button */}
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation(); // Prevent the click from bubbling up to the product card
                                                if (product.product_quantity > 0) {
                                                    handleAddToCart(product);
                                                }
                                            }}
                                            className={`w-full transition duration-300 mt-2 ${product.product_quantity === 0 ? 'bg-gray-400 text-gray-700 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-700 text-white'} text-2xl font-bold p-2 rounded`}
                                            disabled={product.product_quantity === 0}
                                        >
                                            {product.product_quantity === 0 ? 'Out of Stock' : 'Add to Cart'}
                                        </button>

                                        {/* Overlay for "Out of Stock" message */}
                                        {product.product_quantity === 0 && (
                                            <div className="absolute inset-0 bg-black bg-opacity-70 flex items-center justify-center text-white font-bold text-2xl rounded-md">
                                                <span className="text-red-500">Out of Stock</span>
                                            </div>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Pagination Section */}
                    <div className="mt-4">
                        <div className="flex items-center justify-between text-2xl font-bold">
                            <button
                                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1 || totalPages === 0}
                                className={`flex items-center px-4 py-2 rounded transition text-4xl duration-300 ${currentPage === 1 || totalPages === 0 ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-blue-500 text-white hover:bg-blue-700'}`}
                            >
                                <FaChevronLeft size={50} />
                                Prev
                            </button>

                            {/* Page Numbers */}
                            <div className="flex justify-center ml-4">
                                {/* Always show the first page button */}
                                <button
                                    onClick={() => setCurrentPage(1)}
                                    className={`mx-2 px-4 py-2 rounded transition duration-300 ${currentPage === 1 ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-600 hover:bg-blue-500 hover:text-white'}`}
                                >
                                    1
                                </button>

                                {/* Ellipsis if needed */}
                                {currentPage > 3 && <span className="mx-2 text-gray-600">...</span>}

                                {/* Range of pages */}
                                {Array.from({ length: Math.min(3, totalPages) }, (_, index) => {
                                    const pageNum = currentPage - 1 + index;
                                    if (pageNum < 2 || pageNum >= totalPages) return null;
                                    return (
                                        <button
                                            key={pageNum}
                                            onClick={() => setCurrentPage(pageNum)}
                                            className={`mx-2 px-4 py-2 rounded transition duration-300 ${currentPage === pageNum ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-600 hover:bg-blue-500 hover:text-white'}`}
                                        >
                                            {pageNum}
                                        </button>
                                    );
                                })}

                                {/* Ellipsis if needed */}
                                {currentPage < totalPages - 2 && <span className="mx-2 text-gray-600">...</span>}

                                {/* Last page button */}
                                <button
                                    onClick={() => setCurrentPage(totalPages)}
                                    className={`mx-2 px-4 py-2 rounded transition duration-300 ${currentPage === totalPages ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-600 hover:bg-blue-500 hover:text-white'}`}
                                >
                                    {totalPages}
                                </button>
                            </div>

                            <button
                                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                                disabled={currentPage === totalPages || totalPages === 0}
                                className={`flex items-center px-4 py-2 rounded transition text-4xl duration-300 ${currentPage === totalPages || totalPages === 0 ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-blue-500 text-white hover:bg-blue-700'}`}
                            >
                                Next
                                <FaChevronRight size={50} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            <ProductModal
                product={selectedProduct}
                isOpen={isProductModalOpen}
                onClose={handleCloseModal}
                onAddToCart={handleAddToCart} // Pass the handleAddToCart function
            />
        </div >
    );
};

export default UnifiedProductSelect;