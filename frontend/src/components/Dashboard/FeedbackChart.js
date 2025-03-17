import React, { useEffect, useState, useCallback } from 'react';
import { Pie } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    ArcElement,
    Tooltip,
    Legend,
} from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import axios from 'axios';
import Loader from '../Loader/Loader'; // Adjust the import path as necessary
import { FaStar } from 'react-icons/fa';

// Register necessary elements and components with Chart.js
ChartJS.register(ArcElement, Tooltip, Legend, ChartDataLabels);

const FeedbackChart = () => {
    const [feedbackData, setFeedbackData] = useState({
        labels: [],
        datasets: []
    });
    const [loading, setLoading] = useState(true);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear()); // Default to current year

    const fetchSatisfactionData = useCallback(async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:8000/api/feedback/satisfaction/', {
                headers: {
                    Authorization: `Token ${token}`
                },
                params: {
                    year: selectedYear // Pass the selected year as a query parameter
                }
            });
            const satisfactionCounts = response.data;

            const labels = Object.keys(satisfactionCounts);
            const data = Object.values(satisfactionCounts);

            setFeedbackData({
                labels,
                datasets: [
                    {
                        data,
                        backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF'],
                    },
                ],
            });
            setLoading(false); // Set loading to false after fetching data
        } catch (error) {
            console.error("Error fetching satisfaction data:", error);
            setLoading(false); // Ensure loading is set to false even if there's an error
        }
    }, [selectedYear]);

    useEffect(() => {
        fetchSatisfactionData(); // Fetch data immediately on mount

        // Refetch every 15 seconds without showing loader
        const intervalId = setInterval(fetchSatisfactionData, 15000);

        return () => clearInterval(intervalId);
    }, [fetchSatisfactionData]); // Refetch data when fetchSatisfactionData changes

    const handleYearChange = (event) => {
        setSelectedYear(event.target.value);
    };

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

    // Generate an array of years for the dropdown (e.g., last 10 years)
    const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);

    return (
        <div className="bg-white shadow-md p-4 rounded-lg flex-grow flex flex-col h-full">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold flex items-center">
                    <FaStar className="mr-2 text-yellow-500 text-3xl" />
                    Satisfaction Ratings (Kiosk)
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
                    <Loader />
                </div>
            ) : feedbackData.labels.length === 0 ? (
                <div className="flex justify-center items-center h-full text-gray-700">
                    No data available
                </div>
            ) : (
                <div className="flex-grow relative" style={{ height: '310px' }}>
                    <Pie data={feedbackData} options={chartOptions} />
                </div>
            )}
        </div>
    );
};

export default FeedbackChart;