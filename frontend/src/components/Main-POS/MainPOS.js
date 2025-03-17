import React, { useEffect, useState, useRef, useCallback } from 'react';
import axios from 'axios';
import { FaPlus, FaMinus, FaChevronRight, FaChevronLeft, FaTimes, FaFilter, FaSortAlphaDown, FaSortAlphaUp, FaSortAmountDown, FaSortAmountUp, FaSortNumericDown, FaSortNumericUp } from 'react-icons/fa';
import Swal from 'sweetalert2'

const MainPOS = ({ setPendingOrderCount, fetchOrders }) => {
    const [products, setProducts] = useState([]);
    const [cart, setCart] = useState({});
    const [total, setTotal] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const productsPerPage = 9;

    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);

    const [isSortDropdownOpen, setSortDropdownOpen] = useState(false);
    const [isFilterDropdownOpen, setFilterDropdownOpen] = useState(false);
    const [selectedSort, setSelectedSort] = useState('Alphabetical Asc');
    const [stockFilter, setStockFilter] = useState(null);

    const [mainCategories, setMainCategories] = useState([]);
    const [subCategories, setSubCategories] = useState([]);
    const [selectedMainCategory, setSelectedMainCategory] = useState(null);
    const [selectedSubCategory, setSelectedSubCategory] = useState(null);

    const dropdownRef = useRef(null); // Reference for the dropdown
    const productGridRef = useRef(null); // Reference for the dropdown
    const orderSummaryRef = useRef(null); // Reference for the dropdown

    const sortOptions = [
        { value: "Alphabetical Asc", label: "Alphabetically, A-Z", icon: <FaSortAlphaDown /> },
        { value: "Alphabetical Desc", label: "Alphabetically, Z-A", icon: <FaSortAlphaUp /> },
        { value: "Price Low to High", label: "Price: Low to High", icon: <FaSortAmountDown /> },
        { value: "Price High to Low", label: "Price: High to Low", icon: <FaSortAmountUp /> },
        { value: "In Stock Low to High", label: "In Stock: Low to High", icon: <FaSortNumericDown /> },
        { value: "In Stock High to Low", label: "In Stock: High to Low", icon: <FaSortNumericUp /> },
    ];

    useEffect(() => {
        const fetchCategories = async () => {
            const token = localStorage.getItem('token');
            try {
                const mainCategoriesResponse = await axios.get('http://localhost:8000/api/main-categories/', {
                    headers: { 'Authorization': `Token ${token}` }
                });
                setMainCategories(mainCategoriesResponse.data);

                const subCategoriesResponse = await axios.get('http://localhost:8000/api/sub-categories/', {
                    headers: { 'Authorization': `Token ${token}` }
                });
                setSubCategories(subCategoriesResponse.data);
            } catch (error) {
                console.error('Error fetching categories:', error);
            }
        };

        fetchCategories();
    }, []);

    useEffect(() => {
        const fetchProducts = async () => {
            const token = localStorage.getItem('token');
            try {
                const response = await axios.get('http://localhost:8000/api/products/', {
                    headers: { 'Authorization': `Token ${token}` }
                });
                setProducts(response.data);
            } catch (error) {
                console.error('Error fetching products:', error);
            }
        };

        // Fetch products initially
        fetchProducts();

        // Set up interval to refetch products every 15 seconds
        const intervalId = setInterval(fetchProducts, 15000); // 15000 milliseconds = 15 seconds

        // Cleanup function to clear the interval when the component unmounts
        return () => clearInterval(intervalId);
    }, []); // Empty dependency array means this effect runs once on mount


    // Close dropdowns if clicked outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setSortDropdownOpen(false);
                setFilterDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleSortChange = (e) => {
        setSelectedSort(e.target.value);
    };

    const handleInStockChange = () => {
        setStockFilter(stockFilter === 'inStock' ? null : 'inStock'); // Toggle inStock
        setCurrentPage(1); // Reset pagination to page 1
    };

    const handleOutOfStockChange = () => {
        setStockFilter(stockFilter === 'outOfStock' ? null : 'outOfStock'); // Toggle outOfStock
        setCurrentPage(1); // Reset pagination to page 1
    };

    const handleMainCategoryChange = (mainCategoryId) => {
        setSelectedMainCategory(mainCategoryId);
        setSelectedSubCategory(null); // Reset subcategory when main category changes
        setCurrentPage(1); // Reset pagination to page 1
    };

    const handleSubCategoryChange = (subCategoryId) => {
        setSelectedSubCategory(subCategoryId);
        setSelectedMainCategory(null); // Reset main category when subcategory changes
        setCurrentPage(1); // Reset pagination to page 1
    };

    const handleSearchChange = (e) => {
        const value = e.target.value;
        setSearchTerm(value);
        setShowSuggestions(value.length > 0); // Show suggestions if there's input

        // Reset to page 1 on search
        setCurrentPage(1);

        // Filter and sort suggestions
        const filteredSuggestions = products
            .filter(product => product.product_name.toLowerCase().includes(value.toLowerCase()))
            .map(product => ({
                ...product,
                startsWith: product.product_name.toLowerCase().startsWith(value.toLowerCase()), // Check if it starts with the search term
            }))
            .sort((a, b) => {
                // Prioritize suggestions that start with the search term
                if (a.startsWith && !b.startsWith) return -1; // a comes first if it starts with the search term
                if (!a.startsWith && b.startsWith) return 1;  // b comes first if it starts with the search term
                return a.product_name.localeCompare(b.product_name); // Otherwise, sort alphabetically
            });

        setSuggestions(filteredSuggestions);
    };

    const handleSuggestionClick = (suggestion) => {
        setSearchTerm(suggestion.product_name); // Set the search term to the selected suggestion
        setSuggestions([]); // Clear suggestions
        setShowSuggestions(false); // Hide suggestions
    };

    const highlightMatch = (text, term) => {
        if (!term) return text;
        const parts = text.split(new RegExp(`(${term})`, 'gi')); // Split the text by the term, case insensitive
        return parts.map((part, index) =>
            part.toLowerCase() === term.toLowerCase() ? (
                <span key={index} className="font-bold text-blue-500">{part}</span>
            ) : (
                part
            )
        );
    };

    const clearSearch = () => {
        setSearchTerm('');
        setSuggestions([]);
    };

    const getFilteredProducts = () => {
        let filtered = products.filter(product => {
            const matchesSearchTerm = product.product_name.toLowerCase().includes(searchTerm.toLowerCase());

            const matchesMainCategory = selectedMainCategory
                ? subCategories.some(sub => sub.sub_category_id === product.sub_category && sub.main_category === selectedMainCategory)
                : true;

            const matchesSubCategory = selectedSubCategory ? product.sub_category === selectedSubCategory : true;

            // Check stock options based on stockFilter
            const isInStock = stockFilter === 'inStock' && product.product_quantity > 0;
            const isOutOfStock = stockFilter === 'outOfStock' && product.product_quantity === 0;

            // Return true if it matches search term, main category, sub category, and matches stock options
            return matchesSearchTerm && matchesMainCategory && matchesSubCategory && (stockFilter === null || isInStock || isOutOfStock);
        });

        // Sort based on selected sort option
        if (selectedSort === "Alphabetical Asc") {
            filtered.sort((a, b) => a.product_name.localeCompare(b.product_name));
        } else if (selectedSort === "Alphabetical Desc") {
            filtered.sort((a, b) => b.product_name.localeCompare(a.product_name));
        } else if (selectedSort === "Price Low to High") {
            filtered.sort((a, b) => parseFloat(a.product_price) - parseFloat(b.product_price));
        } else if (selectedSort === "Price High to Low") {
            filtered.sort((a, b) => parseFloat(b.product_price) - parseFloat(a.product_price));
        } else if (selectedSort === "In Stock Low to High") {
            filtered.sort((a, b) => a.product_quantity - b.product_quantity);
        } else if (selectedSort === "In Stock High to Low") {
            filtered.sort((a, b) => b.product_quantity - a.product_quantity);
        }

        return filtered;
    };

    const filteredProducts = getFilteredProducts();

    // Pagination calculation
    const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
    const startIndex = (currentPage - 1) * productsPerPage;
    const currentProducts = filteredProducts.slice(startIndex, startIndex + productsPerPage);

    const calculateTotal = useCallback((updatedCart) => {
        const newTotal = Object.keys(updatedCart).reduce((sum, productId) => {
            const product = products.find(p => p.product_id === parseInt(productId));
            if (product) {
                return sum + (parseFloat(product.product_price) * updatedCart[productId]);
            }
            return sum;
        }, 0);
        setTotal(newTotal);
    }, [products]); // Add products as a dependency

    const handleQuantityChange = (productId, change) => {
        const currentQuantity = cart[productId] || 0;
        const product = products.find(p => p.product_id === productId);

        if (product) {
            const newQuantity = Math.max(0, currentQuantity + change);
            if (newQuantity > product.product_quantity) {
                // If trying to add more than available stock, do not update
                Swal.fire({
                    icon: 'warning',
                    title: 'Insufficient Stock',
                    text: `You can only add up to ${product.product_quantity} of ${product.product_name}.`,
                    position: 'top-end',
                    showConfirmButton: false,
                    timer: 2000,
                    toast: true,
                    timerProgressBar: true,
                });
                return; // Exit the function early
            }

            const updatedCart = { ...cart, [productId]: newQuantity };
            setCart(updatedCart);
            calculateTotal(updatedCart); // Now this can safely be called
        }
    };

    useEffect(() => {
        const updatedCart = { ...cart }; // Create a copy of the cart

        Object.keys(cart).forEach(productId => {
            const product = products.find(p => p.product_id === parseInt(productId));

            // If the product is not found or its quantity is 0, remove it from the cart
            if (!product || product.product_quantity === 0) {
                delete updatedCart[productId]; // Remove the product from the cart
            }
        });

        // Update the cart state if it has changed
        if (Object.keys(updatedCart).length !== Object.keys(cart).length) {
            setCart(updatedCart);
            calculateTotal(updatedCart); // This is now safe
        }
    }, [products, calculateTotal, cart]);

    // Add a function to check if the product is added
    const isProductAdded = (productId) => {
        return cart[productId] > 0;
    };

    const handleNextPage = useCallback(() => {
        if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
        }
    }, [currentPage, totalPages]);
    
    const handlePreviousPage = useCallback(() => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    }, [currentPage]);

    const handleCreateOrder = async () => {
        const orderItems = Object.keys(cart)
            .filter(productId => cart[productId] > 0) // Only include products with quantity > 0
            .map(productId => {
                const product = products.find(p => p.product_id === parseInt(productId));
                return {
                    product: {
                        product_id: product.product_id,
                        product_name: product.product_name,
                        product_price: product.product_price,
                    },
                    quantity: cart[productId],
                };
            });

        // If there are no items to order, show an alert
        if (orderItems.length === 0) {
            Swal.fire({
                icon: 'warning',
                title: 'No items to order',
                text: 'Please add items to your cart before creating an order.',
                position: 'top-end',
                showConfirmButton: false,
                timer: 2000,
                toast: true,
                timerProgressBar: true,
                background: '#fff',
            });
            return; // Exit the function early
        }

        const orderData = {
            items: orderItems,
            total: total,
        };

        const token = localStorage.getItem('token');
        try {
            const response = await axios.post('http://localhost:8000/api/create-order/', orderData, {
                headers: {
                    'Authorization': `Token ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (response.data.success) {
                Swal.fire({
                    icon: 'success',
                    title: 'Order Created!',
                    text: 'Order ID: ' + response.data.order_id,
                    position: 'top-end',
                    showConfirmButton: false,
                    timer: 2000,
                    toast: true,
                    timerProgressBar: true,
                    background: '#fff',
                });
                setCart({}); // Clear the cart
                setTotal(0); // Reset the total

                // Fetch updated orders from the database
                await fetchOrders(); // Call fetchOrders to refresh the order count
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: response.data.message || 'Something went wrong while creating the order.',
                    position: 'top-end',
                    showConfirmButton: false,
                    timer: 2000,
                    toast: true,
                    timerProgressBar: true,
                    background: '#fff',
                });
            }
        } catch (error) {
            console.error('Error creating order:', error);
            let errorMessage = 'An error occurred while creating the order. Please try again.';
            if (error.response && error.response.data && error.response.data.message) {
                errorMessage = error.response.data.message;
            }

            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: errorMessage,
                position: 'top-end',
                showConfirmButton: false,
                timer: 2000,
                toast: true,
                timerProgressBar: true,
                background: '#fff',
            });
        }
    };

    useEffect(() => {
        const handleWheel = (event) => {
            if (
                productGridRef.current && !productGridRef.current.contains(event.target) &&
                orderSummaryRef.current && !orderSummaryRef.current.contains(event.target)
            ) {
                if (event.deltaY < 0) {
                    handlePreviousPage();
                } else if (event.deltaY > 0) {
                    handleNextPage();
                }
            }
        };
    
        window.addEventListener('wheel', handleWheel);
        return () => {
            window.removeEventListener('wheel', handleWheel);
        };
    }, [currentPage, totalPages, handleNextPage, handlePreviousPage]);

    useEffect(() => {
        if (productGridRef.current) {
            productGridRef.current.scrollTop = 0;
        }
    }, [currentPage]);

    return (
        <div className="flex h-full">
            {/* Left Section: Products */}
            <div className={`w-96 flex-grow p-4 flex flex-col`}>
                <h2 className="text-2xl font-bold mb-2">Products </h2>

                {/* Search Box */}
                <div className="flex justify-between mb-4 relative items-center">
                    <div className="flex items-center">
                        <div className="relative">
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={handleSearchChange}
                                onFocus={() => setShowSuggestions(searchTerm.length > 0)}
                                onBlur={() => setTimeout(() => setShowSuggestions(false), 100)}
                                placeholder="Search products..."
                                className="w-full p-2 border border-gray-300 rounded text-2xl font-bold pr-10 uppercase"
                            />
                            {searchTerm && (
                                <button onClick={clearSearch} className="absolute right-2 top-1/2 transform -translate-y-1/2">
                                    <FaTimes size={30} className="text-gray-500" />
                                </button>
                            )}
                            {showSuggestions && suggestions.length > 0 && (
                                <ul className="absolute left-0 top-14 z-10 w-full bg-white border border-gray-300 rounded shadow-lg max-h-96 overflow-y-auto">
                                    {suggestions
                                        .filter((suggestion, index, self) =>
                                            // Filter to ensure unique product names
                                            index === self.findIndex((s) => s.product_name === suggestion.product_name)
                                        )
                                        .map((suggestion) => (
                                            <li
                                                key={suggestion.product_id}
                                                onClick={() => handleSuggestionClick(suggestion)}
                                                className="p-2 hover:bg-gray-200 cursor-pointer text-2xl"
                                            >
                                                {highlightMatch(suggestion.product_name, searchTerm)}
                                            </li>
                                        ))}
                                </ul>
                            )}
                        </div>
                    </div>

                    {/* Sort and Filter buttons */}
                    <div className="flex items-center">
                        <div className="relative">
                            <button
                                className={`flex items-center ml-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700 transition-colors duration-200 ${isSortDropdownOpen ? 'bg-blue-700' : ''}`}
                                onClick={() => setSortDropdownOpen(!isSortDropdownOpen)}
                            >
                                <FaFilter className="mr-2" size={20} />
                                Sort
                            </button>
                            {/* Sort options dropdown */}
                            {isSortDropdownOpen && (
                                <div ref={dropdownRef} className="absolute z-10 bg-white border border-gray-300 rounded shadow-lg right-0 top-12 p-4 w-64 max-h-96 overflow-y-auto">
                                    <h3 className="font-bold mb-2 text-lg text-gray-800">Sort By:</h3>
                                    <div className="flex flex-col space-y-2">
                                        {sortOptions.map(option => (
                                            <label key={option.value} className="flex items-center">
                                                <input
                                                    type="radio"
                                                    value={option.value}
                                                    checked={selectedSort === option.value}
                                                    onChange={handleSortChange}
                                                    className="mr-2 accent-blue-500"
                                                />
                                                <span className="flex items-center text-black">
                                                    {option.icon}
                                                    <span className="ml-2">{option.label}</span>
                                                </span>
                                            </label>
                                        ))}
                                    </div>

                                    <h3 className="font-bold mt-4 mb-2 text-lg text-gray-800">Stock Options:</h3>
                                    <div className="flex flex-col space-y-2">
                                        <label className="flex items-center">
                                            <input
                                                type="checkbox"
                                                checked={stockFilter === 'inStock'}
                                                onChange={handleInStockChange}
                                                className="mr-2 accent-blue-500"
                                            />
                                            <span className="text-black">In Stock</span>
                                        </label>
                                        <label className="flex items-center">
                                            <input
                                                type="checkbox"
                                                checked={stockFilter === 'outOfStock'}
                                                onChange={handleOutOfStockChange}
                                                className="mr-2 accent-blue-500"
                                            />
                                            <span className="text-black">Out of Stock</span>
                                        </label>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="relative">
                            <button
                                className={`flex items-center ml-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700 transition-colors duration-200 ${isFilterDropdownOpen ? 'bg-blue-700' : ''}`}
                                onClick={() => setFilterDropdownOpen(!isFilterDropdownOpen)}
                            >
                                <FaFilter className="mr-2" size={20} />
                                Filter Categories
                            </button>
                            {/* Filter categories dropdown */}
                            {isFilterDropdownOpen && (
                                <div ref={dropdownRef} className="absolute z-10 bg-white border border-gray-300 rounded-tl rounded-bl shadow-lg right-0 top-12 p-4 w-64 min-h-96 overflow-y-auto custom-scrollbar">
                                    <h3 className="font-bold mb-2 text-lg text-gray-800">Show All:</h3>
                                    <label className="flex items-center mb-2">
                                        <input
                                            type="radio"
                                            value="all"
                                            checked={selectedMainCategory === null && selectedSubCategory === null}
                                            onChange={() => {
                                                setSelectedMainCategory(null);
                                                setSelectedSubCategory(null);
                                            }}
                                            className="mr-2 accent-blue-500"
                                        />
                                        <span className="text-gray-700">All</span>
                                    </label>

                                    <h3 className="font-bold mb-2 text-lg text-gray-800">Main Categories:</h3>
                                    <div className="flex flex-col space-y-2 mb-2">
                                        {mainCategories.map(category => (
                                            <label key={category.main_category_id} className="flex items-center">
                                                <input
                                                    type="radio"
                                                    value={category.main_category_id}
                                                    checked={selectedMainCategory === category.main_category_id}
                                                    onChange={() => handleMainCategoryChange(category.main_category_id)}
                                                    className="mr-2 accent-blue-500"
                                                />
                                                <span className="text-gray-700">{category.main_category_name}</span>
                                            </label>
                                        ))}
                                    </div>

                                    <h3 className="font-bold mb-2 text-lg text-gray-800">Sub Categories:</h3>
                                    <div className="flex flex-col space-y-2">
                                        {subCategories.map(subCategory => (
                                            <label key={subCategory.sub_category_id} className="flex items-center">
                                                <input
                                                    type="radio"
                                                    value={subCategory.sub_category_id}
                                                    checked={selectedSubCategory === subCategory.sub_category_id}
                                                    onChange={() => handleSubCategoryChange(subCategory.sub_category_id)}
                                                    className="mr-2 accent-blue-500"
                                                />
                                                <span className="text-gray-700">{subCategory.sub_category_name}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>


                {/* Product Grid Container */}
                <div ref={productGridRef} className="overflow-y-auto custom-scrollbar bg-gray-200 p-4 rounded-md w-full"> {/* Adjust maxHeight as needed */}
                    <div className={`grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3`}>
                        {currentProducts.length === 0 ? (
                            <p className="col-span-full text-center text-4xl font-semibold text-gray-600">No products available.</p>
                        ) : (
                            currentProducts.map(product => {
                                const isOutOfStock = product.product_quantity === 0;
                                const added = isProductAdded(product.product_id); // Check if the product is added

                                return (
                                    <div
                                        key={product.product_id}
                                        className={`relative bg-white border p-4 rounded-md shadow flex flex-col ${isOutOfStock
                                            ? 'bg-gray-300 border-2 border-red-500'
                                            : added
                                                ? 'bg-green-100 border-2 border-green-400' // Change background to green if added
                                                : ''
                                            }`}
                                    >
                                        {/* "Out of Stock" Overlay */}
                                        {isOutOfStock && (
                                            <div className="absolute inset-0 bg-black rounded bg-opacity-70 flex items-center justify-center text-white font-bold text-2xl">
                                                <span className="text-red-500">Out of Stock</span>
                                            </div>
                                        )}

                                        {/* "Added" Label */}
                                        {added && (
                                            <div className="absolute top-2 left-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded">
                                                Added
                                            </div>
                                        )}

                                        {/* Top: Product Image */}
                                        <img
                                            src={product.product_image ? `http://localhost:8000${product.product_image}` : "https://via.placeholder.com/150"}
                                            alt={product.product_name}
                                            className="w-auto h-48 object-cover border-2 border-black rounded mb-2" // Increased height for better visibility
                                            onError={(e) => {
                                                e.target.onerror = null; // Prevents looping
                                                e.target.src = "https://via.placeholder.com/150"; // Placeholder image
                                            }}
                                        />

                                        {/* Bottom: Product Details */}
                                        <div className="flex flex-col justify-between flex-grow">
                                            <div>
                                                <h3 className="text-xl font-bold">{product.product_name}</h3>
                                                <p className="text-lg"><span className="font-semibold">Color: </span>{product.product_color}</p>
                                                <p className="text-lg"><span className="font-semibold">Size: </span>{product.product_size}</p>
                                                <p className="text-lg"><span className="font-semibold">Price: </span>₱{parseFloat(product.product_price).toFixed(2)}</p>
                                            </div>
                                            <div className="flex items-center mt-2">
                                                {/* Quantity Controls */}
                                                <button
                                                    onClick={() => handleQuantityChange(product.product_id, -1)}
                                                    className="p-2 text-xl bg-gray-300 text-red-600 rounded-l hover:bg-red-200 hover:text-red-700"
                                                    disabled={isOutOfStock}
                                                >
                                                    <FaMinus />
                                                </button>
                                                <input
                                                    type="number"
                                                    readOnly
                                                    value={cart[product.product_id] || 0}
                                                    className="w-12 text-center text-2xl font-bold border-t border-b border-gray-300"
                                                />
                                                <button
                                                    onClick={() => handleQuantityChange(product.product_id, 1)}
                                                    className="p-2 text-xl bg-gray-300 text-green-600 rounded-r hover:bg-green-200 hover:text-green-700"
                                                    disabled={isOutOfStock}
                                                >
                                                    <FaPlus />
                                                </button>
                                            </div>
                                            <div className='flex items-center mt-2'>
                                                <button
                                                    className={`bg-blue-500 text-xl font-semibold text-white rounded w-full px-4 py-1 hover:bg-blue-700 transition-colors duration-200 ${isOutOfStock || (cart[product.product_id] >= product.product_quantity) ? 'bg-gray-400 cursor-not-allowed ' : ''}`}
                                                    onClick={() => handleQuantityChange(product.product_id, 1)} // This should add 1
                                                    disabled={isOutOfStock || (cart[product.product_id] >= product.product_quantity)} // Disable button if out of stock or if cart quantity is at max
                                                >
                                                    {isOutOfStock ? 'Out of Stock' : (cart[product.product_id] >= product.product_quantity ? 'Max Quantity Reached' : 'Add')} {/* Change button text based on stock status */}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
                {/* Pagination Controls */}
                <div className="flex justify-between items-center mt-4 text-lg font-bold">
                    <button
                        onClick={handlePreviousPage}
                        disabled={currentPage === 1 || currentProducts.length === 0}
                        className={`flex items-center px-4 py-2 rounded transition-colors duration-200 
        ${currentPage === 1 || currentProducts.length === 0 ? 'cursor-not-allowed bg-blue-200' : 'bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white'}`}
                    >
                        <FaChevronLeft className="mr-2" />
                        Prev
                    </button>

                    {/* Selectable Page Numbers */}
                    <div className="flex items-center space-x-2">
                        {/* Always show the first page button */}
                        <button
                            onClick={() => setCurrentPage(1)}
                            className={`px-4 py-2 rounded transition-colors duration-200 
            ${currentPage === 1 ? 'bg-blue-700 text-white' : 'bg-blue-500 hover:bg-blue-600 text-white'}`}
                            style={{ width: '60px', height: '40px' }} // Fixed width and height
                        >
                            1
                        </button>

                        {/* Show ellipsis if there are pages between the first page and the current page */}
                        {currentPage > 3 && <span className="text-gray-600">...</span>}

                        {/* Display the range of pages around the current page */}
                        {Array.from({ length: Math.min(3, totalPages) }, (_, index) => {
                            const pageNum = currentPage - 1 + index; // Show currentPage - 1, currentPage, currentPage + 1
                            if (pageNum < 2 || pageNum >= totalPages) return null; // Skip if out of range

                            return (
                                <button
                                    key={pageNum}
                                    onClick={() => setCurrentPage(pageNum)} // Update the current page
                                    className={`px-4 py-2 rounded transition-colors duration-200 
                    ${currentPage === pageNum ? 'bg-blue-700 text-white' : 'bg-blue-500 hover:bg-blue-600 text-white'}`}
                                    style={{ width: '60px', height: '40px' }} // Fixed width and height
                                >
                                    {pageNum}
                                </button>
                            );
                        })}

                        {/* Show ellipsis if there are pages between the current page and the last page */}
                        {currentPage < totalPages - 2 && <span className="text-gray-600">...</span>}

                        {/* Always show the last page button, ensure it's not duplicated */}
                        {totalPages > 1 && (
                            <button
                                onClick={() => setCurrentPage(totalPages)}
                                className={`px-4 py-2 rounded transition-colors duration-200 
                ${currentPage === totalPages ? 'bg-blue-700 text-white' : 'bg-blue-500 hover:bg-blue-600 text-white'}`}
                                style={{ width: '60px', height: '40px' }} // Fixed width and height
                            >
                                {totalPages}
                            </button>
                        )}
                    </div>

                    <button
                        onClick={handleNextPage}
                        disabled={currentPage === totalPages || currentProducts.length === 0}
                        className={`flex items-center px-4 py-2 rounded transition-colors duration-200 
        ${currentPage === totalPages || currentProducts.length === 0 ? 'cursor-not-allowed bg-blue-200' : 'bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white'}`}
                    >
                        Next
                        <FaChevronRight className="ml-2" />
                    </button>
                </div>
            </div>

            {/* Right Section: Order Summary */}
            <div className="w-1/4 p-4 border-l flex flex-col justify-between">
                <h2 className="text-2xl font-bold mb-4">Over the Counter Order</h2>

                <div ref={orderSummaryRef} className="flex-grow overflow-y-auto mb-4">
                    {Object.keys(cart).some(productId => cart[productId] > 0) ? (
                        <table className="w-full text-left">
                            <thead className="bg-gray-200 sticky top-0 z-10">
                                <tr className="border-b-2 text-xl font-semibold">
                                    <th className="p-2 w-1/2">Product</th>
                                    <th className="p-2 w-1/7 text-center">Qty</th>
                                    <th className="p-2 w-1/3 text-right">Price</th>
                                </tr>
                            </thead>
                            <tbody>
                                {Object.keys(cart).map(productId => {
                                    const product = products.find(p => p.product_id === parseInt(productId));
                                    const quantity = cart[productId];
                                    return (
                                        quantity > 0 && (
                                            <tr key={productId} className="border-b text-lg">
                                                <td className="p-2">{product.product_name}</td>
                                                <td className="p-2 text-center">{quantity}</td>
                                                <td className="p-2 text-right font-bold">₱{(parseFloat(product.product_price) * quantity).toFixed(2)}</td>
                                            </tr>
                                        )
                                    );
                                })}
                            </tbody>
                        </table>
                    ) : (
                        <div className="flex items-center justify-center h-full">
                            <p className="text-4xl font-semibold text-gray-600 text-center">No products added to the order.</p>
                        </div>
                    )}
                </div>

                {/* Bottom Section: Subtotal, Total, and Button (shown only when cart has items) */}
                {Object.keys(cart).some(productId => cart[productId] > 0) && (
                    <div className="mt-4">
                        <div className="flex justify-between font-bold text-2xl">
                            <span>Subtotal:</span>
                            <span>₱{total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                        </div>
                        <div className="flex justify-between font-bold mt-2 text-2xl">
                            <span>Total:</span>
                            <span>₱{total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                        </div>

                        <button
                            onClick={handleCreateOrder}
                            className="mt-4 bg-blue-500 text-white font-bold text-3xl py-2 px-4 rounded hover:bg-blue-700 transition-colors duration-200 w-full"
                        >
                            Create Order
                        </button>
                    </div>
                )}
            </div>



        </div>
    );
};

export default MainPOS;