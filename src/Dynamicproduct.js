import React, { useEffect, useState, useContext } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import './products.css';
import { Bvalue } from './SignIn';
import {BASE_URL,MESSAGE_QUEUE_URL} from './config';

function SCElement(props) {
    return (
        <Link to={`/products/${props.element._id}`}>
            <div className="c1">
                <button className="product-button">
                    <div className="product-name">{props.element.name}</div>
                </button>
            </div>
        </Link>
    );
}

const SubCategory = () => {
    const { categoryId } = useParams();
    const [subCategories, setSubCategories] = useState([]);
  
    useEffect(() => {
      const fetchSubCategories = async () => {
        try {
          const response = await axios.get(`${BASE_URL}/api/subcategories`, {
            params: { categoryId }
          });
          setSubCategories(response.data);
        } catch (error) {
          console.error('Error fetching subcategories:', error);
        }
      };
  
      fetchSubCategories();
    }, [categoryId]);
  
    return (
      <div>
        {subCategories.map((subCategory) => (
          <SCElement key={subCategory._id} element={subCategory} />
        ))}
      </div>
    );
  };

function ProductElement(props) {
    const navg = useNavigate();
    const {Uid} = useContext(Bvalue);
    const add_data = async() =>{

        if(!Uid){return;}
        try{
            await axios.put(`${BASE_URL}/api/update`,
             {
                collectionName :"user_interactions", 
                searchFields: {Uid: Uid},
                updatedValues:{$push:{products: {
                   $each: [props.element.product_details],
                   $position : 0,
                   $slice: 10           
                 }}}
            });
        }catch(error){
            try{
            await axios.post(`${BASE_URL}/api/user_interactions`,{
                Uid: Uid,
                products:[props.element.product_details]
            });
        }catch(error){
            alert("hello");
            console.log(error);
        }
        }
    }
    return (
            <div className="c1">
                <button className="product-button" onClick={()=>{navg(`/product/${props.element._id}`); add_data();}}>
                    <div className="product-name">{props.element.product_details.name}</div>
                </button>
            </div>

    );
}

const ProductLevel1 = () => {
    const { subcategoryId } = useParams();
    const [Pl1, setPl1] = useState([]);
  
    useEffect(() => {
      const fetchProducts = async () => {
        try {
          const response = await axios.get(`${BASE_URL}/api/product1`, {
            params: { subcategoryId }
          });
          setPl1(response.data);
        } catch (error) {
          console.error('Error fetching products:', error);
        }
      };
  
      fetchProducts();
    }, [subcategoryId]);
  
    return (
      <div>
        {Pl1.map((product) => (
          <ProductElement key={product._id} element={product} />
        ))}
      </div>
    );
  };
  const AddToCartButton = (props) => {
    const { Uid, setUid } = useContext(Bvalue); // Get userId from context
    const [error, setError] = useState(null);

    const addToCart = () => {
        console.log(Uid);
        if (!Uid) {
            window.location.href='/SignIn';
            //setError("Please log in to add items to your cart.");
            return;
        }

        axios.put(`${BASE_URL}/api/update`, 
        {
            collectionName: "carts", 
            searchFields: { UserId: Uid, "items.productId": props.productId },
            updatedValues: { $inc: { "items.$.quantity": 1 } },
        })
            .then(response => {
                console.log('Product quantity updated in cart');
                setError(null); // Clear any previous errors
            })
            .catch(() => {
                axios.put(`${BASE_URL}/api/update`, 
                {
                    collectionName: "carts",
                    searchFields: { UserId: Uid },
                    updatedValues: {
                        $push: {
                            items: {
                                productId: props.productId,
                                name: props.name,
                                price: parseInt(props.price),
                                imageUrl: props.imageUrl, // Add imageUrl here
                                quantity: 1,
                            },
                        },
                    },
                })
                    .then(() => {
                        alert('Product added to cart');
                        setError(null); // Clear any previous errors
                    })
                    .catch(() => {
                        axios.post(`${BASE_URL}/api/carts`, {
                            UserId: Uid,
                            items: [
                                {
                                    productId: props.productId,
                                    name: props.name,
                                    price: parseInt(props.price),
                                    imageUrl: props.imageUrl, // Add imageUrl here
                                    quantity: 1,
                                },
                            ],
                        })
                            .then(() => {
                                console.log('Cart created and product added');
                                setError(null); // Clear any previous errors
                            })
                            .catch(() => {
                                setError('Error adding product to cart');
                            });
                    });
            });
    };

    return (
        <>
            <button className="add-to-cart-button" onClick={addToCart}>
                Add to Cart
            </button>
            {error && <div className="error-message">{error}</div>}
        </>
    );
};


const BuyNowButton = (props) => {
    const { Uid } = useContext(Bvalue); // Get userId from context
    const [error, setError] = useState(null);
    const [quantity, setQuantity] = useState(1); // Default quantity is 1

    const increaseQuantity = () => {
        setQuantity(prev => prev + 1);
    };

    const decreaseQuantity = () => {
        setQuantity(prev => (prev > 1 ? prev - 1 : 1)); // Prevent quantity from going below 1
    };

    const buyNow = () => {
        console.log(Uid);
        if (!Uid) {
            window.location.href='/SignIn';
            //setError("Please log in to purchase this product.");
            return;
        }
        if(props.stock < quantity){
            alert("Not adequate quantity present");
            return;
        }
        // Add product to orders collection
        axios.put(`${BASE_URL}/api/update`, 
        {
            collectionName: "orders",
            searchFields: { UserId: Uid },
            updatedValues: {
                $push: {
                    items: {
                       $each:[{
                        productId: props.productId,
                        name: props.name,
                        price: parseInt(props.price),
                        imageUrl: props.imageUrl, // Add imageUrl
                        quantity: quantity, // Use the selected quantity
                        purchasedAt: new Date().toISOString(),
                    }],
                    $position:0,
                    $slice:10
                },
                },
            },
        })
        .then(() => {
            console.log('Product purchased successfully');
            setError(null); // Clear any previous errors
            alert('Thank you for your purchase!');
        })
        .catch((error) => {
            // If the user doesn't already have an orders entry, create one
            axios.post(`${BASE_URL}/api/orders`, {
                UserId: Uid,
                items: [
                    {
                        productId: props.productId,
                        name: props.name,
                        price: parseInt(props.price),
                        imageUrl: props.imageUrl, // Add imageUrl
                        quantity: quantity, // Use the selected quantity
                        purchasedAt: new Date().toISOString(),
                    },
                ],
            })
            .then(() => {
                console.log('Order created and product purchased successfully');
                setError(null); // Clear any previous errors
                alert('Thank you for your purchase!');
            })
            .catch(() => {
                setError('Error processing your purchase. Please try again.');
            });
        });
        axios.put(`${BASE_URL}/api/update`,
            {
                collectionName:"product1",
                searchFields:{_id:props.productId},
                updatedValues:{$set:{"product_details.stock": (props.stock-quantity) }}
            }
        )
        .then(response=>console.log("Successfully updated"))
        .catch((error)=>console.log("Error Updating items"))
    };

    return (
        <>
            <div className="quantity-controls">
                <button onClick={decreaseQuantity}>-</button>
                <span style={{ margin: '0 10px' }}>{quantity}</span>
                <button onClick={increaseQuantity}>+</button>
            </div>
            <button className="buy-now-button" onClick={buyNow}>Buy Now</button>
            {error && <div className="error-message">{error}</div>}
        </>
    );
};

const ProductLevel0 = () => {
    const { _id } = useParams(); // Get productId from URL
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const response = await axios.get(`${BASE_URL}/api/product1`, {
                    params: { _id },
                });
                if (response.data) {
                    setProduct(response.data[0]);
                } else {
                    setError("Product not found");
                }
            } catch (err) {
                setError("Error fetching product details");
            } finally {
                setLoading(false);
            }
        };
        fetchProduct();
    }, [_id]);

    if (loading) return <div className="loading">Loading...</div>;
    if (error) return <div className="error">{error}</div>;

    const { name, brand, price, description, imageUrl, stock, rating, reviews } =
        product.product_details;

    return (
        <div className="product-details-container">
            <div className="product-image-container">
                <img
                    src={imageUrl || "/placeholder.jpg"}
                    alt={name}
                    className="product-image"
                />
            </div>
            <div className="product-info">
                <h1 className="product-name">{name}</h1>
                <h2 className="product-brand">{brand}</h2>
                <h3 className="product-price">Price: ${price}</h3>
                <p className="product-description">{description || "No description available."}</p>
                <p className="product-stock">
                    {stock > 0 ? `${stock} in stock` : "Out of stock"}
                </p>
                <div className="product-rating">
                    Rating: {rating} ⭐
                </div>
                <div className="product-reviews">
                    <h4>Reviews:</h4>
                    {reviews && reviews.length > 0 ? (
                        reviews.map((review, index) => (
                            <div key={index} className="review">
                                <strong>{review.user}</strong>: {review.comment} (
                                {review.rating} ⭐)
                            </div>
                        ))
                    ) : (
                        <p>No reviews available</p>
                    )}
                </div>
                <AddToCartButton productId={_id} price={price} imageUrl={imageUrl} />
                <BuyNowButton productId={_id} price={price} name={name} imageUrl={imageUrl} stock={stock} />
            </div>
        </div>
    );
};

export default ProductLevel0;


export {ProductLevel1,SubCategory,ProductLevel0};
