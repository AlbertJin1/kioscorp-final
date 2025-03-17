import React from 'react';
import { FaBackspace, FaTimes } from 'react-icons/fa';

const keys = [
    ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', 'Backspace'],
    ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
    ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
    ['Z', 'X', 'C', 'V', 'B', 'N', 'M'],
    ['Close', 'Space', 'Close'],
];

const OnScreenKeyboard = ({ onKeyPress, onClose }) => {
    return (
        <div className="fixed bottom-0 left-0 right-0 bg-gray-800 py-4 shadow-lg z-50 p-4">
            <div className="max-w-full mx-auto grid gap-3">
                {keys.map((row, rowIndex) => (
                    <div
                        key={rowIndex}
                        className="flex flex-grow justify-center items-center space-x-4"
                    >
                        {row.map((key, index) => (
                            <button
                                key={index}
                                onClick={() => {
                                    if (key === 'Close') {
                                        onClose(); // Call the close handler
                                    } else {
                                        onKeyPress(key);
                                    }
                                }}
                                className={`flex items-center p-3 justify-center ${key === 'Space'
                                    ? 'w-1/2 h-auto'
                                    : key === 'Close'
                                        ? 'w-auto h-auto bg-red-500' // Set background color for Close button
                                        : 'w-full h-auto'
                                    } ${key === 'Backspace'
                                        ? 'bg-red-600'
                                        : key === 'Space'
                                            ? 'bg-gray-300 text-black'
                                            : 'bg-gray-600 text-white'
                                    } text-6xl font-semibold rounded-md shadow-md hover:bg-gray-700 active:bg-gray-800 focus:outline-none focus:ring focus:ring-blue-300`}
                            >
                                {key === 'Backspace' ? (
                                    <FaBackspace className="text-white" />
                                ) : key === 'Close' ? (
                                    <FaTimes className="text-white" /> // Use FaTimes icon for Close
                                ) : (
                                    key
                                )}
                            </button>
                        ))}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default OnScreenKeyboard;