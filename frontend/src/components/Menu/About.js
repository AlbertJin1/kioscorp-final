import React from 'react';

const About = () => {
    return (
        <div className="flex flex-col h-screen flex-grow p-4 bg-white rounded-lg">

            <h2 className="text-3xl font-bold mb-4 text-blue-900">About This Application</h2>
            <hr className="border-t-2 border-blue-900 mb-6" />

            <div className="max-w-7xl w-full">
                <p className="text-lg text-gray-700 mb-4">
                    This application streamlines sales and inventory management with a focus on secure, efficient operations. It allows authorized users to manage customer data, roles, and track key activities in real time.
                </p>
                <p className="text-lg text-gray-700 mb-4">
                    Key Features:
                </p>
                <ul className="list-disc pl-5 text-lg text-gray-700">
                    <li>Role-based user management</li>
                    <li>Sales and customer data tracking</li>
                    <li>Secure access control</li>
                    <li>Activity logs and reporting</li>
                </ul>
                <p className="text-lg text-gray-700 mt-4">
                    The integrated Point of Sale (POS) system supports efficient transactions with features such as:
                </p>
                <ul className="list-disc pl-5 text-lg text-gray-700">
                    <li>Order management and payment processing</li>
                    <li>Real-time inventory updates</li>
                    <li>Order history and reporting</li>
                </ul>
                <p className="text-lg text-gray-700 mt-4">
                    The app also supports seamless product management, including adding new products, updating existing ones, managing categories, and tracking inventory levels.
                </p>
                <h3 className="text-2xl font-bold mt-6 text-blue-900">KiosCorp Members</h3>
                <hr className="border-t-2 border-blue-900 mb-4" />
                <ul className="list-disc pl-5 text-lg text-gray-700">
                    <li>Brieanne Joyce M. Alsonado</li>
                    <li>Mohamad B. Dida-agun</li>
                    <li>John Henley S. Llamos</li>
                    <li>Jessie Albert J. Regualos</li>
                    <li>Eric John R. Tan</li>
                </ul>
            </div>
        </div>
    );
};

export default About;
