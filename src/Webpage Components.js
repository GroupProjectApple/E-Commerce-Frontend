import * as G from "./Generic forms";
import "./Webpage Components.css";
import { useNavigate } from 'react-router-dom';
import React, { useContext, useState, useEffect, useRef } from 'react';
import axios from 'axios';
import ECart from "./Cart";
import { Bvalue } from './SignIn';

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

function Searchbutton(props){
   const navg= useNavigate();
   const {Uid} = useContext(Bvalue);
   const updatadata= async() =>{
      if(!props.Text || props.Text.length ===0){return;}
      try{
         const response=await axios.get("https://e-commerce-website-tioj.onrender.com/api/search_phrases",{
            params:{Uid:"-1", phrases:{"$regex":`^${props.Text}$`, "$options": "i"}}
         });
         console.log(response.data);
      }
      catch(error){
         try{
            await axios.put("https://e-commerce-website-tioj.onrender.com/api/update",{
               collectionName :"search_phrases", 
               searchFields: {Uid:"-1"},
               updatedValues:{$push:{phrases: {
                  $each: [props.Text],
                  $position:0,
                  $slice: 5000             
                }}}
            });
            //alert("Success");
         }
         catch(error){
            console.log(error);
         }
      }

   };
   const updateme= async() =>{
      if (!Uid || !props.Text || props.Text.length<=0){
         return;
      }
      try{
         const response=await axios.get("https://e-commerce-website-tioj.onrender.com/api/search_phrases",{
            params:{Uid: Uid, phrases:{"$regex":`^${props.Text}$`, "$options": "i"}}
         });
         console.log(response.data);
      }
      catch(error){
         try{
            await axios.put("https://e-commerce-website-tioj.onrender.com/api/update",{
               collectionName :"search_phrases", 
               searchFields: {Uid: Uid},
               updatedValues:{$push:{phrases: {
                  $each: [props.Text],
                  $position : 0,
                  $slice: 5           
                }}}
            });
            //alert("Success");
         }
         catch(error){
            try{
               await axios.post("https://e-commerce-website-tioj.onrender.com/api/search_phrases",{
                  Uid: Uid,
                  phrases:[props.Text]
               });
            }
            catch(error){
               console.log(error);
            }
         }
      }

   };
   return(<button type="button" id="sb1" onClick={(e) => {props.path!==`/`?navg(props.path):window.location.href = '/'; updatadata();updateme();}}></button>);
}

const ForwardedSearchbutton = React.forwardRef(Searchbutton);

export function Searchbar() {
  const [Text, setText] = useState("");
  const [Txt, setTxt] = useState([]);
  const contextValue = useContext(Bvalue);
  const { Catg, Uid } = contextValue;
  const [Isclicked, setIsclicked] = useState(false);
  const dropdownRef = useRef(null); // Ref to track the dropdown element
  const searchButtonRef = useRef(null); // Ref for the Searchbutton

  const handleClickOutside = (event) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setIsclicked(false); // Close the dropdown
    }
  };

  const handleKeyPress = (event) => {
    if (event.key === "Enter") {
      console.log("Enter key pressed!");
      searchButtonRef.current?.click(); // Trigger Searchbutton click
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
        const url = `https://e-commerce-website-tioj.onrender.com/api/search_phrases?aggregate=true&pipeline=${encodeURIComponent(
          pipeline
        )}`;
        const response = !UId
          ? await axios.get(url)
          : await axios.get(`https://e-commerce-website-tioj.onrender.com/api/search_phrases`, { params: { Uid: UId } });
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
          onKeyDown={handleKeyPress} // Trigger on Enter key press
        />
        <G.DropdownSearchMenu Txt={Txt} ref={dropdownRef} />
      </div>
      <ForwardedSearchbutton
        ref={searchButtonRef} // Attach ref to the Searchbutton
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
     axios.get('https://e-commerce-website-tioj.onrender.com/api/product')
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
