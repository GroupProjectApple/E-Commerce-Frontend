import React, { useState, useRef, useEffect, useContext} from 'react';
import { Link, useParams, useNavigate, useLocation } from 'react-router-dom';
import './Generic forms.css';
import axios from 'axios';
import { Bvalue } from './SignIn';
import {BASE_URL,MESSAGE_QUEUE_URL} from './config';

export function Button(props){
  return (
    <Link to ={props.path} >
      <button type="button" className={props.class}>
        {props.name}
      </button>
    </Link>
  );
}
export function SignInSignUp(props){
  const navg=useNavigate();
  return(
    <div>
      <h1>{props.Txt}</h1>
      <button onClick={()=>{navg('/SignIn')}} className="checkout-button">Sign In to continue</button> 
      <button onClick={()=>{navg('/SignUp')}} className="checkout-button">Sign Up</button>
   </div>
  );
}
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

export function DropdownButton(props) {
  const [isOpen, setIsOpen] = useState(false); // State to manage dropdown visibility
  const dropdownRef = useRef(null); // Ref to track the dropdown element

  // Function to toggle the dropdown
  const toggleDropdown = (e) => {
    e.preventDefault();  // Prevent default link behavior
    setIsOpen(!isOpen);  // Toggle the dropdown state
  };

  // Function to close dropdown if clicked outside
  const handleClickOutside = (event) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setIsOpen(false); // Close the dropdown
    }
  };

  // Add event listener for clicks outside the dropdown
  useEffect(() => {
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    // Cleanup the event listener on component unmount
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div
      className="dropdown-container"
      ref={dropdownRef}
      onMouseEnter={() => setIsOpen(true)}  // Show dropdown on hover
      onMouseLeave={() => setIsOpen(false)}
    >
      <button
        className="b1"
        onClick={toggleDropdown}
      >
        {props.name}
      </button>

      {/* Dropdown menu - only visible when isOpen is true */}
      {isOpen && (
        <div className="dropdown-menu">
          {props.dropdownItems.map((item, index) => (
            <Link key={index} to={item.path} className="link">
              <button className="dropdown-item" type="button" onClick={item.action}>
                {item.label}
              </button>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
export function GenerateSearchRegex(query) {
  // Split query into individual words (tokens)
  const tokens = query
    .trim()
    .split(/\s+/) // Split by spaces
    .map((word) => word.toLowerCase()); // Tokenize and lowercase each word

  // Generate regex for each token with flexibility for partial matches
  const regexParts = tokens
    .map((word) =>
      // Match each character loosely within the word
      word
        .split("") // Split into characters
        .map((char) => `(?=.*${char})`) // Lookahead for each character
        .join("") // Join the individual lookaheads
    )
    .join(".*|"); // Ensure that all tokens are matched in sequence, allowing extra characters in between

  return regexParts; // Match from the start with case-insensitivity
}


let Txt='';
export function SearchResult() {
  const [products, setProducts] = useState([]); // Store fetched products
  const [loading, setLoading] = useState(true); // Track loading state
  const [error, setError] = useState(null); // Track any errors during fetch
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  let query = queryParams.get('query');
  let q1=query;
  query = `^${GenerateSearchRegex(query)}.*$`; // Regular expression for query matching
  let category = queryParams.get('i');

  useEffect(() => {
    if (!query) return; // If no query is present in the URL, skip fetching.

    const fetchProducts = async () => {
      try {
        // Build the aggregation pipeline for the query
        const pipeline = JSON.stringify([
          {
            '$match': {
              '$and': [
                {
                  'product_details.category_level_3': {
                    '$regex': category,
                    '$options': 'i'
                  }
                },
                {
                  '$or': [
                    {
                      'product_details.category_level_3': {
                        '$regex': query,
                        '$options': 'i'
                      }
                    },
                    {
                      'product_details.name': {
                        '$regex': query,
                        '$options': 'i'
                      }
                    },
                    {
                      'product_details.brand': {
                        '$regex': query,
                        '$options': 'i'
                      }
                    },
                    {
                      'product_details.category_level_2': {
                        '$regex': query,
                        '$options': 'i'
                      }
                    },
                    {
                      'product_details.tags': {
                        '$regex': query,
                        '$options': 'i'
                      }
                    }
                  ]
                }
              ]
            }
          },
          {
            '$addFields': {
              'name_match': { 
                '$regexFind': { 
                  'input': { 
                    '$ifNull': [
                      { '$toString': '$product_details.name' },
                      '' 
                    ] 
                  }, 
                  'regex': query, 
                  'options': 'i' 
                } 
              },
              'brand_match': { 
                '$regexFind': { 
                  'input': { 
                    '$ifNull': [
                      { '$toString': '$product_details.brand' }, 
                      '' 
                    ] 
                  }, 
                  'regex': query, 
                  'options': 'i' 
                } 
              },
              'category_level_2_match': { 
                '$regexFind': { 
                  'input': { 
                    '$ifNull': [
                      { '$toString': '$product_details.category_level_2' }, 
                      '' 
                    ] 
                  }, 
                  'regex': query, 
                  'options': 'i' 
                } 
              },
              'category_level_3_match': { 
                '$regexFind': { 
                  'input': { 
                    '$ifNull': [
                      { '$toString': '$product_details.category_level_3' }, 
                      '' 
                    ] 
                  }, 
                  'regex': query, 
                  'options': 'i' 
                } 
              },
              'tags_match': { 
                '$regexFind': { 
                  'input': { 
                    '$ifNull': [
                      { '$toString': { '$arrayElemAt': ['$product_details.tags', 0] } }, 
                      '' 
                    ] 
                  }, 
                  'regex': query, 
                  'options': 'i' 
                } 
              }
            }
          },
          {
            '$addFields': {
              'name_match_percentage': {
                '$cond': {
                  'if': { '$gt': [{ '$strLenCP': { '$ifNull': ['$name_match.match', ''] } }, 0] },
                  'then': {
                    '$multiply': [
                      { '$divide': [{ '$strLenCP': { '$ifNull': ['$name_match.match', ''] } }, { '$strLenCP': { '$ifNull': ['$product_details.name', ''] } }] },
                      100
                    ]
                  },
                  'else': 0
                }
              },
              'brand_match_percentage': {
                '$cond': {
                  'if': { '$gt': [{ '$strLenCP': { '$ifNull': ['$brand_match.match', ''] } }, 0] },
                  'then': {
                    '$multiply': [
                      { '$divide': [{ '$strLenCP': { '$ifNull': ['$brand_match.match', ''] } }, { '$strLenCP': { '$ifNull': ['$product_details.brand', ''] } }] },
                      100
                    ]
                  },
                  'else': 0
                }
              },
              'category_level_2_match_percentage': {
                '$cond': {
                  'if': { '$gt': [{ '$strLenCP': { '$ifNull': ['$category_level_2_match.match', ''] } }, 0] },
                  'then': {
                    '$multiply': [
                      { '$divide': [{ '$strLenCP': { '$ifNull': ['$category_level_2_match.match', ''] } }, { '$strLenCP': { '$ifNull': ['$product_details.category_level_2', ''] } }] },
                      100
                    ]
                  },
                  'else': 0
                }
              },
              'category_level_3_match_percentage': {
                '$cond': {
                  'if': { '$gt': [{ '$strLenCP': { '$ifNull': ['$category_level_3_match.match', ''] } }, 0] },
                  'then': {
                    '$multiply': [
                      { '$divide': [{ '$strLenCP': { '$ifNull': ['$category_level_3_match.match', ''] } }, { '$strLenCP': { '$ifNull': ['$product_details.category_level_3', ''] } }] },
                      100
                    ]
                  },
                  'else': 0
                }
              },
              'tags_match_percentage': {
                '$cond': {
                  'if': { '$gt': [{ '$strLenCP': { '$ifNull': ['$tags_match.match', ''] } }, 0] },
                  'then': {
                    '$multiply': [
                      { '$divide': [{ '$strLenCP': { '$ifNull': ['$tags_match.match', ''] } }, { '$strLenCP': { '$ifNull': [{ '$arrayElemAt': ['$product_details.tags', 0] }, ''] } }] },
                      100
                    ]
                  },
                  'else': 0
                }
              }
            }
          },
          {
            '$addFields': {
              'match_percentage': {
                '$sum': [
                  '$name_match_percentage',
                  '$brand_match_percentage',
                  '$category_level_2_match_percentage',
                  '$category_level_3_match_percentage',
                  '$tags_match_percentage'
                ]
              }
            }
          },
          {
            '$sort': { 'match_percentage': -1 }
          },
          {
            '$project': {
              'product_details.name': 1,
              'product_details.brand': 1,
              'match_percentage': 1
            }
          }
        ]);
        

        const url = `${BASE_URL}/api/product1?aggregate=true&pipeline=${encodeURIComponent(pipeline)}`;
        const response = await axios.get(url);

        setProducts(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching products:', error);
        setError('No match found to your search');
        setLoading(false);
      }
    };

    setLoading(true); // Reset loading state
    setError(null);
    fetchProducts();
  }, [query, category]); // Trigger effect when 'query' or 'category' changes

  // If loading, show a loading message
  if (loading) return <div>Loading products...</div>;

  // If an error occurs, show the error message
  if (error) return <div>{error}</div>;

  return (
    <div>
      <div className="product-list">
        {products.length > 0 ? (
          products.map((product) => (
            <ProductElement key={product._id} element={product} />
          ))
        ) : (
          <div>No products found matching "{query}"</div>
        )}
      </div>
    </div>
  );
}

export function DropdownSearchMenu(props) {
 const [IsOpen, setIsOpen] = useState(false); 
 const [Clicked, setClicked] = useState(false); // State to manage dropdown visibility
  const dropdownRef = useRef(null); // Ref to track the dropdown element

  /*useEffect(() => {
    // Example: Open the dropdown whenever Txt changes and isn't empty
    if (props.Txt.length > 0 && props.Txt[0].name) {
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
  }, [props.Txt]);*/

  // Function to toggle the dropdown
  const toggleDropdown = () => {
     // Prevent default link behavior
    setIsOpen(!IsOpen);  // Toggle the dropdown state
    setClicked(true);
  };


  // Function to close dropdown if clicked outside
  const handleClickOutside = (event) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setIsOpen(false); // Close the dropdown
      setClicked(true);
    }
  };

  // Add event listener for clicks outside the dropdown
  useEffect(() => {
    // Example: Open the dropdown whenever Txt changes and isn't empty
    
    if (IsOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    if (props.Txt.length > 0 && !Clicked) {
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
    setClicked(false);
    // Cleanup the event listener on component unmount
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [IsOpen, props.Txt]);
  

  return (
    <div
      className="dropdown-container"
      ref={dropdownRef}
    >
      {IsOpen && (
        <div className="dropdown-menu1">
          {props.Txt.map((item, index) => (
            <Link key={index} to={item.path} className="link">
              <button className="dropdown-item" type="button" onClick={() => toggleDropdown() }>
                {item.ph}
              </button>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}


export function Dropdownmenu(props){
  const contextVlaue=useContext(Bvalue);
  const {Catg, setCatg}=contextVlaue;
  const handleChange = (event) => {
    const selectedValue = event.target.value;
    if(selectedValue!="All Categories")
    setCatg(selectedValue);// Call your update function with the selected value
    else
    setCatg('');  
  };
  return(
    <select className="dd1" onChange={handleChange}>
      <option>{props.op1}</option>
      {props.options.map((item, index)=>(
        <option>{item.name}</option>
      ))}
    </select>
  );
}
export function Product(props){
  return(
    <>
    {props.product.map((item, index)=>(
    <Link to={item.path} className='link'>
        <div className="p1">
          <img src={item.im} alt="product" className="pimg"/>
          <br/>
          {item.name}       
          <br/>
          "Shop"
        </div>
    </Link>
    ))}
    </>
  );
}
export function Product1(props){
  return(
    <>
    {props.product.map((item, index)=>(
    <Link to={`/product/${item._id}`}className='link'>
        <div className="p2">
          <img src={item.img} alt="product" className="pimg"/>
          <br/>
          {item.name}       
          <br/>
          "Shop"
        </div>
    </Link>
    ))}
    </>
  );
}