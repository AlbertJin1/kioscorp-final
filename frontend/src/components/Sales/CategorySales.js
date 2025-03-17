import React, { useEffect, useState } from 'react';
import { Pie } from 'react-chartjs-2';
import axios from 'axios';
import { FaChartPie } from 'react-icons/fa';
import Loader from '../Loader/Loader'; // Import the Loader component

const CategorySales = () => {
    const [chartData, setChartData] = useState({
        labels: [],
        datasets: [{
            data: [],
            backgroundColor: [],
        }],
    });
    const [loading, setLoading] = useState(true);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear()); // Default to current year

    useEffect(() => {
        const fetchCategorySales = async () => {
            const token = localStorage.getItem('token'); // Retrieve token from localStorage
            try {
                const response = await axios.get('http://localhost:8000/api/sales/category/', {
                    headers: {
                        Authorization: `Token ${token}`,
                    },
                    params: {
                        year: selectedYear, // Pass the selected year as a query parameter
                    },
                });

                const labels = Object.keys(response.data);
                const data = Object.values(response.data);

                // Define two attractive colors
                const attractiveColors = [
                    '#4A90E2', // Calm Blue
                    '#50E3C2', // Soft Green
                ];

                // Use the two colors for the dataset
                const backgroundColor = attractiveColors.slice(0, Math.min(labels.length, 2)); // Limit to 2 colors

                setChartData({
                    labels: labels,
                    datasets: [{
                        data: data,
                        backgroundColor: backgroundColor,
                    }],
                });
            } catch (error) {
                console.error("Error fetching category sales data:", error);
            } finally {
                setLoading(false); // Ensure loading is set to false after fetching data
            }
        };

        fetchCategorySales();
    }, [selectedYear]);

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            datalabels: {
                color: '#fff',
                font: {
                    weight: 'bold',
                    size: 16,
                },
                formatter: (value, context) => value,
            },
        },
    };

    const handleYearChange = (event) => {
        setSelectedYear(event.target.value);
    };

    // Generate an array of years for the dropdown (e.g., last 10 years)
    const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);

    return (
        <div className="bg-white shadow-md p-4 rounded-lg flex-grow flex flex-col h-full">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold flex items-center">
                    <FaChartPie className="mr-2 text-yellow-500 text-3xl" />
                    Category Sales
                </h2>
                <select
                    value={selectedYear}
                    onChange={handleYearChange}
                    className="p-2 border rounded-lg"
                >
                    {years.map(year => (
                        <option key={year} value={year}>{year}</option>
                    ))}
                </select>
            </div>
            {loading ? (
                <div className="flex justify-center items-center h-full">
                    <Loader /> {/* Use the Loader component here */}
                </div>
            ) : (
                <div className="flex-grow flex justify-center items-center" style={{ height: '260px' }}>
                    {chartData.labels.length === 0 ? (
                        <p className="text-lg text-gray-700">No data available</p> // Message when no data is available
                    ) : (
                        <Pie data={chartData} options={chartOptions} />
                    )}
                </div>
            )}
        </div>
    );
};

export default CategorySales;