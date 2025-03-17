import React, { useState, useRef, useEffect } from 'react';
import { IoMdRemoveCircleOutline, IoMdAddCircleOutline } from 'react-icons/io';
import { FaTimes } from 'react-icons/fa';
import axios from 'axios';
import Swal from 'sweetalert2';
import './CartModal.css';

const CartModal = ({ isCartOpen, setIsCartOpen, cart, setCart, token, navigate }) => {
    const [isPrinting, setIsPrinting] = useState(false); // State to track printing status
    const modalRef = useRef();

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (modalRef.current && !modalRef.current.contains(event.target)) {
                setIsCartOpen(false);
            }
        };

        document.addEventListener('click', handleClickOutside, true);

        return () => {
            document.removeEventListener('click', handleClickOutside, true);
        };
    }, [modalRef, setIsCartOpen]);

    const calculateTotal = () => {
        return cart.reduce((total, item) => total + (parseFloat(item.product_price) * item.quantity), 0).toFixed(2); // Float total with 2 decimal places
    };

    const handleUpdateQuantity = (productId, newQuantity) => {
        const existingProduct = cart.find(item => item.product_id === productId);

        // Check if the product exists in the cart
        if (existingProduct) {
            // Ensure new quantity does not exceed available stock
            if (newQuantity <= 0) {
                handleRemoveFromCart(productId);
            } else if (newQuantity > existingProduct.product_quantity) {
                // No Swal here, just a simple return as per your request
                return;
            } else {
                setCart(prevCart => prevCart.map(item =>
                    item.product_id === productId ? { ...item, quantity: newQuantity } : item
                ));
            }
        } else {
            // If the product is not in the cart, add it with the specified quantity
            if (newQuantity > 0) {
                setCart(prevCart => [...prevCart, { product_id: productId, quantity: newQuantity }]);
            }
        }
    };

    const handleRemoveFromCart = (productId) => {
        setCart(prevCart => {
            const updatedCart = prevCart.filter(item => item.product_id !== productId);
            return updatedCart;
        });
    };

    const handlePrint = async () => {
        if (isPrinting) return; // Prevent further execution if already printing
        setIsPrinting(true); // Set printing state to true

        try {
            if (cart.length === 0) {
                // SweetAlert2 still used here as per your request
                Swal.fire({
                    toast: true,
                    position: 'top-end',
                    icon: 'error',
                    title: 'Please add items to your cart before printing.',
                    showConfirmButton: false,
                    timer: 3000,
                    timerProgressBar: true,
                    backdrop: false,
                });
                setIsPrinting(false);
                return;
            }

            const printData = {
                items: cart.map(item => ({
                    product: {
                        product_id: item.product_id,
                        product_name: item.product_name,
                        product_price: item.product_price
                    },
                    quantity: item.quantity,
                    price: item.product_price
                })),
                total: calculateTotal()
            };

            // Show processing modal
            const loadingAlert = Swal.fire({
                title: 'Processing...',
                text: 'Please wait while we print your receipt.',
                allowEscapeKey: false,
                allowOutsideClick: false,
                didOpen: () => {
                    Swal.showLoading();
                }
            });

            // Send the request to the server
            const response = await axios.post('http://localhost:8000/api/print-receipt/', printData, {
                headers: {
                    'Authorization': `Token ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            loadingAlert.close(); // Close loading modal

            if (response.data.success) {
                Swal.fire({
                    toast: true,
                    position: 'top-end',
                    icon: 'success',
                    title: 'Your receipt has been printed successfully.',
                    showConfirmButton: false,
                    timer: 2000,
                    timerProgressBar: true,
                    backdrop: false,
                });

                const order_id = response.data.order_id; // Retrieve the order_id from the response
                console.log('Order ID to navigate with:', order_id); // Debugging line

                // Clear the cart and close the modal
                setCart([]);
                setIsCartOpen(false);

                // Navigate to the Feedback screen with order_id
                navigate('/feedback', { state: { order_id } });
            } else {
                throw new Error(response.data.message || 'Printing failed');
            }
        } catch (error) {
            console.error('Error printing receipt:', error);
            Swal.fire({
                toast: true,
                position: 'top-end',
                icon: 'error',
                title: 'There was an error printing the receipt. Please try again.',
                showConfirmButton: false,
                timer: 3000,
                timerProgressBar: true,
                backdrop: false,
            });
        } finally {
            setIsPrinting(false); // Reset printing state
        }
    };

    return (
        isCartOpen && (
            <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 backdrop-blur-sm flex justify-center items-center z-50">
                <div ref={modalRef} className="bg-white p-6 rounded-lg shadow-lg w-3/4 h-3/4 flex flex-col text-black">
                    <h2 className="text-5xl font-bold mb-4 ">Shopping Cart</h2>
                    <hr className="border-gray-300 mb-4" />
                    {cart.length === 0 ? (
                        <div className="flex flex-col items-center justify-center flex-grow">
                            <p className="text-2xl text-gray-500 mb-4">Your cart is empty.</p>
                            <button
                                onClick={() => setIsCartOpen(false)}
                                className="bg-gray-300 text-gray-700 px-6 py-3 rounded-lg text-5xl font-bold hover:bg-gray-400 transition duration-300 flex items-center"
                            >
                                <FaTimes className="mr-2" size={50} />
                                CLOSE
                            </button>
                        </div>
                    ) : (
                        <>
                            <div className="flex justify-between mb-4 text-4xl font-bold text-gray-600">
                                <span className="w-1/6 text-center">Image</span>
                                <span className="w-1/3">Product Name</span>
                                <span className="w-1/3 text-center">Quantity</span>
                                <span className="w-1/4 text-right mr-10">Price</span>
                            </div>
                            <hr className="border-gray-300" />
                            <div className="flex flex-col flex-grow overflow-y-auto cart-modal-scrollbar">
                                {cart.map((item, index) => (
                                    <div key={index}>
                                        <div className="flex justify-between items-center my-4">
                                            <div className="w-1/6 flex justify-center">
                                                <img
                                                    src={item.product_image
                                                        ? `http://localhost:8000${item.product_image}`
                                                        : "https://via.placeholder.com/150"
                                                    }
                                                    alt={item.product_name}
                                                    className="h-20 w-20 object-cover rounded"
                                                    onError={(e) => {
                                                        e.target.onerror = null; // prevents looping
                                                        e.target.src = "https://via.placeholder.com/150";
                                                    }}
                                                />
                                            </div>
                                            <div className="w-1/3 flex flex-col">
                                                <span className="text-3xl font-bold">{item.product_name}</span>
                                                <span className="text-xl text-gray-600 font-bold">{item.product_color} ({item.product_size})</span>
                                            </div>
                                            <div className="flex items-center justify-center w-1/3">
                                                <button onClick={() => handleUpdateQuantity(item.product_id, item.quantity - 1)}>
                                                    <IoMdRemoveCircleOutline size={70} className="text-red-500 hover:text-red-700" />
                                                </button>
                                                <input
                                                    type="number"
                                                    value={item.quantity}
                                                    onInput={(e) => {
                                                        const newQuantity = e.target.value;
                                                        if (newQuantity === '') {
                                                            return;
                                                        }
                                                        const parsedQuantity = parseInt(newQuantity);
                                                        if (isNaN(parsedQuantity) || parsedQuantity < 1) {
                                                            e.target.value = item.quantity;
                                                            return;
                                                        }
                                                        handleUpdateQuantity(item.product_id, parsedQuantity);
                                                    }}
                                                    min="1"
                                                    className="w-16 font-bold text-2xl text-center border-2 border-gray-300 rounded p-2 mx-2 focus:outline-none focus:border-blue-500 appearance-none -moz-appearance-none -webkit-appearance-none"
                                                />
                                                <button onClick={() => handleUpdateQuantity(item.product_id, item.quantity + 1)}>
                                                    <IoMdAddCircleOutline size={70} className="text-green-500 hover:text-green-700" />
                                                </button>
                                            </div>
                                            <span className="w-1/4 text-right mr-10 text-3xl font-bold">
                                                ₱{(parseFloat(item.product_price) * item.quantity).toFixed(2)}
                                            </span>
                                        </div>
                                        <hr className="border-gray-300" />
                                    </div>
                                ))}
                            </div>

                            {/* Footer with Close, Total, and Print */}
                            <div className="flex justify-between items-center mt-4">
                                <button
                                    onClick={() => setIsCartOpen(false)}
                                    className="bg-gray-300 text-gray-700 px-6 py-3 rounded-lg text-4xl font-bold hover:bg-gray-400 transition duration-300"
                                >
                                    CLOSE
                                </button>
                                <div className="flex justify-center items-center">
                                    <span className="text-4xl font-bold mr-4">Total:</span>
                                    <span className="text-6xl font-bold">₱{calculateTotal()}</span>
                                </div>
                                <button
                                    onClick={handlePrint}
                                    className="bg-blue-500 text-white px-6 py-3 rounded-lg text-4xl font-bold hover:bg-blue-600 transition duration-300"
                                    disabled={isPrinting} // Disable button while printing
                                >
                                    PRINT
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        )
    );
};

export default CartModal;
