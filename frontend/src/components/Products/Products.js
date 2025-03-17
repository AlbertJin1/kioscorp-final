import React, { useState, useEffect } from 'react';
import { FaPlusCircle, FaTimes, FaSearch, FaTrash, FaEdit } from 'react-icons/fa';
import axios from 'axios';
import Swal from 'sweetalert2'; // Import SweetAlert2
import imagePlaceholder from '../../img/logo/placeholder-image.png'
import '../Styles/styles.css'; // Import your CSS file for custom scrollbar styles

const Products = () => {
    const [mainCategory, setMainCategory] = useState(null);
    const [selectedSubCategory, setSelectedSubCategory] = useState(null);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [products, setProducts] = useState([]);
    const [subCategories, setSubCategories] = useState([]);
    const [mainCategories, setMainCategories] = useState([]);
    const [newProductName, setNewProductName] = useState('');
    const [newProductType, setNewProductType] = useState('');
    const [newProductBrand, setNewProductBrand] = useState('');
    const [newProductDescription, setNewProductDescription] = useState('');
    const [productImage, setProductImage] = useState(null);
    const [modalOpenProduct, setModalOpenProduct] = useState(false);
    const [editingSubCategory, setEditingSubCategory] = useState(null);
    const [subCategoryImage, setSubCategoryImage] = useState(null);
    const [subCategoryImagePreview, setSubCategoryImagePreview] = useState(null);
    const [productVariations, setProductVariations] = useState([
        { color: '', size: '', quantity: '', price: '', image: null },
    ]);
    const [userRole, setUserRole] = useState('');


    const [searchQuery, setSearchQuery] = useState('');
    const [searchOpen, setSearchOpen] = useState(false);
    const [searchQueryProduct, setSearchQueryProduct] = useState('');
    const [searchOpenProduct, setSearchOpenProduct] = useState(false);

    // Modal State
    const [modalOpen, setModalOpen] = useState(false);
    const [newSubCategoryName, setNewSubCategoryName] = useState('');

    useEffect(() => {
        if (mainCategory && selectedSubCategory && selectedSubCategory.main_category !== mainCategory.main_category_id) {
            setSelectedSubCategory(null); // Clear the subcategory if it doesn't match the main category
        }
    }, [mainCategory, selectedSubCategory]);


    useEffect(() => {
        const fetchMainCategories = async () => {
            try {
                const token = localStorage.getItem('token');
                if (token) {
                    const config = {
                        headers: {
                            'Authorization': `Token ${token}`,
                        }
                    };
                    const res = await axios.get('http://localhost:8000/api/main-categories/', config);
                    setMainCategories(res.data);

                    // Set "Auto Supply" as the default main category
                    const autoSupplyCategory = res.data.find(category => category.main_category_name === 'Auto Supply');
                    if (autoSupplyCategory) {
                        setMainCategory(autoSupplyCategory);
                    }
                } else {
                    showError('You are not authorized to view main categories.');
                }
            } catch (error) {
                if (error.response.status === 403) {
                    showError('You do not have permission to view main categories.');
                } else {
                    showError('Error fetching main categories');
                }
            }
        };

        fetchMainCategories();
    }, []);

    useEffect(() => {
        const fetchSubCategories = async () => {
            if (mainCategory) {
                try {
                    const token = localStorage.getItem('token');
                    if (token) {
                        const config = {
                            headers: {
                                'Authorization': `Token ${token}`,
                            }
                        };
                        const res = await axios.get(`http://localhost:8000/api/sub-categories/?main_category=${mainCategory.main_category_id}`, config);
                        const subCategories = res.data.filter(subCategory => subCategory.main_category === mainCategory.main_category_id);
                        setSubCategories(subCategories.sort((a, b) => a.sub_category_name.localeCompare(b.sub_category_name)));

                        // Auto-select the first subcategory if it exists
                        if (subCategories.length > 0) {
                            setSelectedSubCategory(subCategories[0]); // Set the first subcategory
                        }
                    } else {
                        showError('You are not authorized to view subcategories.');
                    }
                } catch (error) {
                    if (error.response.status === 403) {
                        showError('You do not have permission to view subcategories.');
                    } else {
                        showError('Error fetching subcategories');
                    }
                }
            } else {
                setSubCategories([]); // Clear subcategories when no main category is selected
            }
        };

        fetchSubCategories();
    }, [mainCategory]);

    useEffect(() => {
        const fetchProducts = async () => {
            if (selectedSubCategory) {
                try {
                    const token = localStorage.getItem('token');
                    if (token) {
                        const config = {
                            headers: {
                                'Authorization': `Token ${token}`,
                            }
                        };
                        const params = {
                            subcategory: selectedSubCategory.sub_category_name, // Use the subcategory name or ID based on your API design
                            include_subcategory: true, // Include subcategory details
                        };
                        const res = await axios.get('http://localhost:8000/api/products/', { params, headers: config.headers });
                        const products = res.data;

                        setProducts(products); // Set the products

                        // Remove the auto-selection of the first product
                        // if (products.length > 0) {
                        //     setSelectedProduct(products[0]); // Set the first product
                        // } else {
                        //     setSelectedProduct(null); // Clear selected product if no products found
                        // }
                    } else {
                        showError('You are not authorized to view products.');
                    }
                } catch (error) {
                    if (error.response.status === 403) {
                        showError('You do not have permission to view products.');
                    } else {
                        showError('Error fetching products');
                    }
                }
            } else {
                setProducts([]); // Clear products when no subcategory is selected
                setSelectedProduct(null); // Clear selected product when no subcategory is selected
            }
        };

        fetchProducts();
    }, [selectedSubCategory, mainCategory]);

    const showError = (message) => {
        Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: message,
            position: 'top-end',
            toast: true,
            showConfirmButton: false,
            timer: 2000,
            timerProgressBar: true,
            didOpen: () => {
                Swal.showLoading();
            },
        });
    };

    const fetchSubCategories = async () => {
        if (mainCategory) {
            try {
                const token = localStorage.getItem('token');
                if (token) {
                    const config = {
                        headers: {
                            'Authorization': `Token ${token}`,
                        }
                    };
                    const res = await axios.get(`http://localhost:8000/api/sub-categories/?main_category=${mainCategory.main_category_id}`, config);
                    const subCategories = res.data.filter(subCategory => subCategory.main_category === mainCategory.main_category_id);
                    setSubCategories(subCategories.sort((a, b) => a.sub_category_name.localeCompare(b.sub_category_name)));
                } else {
                    showError('You are not authorized to view subcategories.');
                }
            } catch (error) {
                if (error.response.status === 403) {
                    showError('You do not have permission to view subcategories.');
                } else {
                    showError('Error fetching subcategories');
                }
            }
        } else {
            setSubCategories([]); // Clear subcategories when no main category is selected
        }
    };

    const handleMainCategoryClick = (category) => {
        // Unselect main category if it's already selected
        if (mainCategory && category.main_category_id === mainCategory.main_category_id) {
            setMainCategory(null);
            setSelectedSubCategory(null);
            setSelectedProduct(null);
            setProducts([]); // Clear products when unselecting
            setSubCategories([]); // Clear subcategories when unselecting
            setNewProductType(''); // Clear product type when unselecting
        } else {
            setMainCategory(category);
            setSelectedSubCategory(null);
            setSelectedProduct(null);
            setNewProductType(category.main_category_name); // Set product type based on selected main category
        }
    };

    const handleSubCategoryClick = (subCategory) => {
        // Unselect subcategory if it's already selected
        if (selectedSubCategory && subCategory.sub_category_id === selectedSubCategory.sub_category_id) {
            setSelectedSubCategory(null);
            setSelectedProduct(null); // Clear selected product when unselecting
            setProducts([]); // Clear products when unselecting
        } else {
            setSelectedSubCategory(subCategory);
            setSelectedProduct(null); // Clear selected product when changing subcategory
            // Optionally, you can also fetch products here if you want to keep the logic for fetching
            // fetchProducts(subCategory); // Uncomment if you want to fetch products immediately
        }
    };

    const handleProductClick = (product) => {
        // Unselect product if it's already selected
        if (selectedProduct && selectedProduct.product_id === product.product_id) {
            setSelectedProduct(null);
        } else {
            setSelectedProduct(product);
        }
    };

    // handleAddSubCategory
    const handleAddSubCategory = async () => {
        if (!newSubCategoryName) {
            Swal.fire({
                icon: 'warning',
                title: 'Input Required',
                text: 'Please enter a subcategory name.',
                position: 'top-end',
                toast: true,
                showConfirmButton: false,
                timer: 2000,
                timerProgressBar: true,
            });
            return;
        }

        if (mainCategory) {
            try {
                const token = localStorage.getItem('token');
                if (token) {
                    const formData = new FormData();
                    formData.append('sub_category_name', newSubCategoryName);
                    formData.append('main_category', mainCategory.main_category_id);
                    if (subCategoryImage) {
                        formData.append('sub_category_image', subCategoryImage, 'subcategory_image.jpg');
                    }

                    const response = await axios.post('http://localhost:8000/api/sub-categories/', formData, {
                        headers: {
                            'Authorization': `Token ${token}`,
                            'Content-Type': 'multipart/form-data',
                        },
                    });
                    if (response.status === 201) {
                        setNewSubCategoryName('');
                        setModalOpen(false);
                        setSubCategoryImage(null);
                        setSubCategoryImagePreview(null);
                        // Refetch subcategories
                        fetchSubCategories();
                        // Show success alert
                        Swal.fire({
                            icon: 'success',
                            title: 'Success!',
                            text: 'Subcategory added successfully.',
                            position: 'top-end',
                            toast: true,
                            showConfirmButton: false,
                            timer: 2000,
                            timerProgressBar: true,
                        });
                    } else {
                        showError('Error adding subcategory');
                    }
                } else {
                    showError('You are not authorized to add subcategories.');
                }
            } catch (error) {
                // Check for a 400 error and a specific detail message
                if (error.response && error.response.status === 400 && error.response.data.detail) {
                    // Check if the error is about duplicate subcategory name
                    if (error.response.data.error) {
                        Swal.fire({
                            icon: 'error',
                            title: 'Duplicate Subcategory',
                            text: error.response.data.error,
                            position: 'top-end',
                            toast: true,
                            showConfirmButton: false,
                            timer: 2000,
                            timerProgressBar: true,
                        });
                    } else {
                        showError(error.response.data.detail);
                    }
                } else if (error.response && error.response.status === 403) {
                    showError('You do not have permission to add subcategories.');
                } else {
                    showError('Error adding subcategory');
                }
            }
        }
    };

    const handleSubCategoryImageChange = (e) => {
        const image = e.target.files[0];
        if (!image) return; // Ensure an image is selected

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
                // Resize logic based on aspect ratio
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
                // Convert canvas to blob
                canvas.toBlob((blob) => {
                    setSubCategoryImage(blob);
                    setSubCategoryImagePreview(URL.createObjectURL(blob));
                }, 'image/jpeg', 0.8);
            };
            img.src = event.target.result;
        };
        reader.readAsDataURL(image);
    };

    const handleProductImageChange = (e, variationIndex) => {
        const image = e.target.files[0];
        if (!image) return; // Ensure an image is selected

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

                // Resize logic based on aspect ratio
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

                // Compress the image
                canvas.toBlob((blob) => {
                    const compressedImage = new File([blob], image.name, {
                        type: blob.type,
                        lastModified: Date.now(),
                    });

                    // Set the product image and also set it as the specified variation's image
                    if (variationIndex === undefined) {
                        setProductImage(compressedImage);
                        setProductVariations((prevVariations) => {
                            const newVariations = [...prevVariations];
                            newVariations[0].image = compressedImage; // Set the first variation's image
                            return newVariations;
                        });
                    } else {
                        setProductVariations((prevVariations) => {
                            const newVariations = [...prevVariations];
                            newVariations[variationIndex].image = compressedImage; // Set the specified variation's image
                            return newVariations;
                        });
                    }
                }, 'image/jpeg', 0.5); // Compress the image to 50% quality
            };
            img.src = event.target.result;
        };
        reader.readAsDataURL(image);
    };

    useEffect(() => {
        const role = localStorage.getItem('role'); // Retrieve the user role from local storage
        setUserRole(role); // Set the user role state
    }, []);

    // Add this function to handle adding variations
    const handleVariationChange = (index, field, value) => {
        const newVariations = [...productVariations];
        newVariations[index][field] = value;
        setProductVariations(newVariations);
    };

    const handleAddVariation = () => {
        setProductVariations([...productVariations, { color: '', size: '', quantity: '', price: '' }]);
    };

    const handleRemoveVariation = (index) => {
        const newVariations = productVariations.filter((_, i) => i !== index);
        setProductVariations(newVariations);
    };

    const fetchProducts = async () => {
        if (selectedSubCategory) {
            try {
                const token = localStorage.getItem('token');
                if (token) {
                    const config = {
                        headers: {
                            'Authorization': `Token ${token}`,
                        }
                    };
                    const params = {
                        subcategory: selectedSubCategory.sub_category_name, // Use the subcategory name or ID based on your API design
                        include_subcategory: true, // Include subcategory details
                    };
                    const res = await axios.get('http://localhost:8000/api/products/', { params, headers: config.headers });
                    const products = res.data;

                    setProducts(products); // Set the products
                } else {
                    showError('You are not authorized to view products.');
                }
            } catch (error) {
                if (error.response.status === 403) {
                    showError('You do not have permission to view products.');
                } else {
                    showError('Error fetching products');
                }
            }
        } else {
            setProducts([]); // Clear products when no subcategory is selected
            setSelectedProduct(null); // Clear selected product when no subcategory is selected
        }
    };

    const handleAddProduct = async () => {
        // Check if required fields are filled
        if (!newProductName || !newProductType || !newProductBrand || productVariations.length === 0 || !selectedSubCategory) {
            // Show warning message
            Swal.fire({
                icon: 'warning',
                title: 'Input Required',
                text: 'Please fill in all required fields.',
                position: 'top-end',
                toast: true,
                showConfirmButton: false,
                timer: 2000,
                timerProgressBar: true,
            });
            return;
        }

        try {
            // Loop through each variation and add the product
            for (const [index, variation] of productVariations.entries()) {
                const data = new FormData();
                // Append common product details
                data.append('product_name', newProductName);
                data.append('product_type', newProductType);
                data.append('product_brand', newProductBrand);
                data.append('sub_category', selectedSubCategory.sub_category_id); // Use the ID from selectedSubCategory

                // Set optional fields to "N/A" if they are empty
                data.append('product_description', newProductDescription || 'N/A');
                data.append('product_color', variation.color || 'N/A');
                data.append('product_size', variation.size || 'N/A');
                data.append('product_quantity', variation.quantity || '0');
                data.append('product_price', variation.price || '0');

                // Append the image file for each variation
                if (index === 0) {
                    // For the first variation, use the main product image
                    if (productImage) {
                        data.append('product_image', productImage);
                    }
                } else {
                    // For subsequent variations, use their own images
                    if (variation.image) {
                        data.append('product_image', variation.image);
                    }
                }

                // Make the request to add the product variation
                const productResponse = await fetch('http://localhost:8000/api/products/', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Token ${localStorage.getItem('token')}`,
                    },
                    body: data
                });

                if (!productResponse.ok) {
                    const errorMessage = await productResponse.text();
                    console.error('Error adding product variation:', errorMessage);
                    throw new Error(errorMessage || 'Failed to add product variation.');
                }
            }

            // Handle successful product addition
            setModalOpenProduct(false);
            // Show success alert
            Swal.fire({
                icon: 'success',
                title: 'Products Added!',
                text: 'All product variations added successfully.',
                position: 'top-end',
                toast: true,
                showConfirmButton: false,
                timer: 2000,
                timerProgressBar: true,
            });

            // Clear fields after successful addition
            setNewProductName('');
            setNewProductType('');
            setNewProductBrand('');
            setNewProductDescription('');
            setProductVariations([{ color: '', size: '', quantity: '', price: '', image: null }]); // Reset variations
            setProductImage(null);

            // Refetch products to show the newly added ones
            fetchProducts(); // Call fetchProducts to refresh the product list

        } catch (error) {
            console.error('Error adding product variations:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: error.message,
                position: 'top-end',
                timer: 1500,
                timerProgressBar: true,
                showConfirmButton: false,
                toast: true,
            });
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
                    // Refetch products to exclude the deleted one
                    const res = await fetch(`http://localhost:8000/api/products/?sub_category=${selectedSubCategory.sub_category_id}`, {
                        method: 'GET',
                        headers: {
                            'Authorization': `Token ${localStorage.getItem('token')}`,
                            'Content-Type': 'application/json'
                        }
                    });
                    const products = await res.json();
                    const filteredProducts = products.filter(product => product.sub_category === selectedSubCategory.sub_category_id);
                    setProducts(filteredProducts);
                    // Unselect the deleted product
                    if (selectedProduct && selectedProduct.product_id === productId) {
                        setSelectedProduct(null);
                    }
                    // Show success alert
                    Swal.fire({
                        icon: 'success',
                        title: 'Success!',
                        text: 'Product deleted successfully.',
                        position: 'top-end',
                        toast: true,
                        showConfirmButton: false,
                        timer: 2000,
                        timerProgressBar: true,
                    });
                } else {
                    showError('Error deleting product');
                }
            } else {
                showError('You are not authorized to delete products.');
            }
        } catch (error) {
            if (error.response.status === 403) {
                showError('You do not have permission to delete products.');
            } else {
                showError('Error deleting product');
            }
        }
    };

    const handleEditSubCategory = async () => {
        try {
            const token = localStorage.getItem('token');
            if (token) {
                const config = {
                    headers: {
                        'Authorization': `Token ${token}`,
                        'Content-Type': 'multipart/form-data',  // Ensure the form data is correctly encoded for file uploads
                    }
                };

                const formData = new FormData(); // Use FormData to handle both text and file data

                // Append the updated name if it was changed
                if (newSubCategoryName) {
                    formData.append('sub_category_name', newSubCategoryName);
                }

                // Append the new image if one was selected
                if (subCategoryImage) {
                    formData.append('sub_category_image', subCategoryImage); // 'sub_category_image' is the key expected by your API
                }

                // Make the patch request to update the subcategory
                const response = await axios.patch(`http://localhost:8000/api/sub-categories/${editingSubCategory.sub_category_id}/`, formData, config);

                if (response.status === 200) {
                    // Refetch subcategories to include the updated one
                    const res = await fetch(`http://localhost:8000/api/sub-categories/?main_category=${mainCategory.main_category_id}`, {
                        method: 'GET',
                        headers: {
                            'Authorization': `Token ${localStorage.getItem('token')}`,
                            'Content-Type': 'application/json'
                        }
                    });

                    const subCategories = await res.json();

                    // Update the state to include the latest subcategories
                    setSubCategories(subCategories.filter(subCategory => subCategory.main_category === mainCategory.main_category_id));

                    // Unselect the subcategory
                    setSelectedSubCategory(null);

                    // Reset the newSubCategoryName and image states
                    setNewSubCategoryName('');
                    setSubCategoryImage(null);
                    setSubCategoryImagePreview(null);

                    // Show success alert
                    Swal.fire({
                        icon: 'success',
                        title: 'Success!',
                        text: 'Subcategory updated successfully.',
                        position: 'top-end',
                        toast: true,
                        showConfirmButton: false,
                        timer: 2000,
                        timerProgressBar: true,
                    });
                } else {
                    showError('Error updating subcategory');
                }
            } else {
                showError('You are not authorized to update subcategories.');
            }
        } catch (error) {
            if (error.response && error.response.status === 403) {
                showError('You do not have permission to update subcategories.');
            } else {
                showError('Error updating subcategory');
            }
        }
    };


    const handleDeleteSubCategory = async (subCategoryId) => {
        try {
            const token = localStorage.getItem('token');

            if (token) {
                const config = {
                    headers: {
                        'Authorization': `Token ${token}`,
                    }
                };

                // Make delete request directly
                const deleteResponse = await axios.delete(
                    `http://localhost:8000/api/sub-categories/${subCategoryId}/`,
                    config
                );

                if (deleteResponse.status === 204) {
                    // Refetch subcategories to reflect the changes
                    fetchSubCategories();

                    // Unselect the deleted subcategory
                    if (selectedSubCategory && selectedSubCategory.sub_category_id === subCategoryId) {
                        setSelectedSubCategory(null);
                    }

                    // Show success alert
                    Swal.fire({
                        icon: 'success',
                        title: 'Success!',
                        text: 'Subcategory deleted successfully.',
                        position: 'top-end',
                        toast: true,
                        showConfirmButton: false,
                        timer: 2000,
                        timerProgressBar: true,
                    });
                }
            } else {
                showError('You are not authorized to delete subcategories.');
            }
        } catch (error) {
            // Handle errors returned by the backend
            if (error.response) {
                if (error.response.status === 400 && error.response.data.error) {
                    showError(error.response.data.error); // Show specific backend error
                } else if (error.response.status === 404) {
                    showError('Subcategory not found.');
                } else if (error.response.status === 403) {
                    showError('You do not have permission to delete subcategories.');
                } else {
                    showError('Error deleting subcategory.');
                }
            } else {
                showError('An unexpected error occurred.');
            }
        }
    };


    return (
        <div className="flex flex-col lg:flex-row h-full text-white font-bold gap-4 p-4">
            {/* Left Categories Section */}
            <div className="w-full lg:w-1/3 rounded-lg flex flex-col h-full">
                {/* Category Buttons */}
                <div className="flex justify-between mb-4 bg-blue-900 py-3 px-4 rounded-lg">
                    {mainCategories.map((category, index) => (
                        <button
                            key={index}
                            onClick={() => handleMainCategoryClick(category)}
                            className={`w-36 rounded-full py-1 px-4 text-black border border-black ${mainCategory?.main_category_id === category.main_category_id ? 'bg-yellow-500' : 'bg-white'} hover:bg-yellow-600`}
                        >
                            {category.main_category_name}
                        </button>
                    ))}
                </div>

                <div className='text-yellow-500 p-4 bg-blue-900 rounded-tl-lg rounded-tr-lg flex flex-col'>
                    <div className='flex items-center justify-between'>
                        <h2 className='text-2xl'>Categories</h2>

                        <div className='flex items-center gap-2'>
                            {userRole === 'owner' && ( // Only show the delete button if the user is an owner
                                <FaTrash
                                    className={`text-red-500 transition duration-200 cursor-pointer hover:text-red-700 ${selectedProduct || (selectedSubCategory && products.length === 0) ? '' : 'opacity-50 pointer-events-none'}`}
                                    size={30}
                                    title={selectedProduct ? 'Delete Product' : selectedSubCategory ? 'Delete Subcategory' : ''}
                                    onClick={() => {
                                        if (selectedProduct) {
                                            Swal.fire({
                                                title: 'Delete Product?',
                                                text: `Are you sure you want to delete ${selectedProduct.product_name}?`,
                                                icon: 'warning',
                                                showCancelButton: true,
                                                confirmButtonColor: '#3085d6',
                                                cancelButtonColor: '#d33',
                                                confirmButtonText: 'Yes, delete it!'
                                            }).then((result) => {
                                                if (result.isConfirmed) {
                                                    handleDeleteProduct(selectedProduct.product_id);
                                                }
                                            });
                                        } else if (selectedSubCategory) {
                                            Swal.fire({
                                                title: 'Delete Subcategory?',
                                                text: `Are you sure you want to delete ${selectedSubCategory.sub_category_name}?`,
                                                icon: 'warning',
                                                showCancelButton: true,
                                                confirmButtonColor: '#3085d6',
                                                cancelButtonColor: '#d33',
                                                confirmButtonText: 'Yes, delete it!'
                                            }).then((result) => {
                                                if (result.isConfirmed) {
                                                    handleDeleteSubCategory(selectedSubCategory.sub_category_id);
                                                }
                                            });
                                        }
                                    }}
                                />
                            )}

                            <FaEdit
                                className={`text-yellow-500 transition duration-200 cursor-pointer hover:text-yellow-300 ${selectedSubCategory ? '' : 'opacity-50 pointer-events-none'}`}
                                size={30}
                                title="Edit Subcategory"
                                onClick={() => {
                                    if (selectedSubCategory) {
                                        setEditingSubCategory(selectedSubCategory);
                                        setNewSubCategoryName(selectedSubCategory.sub_category_name);
                                    }
                                }}
                            />

                            <div className="flex items-center cursor-pointer" onClick={() => {
                                setSearchOpen(!searchOpen);
                                if (searchOpen) {
                                    setSearchQuery('');
                                }
                            }}>
                                {searchOpen ? (
                                    <FaTimes className="text-yellow-500 hover:text-yellow-300" size={32} title="Close Search Bar" />
                                ) : (
                                    <FaSearch className="text-yellow-500 hover:text-yellow-300" size={30} title="Open Search Bar" />
                                )}
                            </div>

                            <FaPlusCircle
                                className={`text-yellow-500 cursor-pointer hover:text-yellow-300 ${!mainCategory ? 'opacity-50 cursor-not-allowed' : ''}`}
                                size={30}
                                title="Add New Sub-Category"
                                onClick={() => {
                                    if (mainCategory) {
                                        setModalOpen(true);
                                    } else {
                                        showError('Please select a main category before adding a subcategory.');
                                    }
                                }}
                                disabled={!mainCategory} // Disable if no main category is selected
                            />
                        </div>
                    </div>

                    {/* Conditionally render the search input with sliding effect */}
                    <div className={`flex items-center mt-2 transition-all duration-500 ease-in-out ${searchOpen ? 'max-h-20 opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}>
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="p-2 rounded text-md text-black font-semibold w-full transition-width duration-500 ease-in-out"
                            placeholder="Search"
                        />
                    </div>
                </div>


                {/* Scrollable Categories Section */}
                <div className="flex-grow flex flex-col px-4 bg-blue-900 rounded-bl-lg rounded-br-lg overflow-y-auto pb-2 custom-scrollbar">
                    {subCategories.length > 0 ? (
                        <div className="categories-list">
                            {subCategories.filter(subCategory => subCategory.sub_category_name.toLowerCase().includes(searchQuery.toLowerCase())).length > 0 ? (
                                subCategories.filter(subCategory => subCategory.sub_category_name.toLowerCase().includes(searchQuery.toLowerCase())).map((category, index) => (
                                    <div
                                        key={index}
                                        onClick={() => handleSubCategoryClick(category)}
                                        className={`rounded-full py-2 px-4 mb-1 hover:bg-yellow-500 hover:text-black cursor-pointer ${selectedSubCategory?.sub_category_id === category.sub_category_id ? 'bg-yellow-500 text-black' : 'bg-blue-700 text-white'}`}
                                    >
                                        {category.sub_category_name}
                                    </div>
                                ))
                            ) : (
                                <p className="text-white text-center py-10">No categories found with the name "{searchQuery}"</p>
                            )}
                        </div>
                    ) : (
                        <p className="text-white text-center py-10">{mainCategory ? `No categories found in ${mainCategory?.main_category_name}` : 'Select a main category to view subcategories.'}</p>
                    )}
                </div>
            </div>

            {/* Middle Products Section */}
            <div className="w-full lg:w-1/2 flex flex-col">
                {/* Title Section */}
                <div className="text-2xl text-yellow-500 p-4 bg-blue-900 rounded-tl-lg rounded-tr-lg flex justify-between items-center">
                    <h2>Products</h2>
                    {/* Search Input */}
                    <div className={`flex items-center transition-all duration-500 ease-in-out mx-4 ${searchOpenProduct ? 'w-full opacity-100' : 'w-0 opacity-0 overflow-hidden'}`}>
                        <div className="flex items-center w-full px-2">
                            <input
                                type="text"
                                value={searchQueryProduct}
                                onChange={(e) => setSearchQueryProduct(e.target.value)}
                                className="p-1 rounded text-md text-black font-semibold w-full transition-width duration-500 ease-in-out"
                                placeholder="Search"
                            />
                        </div>
                    </div>
                    <div className="flex items-center justify-end gap-x-2">
                        {/* Search Icon */}
                        <div className="flex items-center cursor-pointer" onClick={() => {
                            setSearchOpenProduct(!searchOpenProduct);
                            if (searchOpenProduct) {
                                setSearchQueryProduct('');
                            }
                        }}>
                            {searchOpenProduct ? (
                                <FaTimes className="text-yellow-500 hover:text-yellow-300" size={32} title="Close Search Bar" />
                            ) : (
                                <FaSearch className="text-yellow-500 hover:text-yellow-300" size={30} title="Open Search Bar" />
                            )}
                        </div>
                        {/* Add Product Icon */}
                        <FaPlusCircle
                            className={`text-yellow-500 cursor-pointer hover:text-yellow-300 ${!selectedSubCategory ? 'opacity-50 cursor-not-allowed' : ''}`}
                            size={30}
                            title="Add Product"
                            onClick={() => {
                                if (selectedSubCategory) {
                                    setNewProductType(mainCategory ? mainCategory.main_category_name : ''); // Set product type based on selected main category
                                    setModalOpenProduct(true);
                                } else {
                                    showError('Please select a subcategory before adding a product.');
                                }
                            }}
                            disabled={!selectedSubCategory} // Disable if no subcategory is selected
                        />
                    </div>
                </div>

                {/* Scrollable Products Section */}
                <div className="flex-grow px-4 pb-2 bg-blue-900 rounded-br-lg rounded-bl-lg overflow-y-auto custom-scrollbar">
                    {selectedSubCategory ? ( // Check if a subcategory is selected
                        products.length > 0 ? (
                            <ul>
                                {products
                                    .filter(product =>
                                        product.product_name.toLowerCase().includes(searchQueryProduct.toLowerCase()) ||
                                        (product.product_size && product.product_size.toLowerCase().includes(searchQueryProduct.toLowerCase())) // Check for product_size
                                    )
                                    .sort((a, b) => a.product_name.localeCompare(b.product_name)) // Sort alphabetically
                                    .map((product) => (
                                        <li
                                            key={product.product_id}
                                            className={`rounded-full py-2 px-4 mb-1 hover:bg-yellow-500 hover:text-black cursor-pointer ${selectedProduct?.product_id === product.product_id ? 'bg-yellow-500 text-black' : 'bg-blue-700 text-white'}`}
                                            onClick={(e) => {
                                                if (e.target.tagName !== 'svg' && e.target.tagName !== 'path') {
                                                    handleProductClick(product);
                                                }
                                            }}
                                        >
                                            <span>
                                                {product.product_name}
                                                {product.product_color && product.product_size ? ` (${product.product_color}, ${product.product_size})` : ''} {/* Display color and size */}
                                            </span>
                                        </li>
                                    ))}
                            </ul>
                        ) : (
                            <p className="text-red-500 text-center py-10">No product data available</p> // Message when no products are found
                        )
                    ) : (
                        <p className="text-white text-center py-10">Please select a category to view products</p> // Message when no subcategory is selected
                    )}
                </div>
            </div>

            {/* Right Product Detail Section */}
            <div className="w-1/2 max-w-2xl flex flex-col overflow-hidden">

                {/* Title for Product Details */}
                <div className="text-2xl text-yellow-500 p-4 bg-blue-900 rounded-tl-lg rounded-tr-lg flex justify-between items-center">
                    <h2>Product Details</h2>
                </div>

                {/* Product Details */}
                <div className="flex-grow px-2 bg-blue-900 rounded-br-lg rounded-bl-lg overflow-y-auto custom-scrollbar max-w-full">
                    {selectedProduct ? (
                        <div className="flex flex-wrap">
                            {/* Left side: Image */}
                            <div className="w-full md:w-1/2 mb-4">
                                {selectedProduct.product_image && (
                                    <img
                                        src={`http://localhost:8000${selectedProduct.product_image}`}
                                        alt="Product_Image"
                                        className="border-2 border-black rounded w-64 h-64 object-cover mx-auto"
                                    />
                                )}
                            </div>

                            {/* Right side: Product Name, Type, and Size */}
                            <div className="w-full md:w-1/2 px-4 mb-4 flex flex-col justify-center">
                                <div className="flex flex-col gap-2 mb-4">
                                    <label className="text-white">Product Name:</label>
                                    <input
                                        type="text"
                                        value={selectedProduct.product_name}
                                        readOnly
                                        className="p-2 w-full rounded bg-gray-200 text-black"
                                    />
                                </div>
                                <div className="flex flex-col gap-2 mb-4">
                                    <label className="text-white">Product Type:</label>
                                    <input
                                        type="text"
                                        value={selectedProduct.product_type}
                                        readOnly
                                        className="p-2 w-full rounded bg-gray-200 text-black"
                                    />
                                </div>
                                <div className="flex flex-col gap-2 mb-4">
                                    <label className="text-white">Product Size:</label>
                                    <input
                                        type="text"
                                        value={selectedProduct.product_size}
                                        readOnly
                                        className="p-2 w-full rounded bg-gray-200 text-black"
                                    />
                                </div>
                            </div>

                            {/* Centered Columns for other fields */}
                            <div className="w-full flex flex-wrap justify-center">
                                <div className="w-full md:w-1/2 px-4 mb-4">
                                    <div className="flex flex-col gap-2">
                                        <label className="text-white">Product Quantity:</label>
                                        <input
                                            type="text"
                                            value={selectedProduct.product_quantity}
                                            readOnly
                                            className="p-2 w-full rounded bg-gray-200 text-black"
                                        />
                                    </div>
                                </div>
                                <div className="w-full md:w-1/2 px-4 mb-4">
                                    <div className="flex flex-col gap-2">
                                        <label className="text-white">Product Color:</label>
                                        <input
                                            type="text"
                                            value={selectedProduct.product_color}
                                            readOnly
                                            className="p-2 w-full rounded bg-gray-200 text-black"
                                        />
                                    </div>
                                </div>
                                <div className="w-full md:w-1/2 px-4 mb-4">
                                    <div className="flex flex-col gap-2">
                                        <label className="text-white">Product Brand:</label>
                                        <input
                                            type="text"
                                            value={selectedProduct.product_brand}
                                            readOnly
                                            className="p-2 w-full rounded bg-gray-200 text-black"
                                        />
                                    </div>
                                </div>
                                <div className="w-full md:w-1/2 px-4 mb-4">
                                    <div className="flex flex-col gap-2">
                                        <label className="text-white">Product Price:</label>
                                        <input
                                            type="text"
                                            value={`₱${selectedProduct.product_price}`}
                                            readOnly
                                            className="p-2 w-full rounded bg-gray-200 text-black"
                                        />
                                    </div>
                                </div>
                                <div className="w-full px-4 mb-4">
                                    <div className="flex flex-col gap-2">
                                        <label className="text-white">Product Description:</label>
                                        <textarea
                                            readOnly
                                            value={selectedProduct.product_description}
                                            className="p-2 w-full rounded bg-gray-200 text-black h-48 overflow-y-auto resize-none text-md font-semibold"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <p className="text-white text-center py-10">Select a product to see details</p>
                    )}
                </div>

            </div>


            {/* Modal for Adding Subcategory */}
            {modalOpen && (
                <div className="bg-black bg-opacity-50 backdrop-blur-sm fixed inset-0 flex justify-center items-center z-50">
                    <div className="bg-blue-800 p-6 rounded-lg shadow-lg text-black w-full md:w-1/2 lg:w-1/3 xl:w-1/4">
                        <h2 className="text-xl mb-4 text-yellow-500">Add Subcategory</h2>
                        <input
                            type="text"
                            value={newSubCategoryName}
                            onChange={(e) => setNewSubCategoryName(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    handleAddSubCategory();
                                }
                            }}
                            className="p-2 mb-4 w-full rounded"
                            placeholder="Enter subcategory name"
                        />
                        <input
                            type="file"
                            onChange={handleSubCategoryImageChange}
                            className="p-2 mb-4 w-full rounded"
                            accept="image/*"
                        />
                        <p className="text-sm text-gray-400 mb-2">Uploading a photo is optional.</p> {/* Optional note */}
                        <div className="mb-4">
                            {subCategoryImagePreview ? (
                                <img
                                    src={subCategoryImagePreview}
                                    alt="Subcategory preview"
                                    className="w-48 h-48 object-cover rounded border-2 border-black"
                                />
                            ) : (
                                <img
                                    src={imagePlaceholder} // Placeholder image for when no image is uploaded
                                    alt="Placeholder"
                                    className="w-48 h-48 object-cover rounded border-2 border-black"
                                />
                            )}
                        </div>
                        <div className="flex justify-end">
                            <button
                                className="bg-yellow-500 text-black rounded px-4 py-2 mr-2"
                                onClick={handleAddSubCategory}
                            >
                                Add
                            </button>
                            <button
                                className="bg-red-500 text-white rounded px-4 py-2"
                                onClick={() => {
                                    setModalOpen(false);
                                    setNewSubCategoryName('');
                                    setSubCategoryImage(null);
                                    setSubCategoryImagePreview(null);
                                }}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {editingSubCategory && (
                <div className="bg-black bg-opacity-50 backdrop-blur-sm fixed inset-0 flex justify-center items-center z-50">
                    <div className="bg-blue-800 p-6 rounded-lg shadow-lg text-black w-full md:w-1/2 lg:w-1/3 xl:w-1/4">
                        <h2 className="text-xl mb-4 text-yellow-500">Edit Subcategory</h2>
                        <input
                            type="text"
                            value={newSubCategoryName}
                            onChange={(e) => setNewSubCategoryName(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    handleEditSubCategory(); // Call the function when Enter is pressed
                                    setEditingSubCategory(null); // Close the modal after saving
                                }
                            }}
                            className="p-2 mb-4 w-full rounded"
                            placeholder="Enter new subcategory name"
                        />
                        <div className="flex justify-end">
                            <button
                                className="bg-yellow-500 text-black rounded px-4 py-2 mr-2"
                                onClick={async () => {
                                    await handleEditSubCategory();
                                    setEditingSubCategory(null);
                                }}
                            >
                                Save
                            </button>
                            <button
                                className="bg-red-500 text-white rounded px-4 py-2"
                                onClick={() => {
                                    setEditingSubCategory(null);
                                }}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {modalOpenProduct && (
                <div className="bg-black bg-opacity-50 backdrop-blur-sm fixed inset-0 flex justify-center items-center z-50">
                    <div className="bg-blue-800 p-4 rounded-lg shadow-lg text-black w-full md:w-3/4 lg:w-2/3 xl:w-1/2 max-h-[90vh] overflow-y-auto">
                        <h2 className="text-2xl mb-4 text-yellow-500">Add Product</h2>
                        <div className="flex flex-col md:flex-row">
                            {/* Left Column: Product Image */}
                            <div className="w-full md:w-1/4 px-2 mb-4 flex flex-col items-center">
                                <label className="block text-white mb-2">Main Product Image</label>
                                <input
                                    type="file"
                                    onChange={(e) => handleProductImageChange(e)}
                                    className="p-2 w-full rounded mb-2"
                                />
                                {/* Image preview for the main product image */}
                                {productImage ? (
                                    <img
                                        src={URL.createObjectURL(productImage)}
                                        alt="Selected product"
                                        className="rounded border-2 border-black w-40 h-40 object-cover shadow-lg"
                                    />
                                ) : (
                                    <img
                                        src={imagePlaceholder}
                                        alt="Placeholder"
                                        className="rounded border-2 border-black w-40 h-40 object-cover shadow-lg"
                                    />
                                )}
                            </div>

                            {/* Right Column: Product Details */}
                            <div className="w-full md:w-3/4 px-2 mb-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                    <div>
                                        <label className="block text-white mb-2">Product Name</label>
                                        <input
                                            type="text"
                                            value={newProductName}
                                            onChange={(e) => setNewProductName(e.target.value)}
                                            className="p-2 w-full rounded shadow-lg"
                                            placeholder="Enter product name"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-white mb-2">Product Type</label>
                                        <input
                                            type="text"
                                            value={newProductType}
                                            onChange={(e) => setNewProductType(e.target.value)}
                                            className="p-2 w-full rounded shadow-lg"
                                            placeholder="Enter product type"
                                            disabled
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-white mb-2">Product Brand</label>
                                        <input
                                            type="text"
                                            value={newProductBrand}
                                            onChange={(e) => setNewProductBrand(e.target.value)}
                                            className="p-2 w-full rounded shadow-lg"
                                            placeholder="Enter product brand"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-white mb-2">Product Description (Optional)</label>
                                        <textarea
                                            value={newProductDescription}
                                            onChange={(e) => setNewProductDescription(e.target.value)}
                                            className="p-2 w-full rounded shadow-lg resize-none"
                                            placeholder="Leave blank to save as N/A"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Product Variations Section */}
                        <div className="mb-4">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-yellow-500 text-2xl">Product Variations</h3>
                                <button
                                    className="bg-yellow-500 text-lg text-black rounded px-4 py-2 transition-colors duration-200 hover:bg-yellow-600"
                                    onClick={handleAddVariation}
                                >
                                    Add Variation
                                </button>
                            </div>

                            {/* Scrollable Variations List */}
                            <div className="overflow-y-auto max-h-72 custom-scrollbar mb-4">
                                {productVariations.map((variation, index) => (
                                    <div key={index} className="flex items-center mb-4 ">
                                        {/* Variation Image for 2nd and subsequent variations */}
                                        {index > 0 && (
                                            <div className="w-1/2 pr-2">
                                                <label className="block text-white mb-2">Variation Image</label>
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={(e) => handleProductImageChange(e, index)} // Pass the index to handleProductImageChange
                                                    className="p-2 w-full rounded mb-2"
                                                />
                                                {/* Image preview for variation */}
                                                {variation.image ? (
                                                    <img
                                                        src={URL.createObjectURL(variation.image)}
                                                        alt={`Variation ${index + 1}`}
                                                        className="rounded border-2 mx-auto border-black w-40 h-40 object-cover shadow-lg"
                                                    />
                                                ) : (
                                                    <img
                                                        src={imagePlaceholder}
                                                        alt={`Variation ${index + 1}`}
                                                        className="rounded border-2 mx-auto border-black w-40 h-40 object-cover shadow-lg"
                                                    />
                                                )}
                                            </div>
                                        )}

                                        {/* Variation Fields (Right Side) */}
                                        <div className="w-full mx-2 grid grid-cols-2 gap-2">
                                            <div className="mb-4">
                                                <label className="block text-white mb-2">Color</label>
                                                <select
                                                    value={variation.color}
                                                    onChange={(e) => handleVariationChange(index, 'color', e.target.value)}
                                                    className="p-2 w-full rounded shadow-lg"
                                                >
                                                    <option value="" disabled>Select a color</option>
                                                    {['Red', 'Blue', 'Green', 'Yellow', 'Black', 'White', 'Purple', 'Orange'].map((color) => (
                                                        <option key={color} value={color}>
                                                            {color}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div className="mb-4">
                                                <label className="block text-white mb-2">Size</label>
                                                <input
                                                    type="text"
                                                    value={variation.size}
                                                    onChange={(e) => handleVariationChange(index, 'size', e.target.value)}
                                                    className="p-2 w-full rounded shadow-lg"
                                                    placeholder="Enter size"
                                                />
                                            </div>
                                            <div className="mb-4">
                                                <label className="block text-white mb-2">Quantity</label>
                                                <input
                                                    type="number"
                                                    value={variation.quantity}
                                                    onChange={(e) => {
                                                        const newValue = Math.max(0, e.target.value);
                                                        handleVariationChange(index, 'quantity', newValue);
                                                    }}
                                                    className="p-2 w-full rounded shadow-lg"
                                                    placeholder="Enter quantity"
                                                />
                                            </div>
                                            <div className="mb-4">
                                                <label className="block text-white mb-2">Price (₱)</label>
                                                <input
                                                    type="number"
                                                    value={variation.price}
                                                    onChange={(e) => {
                                                        const newValue = Math.max(0, e.target.value);
                                                        handleVariationChange(index, 'price', newValue);
                                                    }}
                                                    className="p-2 w-full rounded shadow-lg"
                                                    placeholder="Enter price"
                                                />
                                            </div>
                                        </div>

                                        {/* Remove Variation Button for variations other than the first one */}
                                        {index > 0 && (
                                            <div className="justify-end items-center mx-2">
                                                <button
                                                    className="bg-red-500 hover:bg-red-600 transition-colors duration-200 text-white rounded px-2 py-1 text-xl"
                                                    onClick={() => handleRemoveVariation(index)}
                                                >
                                                    Remove
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="flex justify-end">
                            <button
                                className="bg-red-500 text-lg text-white rounded px-4 py-2 mr-2 transition-colors duration-200 hover:bg-red-600"
                                onClick={() => setModalOpenProduct(false)}
                            >
                                Cancel
                            </button>
                            <button
                                className="bg-green-500 text-lg text-white rounded px-4 py-2 transition-colors duration-200 hover:bg-green-600"
                                onClick={handleAddProduct}
                            >
                                Add Product
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};

export default Products;