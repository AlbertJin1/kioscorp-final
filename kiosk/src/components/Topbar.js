import React, { useState, useEffect, useRef } from 'react';
import { FaTimes } from 'react-icons/fa';
import axios from 'axios';
import Fuse from 'fuse.js';
import CustomSelect from './CustomSelect';
import OnScreenKeyboard from './OnScreenKeyboard';

const Topbar = ({ searchTerm, setSearchTerm, sortOption, setSortOption, products, token, inStockOnly, setInStockOnly, inactivityTime, setCurrentPage }) => {
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [showKeyboard, setShowKeyboard] = useState(false);
    const suggestionBoxRef = useRef(null);
    const keyboardRef = useRef(null); // Create a ref for the keyboard

    useEffect(() => {
        if (products && searchTerm) {
            const filteredSuggestions = products.filter(product => {
                const matchesSearchTerm = product.product_name.toLowerCase().includes(searchTerm.toLowerCase());
                const matchesInStock = inStockOnly ? product.product_quantity > 0 : true; // Check stock condition
                return matchesSearchTerm && matchesInStock;
            });

            // Create a Set to store unique product names
            const uniqueSuggestions = Array.from(new Set(filteredSuggestions.map(product => product.product_name)))
                .map(name => filteredSuggestions.find(product => product.product_name === name));

            setSuggestions(uniqueSuggestions);
        } else {
            setSuggestions([]);
        }
    }, [searchTerm, products, inStockOnly]); // Add inStockOnly to dependency array

    const fetchSuggestions = async (term) => {
        if (!term) {
            setSuggestions([]);
            return;
        }

        try {
            const response = await axios.get('http://localhost:8000/api/products/', {
                headers: {
                    'Authorization': `Token ${token}`,
                },
            });
            const data = response.data;

            const fuse = new Fuse(data, {
                keys: ['product_name'],
                threshold: 0.4, // Lower threshold for more accurate matches
            });

            const result = fuse.search(term);
            const orderedSuggestions = result.map((item) => item.item); // Map results to the item objects

            // Create a Set to store unique product names
            const uniqueSuggestions = Array.from(new Set(orderedSuggestions.map(product => product.product_name)))
                .map(name => orderedSuggestions.find(product => product.product_name === name));

            setSuggestions(uniqueSuggestions); // Set multiple close matches, with the closest at the top
        } catch (error) {
            console.error('Error fetching suggestions:', error);
        }
    };

    const handleSearchChange = (e) => {
        const value = e.target.value;
        setSearchTerm(value);
        setShowSuggestions(value.length > 0);
        fetchSuggestions(value);
        setCurrentPage(1); // Reset to page 1 when searching
    };

    const highlightMatch = (text, term) => {
        if (!term) return text;
        const parts = text.split(new RegExp(`(${term})`, 'gi'));
        return parts.map((part, index) =>
            part.toLowerCase() === term.toLowerCase() ? (
                <span key={index} className="font-bold text-blue-500">{part}</span>
            ) : (
                part
            )
        );
    };

    const handleSuggestionClick = (suggestion) => {
        setSearchTerm(suggestion.product_name);
        setSuggestions([]);
        setShowSuggestions(false);
    };

    const clearSearch = () => {
        setSearchTerm('');
        setSuggestions([]);
        setShowKeyboard(false); // Close the keyboard when clearing the search
    };

    const handleClickOutside = (event) => {
        if (suggestionBoxRef.current && !suggestionBoxRef.current.contains(event.target) &&
            keyboardRef.current && !keyboardRef.current.contains(event.target)) { // Check if the click is outside both suggestion box and keyboard
            setShowSuggestions(false);
            setShowKeyboard(false); // Hide keyboard when clicking outside
        }
    };

    useEffect(() => {
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleKeyPress = (key) => {
        if (key === 'Backspace') {
            setSearchTerm(prev => prev.slice(0, -1)); // Remove last character
        } else if (key === 'Space') {
            setSearchTerm(prev => prev + ' '); // Add space
        } else {
            setSearchTerm(prev => prev + key); // Append key to search term
        }

        // Trigger suggestion fetching when typing with the on-screen keyboard
        fetchSuggestions(searchTerm);
        setShowSuggestions(true); // Show suggestions when typing
    };

    return (
        <div className="w-full bg-white p-4 shadow select-none">
            {/* Row 1: Titles */}
            <div className="flex justify-between mb-2">
                <div className="flex items-baseline">
                    <h2 className="text-4xl font-bold text-[#033372]">
                        <span className="text-[#FFBD59]">P</span>roducts
                    </h2>
                    <span className="ml-4 text-2xl font-semibold">Inactivity Timer: {inactivityTime}</span>
                </div>
                <div className="flex items-center">
                    <h2 className="text-4xl text-[#033372] font-bold">Universal Auto Supply <span className='text-[#FFBD59]'>and</span> Bolt Center</h2>
                </div>
            </div>

            {/* Row 2: Sort by, In Stock Only checkbox, and Search box */}
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-x-4">
                    <div className="flex items-center">
                        <label htmlFor="sort" className="mr-2 text-2xl font-semibold">Sort by:</label>
                        <CustomSelect value={sortOption} onChange={(value) => setSortOption(value)} />
                    </div>
                    <div className="flex items-center mr-4">
                        <div
                            onClick={() => setInStockOnly(!inStockOnly)} // Toggle the state on click
                            className={`w-24 h-12 flex items-center rounded-full p-1 cursor-pointer transition duration-300 ease-in-out ${inStockOnly ? 'bg-blue-500' : 'bg-gray-300'}`}
                        >
                            <div className={`h-10 w-10 flex items-center justify-center bg-white rounded-full shadow transform transition duration-300 ease-in-out ${inStockOnly ? 'translate-x-12' : 'translate-x-0'}`}>
                                <span className={`text-sm font-semibold ${inStockOnly ? 'text-blue-500' : 'text-gray-500'}`}>
                                    {inStockOnly ? 'Yes' : 'No'}
                                </span>
                            </div>
                        </div>
                        <label className="ml-2 text-3xl font-semibold cursor-pointer select-none" onClick={() => setInStockOnly(!inStockOnly)}>In Stock Only</label>
                    </div>
                </div>

                <div className="relative w-2/5" ref={suggestionBoxRef}>
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={handleSearchChange}
                        onFocus={() => {
                            setShowSuggestions(searchTerm.length > 0);
                            setShowKeyboard(true); // Show keyboard on focus
                        }}
                        placeholder="Search products..."
                        className="w-full p-4 rounded-lg text-3xl font-bold border border-gray-300 shadow pr-16" // Removed 'uppercase'
                    />
                    {searchTerm && (
                        <button onClick={clearSearch} className="absolute right-4 top-1/2 transform -translate-y-1/2">
                            <FaTimes size={40} className="text-gray-500" />
                        </button>
                    )}
                    {showSuggestions && suggestions.length > 0 && (
                        <ul className="absolute z-10 w-full bg-white border border-gray-300 rounded shadow-lg mt-2 max-h-96 overflow-y-auto custom-scrollbar">
                            {suggestions.map((suggestion) => (
                                <li
                                    key={suggestion.product_id}
                                    onClick={() => handleSuggestionClick(suggestion)}
                                    className="p-2 hover:bg-gray-200 cursor-pointer text-4xl"
                                >
                                    {/* Make sure to handle case-insensitive matching */}
                                    {highlightMatch(suggestion.product_name, searchTerm)}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

            </div>
            {showKeyboard && (
                <div ref={keyboardRef}> {/* Attach the ref to the keyboard div */}
                    <OnScreenKeyboard onKeyPress={handleKeyPress} onClose={() => setShowKeyboard(false)} />
                </div>
            )}
        </div>
    );
};

export default Topbar;