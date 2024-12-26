import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { Bvalue } from './SignIn'; // Assume user context
import { format } from 'date-fns';
import './YourOrders.css'; // Import the CSS file
import { SignInSignUp } from './Generic forms';

const YourOrders = () => {
    const { Uid } = useContext(Bvalue); // UserId from context
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!Uid) return;
        setLoading(true);
        axios.get(`https://e-commerce-website-tioj.onrender.com/api/orders`, {
            params: { UserId: Uid },
        })
            .then(response => {
                setOrders(response.data[0].items || []);
                setLoading(false);
            })
            .catch((error) => {
                if (error.response) {
                    if (error.response.status === 404) {
                        setLoading(false);
                        setError("You have no orders yet");
                    } else {
                        setLoading(false);
                        setError("OOPS!! Server error");
                    }
                } else if (error.request) {
                    console.error('Network error: No response from server', error.message);
                    setError(error.message);
                    setLoading(false);
                } else {
                    console.error('Request setup error:', error.message);
                    setError(error.message);
                    setLoading(false);
                }
            });
    }, [Uid]);

    if (!Uid) return <SignInSignUp Txt="You have no orders yet"/>
    if (loading) return <div className="loading-message">Loading orders...</div>;
    if (error) return <div className="error-message">{error}</div>;

    return (
        <div className="your-orders-container">
            <h2>Your Orders</h2>
            {orders.length === 0 ? (
                <div className="no-orders-message">You have no orders yet</div>
            ) : (
                orders.map((order, index) => (
                    <div key={index} className="order-item">
                        <h3>Order {index + 1}</h3>
                        <img 
                            src={order.imageUrl} 
                            alt={order.name} 
                            className="order-item-image" 
                        />
                        <p>{order.name}</p>
                        <p>Quantity: {order.quantity}</p>
                        <p>Price(Per Item): ${order.price}</p>
                        <p className="date">Date: {format(new Date(order.purchasedAt), 'yyyy-MM-dd')}</p>
                        <p className="time">Time: {format(new Date(order.purchasedAt), 'HH:mm:ss')}</p>
                    </div>
                ))
            )}
        </div>
    );
};

export default YourOrders;