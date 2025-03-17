import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar } from '@fortawesome/free-solid-svg-icons';
import BackgroundImage from '../img/Background/background.png';

const Feedback = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { order_id } = location.state || {};
    console.log('Received order_id:', order_id);

    const [rating, setRating] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const getSatisfactionLabel = (rating) => {
        if (rating === 1) return 'Not Satisfied';
        if (rating === 2) return 'Slightly Satisfied';
        if (rating === 3) return 'Neutral';
        if (rating === 4) return 'Satisfied';
        if (rating === 5) return 'Very Satisfied';
        return '';
    };

    const handleSubmit = useCallback(async (rating) => {
        if (!order_id) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Order ID is required.',
                timer: 2000,
                showConfirmButton: false
            });
            return;
        }

        if (isSubmitting) return;

        setIsSubmitting(true);

        const feedbackSatisfaction = getSatisfactionLabel(rating);

        const feedbackData = {
            order_id: order_id,
            feedback_rating: rating,
            feedback_satisfaction: feedbackSatisfaction
        };

        try {
            const response = await axios.post('http://localhost:8000/api/feedback/', feedbackData);
            if (response.status === 201) {
                Swal.fire({
                    icon: 'success',
                    title: 'Thank you for your feedback!',
                    text: 'Your feedback has been submitted successfully.',
                    timer: 2000,
                    showConfirmButton: false
                }).then(() => {
                    navigate('/');
                });
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: response.data.message || 'Failed to submit feedback. Please try again.',
                    timer: 2000,
                    showConfirmButton: false
                });
            }
        } catch (error) {
            console.error('Error submitting feedback:', error.response.data);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: error.response?.data?.message || 'Failed to submit feedback. Please try again.',
                timer: 2000,
                showConfirmButton: false
            });
        } finally {
            setIsSubmitting(false);
        }
    }, [order_id, isSubmitting, navigate]);

    useEffect(() => {
        const timer = setTimeout(() => {
            if (rating === 0) {
                handleSubmit(3); // Automatically submit a rating of 3 (Neutral)
            }
        }, 20000); // 20 seconds

        return () => clearTimeout(timer);
    }, [rating, handleSubmit]);

    const handleRatingChange = (rating) => {
        setRating(rating);
        handleSubmit(rating);
    };

    return (
        <div className="h-full bg-cover bg-center" style={{ backgroundImage: `url(${BackgroundImage})` }}>
            <div className="container mx-auto p-4 pt-6 flex flex-col justify-between items-center">
                <div className="text-center">
                    <h2 className="font-bold text-white my-24" style={{ fontSize: 100, lineHeight: 1.2 }}>
                        <span className="text-[#FFBD59]">H</span>ow <span className="text-[#FFBD59]">W</span>ould <span className="text-[#FFBD59]">Y</span>ou <span className="text-[#FFBD59]">R</span>ate <span className="text-[#FFBD59]">Y</span>our <span className="text-[#FFBD59]">E</span>xperience?
                    </h2>
                    <div className="flex justify-center">
                        {[1, 2, 3, 4, 5].map((ratingValue) => (
                            <button key={ratingValue} onClick={() => handleRatingChange(ratingValue)} className={`mx-2`}>
                                <FontAwesomeIcon
                                    icon={faStar}
                                    style={{ fontSize: 300, color: ratingValue <= rating ? '#FFBD59' : '#C4C4C4' }} />
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Feedback;