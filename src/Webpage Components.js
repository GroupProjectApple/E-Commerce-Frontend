import * as G from "./Generic forms";
import "./Webpage Components.css";
import { useNavigate } from 'react-router-dom';
import React, { useContext, useState, useEffect, useRef } from 'react';
import axios from 'axios';
import ECart from "./Cart";
import { Bvalue } from './SignIn';
import { BASE_URL,MESSAGE_QUEUE_URL } from "./config";

export function AccountButton() {
   const contextValue = useContext(Bvalue);  // Log the value from the context
   console.log("Context Value: ", contextValue); // Log it to check
 
   // Ensure that contextValue is an array
  /* if (!Array.isArray(contextValue)) {
     console.error("Bvalue context is not an array:", contextValue);
     return <div>Error: Invalid context value</div>;
   }*/
 
   const {Flag, setFlag, Uid, setUid} = contextValue;
   const navg= useNavigate();
 
   const accountItems = [
     { label: 'Sign In', path: '/SignIn' },
     { label: 'Sign Up', path: '/SignUp' }
   ];
 
   const accountItems1 = [
     { label: 'Account', path: '/Account' },
     { label: 'Logout', action:()=>{
      window.location.href = '/';
      setTimeout(()=>{setFlag(false);
      setUid('');},500);
      localStorage.removeItem('isSignedIn');
      localStorage.removeItem('uid');
      localStorage.removeItem('uname');
      localStorage.removeItem('umail');
      
   }}
   ];
   return (
      <div>
         <G.DropdownButton name="Account" dropdownItems={Flag?accountItems1:accountItems}/>
      </div>
   );
}
export function DeliveryLocation(){
   return (<G.Button name="Location" class="b1" path="/Location"/>);
}

export function Orders(){
   return (<G.Button name="Your Orders" class="b1" path="/YourOrders"/>);
}

export function Cart(){
   return (<G.Button name="Cart" class="b1" path="/Cart"/>);
}
function Categories(){
   const {Pl3}= useContext(Bvalue)
   return(<G.Dropdownmenu op1="All Categories" options={Pl3}/>)
}

export const Searchbutton = React.forwardRef((props, ref) => {
  const navg = useNavigate();
  const { Uid } = useContext(Bvalue);

  const handleClick = async () => {
    console.log("Searchbutton clicked, props:", props);

    if (props.path) {
      navg(props.path); // Navigate if a valid path is present
    } else {
      window.location.href = "/";
    }

    // Execute updates
    await updatadata();
    await updateme();
  };

  const updatadata = async () => {
    if (!props.Text || props.Text.length === 0) {
      console.log("No text to update data.");
      return;
    }
    try {
      const response = await axios.get(
        `${BASE_URL}/api/search_phrases`,
        {
          params: {
            Uid: "-1",
            phrases: { $regex: `^${props.Text}$`, $options: "i" },
          },
        }
      );
      console.log("Update data response:", response.data);
    } catch (error) {
      try {
        await axios.put(`${BASE_URL}/api/update`, {
          collectionName: "search_phrases",
          searchFields: { Uid: "-1" },
          updatedValues: {
            $push: {
              phrases: {
                $each: [props.Text],
                $position: 0,
                $slice: 5000,
              },
            },
          },
        });
        console.log("Data updated successfully.");
      } catch (error) {
        console.error("Error updating data:", error);
      }
    }
  };

  const updateme = async () => {
    if (!Uid || !props.Text || props.Text.length <= 0) {
      console.log("No Uid or text to update.");
      return;
    }
    try {
      const response = await axios.get(
        `${BASE_URL}/api/search_phrases`,
        {
          params: {
            Uid,
            phrases: { $regex: `^${props.Text}$`, $options: "i" },
          },
        }
      );
      console.log("Update me response:", response.data);
    } catch (error) {
      try {
        await axios.put(`${BASE_URL}/api/update`, {
          collectionName: "search_phrases",
          searchFields: { Uid },
          updatedValues: {
            $push: {
              phrases: {
                $each: [props.Text],
                $position: 0,
                $slice: 5,
              },
            },
          },
        });
        console.log("Updated me successfully.");
      } catch (error) {
        console.error("Error updating me:", error);
      }
    }
  };

  // Forward the `handleClick` function to the parent via ref
  React.useImperativeHandle(ref, () => ({
    triggerSearch: handleClick,
  }));

  return (
    <button type="button" id="sb1" onClick={handleClick}>
    </button>
  );
});

export function Searchbar() {
  const [Text, setText] = useState("");
  const [Txt, setTxt] = useState([]);
  const contextValue = useContext(Bvalue);
  const { Catg, Uid } = contextValue;
  const [Isclicked, setIsclicked] = useState(false);
  const dropdownRef = useRef(null);
  const searchButtonRef = useRef(null);

  const handleClickOutside = (event) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setIsclicked(false);
    }
  };

  const handleKeyPress = (event) => {
    if (event.key === "Enter") {
      console.log("Enter key pressed!");
      searchButtonRef.current?.triggerSearch(); // Call the forwarded function
    }
  };

  useEffect(() => {
    if (Isclicked) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    const fetchData = async (UId = null) => {
      try {
        const regex = `^${G.GenerateSearchRegex(Text)}.*$`;
        const pipeline = JSON.stringify([
          {
            $match: { phrases: { $regex: regex, $options: "i" } },
          },
          {
            $project: {
              phrases: {
                $filter: {
                  input: "$phrases",
                  as: "phrase",
                  cond: { $regexMatch: { input: "$$phrase", regex: regex, options: "i" } },
                },
              },
            },
          },
        ]);
        const url = `${BASE_URL}/api/search_phrases?aggregate=true&pipeline=${encodeURIComponent(
          pipeline
        )}`;
        const response = !UId
          ? await axios.get(url)
          : await axios.get(`${BASE_URL}/api/search_phrases`, { params: { Uid: UId } });
        console.log(response.data);
        const phrases =
          response.data.length > 0 ? response.data[0].phrases.slice(0, 5) : [];
        setTxt(
          phrases
            .filter((phrase) => phrase !== null)
            .map((phrase) => ({
              ph: phrase,
              path: `/search?query=${phrase.replace(/ /g, "+")}&i=${Catg}`,
            }))
        );
      } catch (error) {
        setTxt([
          {
            ph: Text,
            path: `/search?query=${Text.replace(/ /g, "+")}&i=${Catg}`,
          },
        ]);
      }
    };

    if (Text !== "" && Text.length > 0) {
      fetchData();
    } else if (Uid && Isclicked) {
      fetchData(Uid);
    } else {
      setTxt([]);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [Catg, Text, Uid, Isclicked]);

  return (
    <div className="se1">
      <Categories />
      <div>
        <input
          type="text"
          placeholder="Search"
          id="s1"
          value={Text}
          onChange={(e) => setText(e.target.value)}
          onClick={() => setIsclicked(!Isclicked)}
          onKeyDown={handleKeyPress}
        />
        <G.DropdownSearchMenu Txt={Txt} ref={dropdownRef} />
      </div>
      <Searchbutton
        ref={searchButtonRef}
        path={Text ? `/search?query=${Text.replace(/ /g, "+")}&i=${Catg}` : `/`}
        Text={Text}
      />
    </div>
  );
}

 

export function Product3() {
   // State to hold the fetched products
   const {Pl3, setPl3} = useContext(Bvalue);
   const [loading, setLoading] = useState(true);  // State to track loading status
   const [error, setError] = useState(null);       // State to track errors
 
   // useEffect to fetch data when the component mounts
   useEffect(() => {
     console.log('Fetching data...');
     axios.get(`${BASE_URL}/api/product`)
       .then(response => {
         console.log('Data fetched:', response.data);
         // Store the fetched data in the state
         setPl3(response.data);
         setLoading(false);  // Set loading to false when data is fetched
       })
       .catch(err => {
         console.error('Error fetching data:', err);
         setError(err);      // Store the error in state
         setLoading(false);  // Set loading to false even if there's an error
       });
   }, []);  // Empty array ensures this runs only once when the component mounts
 
   //if (loading) return <p>Loading...</p>;  // Display a loading message while data is being fetched
   //if (error) return <p>Error loading data: {error.message}</p>;  // Display error message if there's an error
 
   console.log('Items:', Pl3);
 
   return (
     <G.Product product={Pl3} />
   );
}

export function Recommendations() {
   // State to hold the fetched products
   const {Recommend} = useContext(Bvalue)
   return (
      <G.Product1 product={Recommend} />
   );
 }

 export function SendOtp({ setEmail, setIsOtpSent }) {
  const [email, setEmailState] = useState(''); // Local state for email input
  const [message, setMessage] = useState(''); // Local state for messages

  const handleEmailChange = (e) => {
    const value = e.target.value;
    setEmailState(value); // Update local state
    setEmail(value);      // Update parent state via prop
  };

  const handleSendOtp = async () => {
    try {
      const response = await axios.post(`${BASE_URL}/api/otp/send-otp`, { identifier: email });
      setMessage(response.data.message);
      setIsOtpSent(true); // Notify parent component that OTP was sent
    } catch (error) {
      if (error.response && error.response.data && error.response.data.message) {
        setMessage(error.response.data.message); // Display the error message from the backend
      } else {
        setMessage('An unexpected error occurred. Please try again.'); // Fallback error message
      }
    }
  };

  return (
    <div className="send-otp-container">
      <h2 className="send-otp-heading">Enter your email to receive OTP</h2>
      <input
        className="send-otp-input"
        type="email"
        placeholder="Enter your email"
        value={email}
        onChange={handleEmailChange} // Update the local and parent state
      />
      <button className="send-otp-button" onClick={handleSendOtp}>Send OTP</button>
      {message && <p className="send-otp-message">{message}</p>} {/* Display message if available */}
    </div>
  );
}

export function VerifyOtp({ email, onOtpVerified }) {
  const [otp, setOtp] = useState('');
  const [message, setMessage] = useState('');

  const handleOtpChange = (e) => {
      setOtp(e.target.value);
  };

  const handleVerifyOtp = async () => {
      try {
          const response = await axios.post(`${BASE_URL}/api/otp/verify-otp`, { identifier: email, otp });

          if (response.data.user) {
              setMessage('OTP verified successfully');
              console.log(response.data.user);
              onOtpVerified(response.data.user); // Pass user details to the parent component
          } else {
              setMessage('OTP verification failed');
          }
      } catch (error) {
        if (error.response && error.response.data && error.response.data.message) {
          setMessage(error.response.data.message); // Display the error message from the backend
        } else {
          setMessage('An unexpected error occurred. Please try again.'); // Fallback error message
        }
      }
  };

  return (
      <div className="verify-otp-container">
          <h2 className="verify-otp-heading">Enter the OTP sent to your email</h2>
          <input
              className="verify-otp-input"
              type="text"
              placeholder="Enter OTP"
              value={otp}
              onChange={handleOtpChange}
          />
          <button className="verify-otp-button" onClick={handleVerifyOtp}>Verify OTP</button>
          {message && <p className="verify-otp-message">{message}</p>}
      </div>
  );
}