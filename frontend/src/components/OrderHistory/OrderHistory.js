import React, { useEffect, useState, useCallback, useRef } from 'react';
import axios from 'axios';
import Loader from '../Loader/Loader';
import { FaSearch } from 'react-icons/fa';
import Swal from 'sweetalert2';

const OrderHistory = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(false);

    // Local state for UI inputs
    const [filter, setFilter] = useState('all');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [orderNumber, setOrderNumber] = useState('');

    // Refs to keep the latest values without triggering useCallback dependencies
    const filterRef = useRef(filter);
    const startDateRef = useRef(startDate);
    const endDateRef = useRef(endDate);
    const orderNumberRef = useRef(orderNumber);

    const fetchOrders = useCallback(async (applyDateFilter = false, applyOrderNumberFilter = false) => {
        setLoading(true);
        setOrders([]);

        try {
            // Construct query parameters based on filters
            const params = {
                status: filterRef.current !== 'all' ? filterRef.current : undefined,
                start_date: applyDateFilter ? startDateRef.current : undefined,
                end_date: applyDateFilter ? endDateRef.current : undefined,
                order_number: applyOrderNumberFilter ? orderNumberRef.current : undefined,
            };

            const response = await axios.get('http://localhost:8000/api/orders/history/', {
                headers: {
                    'Authorization': `Token ${localStorage.getItem('token')}`,
                },
                params,
            });

            setTimeout(() => {
                setOrders(response.data);
                setLoading(false);
            }, 500);
        } catch (error) {
            console.error("Error fetching orders:", error);
            setLoading(false);
        }
    }, []); // Dependencies removed to prevent reruns

    useEffect(() => {
        // Fetch all orders initially
        fetchOrders();
    }, [fetchOrders]);

    const handleFilterClick = (selectedFilter) => {
        setFilter(selectedFilter);
        filterRef.current = selectedFilter; // Update ref for status filter

        // Reset date and order number filters when applying a new status filter
        setStartDate('');
        setEndDate('');
        setOrderNumber('');
        startDateRef.current = '';
        endDateRef.current = '';
        orderNumberRef.current = '';

        fetchOrders(); // Apply selected status filter
    };


    const handleDateFilterClick = () => {
        if (new Date(startDate) > new Date(endDate)) {
            Swal.fire({
                toast: true,
                position: 'top-end',
                icon: 'error',
                title: 'Start date must be earlier than end date!',
                showConfirmButton: false,
                timer: 1500,
                backdrop: false, // Disable background dimming
            });
            return;
        }

        setFilter('all');  // Reset to 'All Orders' when applying date filter
        filterRef.current = 'all'; // Update ref to 'all'
        startDateRef.current = startDate;
        endDateRef.current = endDate;
        setOrderNumber(''); // Reset order number input
        orderNumberRef.current = ''; // Update ref for order number
        fetchOrders(true, false); // Only apply date filter
    };

    const handleOrderNumberSearch = () => {
        // Apply order number search regardless of the current filter
        setFilter('all');  // Optionally reset to 'All Orders' when searching by order number
        filterRef.current = 'all'; // Update ref to 'all'
        startDateRef.current = ''; // Reset date range inputs
        endDateRef.current = '';
        setStartDate('');
        setEndDate('');
        orderNumberRef.current = orderNumber;
        fetchOrders(false, true); // Only apply order number filter
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Paid':
                return 'text-green-500 font-semibold';
            case 'Void':
                return 'text-red-500 font-semibold';
            case 'Pending':
                return 'text-orange-500 font-semibold';
            default:
                return 'text-gray-700';
        }
    };

    return (
        <div className="flex flex-col p-4 h-full">
            <div className="flex items-center mb-4 text-lg justify-between">
                {/* Filter Buttons */}
                <div className="flex space-x-4">
                    <button
                        onClick={() => handleFilterClick('all')}
                        className={`${filter === 'all' ? 'text-[#022a5e] hover:text-[#024b8c] underline font-bold' : 'text-gray-700 hover:text-[#022a5e]'} p-2 transition-colors duration-200 ease-in-out`}
                    >
                        All Orders
                    </button>
                    <button
                        onClick={() => handleFilterClick('completed')}
                        className={`${filter === 'completed' ? 'text-green-500 hover:text-green-700 underline font-bold' : 'text-gray-700 hover:text-green-500'} p-2 transition-colors duration-200 ease-in-out`}
                    >
                        Completed
                    </button>
                    <button
                        onClick={() => handleFilterClick('pending')}
                        className={`${filter === 'pending' ? 'text-orange-500 hover:text-orange-700 underline font-bold' : 'text-gray-700 hover:text-orange-500'} p-2 transition-colors duration-200 ease-in-out`}
                    >
                        Pending
                    </button>
                    <button
                        onClick={() => handleFilterClick('cancelled')}
                        className={`${filter === 'cancelled' ? 'text-red-500 hover:text-red-700 underline font-bold' : 'text-gray-700 hover:text-red-500'} p-2 transition-colors duration-200 ease-in-out`}
                    >
                        Cancelled
                    </button>
                </div>

                {/* Date Range and Order Number Filters */}
                <div className="flex items-center space-x-4 ml-auto">
                    <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="border rounded p-2"
                        placeholder="Start Date"
                    />
                    <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="border rounded p-2"
                        placeholder="End Date"
                    />
                    <button
                        onClick={handleDateFilterClick}
                        className=" flex items-center bg-[#022a5e] text-white p-2 rounded hover:bg-[#024b8c] transition"
                    >
                        <FaSearch className="mr-2" /> {/* Add the FaSearch icon */}
                        Apply
                    </button>

                </div>
            </div>
            <div className="flex items-center space-x-4 mb-4 text-lg">
                <input
                    type="text"
                    value={orderNumber}
                    onChange={(e) => setOrderNumber(e.target.value)}
                    className="border rounded p-2"
                    placeholder="Order Number"
                />
                <button
                    onClick={handleOrderNumberSearch}
                    className=" flex items-center bg-[#022a5e] text-white p-2 rounded hover:bg-[#024b8c] transition"
                >
                    <FaSearch className="mr-2" /> {/* Add the FaSearch icon */}
                    Search
                </button>

            </div>

            {/* Orders Table */}
            <div className="overflow-auto flex-grow custom-scrollbar">
                <table className="min-w-full">
                    <thead className="bg-[#022a5e] text-white text-lg sticky top-0 z-10">
                        <tr>
                            <th className="py-2 px-4 w-1/8 text-left">Order No.</th>
                            <th className="py-2 px-4 w-1/3">Product</th>
                            <th className="py-2 px-4 w-1/6 text-center">Date & Time</th>
                            <th className="py-2 px-4 w-1/6 text-center">Status</th>
                            <th className="py-2 px-4 w-1/6 text-center">Unit Price</th>
                            <th className="py-2 px-4 w-1/12 text-center">Quantity</th>
                        </tr>
                    </thead>
                    <tbody className="text-lg bg-white">
                        {loading ? (
                            <tr>
                                <td colSpan="6" className="text-center py-4">
                                    <Loader />
                                </td>
                            </tr>
                        ) : orders.length === 0 ? (
                            <tr>
                                <td colSpan="6" className="text-center py-4 text-xl">
                                    No order history found
                                </td>
                            </tr>
                        ) : (

                            orders.map((order) => (
                                <React.Fragment key={order.order_id}>
                                    <tr className="border-b">
                                        <td className="py-2 px-4" rowSpan={order.items.length || 1}>{order.order_id}</td>
                                        <td className="py-2 px-4 flex items-center">
                                            {order.items[0] && order.items[0].product_image ? (
                                                <img src={order.items[0].product_image} alt={order.items[0].product_name} className="w-20 h-20 mr-4 object-cover rounded" />
                                            ) : (
                                                <span>No Image</span>
                                            )}
                                            {order.items[0] ? (
                                                <div className="flex flex-col">
                                                    <span className="text-xl font-bold">{order.items[0].product_name}</span>
                                                    <span className="text-lg text-gray-500 font-semibold">{order.items[0].product_color}, {order.items[0].product_size}</span>
                                                </div>
                                            ) : 'No Product'}
                                        </td>
                                        <td className="py-2 px-4 text-center">{order.items[0] ? new Date(order.items[0].date_created).toLocaleString() : '-'}</td>
                                        <td className={`py-2 px-4 text-center ${getStatusColor(order.items[0] ? order.items[0].status : '-')}`}>
                                            {order.items[0] ? order.items[0].status : '-'}
                                            {order.items[0] && (order.items[0].status === 'Paid' || order.items[0].status === 'Void') ? (
                                                <div className="text-sm text-gray-500 mt-1">
                                                    Cashier: {order.order_cashier ? order.order_cashier : 'N/A'}
                                                </div>
                                            ) : null}
                                        </td>
                                        <td className="py-2 px-4 text-center">
                                            {order.items[0] ?
                                                typeof order.items[0].unit_price === 'string' ?
                                                    order.items[0].unit_price
                                                    :
                                                    order.items[0].unit_price.discounted ?
                                                        <>
                                                            <span className="line-through text-gray-500">
                                                                ₱{order.items[0].unit_price.original.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                            </span>
                                                            {' '} {' '}
                                                            <span>
                                                                ₱{order.items[0].unit_price.discounted.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                            </span>
                                                        </>
                                                        :
                                                        `₱${order.items[0].unit_price.original.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                                                :
                                                '0.00'}
                                        </td>
                                        <td className="py-2 px-4 text-center">{order.items[0] ? order.items[0].quantity : '-'}</td>
                                    </tr>

                                    {order.items.slice(1).map((item, index) => (
                                        <tr key={`${order.order_id}-${index}`} className="border-b">
                                            <td className="py-2 px-4 flex items-center">
                                                {item.product_image ? (
                                                    <img src={item.product_image} alt={item.product_name} className="w-20 h-20 mr-4 object-cover rounded" />
                                                ) : (
                                                    <img src="https://via.placeholder.com/150" alt="Placeholder" className="w-20 h-20 mr-4 object-cover rounded" />
                                                )}
                                                <div className="flex flex-col">
                                                    <span className="text-xl font-bold">{item.product_name}</span>
                                                    <span className="text-lg text-gray-500 font-semibold">{item.product_color}, {item.product_size}</span>
                                                </div>
                                            </td>
                                            <td className="py-2 px-4 text-center">{new Date(item.date_created).toLocaleString()}</td>
                                            <td className={`py-2 px-4 text-center ${getStatusColor(item.status)}`}>
                                                {item.status}
                                                {item.status === 'Paid' || item.status === 'Void' ? (
                                                    <div className="text-sm text-gray-500 mt-1">
                                                        Cashier: {order.order_cashier ? order.order_cashier : 'N/A'}
                                                    </div>
                                                ) : null}
                                            </td>
                                            <td className="py-2 px-4 text-center">
                                                {typeof item.unit_price === 'string' ?
                                                    item.unit_price
                                                    :
                                                    item.unit_price.discounted ?
                                                        <>
                                                            <span className="line-through text-gray-500">
                                                                ₱{item.unit_price.original.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                            </span>
                                                            {' '} {' '}
                                                            <span>
                                                                ₱{item.unit_price.discounted.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                            </span>
                                                        </>
                                                        :
                                                        `₱${item.unit_price.original.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                                            </td>
                                            <td className="py-2 px-4 text-center">{item.quantity}</td>
                                        </tr>
                                    ))}

                                </React.Fragment>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

        </div>
    );
};

export default OrderHistory;
