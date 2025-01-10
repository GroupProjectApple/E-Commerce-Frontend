import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { Bvalue } from './SignIn'; // Assume we have user context
import "./Cart.css";
import { SignInSignUp } from './Generic forms';
import {BASE_URL,MESSAGE_QUEUE_URL} from './config';

const CartItem = ({ item, updateQuantity, removeItem }) => {
    return (
        <div className="cart-item-container">
            <Link to={`/product/${item.productId}`}>
                <div className="cart-item">
                    <img
                        src={item.imageUrl || "/placeholder.jpg"}
                        alt={item.name}
                        className="cart-item-image"
                    />
                    <div>{item.name}</div>
                    <div>Price: ${item.price}</div>
                </div>
            </Link>
            <input
                type="number"
                value={item.quantity}
                onChange={(e) => {
                    if (e.target.value === '0') {
                        removeItem(item.productId);
                    } else {
                        updateQuantity(item.productId, parseInt(e.target.value));
                    }
                }}
            />
            <button onClick={() =>{ removeItem(item.productId)}}>Remove</button>
        </div>
    );
};

const ECart = () => {
    const { Uid } = useContext(Bvalue); // Assume userId from UserContext
    const [cart, setCart] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navg = useNavigate();
    

    useEffect(() => {
        if (!Uid) {
          return;}
        setLoading(true); // Start loading
        axios.get(`${BASE_URL}/api/cart`, {
            params: { UserId: Uid }
        })
        .then(response => {
            setCart(response.data[0].items || []); // Ensure cart is an empty array if no items
            setLoading(false); // Stop loading after data is fetched
        })
        .catch(() => {
            setError('Your Cart is Empty');
            setLoading(false); // Stop loading on error
        });
    }, [Uid]); // Add Uid to the dependency array

    const updateQuantity = (productId, quantity) => {
        axios.put(`${BASE_URL}/api/update`, {
            collectionName: "carts",
            searchFields: { UserId: Uid, "items.productId": productId },
            updatedValues: { $set: { "items.$.quantity": quantity } }
        })
        .then(response => setCart(response.data[0].items))
        .catch(() => setError('Error updating items'));
    };

    const removeItem = async(productId) => {
        if (cart.length > 1) {
            try{
                axios.put(`${BASE_URL}/api/update`, {
                    collectionName: "carts",
                    searchFields: { UserId: Uid, "items.productId": productId },
                    updatedValues: { $pull: { items: { productId: productId } } }
                });
                window.location.href='/Cart';
            
            }catch(error) { console.log(error)};
        } else {
            removeUser();
            setCart([]);
        }
    };

    const removeUser = () => {
        axios.delete(`${BASE_URL}/api/carts`, {
            data: { query: { UserId: Uid } }
        })
        .then(response => {console.log("Deleted Successfully");window.location.href='/Cart'})
        .catch(error => alert(error.response ? error.response.data.message : error.message)); // Handle error response
    };

    const handleBuyNow = () => {
        const orderItems = cart.map(item => ({
            productId: item.productId,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            imageUrl: item.imageUrl, // Include the imageUrl
            purchasedAt: new Date().toISOString()
        }));

        axios.put(`${BASE_URL}/api/update`, 
            {
                collectionName: "orders",
                searchFields: { UserId: Uid },
                updatedValues: {
                    $push: {
                        items: { $each: orderItems }
                    }
                }
            })
            .then(() => {
                console.log('Product purchased successfully');
                setError(null); // Clear any previous errors
                alert('Thank you for your purchase!');
                removeUser();
            })
            .catch((error) => {
                // If the user doesn't already have an orders entry, create one
                axios.post(`${BASE_URL}/api/orders`, {
                    UserId: Uid,
                    items: orderItems
                })
                .then(() => {
                    console.log('Order created and product purchased successfully');
                    setError(null); // Clear any previous errors
                    alert('Thank you for your purchase!');
                    removeUser();
                    window.location.href='/Cart';
                })
                .catch(() => {
                    setError('Error processing your purchase. Please try again.');
                });
            });
    };

    if (!Uid) {return(
       <SignInSignUp Txt="Your Cart Is Empty"/>
    );}
    if (loading) return <div>Loading cart...</div>;
    if (error) return <div>{error}</div>;
    if (cart.length === 0) {
        // Only call removeUser if the cart is truly empty
        removeUser();
        return <div>Your Cart is empty</div>;
    }

    return (
        <div>
            <h2>Your Cart</h2>
            {cart.map(item => (
                <CartItem
                    key={item.productId}
                    item={item}
                    updateQuantity={updateQuantity}
                    removeItem={removeItem}
                />
            ))}
            <h3>Total: ${cart.reduce((total, item) => total + item.price * item.quantity, 0).toFixed(2)}</h3>
            <button className="checkout-button" onClick={()=>{handleBuyNow();}}>
                Buy Now
            </button>
        </div>
    );
};

export default ECart;