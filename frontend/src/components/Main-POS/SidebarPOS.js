import React, { useState, useEffect, useCallback, forwardRef } from 'react';
import { FaArrowLeft, FaSignOutAlt } from 'react-icons/fa';
import logo from '../../img/logo/KIOSCORP LOGO.png'; // Adjust the path as needed
import axios from 'axios';
import OrderModal from './OrderModal';
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import '../Styles/SidebarPOSStyles.css';

const SidebarPOS = forwardRef(({ handleLogout, setPendingOrderCount, loggedInUser, handleGoBack }, ref) => {
    const [orders, setOrders] = useState([]); // State to hold all pending orders
    const [isOpenModal, setIsOpenModal] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [vatPercentage, setVatPercentage] = useState(0); // State for VAT percentage

    // Fetch orders
    const fetchOrders = useCallback(async () => {
        const token = localStorage.getItem('token');
        try {
            const response = await axios.get('http://localhost:8000/api/orders/pending/', {
                headers: { 'Authorization': `Token ${token}` }
            });
            setOrders(response.data);
            setPendingOrderCount(response.data.length); // Update the count of pending orders
        } catch (error) {
            console.error('Error fetching orders:', error);
        }
    }, [setPendingOrderCount]);

    // Fetch VAT setting
    const fetchVAT = useCallback(async () => {
        try {
            const response = await axios.get('http://localhost:8000/api/vat-setting/');
            setVatPercentage(Number(response.data.vat_percentage)); // Set the VAT percentage
        } catch (error) {
            console.error('Error fetching VAT setting:', error);
            setVatPercentage(0); // Default to 0 if there's an error
        }
    }, []);

    useEffect(() => {
        fetchOrders();
        fetchVAT(); // Fetch VAT setting on component mount

        const intervalId = setInterval(fetchOrders, 5000); // Fetch orders every 5 seconds
        return () => clearInterval(intervalId); // Cleanup interval on component unmount
    }, [fetchOrders, fetchVAT]);

    const handleOrderClick = useCallback((order) => {
        setSelectedOrder(order);
        setIsOpenModal(true);
    }, []);

    const handleCloseModal = useCallback(() => {
        setIsOpenModal(false);
        // Update the orders state with the modified order
        setOrders(prevOrders =>
            prevOrders.map(order =>
                order.order_id === selectedOrder.order_id ? selectedOrder : order
            )
        );
        setSelectedOrder(null);
    }, [selectedOrder]);

    const handleOrderUpdate = (updatedOrder) => {
        // Update the orders state with the modified order
        setOrders(prevOrders =>
            prevOrders.map(order =>
                order.order_id === updatedOrder.order_id ? updatedOrder : order
            )
        );
    };

    const orderRefs = orders.map(() => React.createRef());

    return (
        <div ref={ref} className="w-96 min-h-screen flex flex-col bg-[#033372] text-white transition-all duration-300">
            <div className="flex items-center justify-between p-4">
                <img src={logo} alt="Kioscorp Logo" className="h-auto w-72" />
            </div>

            {/* Scrollable Order Information */}
            <div className="flex-grow overflow-y-auto custom-scrollbar">
                <TransitionGroup>
                    {orders.length > 0 ? (
                        [...orders].reverse().map((order, index) => (
                            <CSSTransition
                                key={order.order_id}
                                nodeRef={orderRefs[index]}
                                timeout={300}
                                classNames="order-container"
                            >
                                <div ref={orderRefs[index]} className={`p-4 rounded shadow-md m-4 transition duration-200 cursor-pointer 
                                    ${selectedOrder && selectedOrder.order_id === order.order_id ? 'bg-gray-300' : 'bg-white text-black'}`}
                                    onClick={() => handleOrderClick(order)}>

                                    <h3 className="text-xl font-bold">Order ID: {order.order_id}</h3>
                                    <p className="text-md text-gray-600 font-semibold">Queue Number: {orders.length - index}</p>
                                    <div className="mb-2">
                                        {order.order_items.filter(item => item.order_item_quantity > 0).map(item => (
                                            <div key={item.order_item_id} className="flex flex-col text-lg">
                                                <div className="flex justify-between items-center">
                                                    <span className="text-md font-bold">{item.product_name}</span>
                                                    <span>x{item.order_item_quantity}</span>
                                                </div>
                                                <span className="text-md text-gray-600 font-semibold">
                                                    ({item.product_color}, {item.product_size})
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="flex text-xl justify-between font-bold">
                                        <span>Total:</span>
                                        <span>
                                            ₱{(Number(order.order_amount) * (1 + vatPercentage / 100)).toFixed(2)}
                                        </span>
                                    </div>
                                </div>
                            </CSSTransition>
                        ))
                    ) : (
                        <CSSTransition
                            nodeRef={React.createRef()}
                            timeout={300}
                            classNames="order-container"
                        >
                            <div ref={React.createRef()} className="bg-white text-black p-4 rounded shadow-md m-4">
                                <h3 className="text-lg font-bold">No pending orders.</h3>
                            </div>
                        </CSSTransition>
                    )}
                </TransitionGroup>
            </div>

            {isOpenModal && (
                <OrderModal
                    isOpen={isOpenModal}
                    onClose={handleCloseModal}
                    order={selectedOrder}
                    loggedInUser={loggedInUser}
                    onOrderUpdate={handleOrderUpdate} // Pass the update handler
                />
            )}

            <div className="flex flex-col justify-center m-4 space-y-4">
                {(loggedInUser?.role === 'owner' || loggedInUser?.role === 'admin') && (
                    <button
                        onClick={handleGoBack}
                        className="flex items-center p-2 rounded bg-white text-black hover:bg-blue-200 transition duration-200 font-semibold text-xl"
                    >
                        <FaArrowLeft className="mr-2" size={30} />
                        Go Back
                    </button>
                )}

                <button
                    onClick={handleLogout}
                    className="flex items-center p-2 rounded bg-white text-black hover:bg-blue-200 transition duration-200 font-semibold text-xl"
                >
                    <FaSignOutAlt className="mr-2" size={30} />
                    <span>Logout</span>
                </button>
            </div>
        </div>
    );
});

export default SidebarPOS;