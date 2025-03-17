import React, { useRef, useEffect, useState, useCallback } from 'react';
import { FaTimes, FaCheck, FaBan, FaMinus, FaPlus, FaTag } from 'react-icons/fa';
import axios from 'axios';
import Swal from 'sweetalert2';

const OrderModal = ({ isOpen, onClose, order, loggedInUser, onOrderUpdate }) => {
    const modalRef = useRef(null);
    const [vatPercentage, setVatPercentage] = useState(0); // State for VAT percentage
    const [currentOrder, setCurrentOrder] = useState(order);
    const [discountedPrices, setDiscountedPrices] = useState({});

    // Fetch VAT settings when the modal opens
    useEffect(() => {
        if (isOpen) {
            axios.get('http://localhost:8000/api/vat-setting/')
                .then(response => {
                    setVatPercentage(response.data.vat_percentage);
                })
                .catch(error => {
                    console.error('Error fetching VAT setting:', error);
                });
        }
    }, [isOpen]);

    useEffect(() => {
        setCurrentOrder(order);
    }, [order]);

    const calculateTotals = useCallback(() => {
        const subtotal = currentOrder?.order_items.reduce(
            (total, item) => total + (item.discounted_price || item.product_price) * item.order_item_quantity,
            0
        );
        const vatAmount = subtotal * (vatPercentage / 100); // Calculate VAT amount
        const total = subtotal + vatAmount; // Total including VAT
        return { subtotal, vatAmount, total }; // Return an object with subtotal, VAT, and total
    }, [currentOrder, vatPercentage]);

    const handleVoidOrder = async () => {
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: "You won't be able to revert this!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, void it!',
            cancelButtonText: 'No, cancel!',
        });

        if (result.isConfirmed) {
            try {
                // Retrieve token from localStorage or any other storage mechanism you're using
                const token = localStorage.getItem('token');

                if (!token) {
                    throw new Error('No authentication token found.');
                }

                // Perform the Axios request with the Authorization header
                const response = await axios.patch(
                    `http://localhost:8000/api/orders/void/${order.order_id}/`,
                    {}, // Empty body since it's a PATCH request
                    {
                        headers: {
                            Authorization: `Token ${token}`, // Add the token here
                        },
                    }
                );

                // Success notification
                Swal.fire({
                    position: 'top-end',
                    icon: 'success',
                    title: response.data.message,
                    showConfirmButton: false,
                    timer: 2000,
                    toast: true,
                    background: '#ffffff',
                });
                onClose();
            } catch (error) {
                // Error notification
                Swal.fire({
                    position: 'top-end',
                    icon: 'error',
                    title: error.response?.data.error || 'An error occurred while voiding the order.',
                    showConfirmButton: false,
                    timer: 2000,
                    toast: true,
                    background: '#ffffff',
                });
            }
        }
    };


    const handlePayOrder = useCallback(async () => {
        const { total } = calculateTotals();

        const { value: amountGiven } = await Swal.fire({
            title: '💵 How much money did the customer give?',
            html: `
                <input id="swal-input1" class="swal2-input border border-gray-300 rounded-lg p-2" type="number" placeholder="Enter amount" />
                <div id="quick-amount-buttons" class="mt-4 flex flex-wrap justify-center gap-2">
                    <button type ="button" data-value="50" class="quick-amount bg-blue-500 text-white font-bold py-2 px-4 rounded hover:bg-blue-600 transition-colors duration-300">₱50</button >
                    <button type="button" data-value="100" class="quick-amount bg-blue-500 text-white font-bold py-2 px-4 rounded hover:bg-blue-600 transition-colors duration-300">₱100</button>
                    <button type="button" data-value="150" class="quick-amount bg-blue-500 text-white font-bold py-2 px-4 rounded hover:bg-blue-600 transition-colors duration-300">₱150</button>
                    <button type="button" data-value="200" class="quick-amount bg-blue-500 text-white font-bold py-2 px-4 rounded hover:bg-blue-600 transition-colors duration-300">₱200</button>
                    <button type="button" data-value="300" class="quick-amount bg-blue-500 text-white font-bold py-2 px-4 rounded hover:bg-blue-600 transition-colors duration-300">₱300</button>
                    <button type = "button"data-value="500" class= "quick-amount bg-blue-500 text-white font-bold py-2 px-4 rounded hover:bg-blue-600 transition-colors duration-300" >₱500</button >
                    <button type="button" data-value="800" class="quick-amount bg-blue-500 text-white font-bold py-2 px-4 rounded hover:bg-blue-600 transition-colors duration-300">₱800</button>
                    <button type="button" data-value="1000" class="quick-amount bg-blue-500 text-white font-bold py-2 px-4 rounded hover:bg-blue-600 transition-colors duration-300">₱1000</button>
                    <button type="button" data-value="2000" class="quick-amount bg-blue-500 text-white font-bold py-2 px-4 rounded hover:bg-blue-600 transition-colors duration-300">₱2000</button>
                    <button type="button" data-value="3000" class="quick-amount bg-blue-500 text-white font-bold py-2 px-4 rounded hover:bg-blue-600 transition-colors duration-300">₱3000</button>
                    <button type="button" data-value="5000" class="quick-amount bg-blue-500 text-white font-bold py-2 px-4 rounded hover:bg-blue-600 transition-colors duration-300">₱5000</button>
                </div >
            `,
            focusConfirm: false,
            showCancelButton: true,
            confirmButtonText: 'Confirm',
            cancelButtonText: 'Cancel',
            customClass: {
                confirmButton: 'bg-blue-500 text-white font-bold py-2 px-4 rounded hover:bg-blue-600 transition-colors duration-300',
                cancelButton: 'bg-red-500 text-white font-bold py-2 px-4 rounded hover:bg-red-600 transition-colors duration-300',
            },
            didOpen: () => {
                const input = Swal.getPopup().querySelector('#swal-input1');
                const buttons = Swal.getPopup().querySelectorAll('.quick-amount');

                buttons.forEach((button) => {
                    button.addEventListener('click', () => {
                        buttons.forEach((btn) => btn.classList.remove('bg-blue-700'));
                        button.classList.add('bg-blue-700');
                        input.value = button.getAttribute('data-value');
                        input.focus();
                    });
                });

                input.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter') Swal.clickConfirm();
                });
            },
            preConfirm: () => {
                const input = Swal.getPopup().querySelector('#swal-input1').value;
                if (!input || isNaN(input)) {
                    Swal.showValidationMessage(`Please enter a valid amount`);
                } else if (parseFloat(input) < total) {
                    Swal.fire({
                        icon: 'error',
                        title: 'Insufficient Amount',
                        text: 'The amount given is less than the total amount. Please try again.',
                        showConfirmButton: false,
                        timer: 1000,
                    });
                    return false; // Prevent closing of the modal
                }
                return parseFloat(input);
            },
        });

        if (amountGiven) {
            Swal.fire({
                title: 'Processing...',
                text: 'Please wait while we process your payment.',
                allowEscapeKey: false,
                allowOutsideClick: false,
                didOpen: () => {
                    Swal.showLoading();
                },
            });

            const change = amountGiven - total;

            try {
                // Retrieve the token from localStorage or any other secure storage
                const token = localStorage.getItem('token');

                if (!token) {
                    throw new Error('No authentication token found.');
                }

                // Perform the Axios request with the token in the Authorization header
                const response = await axios.patch(
                    `http://localhost:8000/api/orders/pay/${order.order_id}/`,
                    {
                        order_paid_amount: amountGiven,
                        cashier_first_name: loggedInUser.firstName,
                        cashier_last_name: loggedInUser.lastName,
                        vat_percentage: vatPercentage, // Include VAT percentage in the request
                    },
                    {
                        headers: {
                            Authorization: `Token ${token}`,
                        },
                    }
                );

                Swal.close();

                if (response.data.success) {
                    Swal.fire({
                        icon: 'success',
                        title: 'Payment Successful',
                        html: `<p class="text-xl text-gray-700">Change to return: <span class="text-4xl font-bold text-green-600">₱${change.toFixed(2)}</span></p>`,
                    });
                    onClose();
                }
            } catch (error) {
                Swal.close();
                Swal.fire({
                    icon: 'error',
                    title: 'Payment Error',
                    text: error.response?.data.error || 'An error occurred while processing the payment.',
                });
            }
        }
    }, [calculateTotals, order, loggedInUser, vatPercentage, onClose]);


    const handleQuantityChange = async (item, change) => {
        const newQuantity = item.order_item_quantity + change;

        if (newQuantity < 0) return; // Prevent negative quantities

        try {
            const token = localStorage.getItem('token');
            const discountedPrice = discountedPrices[item.order_item_id] || item.product_price;

            const payload = {
                items: [
                    {
                        order_item_id: item.order_item_id,
                        quantity: newQuantity,
                        discounted_price: discountedPrice !== item.product_price ? discountedPrice : null, // Only send discounted_price if it's different from product_price
                    },
                ],
            };

            // Make the API call to update the order item
            await axios.patch(`http://localhost:8000/api/orders/update-order/${currentOrder.order_id}/`, payload, {
                headers: { 'Authorization': `Token ${token}` },
            });

            // Update the order in the local state
            const updatedOrder = {
                ...currentOrder,
                order_items: currentOrder.order_items.map(orderItem =>
                    orderItem.order_item_id === item.order_item_id
                        ? { ...orderItem, order_item_quantity: newQuantity, discounted_price: discountedPrice }
                        : orderItem
                ),
            };
            setCurrentOrder(updatedOrder);

            // Calculate the new order amount
            const newOrderAmount = updatedOrder.order_items.reduce((total, orderItem) => {
                return total + (orderItem.discounted_price || orderItem.product_price) * orderItem.order_item_quantity;
            }, 0);

            // Update the order amount in the backend
            await axios.patch(`http://localhost:8000/api/orders/update-order-amount/${currentOrder.order_id}/`, {
                order_amount: newOrderAmount,
            }, {
                headers: { 'Authorization': `Token ${token}` },
            });

            // Notify the parent component about the order update
            onOrderUpdate(updatedOrder);

        } catch (error) {
            console.error('Error updating order item quantity:', error.response?.data || error.message);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Could not update the order item quantity. Please try again.',
            });
        }
    };

    const handleDiscountChange = async (item) => {
        const { value: discountedPrice } = await Swal.fire({
            title: 'Set Discounted Price',
            input: 'number',
            inputLabel: 'Enter the discounted price',
            inputPlaceholder: 'Discounted Price',
            showCancelButton: true,
            confirmButtonText: 'Save',
            cancelButtonText: 'Cancel',
            preConfirm: (value) => {
                if (!value || isNaN(value) || parseFloat(value) < 0) {
                    Swal.showValidationMessage('Please enter a valid price');
                } else {
                    return parseFloat(value);
                }
            }
        });

        if (discountedPrice !== undefined) {
            setDiscountedPrices(prev => ({
                ...prev,
                [item.order_item_id]: discountedPrice
            }));

            // Update the order item with the discounted price
            try {
                const token = localStorage.getItem('token');
                const payload = {
                    items: [
                        {
                            order_item_id: item.order_item_id,
                            quantity: item.order_item_quantity, // Include the quantity field
                            discounted_price: discountedPrice,
                        },
                    ],
                };

                // Make the API call to update the order item
                await axios.patch(`http://localhost:8000/api/orders/update-order/${currentOrder.order_id}/`, payload, {
                    headers: { 'Authorization': `Token ${token}` },
                });

                // Update the order in the local state
                const updatedOrder = {
                    ...currentOrder,
                    order_items: currentOrder.order_items.map(orderItem =>
                        orderItem.order_item_id === item.order_item_id
                            ? { ...orderItem, discounted_price: discountedPrice }
                            : orderItem
                    ),
                };
                setCurrentOrder(updatedOrder);

                // Calculate the new order amount
                const newOrderAmount = updatedOrder.order_items.reduce((total, orderItem) => {
                    return total + (orderItem.discounted_price || orderItem.product_price) * orderItem.order_item_quantity;
                }, 0);

                // Update the order amount in the backend
                await axios.patch(`http://localhost:8000/api/orders/update-order-amount/${currentOrder.order_id}/`, {
                    order_amount: newOrderAmount,
                }, {
                    headers: { 'Authorization': `Token ${token}` },
                });

                // Notify the parent component about the order update
                onOrderUpdate(updatedOrder);

                // Success notification
                Swal.fire({
                    toast: true,
                    position: 'top-end',
                    icon: 'success',
                    title: 'Discounted price updated successfully!',
                    showConfirmButton: false,
                    timer: 1500,
                    timerProgressBar: true,
                    background: '#f0f9ff', // Optional: light background color for success
                });

            } catch (error) {
                console.error('Error updating order item discounted price:', error.response?.data || error.message);
                Swal.fire({
                    toast: true,
                    position: 'top-end',
                    icon: 'error',
                    title: 'Failed to update discounted price. Please try again.',
                    showConfirmButton: false,
                    timer: 1500,
                    timerProgressBar: true,
                    background: '#fff0f0', // Optional: light background color for error
                });
            }
        }
    };


    if (!isOpen || !order) return null;

    const { subtotal, vatAmount, total } = calculateTotals();

    return (
        <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div ref={modalRef} className="bg-white p-6 rounded-lg shadow-lg w-3/4 h-3/4 flex flex-col text-black">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-5xl font-bold">Order ID: {order.order_id}</h2>
                    <button onClick={onClose} className="text-white bg-red-500 hover:bg-red-700 rounded-full p-2 transition duration-200">
                        <FaTimes size={32} />
                    </button>
                </div>
                <hr className="border-gray-300 mb-4" />
                {currentOrder.order_items.length === 0 ? (
                    <div className="flex flex-col items-center justify-center flex-grow">
                        <p className="text-2xl text-gray-500 mb-4">No items in this order.</p>
                        <button
                            onClick={onClose}
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
                            <span className="w-1/4 text-right">Price</span>
                            <span className="w-1/4 text-right">Action</span>
                        </div>
                        <hr className="border-gray-300" />
                        <div className="flex flex-col flex-grow overflow-y-auto custom-scrollbar">
                            {currentOrder.order_items.map((item, index) => {
                                return (
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
                                                        e.target.onerror = null;
                                                        e.target.src = "https://via.placeholder.com/150";
                                                    }}
                                                />
                                            </div>
                                            <div className="w-1/3">
                                                <span className="text-3xl font-bold">{item.product_name}</span>
                                                <div className="text-xl text-gray-600 font-semibold">
                                                    {item.product_color}, {item.product_size}
                                                </div>
                                            </div>
                                            <div className="flex items-center w-1/3 text-center justify-center">
                                                <button
                                                    onClick={() => handleQuantityChange(item, -1)}
                                                    className="p-2 text-xl bg-gray-300 text-red-600 rounded-l hover:bg-red-200 hover:text-red-700"
                                                >
                                                    <FaMinus />
                                                </button>
                                                <input
                                                    type="number"
                                                    readOnly
                                                    value={item.order_item_quantity}
                                                    className="w-12 text-center text-2xl font-bold border-t border-b border-gray-300"
                                                />
                                                <button
                                                    onClick={() => handleQuantityChange(item, 1)}
                                                    className="p-2 text-xl bg-gray-300 text-green-600 rounded-r hover:bg-green-200 hover:text-green-700"
                                                >
                                                    <FaPlus />
                                                </button>
                                            </div>
                                            <div className="w-1/4 text-right">
                                                {item.discounted_price && (
                                                    <span className="text-3xl font-bold text-gray-500 line-through">
                                                        ₱{parseFloat(item.product_price || 0).toFixed(2)} {/* Ensure product_price is a number */}
                                                    </span>
                                                )}
                                                <span className="text-3xl font-bold">
                                                    ₱{parseFloat(item.discounted_price || item.product_price || 0).toFixed(2)} {/* Ensure price is a number */}
                                                </span>
                                            </div>
                                            <div className="w-1/4 text-right flex flex-col items-end">
                                                <button
                                                    onClick={() => handleDiscountChange(item)}
                                                    className="mt-2 flex items-center bg-blue-500 text-white hover:text-gray-200 hover:bg-blue-700 focus:outline-none transition-colors duration-200 py-2 px-4 rounded-full text-xl font-bold"
                                                >
                                                    <FaTag size={20} className="mr-2" />
                                                    Discount
                                                </button>
                                            </div>
                                        </div>
                                        <hr className="border-gray-300" />
                                    </div>
                                );
                            })}
                        </div>
                        <hr className="border-gray-300 mb-4" />
                        <div className="flex justify-between items-center mt-4">
                            <div className="flex flex-col text-4xl font-bold">
                                <span>Subtotal: ₱{subtotal.toFixed(2)}</span>
                                <span>VAT (at {vatPercentage}%): ₱{vatAmount.toFixed(2)}</span>
                                <span>Total: ₱{total.toFixed(2)}</span>
                            </div>
                            <div className="flex">
                                <button
                                    onClick={handlePayOrder}
                                    className="flex items-center bg-green-500 text-white hover:text-gray-200 hover:bg-green-700 focus:outline-none transition-colors duration-200 py-2 px-4 rounded-full mr-4 text-3xl font-bold"
                                >
                                    <FaCheck size={30} className="mr-2" />
                                    Pay
                                </button>
                                <button
                                    onClick={handleVoidOrder}
                                    className="flex items-center bg-red-500 text-white hover:text-gray-200 hover:bg-red-700 focus:outline-none transition-colors duration-200 py-2 px-4 rounded-full text-3xl font-bold"
                                >
                                    <FaBan size={30} className="mr-2" />
                                    Void
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default OrderModal;