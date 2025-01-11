import React, {useContext, useEffect} from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import SignUp from "./SignUp";
import { BvalueProvider, SignIn, Bvalue } from "./SignIn"; 
import './App.css';
import Navbar from './Navbar';
import Body from './Body';
import Footer from './Footer';
import * as D from './Dynamicproduct';
import * as G from './Generic forms'
import ECart from './Cart';
import axios from 'axios';
import YourOrders from './YourOrders';
import Account from './Account';
import Map from './location';
import AboutUs from './AboutUs';
import {BASE_URL,MESSAGE_QUEUE_URL} from './config';

export function Mqueue(){
  const {Uid,Recommend, setRecommend, setLat, setLng} = useContext(Bvalue);
  useEffect(()=>{
    //alert("Sending event to queue...");
    const queue_=()=>{axios.post(`${MESSAGE_QUEUE_URL}/api/send-event`, {
      userId: Uid, // Replace with dynamic value if necessary
  })
  .then((response) => {
      console.log("Response from server:", response.data);
  })
  .catch((error) => {
      console.error("Error sending event to queue:", error);
  });};
  const getrec=async()=>{
    try {
      const response = await axios.get(`${BASE_URL}/api/users`, {
          params: { _id:Uid},
      });
      
      // Check if the response is valid
      if (response.data) {
        setRecommend(response.data[0].recommendation);
      }
      if(response.data[0].location){
        setLat(response.data[0].location.lat);
        setLng(response.data[0].location.lng);
      } 
  } catch (error) {
      alert("Wrong credentials");
      console.error("Error occurred:", error);
  }
  }
  if(Uid){
   queue_();
   setTimeout(()=>{getrec()},2000);
  }
  },[Uid])
}

function App() {
  return (
    <BvalueProvider>
      <Router>
        <RouteHandler />
      </Router>
    <Mqueue/>
    </BvalueProvider>
  );
}

function RouteHandler() {
  const location = useLocation();

  // Routes where Navbar and Footer should be hidden
  const hideNavbarRoutes = ['/SignIn', '/SignUp'];
  const hideFooterRoutes = ['/SignIn', '/SignUp', '/Cart','/Account','/YourOrders','/Location','/about'];

  const hideNavbar = hideNavbarRoutes.includes(location.pathname);
  const hideFooter = hideFooterRoutes.some((route) => location.pathname.startsWith(route));

  return (
    <div className="App">
      {!hideNavbar && <Navbar />}

      <Routes>
        <Route path="/" element={<Body />} />
        <Route path="/SignUp" element={<SignUp />} />
        <Route path="/SignIn" element={<SignIn />} />
        <Route path="/Cart" element={<ECart />} />
        <Route path="/subcategories/:categoryId" element={<D.SubCategory />} />
        <Route path="/products/:subcategoryId" element={<D.ProductLevel1 />} />
        <Route path="/product/:_id" element={<D.ProductLevel0 />} />
        <Route path="/search" element={<G.SearchResult/>} />
        <Route path="/YourOrders" element={<YourOrders/>} />
        <Route path="/Account" element={<Account/>} />
        <Route path="/Location" element={<Map/>} />
        <Route path="/About" element={<AboutUs/>} />
      </Routes>

      {!hideFooter && <Footer />}
    </div>
  );
}

export default App;
