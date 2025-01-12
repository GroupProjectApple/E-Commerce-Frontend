import React, { useState, useContext } from 'react';
import * as C from './Webpage Components'; // Import components dynamically
import { Bvalue } from './SignIn'; // Import context for state management
import './OTPpage.css'

const OtpPage = () => {
    const [email, setEmail] = useState('');
    const [isOtpSent, setIsOtpSent] = useState(false);

    const { setFlag, setUid, setUsername, setEmail: setContextEmail } = useContext(Bvalue);

    const handleOtpVerified = (userDetails) => {
        const { _id, username, email: verifiedEmail } = userDetails;

        // Update context and localStorage
        setFlag(true);
        setUid(_id);
        setUsername(username);
        setContextEmail(verifiedEmail);

        localStorage.setItem('isSignedIn', 'true');
        localStorage.setItem('uid', _id);
        localStorage.setItem('uname', username);
        localStorage.setItem('umail', verifiedEmail);

        alert('Logged in successfully!');
        window.location.href = '/'; // Navigate to homepage
    };

    return (
        <div className="otp-page-container">
            <div className="otp-page-section">
                <h1 className="otp-page-heading">OTP Authentication</h1>
                {!isOtpSent ? (
                    <C.SendOtp setEmail={setEmail} setIsOtpSent={setIsOtpSent} />
                ) : (
                    <C.VerifyOtp email={email} onOtpVerified={handleOtpVerified} />
                )}
            </div>
        </div>
    );
};

export default OtpPage;