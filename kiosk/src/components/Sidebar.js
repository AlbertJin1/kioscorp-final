import React, { useState, useEffect } from 'react';
import { IoMdCart } from 'react-icons/io';
import CartModal from './CartModal';
import LogoImage from '../img/Logo/kioscorp.png';

const Sidebar = ({ cart, isCartOpen, setIsCartOpen, token, setCart, mainCategories, setSelectedSubCategory }) => {
    const [subCategories, setSubCategories] = useState([]);
    const [selectedMainCategory, setSelectedMainCategoryState] = useState(null); // Default is null to show all
    const [selectedSubCategory, setSelectedSubCategoryState] = useState(null);

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;  // Limit sub-categories per page

    useEffect(() => {
        const fetchSubCategories = async () => {
            const response = await fetch(`http://localhost:8000/api/sub-categories/`, {
                headers: { 'Authorization': `Token ${token}` },
            });
            const data = await response.json();
            setSubCategories(data);
            setCurrentPage(1);  // Reset to the first page when subcategories are fetched
        };

        fetchSubCategories();
    }, [token]);

    // Call showAllSubCategories on initial render to set default state
    useEffect(() => {
        showAllSubCategories();
    }, []);

    const handleMainCategorySelect = (category) => {
        // Toggle selection of main category
        if (category === selectedMainCategory) {
            setSelectedMainCategoryState(null); // Unselect main category
            setSelectedSubCategoryState(null); // Reset selected sub-category
        } else {
            setSelectedMainCategoryState(category);
            setSelectedSubCategoryState(null); // Reset selected sub-category when changing main category
        }
    };

    const handleSubCategorySelect = (subCategory) => {
        setSelectedSubCategoryState(subCategory === selectedSubCategory ? null : subCategory);
        setSelectedSubCategory(subCategory);
        if (selectedMainCategory) {
            setSelectedMainCategoryState(null); // Unselect main category when a subcategory is selected
        }
    };

    // Pagination Logic
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentSubCategories = subCategories.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(subCategories.length / itemsPerPage);

    // Change Page
    const nextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
        }
    };

    const prevPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    const showAllSubCategories = () => {
        setSelectedMainCategoryState(null); // Reset main category selection
        setSelectedSubCategoryState(null); // Reset sub-category selection
        setCurrentPage(1); // Reset to the first page
    };

    return (
        <div className={`min-h-screen flex flex-col bg-[#033372] text-white transition-all duration-300 w-72`}>
            {/* Logo Section */}
            <div className="flex items-center justify-center py-2 px-4">
                <img src={LogoImage} alt="Kioscorp Logo" className="w-56 h-auto object-cover" />
            </div>
            <hr className="border-gray-300 mt-2" />

            {/* Show All Selection */}
            <div>
                <button
                    className={`w-full p-4 text-left text-lg font-semibold ${selectedMainCategory === null && selectedSubCategory === null ? 'bg-green-600' : 'hover:bg-[#022a5e]'}`}
                    onClick={showAllSubCategories}
                >
                    Show All
                </button>
            </div>

            {/* Main Categories Filter */}
            <div>
                <h3 className="text-2xl font-bold p-4 text-[#fdcd4b]">Main Categories</h3>
                {mainCategories.map((category) => (
                    <button
                        key={category.main_category_id}
                        className={`w-full p-4 text-left text-lg font-semibold ${selectedMainCategory === category.main_category_id ? 'bg-[#022a5e]' : 'hover:bg-[#022a5e]'}`}
                        onClick={() => handleMainCategorySelect(category.main_category_id)}
                    >
                        {category.main_category_name}
                    </button>
                ))}
            </div>

            {/* Sub-Categories Filter */}
            <div>
                <h3 className="text-2xl font-bold p-4 text-[#fdcd4b]">Sub-Categories</h3>
                {currentSubCategories.map((subCategory) => (
                    <button
                        key={subCategory.sub_category_id}
                        className={`w-full p-4 text-left text-lg font-semibold ${selectedSubCategory === subCategory.sub_category_id ? 'bg-[#022a5e]' : 'hover:bg-[#022a5e]'}`}
                        onClick={() => handleSubCategorySelect(subCategory.sub_category_id)}
                    >
                        {subCategory.sub_category_name}
                    </button>
                ))}
            </div>

            {/* Footer Section with Pagination and Cart */}
            <div className="mt-auto p-4 flex flex-col">
                {/* Pagination Controls */}
                <div className="flex justify-between items-center mb-4">
                    <button
                        onClick={prevPage}
                        disabled={currentPage === 1}
                        className={`p-2 px-4 text-xl font-bold ${currentPage === 1 ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'} text-white rounded`}
                    >
                        Prev
                    </button>
                    <span className="font-bold text-xl">{currentPage} / {totalPages}</span>
                    <button
                        onClick={nextPage}
                        disabled={currentPage === totalPages}
                        className={`p-2 px-4 text-xl font-bold ${currentPage === totalPages ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'} text-white rounded`}
                    >
                        Next
                    </button>
                </div>

                {/* Cart Icon */}
                <div className="relative cursor-pointer flex items-center space-x-2 p-2 h-20 bg-blue-600 hover:bg-blue-700 rounded transition duration-300" onClick={() => setIsCartOpen(true)}>
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
            </div>

            {/* Cart Modal */}
            <CartModal
                isCartOpen={isCartOpen}
                setIsCartOpen={setIsCartOpen}
                cart={cart}
                setCart={setCart}
                token={token}
            />
        </div>
    );
};

export default Sidebar;