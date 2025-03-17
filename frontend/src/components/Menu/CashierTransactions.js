import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Loader from '../Loader/Loader';

const CashierTransactions = () => {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedCashier, setSelectedCashier] = useState(null);
    const [selectedOrder, setSelectedOrder] = useState(null);

    useEffect(() => {
        const fetchTransactions = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get('http://localhost:8000/api/cashier-transactions/', {
                    headers: {
                        Authorization: `Token ${token}`,
                    },
                });
                setTransactions(response.data);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching transactions:', error);
                setLoading(false);
            }
        };

        fetchTransactions();
    }, []);

    if (loading) {
        return <Loader />;
    }

    return (
        <div className="p-4 bg-white rounded h-full">
            <h2 className="text-2xl font-bold mb-4">Cashier Transactions</h2>

            {/* Dropdown to select a cashier */}
            <div className="mb-6">
                <label htmlFor="cashier-select" className="block text-lg font-medium mb-2">
                    Select Cashier:
                </label>
                <select
                    id="cashier-select"
                    className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    onChange={(e) => setSelectedCashier(e.target.value)}
                    value={selectedCashier === null ? "" : selectedCashier} // Ensure the placeholder is selected by default
                >
                    <option value="" disabled>-- Select a Cashier --</option>
                    {transactions.map((cashier, index) => (
                        <option key={index} value={index}>
                            {cashier.cashier_name}
                        </option>
                    ))}
                </select>
            </div>

            {/* Display orders for the selected cashier */}
            {selectedCashier !== null && (
                <div className="space-y-4">
                    <h3 className="text-xl font-semibold mb-2">
                        Orders by {transactions[selectedCashier].cashier_name}
                    </h3>
                    {transactions[selectedCashier].orders.map((order, orderIndex) => (
                        <div key={orderIndex} className="border rounded-lg p-4 bg-gray-50">
                            <button
                                className="w-full text-left"
                                onClick={() => setSelectedOrder(selectedOrder === orderIndex ? null : orderIndex)}
                            >
                                <p className="text-lg font-medium">
                                    Order ID: {order.order_id} - {new Date(order.order_date_created).toLocaleString()}
                                </p>
                                <p className="text-gray-600">
                                    Status: <span className={`${order.order_status === 'Void' ? 'text-red-500' : order.order_status === 'Paid' ? 'text-green-500' : ''}`}>
                                        <span className="font-bold text-lg">{order.order_status}</span>
                                    </span>
                                </p>
                            </button>

                            {/* Show products if the order is selected */}
                            {selectedOrder === orderIndex && (
                                <div className="mt-4 pl-4 border-l-4 border-blue-500">
                                    <h4 className="text-xl font-semibold">Products:</h4>
                                    <ul className="list-disc pl-4">
                                        {order.order_items.map((item, itemIndex) => (
                                            <li key={itemIndex} className="text-gray-700 flex items-center mt-4">
                                                {item.product_image && (
                                                    <img
                                                        src={item.product_image ? item.product_image : "https://via.placeholder.com/150"}
                                                        alt={item.product_name}
                                                        className="w-28 h-28 object-cover rounded mr-4"
                                                        onError={(e) => {
                                                            e.target.onerror = null;
                                                            e.target.src = "https://via.placeholder.com/150";
                                                        }}
                                                    />
                                                )}
                                                <div className="flex flex-col">
                                                    <div className="flex justify-between items-center">
                                                        <span className="font-bold text-2xl text-black">
                                                            {item.product_name}
                                                        </span>
                                                    </div>
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-lg font-semibold text-gray-500">
                                                            ({item.product_color}, {item.product_size})
                                                        </span>
                                                    </div>
                                                    <div className="flex flex-col items-start">
                                                        {item.has_discount ? (
                                                            <div className="text-lg">
                                                                <span className="line-through text-red-500 mr-2">₱{item.original_price}</span>
                                                                <span className="font-semibold">₱{item.discounted_price}</span>
                                                            </div>
                                                        ) : (
                                                            <span className="text-xl font-semibold">₱{item.original_price}</span>
                                                        )}
                                                        <span className="text-md">
                                                            <span className="font-semibold">Quantity: </span>{item.quantity}
                                                        </span>
                                                    </div>

                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default CashierTransactions;