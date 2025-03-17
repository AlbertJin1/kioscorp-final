import React, { useState, useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faFilter, faFileExport, faCircle } from '@fortawesome/free-solid-svg-icons';
import { FaSortAlphaUp, FaSortAlphaDown, FaSortAmountDownAlt, FaSortAmountUp, FaBoxes, FaBox, FaEdit, FaTrash, FaBoxOpen, FaUpload } from 'react-icons/fa';
import Swal from 'sweetalert2'; // Import SweetAlert2
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import axios from 'axios';

const Inventory = () => {
    const [currentPage, setCurrentPage] = useState(1);
    const rowsPerPage = 12;
    const [searchQuery, setSearchQuery] = useState('');
    const [products, setProducts] = useState([]);
    const [mainCategories, setMainCategories] = useState([]);
    const [selectedFilters, setSelectedFilters] = useState({
        category: 'All',
        sort: 'Alphabetical Asc',
    });
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [selectedRow, setSelectedRow] = useState(null); // Keep track of selected row
    const [formData, setFormData] = useState({}); // Handle product form data
    const [isEditModalOpen, setIsEditModalOpen] = useState(false); // Control modal open state
    const [productImage, setProductImage] = useState(null); // Handle product image
    const [productImagePreview, setProductImagePreview] = useState(null); // Image preview
    const [selectedProductId, setSelectedProductId] = useState(null);
    const [isAddStockModalOpen, setIsAddStockModalOpen] = useState(false);
    const [stockToAdd, setStockToAdd] = useState(0);
    const [isMultiSelectMode, setIsMultiSelectMode] = useState(false);
    const [selectedRows, setSelectedRows] = useState([]);
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState([]);

    const fetchProductsRef = useRef(null);
    const filterDropdownRef = useRef(null);

    useEffect(() => {
        fetchProductsRef.current = async () => {
            const token = localStorage.getItem('token');
            axios.defaults.headers.common['Authorization'] = `Token ${token}`;
            try {
                const params = {
                    category: selectedFilters.category !== 'All' ? selectedFilters.category : undefined,
                    include_subcategory: true,
                };
                const response = await axios.get('http://localhost:8000/api/products/', { params });
                console.log("Fetched products:", response.data);
                setProducts(response.data);
            } catch (error) {
                console.error(error);
            }
        };
    }, [selectedFilters.category]);

    useEffect(() => {
        const fetchMainCategories = async () => {
            const token = localStorage.getItem('token');
            axios.defaults.headers.common['Authorization'] = `Token ${token}`;
            try {
                const response = await axios.get('http://localhost:8000/api/main-categories/');
                console.log("Fetched main categories:", response.data);
                setMainCategories(response.data);
            } catch (error) {
                console.error(error);
            }
        };
        fetchMainCategories();
        fetchProductsRef.current();
    }, [selectedFilters.category]);

    // Polling to fetch products every 15 seconds
    useEffect(() => {
        const interval = setInterval(() => fetchProductsRef.current(), 15000);
        return () => clearInterval(interval); // Cleanup on unmount
    }, []);

    useEffect(() => {
        const handleOutsideClick = (event) => {
            if (filterDropdownRef.current && !filterDropdownRef.current.contains(event.target)) {
                setIsFilterOpen(false);
            }
        };
        document.addEventListener('mousedown', handleOutsideClick);
        return () => {
            document.removeEventListener('mousedown', handleOutsideClick);
        };
    }, []);

    const getFilteredData = () => {
        return products.filter((item) => {
            const matchesSearch =
                item.product_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.product_brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (item.sub_category && item.sub_category.sub_category_name &&
                    item.sub_category.sub_category_name.toLowerCase().includes(searchQuery.toLowerCase()));

            return matchesSearch;
        });
    };

    const totalPages = Math.ceil(getFilteredData().length / rowsPerPage);

    const getVisibleData = () => {
        const filteredData = getFilteredData();

        // Sort the data
        if (selectedFilters.sort === 'Alphabetical Asc') {
            filteredData.sort((a, b) => a.product_name.localeCompare(b.product_name));
        } else if (selectedFilters.sort === 'Alphabetical Desc') {
            filteredData.sort((a, b) => b.product_name.localeCompare(a.product_name));
        } else if (selectedFilters.sort === 'Sold High to Low') {
            filteredData.sort((a, b) => b.product_sold - a.product_sold);
        } else if (selectedFilters.sort === 'Sold Low to High') {
            filteredData.sort((a, b) => a.product_sold - b.product_sold);
        } else if (selectedFilters.sort === 'In Stock High to Low') {
            filteredData.sort((a, b) => b.product_quantity - a.product_quantity);
        } else if (selectedFilters.sort === 'In Stock Low to High') {
            filteredData.sort((a, b) => a.product_quantity - b.product_quantity);
        }

        const startIndex = (currentPage - 1) * rowsPerPage;
        return filteredData.slice(startIndex, startIndex + rowsPerPage);
    };

    const handleModalClose = () => {
        setIsEditModalOpen(false);
        setFormData(selectedRow); // Reset form data to the original selected row
        setProductImage(null); // Reset the image
        setProductImagePreview(null); // Reset the image preview
    };

    const handleRowClick = (product) => {
        if (isMultiSelectMode) {
            // Multi-select mode
            if (selectedRows.some(row => row.product_id === product.product_id)) {
                setSelectedRows(selectedRows.filter(row => row.product_id !== product.product_id));
            } else {
                setSelectedRows([...selectedRows, product]);
            }
        } else {
            // Single-select mode
            if (product.product_id !== selectedProductId) {
                setSelectedRow(product);
                setFormData({ ...product }); // This includes product_description
                setSelectedProductId(product.product_id);
                setSelectedRows([]); // Clear multi-select when switching back to single-select
            } else {
                setSelectedRow(null);
                setSelectedProductId(null);
            }
        }
    };

    const handleFilterToggle = () => {
        setIsFilterOpen(!isFilterOpen);
    };

    const handleFilterChange = (e) => {
        setSelectedFilters((prev) => ({
            ...prev,
            [e.target.name]: e.target.value,
        }));
        setCurrentPage(1); // Reset current page to 1 when filter changes
    };

    const handleProductImageChange = (e) => {
        const image = e.target.files[0];
        if (!image) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                const width = img.width;
                const height = img.height;
                const aspectRatio = width / height;
                let newWidth, newHeight;

                if (aspectRatio > 1) {
                    newWidth = height;
                    newHeight = height;
                } else {
                    newWidth = width;
                    newHeight = width;
                }
                canvas.width = newWidth;
                canvas.height = newHeight;
                ctx.drawImage(img, (width - newWidth) / 2, (height - newHeight) / 2, newWidth, newHeight, 0, 0, newWidth, newHeight);

                canvas.toBlob((blob) => {
                    const compressedImage = new File([blob], image.name, {
                        type: blob.type,
                        lastModified: Date.now(),
                    });
                    setProductImage(compressedImage);
                    setProductImagePreview(URL.createObjectURL(blob)); // Set image preview
                }, 'image/jpeg', 0.5);
            };
            img.src = event.target.result;
        };
        reader.readAsDataURL(image);
    };

    const handleEditButtonClick = () => {
        if (selectedRow) {
            setIsEditModalOpen(true);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleEditProduct = async () => {
        try {
            const token = localStorage.getItem('token');
            if (token) {
                const config = {
                    headers: {
                        'Authorization': `Token ${token}`,
                    },
                };

                const updatedProduct = { ...formData }; // Collect form data

                // Check for empty fields and set to "N/A" if they are empty
                updatedProduct.product_size = updatedProduct.product_size || "N/A";
                updatedProduct.product_color = updatedProduct.product_color || "N/A";
                updatedProduct.product_description = updatedProduct.product_description || "N/A";

                const formDataToSend = new FormData();
                formDataToSend.append('product_name', updatedProduct.product_name);
                formDataToSend.append('product_type', updatedProduct.product_type);
                formDataToSend.append('product_size', updatedProduct.product_size);
                formDataToSend.append('product_brand', updatedProduct.product_brand);
                formDataToSend.append('product_color', updatedProduct.product_color);
                formDataToSend.append('product_price', updatedProduct.product_price);
                formDataToSend.append('product_description', updatedProduct.product_description);

                if (productImage) {
                    // If a new image is provided, append it to the form data
                    formDataToSend.append('product_image', productImage); // Add the new image
                }

                const response = await axios.patch(`http://localhost:8000/api/products/${updatedProduct.product_id}/`, formDataToSend, config);

                if (response.status === 200) {
                    Swal.fire({
                        icon: 'success',
                        title: 'Product Updated!',
                        text: 'Product details have been successfully updated.',
                        position: 'top-end',
                        toast: true,
                        showConfirmButton: false,
                        timer: 2000,
                        timerProgressBar: true,
                    });
                    setIsEditModalOpen(false); // Close modal on success
                    // Refetch products after update
                    const res = await axios.get('http://localhost:8000/api/products/', config);
                    setProducts(res.data);
                } else {
                    Swal.fire('Error', 'Failed to update product.', 'error');
                }
            }
        } catch (error) {
            console.error('Error updating product:', error);
            Swal.fire('Error', 'Error updating product.', 'error');
        }
    };

    const handleDeleteProduct = async (productId) => {
        try {
            const token = localStorage.getItem('token');
            if (token) {
                const config = {
                    headers: {
                        'Authorization': `Token ${token}`,
                    }
                };
                const response = await axios.delete(`http://localhost:8000/api/products/${productId}/`, config);

                if (response.status === 204) {
                    // Refetch products to remove the deleted one
                    const res = await axios.get('http://localhost:8000/api/products/', config);
                    setProducts(res.data);
                    setSelectedRow(null); // Unselect the product after deletion
                    Swal.fire({
                        icon: 'success',
                        title: 'Product Deleted!',
                        text: 'Product has been successfully deleted.',
                        position: 'top-end',
                        toast: true,
                        showConfirmButton: false,
                        timer: 2000,
                        timerProgressBar: true,
                    });
                } else {
                    Swal.fire('Error', 'Failed to delete product.', 'error');
                }
            }
        } catch (error) {
            console.error('Error deleting product:', error);
            Swal.fire('Error', 'Error deleting product.', 'error');
        }
    };


    const visibleData = getVisibleData();

    const sortOptions = [
        { value: "Alphabetical Asc", label: "Alphabetical Asc", icon: <FaSortAlphaUp /> },
        { value: "Alphabetical Desc", label: "Alphabetical Desc", icon: <FaSortAlphaDown /> },
        { value: "Sold High to Low", label: "Sold High to Low", icon: <FaSortAmountDownAlt /> },
        { value: "Sold Low to High", label: "Sold Low to High", icon: <FaSortAmountUp /> },
        { value: "In Stock High to Low", label: "In Stock High to Low", icon: <FaBoxes /> },
        { value: "In Stock Low to High", label: "In Stock Low to High", icon: <FaBox /> }
    ];

    const FilterItem = ({ id, name, value, checked, handleFilterChange }) => (
        <div className="mr-4 mb-2">
            <input
                type="radio"
                id={id}
                name={name}
                value={value}
                checked={checked}
                onChange={handleFilterChange}
            />
            <label className="ml-2" htmlFor={id}>{value}</label>
        </div>
    );

    const SortItem = ({ id, name, value, checked, label, icon, handleFilterChange }) => (
        <div className="mr-4 mb-2 flex items-center">
            <input
                type="radio"
                id={id}
                name={name}
                value={value}
                checked={checked}
                onChange={handleFilterChange}
            />
            <label className="ml-2 flex items-center" htmlFor={id}>
                <span className="mr-1">{icon}</span> {label}
            </label>
        </div>
    );

    const formatPrice = (price) => {
        return Math.round(price).toLocaleString();
    };

    const handleAddStock = async () => {
        const token = localStorage.getItem('token');
        if (token && selectedRow) {
            try {
                const newQuantity = selectedRow.product_quantity + parseInt(stockToAdd, 10); // Update quantity

                const config = {
                    headers: {
                        'Authorization': `Token ${token}`,
                    },
                };

                const response = await axios.patch(`http://localhost:8000/api/products/${selectedRow.product_id}/`, { product_quantity: newQuantity }, config);

                if (response.status === 200) {
                    Swal.fire({
                        icon: 'success',
                        title: `Stock added successfully!`,
                        text: `New quantity for ${selectedRow.product_name} is ${newQuantity}.`,
                        toast: true,
                        position: 'top-end',
                        showConfirmButton: false,
                        timer: 2000,
                        timerProgressBar: true,
                    });
                    setIsAddStockModalOpen(false);  // Close modal after success
                    fetchProductsRef.current();  // Refresh product list
                }
            } catch (error) {
                console.error('Error adding stock:', error);
                Swal.fire('Error', 'Error updating stock.', 'error');
            }
        }
    };

    const handleAddStockClick = () => {
        setStockToAdd(''); // Ensure the input field is empty
        setIsAddStockModalOpen(true); // Open the modal
    };

    const handleSearchChange = (e) => {
        const query = e.target.value;
        setSearchQuery(query);
        setCurrentPage(1); // Reset to the first page whenever the search query changes

        // Filter suggestions
        if (query) {
            const filteredSuggestions = products.filter(product => {
                return product.product_name.toLowerCase().includes(query.toLowerCase());
            });

            // Sort suggestions: closest matches first
            filteredSuggestions.sort((a, b) => {
                const aIndex = a.product_name.toLowerCase().indexOf(query.toLowerCase());
                const bIndex = b.product_name.toLowerCase().indexOf(query.toLowerCase());
                return aIndex - bIndex; // Sort by index of query
            });

            setSuggestions(filteredSuggestions);
            setShowSuggestions(true); // Show suggestions
        } else {
            setSuggestions([]); // Clear suggestions if the input is empty
            setShowSuggestions(false); // Hide suggestions
        }
    };

    const handleSuggestionClick = (product) => {
        setSearchQuery(product.product_name); // Set search query to the clicked suggestion
        setSuggestions([]); // Clear suggestions
        setShowSuggestions(false); // Hide suggestions
        setCurrentPage(1); // Reset to the first page
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

    return (
        <div className="p-4 h-full flex flex-col">
            {/* Search and Action Buttons */}
            <div className="flex flex-col mb-4">

                {/* Search Box */}
                <div className="flex justify-between items-center">
                    {/* Search Box */}
                    <div className="relative">
                        <FontAwesomeIcon
                            icon={faSearch}
                            className="absolute left-3 top-3 text-gray-400"
                        />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={handleSearchChange}
                            onFocus={() => setShowSuggestions(searchQuery.length > 0)}
                            onBlur={() => setTimeout(() => setShowSuggestions(false), 100)} // Delay to allow click on suggestion
                            placeholder="Search by product name, sub-category, brand..."
                            className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 shadow"
                            style={{ width: '450px' }}
                        />

                        {showSuggestions && suggestions.length > 0 && (
                            <div className="absolute z-20 w-full bg-white border border-gray-300 rounded-md mt-2 max-h-72 overflow-auto">
                                {suggestions
                                    // Filter out duplicate product names
                                    .filter((value, index, self) =>
                                        index === self.findIndex((t) => t.product_name === value.product_name)
                                    )
                                    .map((product) => (
                                        <div
                                            key={product.product_id}
                                            className="px-4 py-2 hover:bg-blue-100 cursor-pointer transition duration-200 text-xl"
                                            onClick={() => handleSuggestionClick(product)}
                                        >
                                            {highlightMatch(product.product_name, searchQuery)}
                                        </div>
                                    ))}
                            </div>
                        )}
                    </div>


                    {/* Filter, Edit, and Delete Buttons */}
                    <div className="flex items-center space-x-4">
                        <div className="relative">
                            <button
                                className={`flex items-center px-4 py-2 border border-gray-300 rounded-md text-white shadow transition-colors duration-200 ${isFilterOpen ? 'bg-[#024b8c]' : 'bg-[#022a5e] hover:bg-[#024b8c]'}`}
                                onClick={handleFilterToggle}
                            >
                                <FontAwesomeIcon icon={faFilter} className="mr-2" />
                                Filter
                            </button>
                            {isFilterOpen && (
                                <div ref={filterDropdownRef} className="absolute right-0 mt-2 bg-white border border-gray-300 rounded-md shadow-lg z-20 w-72 filter-dropdown">
                                    <div className="p-4">
                                        <h4 className="text-lg font-bold mb-2">Category:</h4>
                                        <div className="flex flex-col">
                                            <FilterItem
                                                id="All"
                                                name="category"
                                                value="All"
                                                checked={selectedFilters.category === "All"}
                                                handleFilterChange={handleFilterChange}
                                            />
                                            {mainCategories.map(category => (
                                                <FilterItem
                                                    key={category.main_category_id}
                                                    id={category.main_category_name}
                                                    name="category"
                                                    value={category.main_category_name}
                                                    checked={selectedFilters.category === category.main_category_name}
                                                    handleFilterChange={handleFilterChange}
                                                />
                                            ))}
                                        </div>

                                        <h4 className="text-lg font-bold mt-4 mb-2">Sort:</h4>
                                        <div className="flex flex-wrap">
                                            {sortOptions.map(option => (
                                                <SortItem
                                                    key={option.value}
                                                    id={option.value}
                                                    name="sort"
                                                    value={option.value}
                                                    checked={selectedFilters.sort === option.value}
                                                    label={option.label}
                                                    icon={option.icon}
                                                    handleFilterChange={handleFilterChange}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        <button
                            onClick={handleAddStockClick}
                            disabled={!selectedRow || isMultiSelectMode} // Disable in multi-select mode
                            className={`px-4 py-2 transition-colors duration-300 flex items-center ${(!selectedRow || isMultiSelectMode) ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-green-500 hover:bg-green-600 text-white shadow'} border border-gray-300 rounded-md`}
                        >
                            <FaBoxOpen className="mr-2" />  {/* Icon for stock */}
                            Add Stock
                        </button>

                        {isAddStockModalOpen && selectedRow && (
                            <div className="bg-black bg-opacity-50 backdrop-blur-sm fixed inset-0 flex justify-center items-center z-50">
                                <div className="bg-blue-800 p-6 rounded-lg shadow-lg text-black w-full md:w-1/4">
                                    <h2 className="text-2xl font-bold text-yellow-500 mb-4">
                                        Add stock for {selectedRow.product_name}
                                    </h2>
                                    <input
                                        type="number"
                                        value={stockToAdd} // This will be empty initially
                                        onChange={(e) => setStockToAdd(e.target.value)} // Update state on change
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                // Check if the stockToAdd field is empty or invalid
                                                if (!stockToAdd || stockToAdd <= 0) {
                                                    Swal.fire({
                                                        icon: 'warning',
                                                        title: 'Oops...',
                                                        text: 'Please enter a valid stock quantity greater than 0!',
                                                        position: 'top-end', // Set position to top-end
                                                        timer: 2000,
                                                        showConfirmButton: false,
                                                        timerProgressBar: true,
                                                    });
                                                    return;
                                                }

                                                // Add stock function
                                                handleAddStock();

                                                // Reset state
                                                setStockToAdd('');

                                                // Fully unselect the row
                                                setSelectedRow(null);

                                                // Close the modal after success
                                                setIsAddStockModalOpen(false);

                                                // Success notification at top-end
                                                Swal.fire({
                                                    icon: 'success',
                                                    title: 'Stock added!',
                                                    text: 'The stock was successfully added.',
                                                    position: 'top-end', // Set position to top-end
                                                    timer: 2000,
                                                    showConfirmButton: false,
                                                    timerProgressBar: true,
                                                });
                                            }
                                        }}
                                        className="p-2 mb-4 w-full border border-gray-300 rounded"
                                        placeholder="Enter stock quantity to add"
                                    />
                                    <div className="flex justify-end">
                                        <button
                                            className="bg-green-500 text-white rounded font-bold px-4 py-2 mr-2"
                                            onClick={() => {
                                                // Check if the stockToAdd field is empty or invalid
                                                if (!stockToAdd || stockToAdd <= 0) {
                                                    Swal.fire({
                                                        icon: 'warning',
                                                        title: 'Oops...',
                                                        text: 'Please enter a valid stock quantity greater than 0!',
                                                        position: 'top-end', // Set position to top-end
                                                        timer: 2000,
                                                        showConfirmButton: false,
                                                        timerProgressBar: true,
                                                    });
                                                    return;
                                                }

                                                // Add stock function
                                                handleAddStock();

                                                // Reset state
                                                setStockToAdd('');

                                                // Fully unselect the row
                                                setSelectedRow(null);

                                                // Close the modal after success
                                                setIsAddStockModalOpen(false);

                                                // Success notification at top-end
                                                Swal.fire({
                                                    icon: 'success',
                                                    title: 'Stock added!',
                                                    text: 'The stock was successfully added.',
                                                    position: 'top-end', // Set position to top-end
                                                    timer: 2000,
                                                    showConfirmButton: false,
                                                    timerProgressBar: true,
                                                });
                                            }}
                                        >
                                            Add Stock
                                        </button>
                                        <button
                                            className="bg-red-500 text-white rounded font-bold px-4 py-2"
                                            onClick={() => {
                                                // Close the modal
                                                setIsAddStockModalOpen(false);

                                                // Reset state
                                                setStockToAdd('');

                                                // FULLY UNSELECT the row
                                                setSelectedRow(null);

                                                // OPTIONAL: Delay to allow reselecting the same row
                                                setTimeout(() => {
                                                    setSelectedRow(null); // Forcefully ensure row is fully unselected
                                                }, 0);
                                            }}
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Edit and Delete Buttons */}
                        <button
                            onClick={handleEditButtonClick}
                            disabled={!selectedRow || isMultiSelectMode} // Disable in multi-select mode
                            className={`px-4 py-2 transition-colors duration-300 flex items-center ${(!selectedRow || isMultiSelectMode) ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-yellow-500 hover:bg-yellow-600 text-white shadow'} border border-gray-300 rounded-md`}
                        >
                            <FaEdit className="mr-2" /> {/* Add margin to the right of the icon */}
                            Edit
                        </button>
                        <button
                            onClick={() => {
                                const productsToDelete = isMultiSelectMode ? selectedRows : [selectedRow]; // Use selectedRows if in multi-select mode
                                Swal.fire({
                                    title: 'Delete Product(s)?',
                                    text: `Are you sure you want to delete the selected product(s)?`,
                                    icon: 'warning',
                                    showCancelButton: true,
                                    confirmButtonColor: '#3085d6',
                                    cancelButtonColor: '#d33',
                                    confirmButtonText: 'Yes, delete them!',
                                }).then((result) => {
                                    if (result.isConfirmed) {
                                        productsToDelete.forEach(product => handleDeleteProduct(product.product_id));
                                    }
                                });
                            }}
                            disabled={isMultiSelectMode ? selectedRows.length === 0 : !selectedRow}
                            className={`px-4 py-2 transition-colors duration-300 flex items-center ${isMultiSelectMode ? (selectedRows.length > 0 ? 'bg-red-500 hover:bg-red-600 text-white shadow' : 'bg-gray-200 text-gray-500 cursor-not-allowed') : (!selectedRow ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-red-500 hover:bg-red-600 text-white shadow')} border border-gray-300 rounded-md`}
                        >
                            <FaTrash className="mr-2" />
                            Delete
                        </button>

                        <button
                            onClick={() => {
                                // Clear the selected row when switching modes
                                if (isMultiSelectMode) {
                                    setSelectedRows([]); // Clear selected rows when switching to single select
                                } else {
                                    setSelectedRow(null); // Clear selected row when switching to multi select
                                }
                                setIsMultiSelectMode(!isMultiSelectMode); // Toggle the mode
                            }}
                            className={`flex justify-between items-center px-4 py-2 border transition-colors duration-300 border-gray-300 rounded-md ${isMultiSelectMode ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-gray-200 hover:bg-gray-300'} w-56`} // Adjust the width as needed
                        >
                            <span className="text-sm">{isMultiSelectMode ? 'Multi Select Mode' : 'Single Select Mode'}</span>
                            <div className={`w-12 h-6 rounded-full ${isMultiSelectMode ? 'bg-yellow-400 hover:bg-yellow-500' : 'bg-gray-400 hover:bg-gray-500'} flex items-center transition-colors duration-300`}>
                                <div className={`w-6 h-6 rounded-full bg-white flex items-center justify-center transition-transform duration-300 ${isMultiSelectMode ? 'transform translate-x-6' : ''}`}>
                                    <span className="text-xs font-bold">{isMultiSelectMode ? 'M' : 'S'}</span>
                                </div>
                            </div>
                        </button>

                        <button
                            className="flex items-center px-4 py-2 bg-[#022a5e] border border-gray-300 text-white shadow hover:bg-[#024b8c] transition-colors duration-300 rounded-md"
                            onClick={async () => {
                                const token = localStorage.getItem('token');
                                if (token) {
                                    const config = {
                                        headers: {
                                            'Authorization': `Token ${token}`,
                                        }
                                    };
                                    const res = await axios.get('http://localhost:8000/api/products/', config);
                                    const products = res.data;

                                    const workbook = new ExcelJS.Workbook();
                                    const worksheet = workbook.addWorksheet('Product Details');

                                    // Add header row
                                    worksheet.addRow(['Product ID', 'Product Name', 'Product Type', 'Product Size', 'Product Quantity', 'Product Color', 'Product Brand', 'Product Price', 'Product Description', 'Product Sold', 'Status']);

                                    // Set column widths
                                    worksheet.columns = [
                                        { header: 'Product ID', key: 'product_id', width: 15 },
                                        { header: 'Product Name', key: 'product_name', width: 35 },
                                        { header: 'Product Type', key: 'product_type', width: 20 },
                                        { header: 'Product Size', key: 'product_size', width: 20 },
                                        { header: 'Product Quantity', key: 'product_quantity', width: 25 },
                                        { header: 'Product Color', key: 'product_color', width: 20 },
                                        { header: 'Product Brand', key: 'product_brand', width: 20 },
                                        { header: 'Product Price', key: 'product_price', width: 20 },
                                        { header: 'Product Description', key: 'product_description', width: 30 },
                                        { header: 'Product Sold', key: 'product_sold', width: 20 },
                                        { header: 'Status', key: 'status', width: 20 },
                                    ];

                                    // Add data rows
                                    products.forEach((product) => {
                                        const status = product.product_quantity > 0 ? 'Available' : 'Out of Stock'; // Determine status
                                        worksheet.addRow([
                                            String(product.product_id), // Convert product_id to string to prevent scientific notation
                                            product.product_name,
                                            product.product_type,
                                            product.product_size,
                                            product.product_quantity,
                                            product.product_color,
                                            product.product_brand,
                                            product.product_price,
                                            product.product_description,
                                            product.product_sold,
                                            status, // Include Status data
                                        ]);
                                    });

                                    // Apply styles to the header
                                    worksheet.getRow(1).height = 30;
                                    worksheet.getRow(1).eachCell(cell => {
                                        cell.font = { bold: true };
                                        cell.alignment = { horizontal: 'center', vertical: 'middle' };
                                        cell.fill = {
                                            type: 'pattern',
                                            pattern: 'solid',
                                            fgColor: { argb: 'FFFFF0' },
                                        };
                                    });

                                    // Apply styles to data rows
                                    worksheet.eachRow((row, rowNumber) => {
                                        row.eachCell((cell) => {
                                            cell.alignment = { horizontal: 'center', vertical: 'middle' };
                                            cell.border = {
                                                top: { style: 'thin' },
                                                left: { style: 'thin' },
                                                bottom: { style: 'thin' },
                                                right: { style: 'thin' },
                                            };
                                        });

                                        // Alternate row color
                                        if (rowNumber % 2 === 0) {
                                            row.eachCell((cell) => {
                                                cell.fill = {
                                                    type: 'pattern',
                                                    pattern: 'solid',
                                                    fgColor: { argb: 'FFEEEEEE' }, // Light grey for even rows
                                                };
                                            });
                                        }
                                    });

                                    workbook.xlsx.writeBuffer().then((buffer) => {
                                        const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
                                        saveAs(blob, 'inventory_products.xlsx');
                                    });
                                }
                            }}
                        >
                            <FontAwesomeIcon icon={faFileExport} className="mr-2" />
                            Export Data
                        </button>
                    </div>
                </div>
            </div>


            {/* Inventory Table */}
            <div className="overflow-auto flex-grow custom-scrollbar">
                <table className="min-w-full text-black">
                    <thead className="bg-[#022a5e] text-white text-lg sticky top-0 z-10">
                        <tr>
                            <th className="py-2 px-4 text-left" style={{ width: '350px' }}>
                                Product Name
                            </th>
                            <th className="py-2 px-4 text-left" style={{ width: '180px' }}>
                                Sub-Category
                            </th>
                            <th className="py-2 px-4 text-left" style={{ width: '200px' }}>
                                Brand
                            </th>
                            <th className="py-2 px-4 text-left" style={{ width: '100px' }}>
                                Color
                            </th>
                            <th className="py-2 px-4 text-left" style={{ width: '100px' }}>
                                Size
                            </th>
                            <th className="py-2 px-4 text-left" style={{ width: '150px' }}>
                                Type
                            </th>
                            <th className="py-2 px-4 text-left" style={{ width: '120px' }}>
                                Unit Price
                            </th>
                            <th className="py-2 px-4 text-left" style={{ width: '125px' }}>
                                In-Stock
                            </th>
                            <th className="py-2 px-4 text-left" style={{ width: '160px' }}>
                                Status
                            </th>
                            <th className="py-2 px-4 text-left" style={{ width: '80px' }}>
                                Sold
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white">
                        {visibleData.length === 0 ? (
                            <tr>
                                <td colSpan="10" className="py-4 text-center text-gray-700">
                                    No data available
                                </td>
                            </tr>
                        ) : (
                            visibleData.map((item) => (
                                <tr
                                    key={item.product_id}
                                    className={`${selectedRows.some(row => row.product_id === item.product_id) ? 'bg-gray-300' : ''} 
                            ${selectedRow && selectedRow.product_id === item.product_id ? 'bg-blue-200' : ''} 
                            hover:bg-gray-200 h-16 transition-colors duration-200 cursor-pointer`}
                                    onClick={() => handleRowClick(item)}
                                    style={{ borderBottom: '1px solid #ccc' }} // Add separator line
                                >
                                    <td className="py-2 px-4">{item.product_name}</td>
                                    <td className="py-2 px-4">
                                        {item.sub_category ? item.sub_category.sub_category_name : 'N/A'}
                                    </td>
                                    <td className="py-2 px-4">{item.product_brand}</td>
                                    <td className="py-2 px-4">{item.product_color || 'N/A'}</td>
                                    <td className="py-2 px-4">{item.product_size || 'N/A'}</td>
                                    <td className="py-2 px-4">{item.product_type}</td>
                                    <td className="py-2 px-4">
                                        ₱{formatPrice(item.product_price)}
                                    </td>
                                    <td className="py-2 px-4">{item.product_quantity}</td>
                                    <td className="py-2 px-4">
                                        {item.product_quantity > 0 ? (
                                            <span className="flex items-center text-green-500">
                                                <FontAwesomeIcon icon={faCircle} className="mr-2" />
                                                Available
                                            </span>
                                        ) : (
                                            <span className="flex items-center text-red-500">
                                                <FontAwesomeIcon icon={faCircle} className="mr-2" />
                                                Out of Stock
                                            </span>
                                        )}
                                    </td>
                                    <td className="py-2 px-4">{item.product_sold}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination Controls */}
            <div className="flex justify-center mt-4">
                {totalPages > 0 && (
                    <>
                        <button
                            onClick={() => setCurrentPage(1)}
                            className={`mx-2 rounded transition duration-300 ${currentPage === 1 ? 'bg-[#022a5e] text-white' : 'bg-gray-200 text-gray-600 hover:bg-[#022a5e] hover:text-white'}`}
                            style={{ width: '60px', height: '40px' }} // Fixed width and height
                        >
                            1
                        </button>
                        {currentPage > 3 && <span className="mx-2">...</span>} {/* Show ellipsis if there are pages in between */}
                        {Array.from({ length: Math.min(5, totalPages) }, (_, index) => {
                            const pageNum = Math.max(2, currentPage - 2) + index; // Start from currentPage - 2, but ensure it's at least 2
                            if (pageNum > totalPages - 1) return null; // Avoid rendering pages beyond totalPages

                            return (
                                <button
                                    key={pageNum}
                                    onClick={() => setCurrentPage(pageNum)}
                                    className={`mx-2 rounded transition duration-300 ${currentPage === pageNum ? 'bg-[#022a5e] text-white' : 'bg-gray-200 text-gray-600 hover:bg-[#022a5e] hover:text-white'}`}
                                    style={{ width: '60px', height: '40px' }} // Fixed width and height
                                >
                                    {pageNum}
                                </button>
                            );
                        })}
                        {currentPage < totalPages - 2 && <span className="mx-2">...</span>} {/* Show ellipsis if there are pages in between */}
                        {totalPages > 1 && (
                            <button
                                onClick={() => setCurrentPage(totalPages)}
                                className={`mx-2 rounded transition duration-300 ${currentPage === totalPages ? 'bg-[#022a5e] text-white' : 'bg-gray-200 text-gray-600 hover:bg-[#022a5e] hover:text-white'}`}
                                style={{ width: '60px', height: '40px' }} // Fixed width and height
                            >
                                {totalPages}
                            </button>
                        )}
                    </>
                )}
            </div>


            {/* Edit Product Modal */}
            {isEditModalOpen && selectedRow && (
                <div className="bg-black bg-opacity-50 backdrop-blur-sm fixed inset-0 flex justify-center items-center z-50">
                    <div className="bg-blue-800 p-6 rounded-lg shadow-lg text-black w-full md:w-3/4 lg:w-2/3 xl:w-1/2">
                        <h2 className="text-2xl mb-4 font-bold text-yellow-500">Edit Product</h2>
                        <div className="flex flex-col md:flex-row gap-4">
                            {/* Image upload section */}
                            <div className="flex-shrink-0 mb-4 md:mb-0 w-full md:w-1/3">
                                <div className="flex flex-col mb-4">
                                    <label className="block text-white mb-2">New Product Image</label>
                                    <input
                                        type="file"
                                        onChange={handleProductImageChange}
                                        className="hidden" // Hide the default input
                                        id="file-upload"
                                    />
                                    <label
                                        htmlFor="file-upload" // Associate label with the input
                                        className="flex items-center justify-center cursor-pointer p-4 border-2 border-dashed border-gray-300 bg-gray-100 rounded-lg text-gray-700 hover:bg-gray-200 transition duration-200"
                                    >
                                        <span className="mr-2">Choose a file</span>
                                        <FaUpload /> {/* Add an upload icon */}
                                    </label>

                                    {productImagePreview && (
                                        <div className="mt-4">
                                            <img
                                                src={productImagePreview}
                                                alt="Product preview"
                                                className="w-full h-auto object-cover border-2 border-black rounded shadow-lg"
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Data Fields Section */}
                            <div className="flex-grow flex flex-col justify-between md:w-2/3">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="flex flex-col mb-4">
                                        <label className="text-white">Product Name:</label>
                                        <input
                                            type="text"
                                            name="product_name"
                                            value={formData.product_name || ''}
                                            onChange={handleInputChange}
                                            className="p-2 rounded bg-gray-200 text-black"
                                            placeholder="Enter product name"
                                        />
                                    </div>

                                    <div className="flex flex-col mb-4">
                                        <label className="text-white">Product Type:</label>
                                        <input
                                            type="text"
                                            name="product_type"
                                            value={formData.product_type || ''}
                                            onChange={handleInputChange} // You can keep this if you want to handle changes, or remove it if you don't want any changes.
                                            className="p-2 rounded bg-gray-200 text-black opacity-50 cursor-not-allowed" // Add opacity and cursor classes
                                            placeholder="Enter product type"
                                            disabled // Add this attribute to disable the input
                                        />
                                    </div>

                                    <div className="flex flex-col mb-4">
                                        <label className="text-white">Product Size:</label>
                                        <input
                                            type="text"
                                            name="product_size"
                                            value={formData.product_size || ''}
                                            onChange={handleInputChange}
                                            className="p-2 rounded bg-gray-200 text-black"
                                            placeholder="Enter product size"
                                        />
                                    </div>

                                    <div className="flex flex-col mb-4">
                                        <label className="text-white">Product Quantity:</label>
                                        <input
                                            type="text"
                                            name="product_quantity"
                                            value={formData.product_quantity || ''}
                                            onChange={handleInputChange}
                                            className="p-2 rounded bg-gray-200 text-black"
                                            placeholder="Enter product quantity"
                                            readOnly
                                        />
                                    </div>

                                    <div className="flex flex-col mb-4">
                                        <label className="text-white">Product Color:</label>
                                        <input
                                            type="text"
                                            name="product_color"
                                            value={formData.product_color || ''}
                                            onChange={handleInputChange}
                                            className="p-2 rounded bg-gray-200 text-black"
                                            placeholder="Enter product color"
                                        />
                                    </div>

                                    <div className="flex flex-col mb-4">
                                        <label className="text-white">Product Brand:</label>
                                        <input
                                            type="text"
                                            name="product_brand"
                                            value={formData.product_brand || ''}
                                            onChange={handleInputChange}
                                            className="p-2 rounded bg-gray-200 text-black"
                                            placeholder="Enter product brand"
                                        />
                                    </div>

                                    <div className="flex flex-col mb-4">
                                        <label className="text-white">Product Price:</label>
                                        <input
                                            type="number"
                                            name="product_price"
                                            value={formData.product_price || ''}
                                            onChange={handleInputChange}
                                            className="p-2 rounded bg-gray-200 text-black"
                                            placeholder="Enter product price"
                                        />
                                    </div>

                                    <div className="flex flex-col mb-4">
                                        <label className="text-white">Product Description:</label>
                                        <textarea
                                            name="product_description"
                                            value={formData.product_description || ''}
                                            onChange={handleInputChange}
                                            className="p-2 rounded bg-gray-200 text-black h-24 overflow-y-auto resize-none"
                                            placeholder="Enter product description"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="flex justify-end mt-4">
                            <button
                                className="bg-yellow-500 text-black rounded px-4 py-2 mr-2"
                                onClick={handleEditProduct}
                            >
                                Save
                            </button>
                            <button
                                className="bg-red-500 text-white rounded px-4 py-2"
                                onClick={handleModalClose}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};

export default Inventory;