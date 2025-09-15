import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import LocalMartIcon from '../../assets/Website logos/LocalMartIcon.png';
import RegisterImage from '../../assets/Website logos/RegisterImage.jpg';
import Footer from "../Header&Footer/Footer";
import { BsMegaphoneFill } from "react-icons/bs";
import { IoMdLogIn, IoIosArrowBack } from "react-icons/io";
import { RxHamburgerMenu } from "react-icons/rx";
import { FaEnvelope, FaMobileAlt, FaUser, FaCalendarAlt, FaLock, FaEye, FaEyeSlash } from "react-icons/fa"; // For input fields and new fields, and password visibility
import { registerOtpWithEmail } from "../../Services/api";
import { verifyOtpWithEmail } from "../../Services/api";
import { registerUserDetails } from "../../Services/api";
import { getCitiesByStateId } from "../../Services/api";
import { searchCitiesByName } from "../../Services/api";

const CompleteRegistration = () => {
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [emailLogin, setEmailLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [error, setError] = useState('');
  const [recaptchaChecked, setRecaptchaChecked] = useState(false);
  const [showOtpSection, setShowOtpSection] = useState(false); // New state to control OTP section visibility
  const [otp, setOtp] = useState(['', '', '', '', '', '']); // State for 6-digit OTP
  const [otpTimer, setOtpTimer] = useState(0); // Timer for OTP countdown (seconds)
  const [showResendOtp, setShowResendOtp] = useState(false); // State to show/hide resend OTP link
  const [showRegistrationFields, setShowRegistrationFields] = useState(false); // New state for additional fields
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [triggerVerifyOtp, setTriggerVerifyOtp] = useState(false);
  const [otpToVerify, setOtpToVerify] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [triggerRegister, setTriggerRegister] = useState(false);
  const [userDetailsPayload, setUserDetailsPayload] = useState(null);
  const [authToken, setAuthToken] = useState(null);

  // New state variables for additional registration fields
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [address, setAddress] = useState('');
  const [addressType, setAddressType] = useState('home');
  const [otherAddressType, setOtherAddressType] = useState('');
  const [countryOptions, setCountryOptions] = useState([
    { value: '678da88c9c4467c6aa4eeb86', label: 'India' }
  ]);
  const [selectedCountry, setSelectedCountry] = useState({ value: '678da88c9c4467c6aa4eeb86', label: 'India' });
  const [selectedState, setSelectedState] = useState(null);
  const [selectedCity, setSelectedCity] = useState(null);
  const [selectedPincode, setSelectedPincode] = useState('');
  const [newPassword, setNewPassword] = useState(''); // New state for password in registration options
  const [showNewPassword, setShowNewPassword] = useState(false); // New state for password visibility

  // Dummy data for dropdowns (replace with API calls later)
  const [stateOptions, setStateOptions] = useState([
    { value: '67ea880c34693d5cc5891593', label: 'Andhra Pradesh' },
    { value: 'Arunachal Pradesh', label: 'Arunachal Pradesh' },
    { value: '67ea880c34693d5cc58915aa', label: 'Telangana' },
    { value: 'Amaravathi', label: 'Amaravathi' }
  ]);
  const [cityOptions, setCityOptions] = useState([]);
  const [pincodeOptions, setPincodeOptions] = useState([
    { value: '533001', label: '533001' },
    { value: '533101', label: '533101' },
    { value: '530003', label: '530003' },
    { value: '520002', label: '520002' }
  ]);

  // Dummy functions for location data (replace with actual API calls)
  const getStates = () => {};
  const getCities = (stateId) => {};
  const getPincodes = (cityId) => {};

  // Populate cities when a state with a valid ID is selected
  useEffect(() => {
    const fetchCities = async () => {
      const stateId = selectedState?.value;
      // Expecting MongoDB-like ObjectId for state ids
      const isValidId = typeof stateId === 'string' && /^[0-9a-fA-F]{24}$/.test(stateId);
      if (!isValidId) {
        setCityOptions([]);
        return;
      }
      try {
        const resp = await getCitiesByStateId(stateId);
        const ok = resp && resp.status >= 200 && resp.status < 300;
        const cities = ok ? resp?.data?.data || [] : [];
        const options = cities.map(c => ({ value: c._id || c.id, label: c.name }));
        setCityOptions(options);
        // Reset selected city if it is not in the new list
        if (selectedCity && !options.some(o => o.value === selectedCity.value)) {
          setSelectedCity(null);
        }
      } catch (e) {
        setCityOptions([]);
      }
    };
    fetchCities();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedState?.value]);

  // Resolve city and state names from selected city id using API search
  useEffect(() => {
    const resolveCityAndState = async () => {
      try {
        if (!selectedCity || !selectedCity.value || !selectedCity.label) return;
        const resp = await searchCitiesByName(selectedCity.label);
        const ok = resp && resp.status >= 200 && resp.status < 300;
        const cities = ok ? resp?.data?.data?.cities || [] : [];
        const match = cities.find(c => c?.id === selectedCity.value);
        if (match && match.state) {
          // Auto-set state based on city selection
          setSelectedState({ value: match.state.id, label: match.state.name });
        }
      } catch (e) {
        // noop: keep current state selection if lookup fails
      }
    };
    resolveCityAndState();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCity?.value]);

  const handleAddressTypeChange = (type) => {
    setAddressType(type);
    setOtherAddressType(''); // Clear other address type if a predefined one is selected
  };

  const addressTypesArray = [
    { name: 'home' },
    { name: 'work' },
    { name: 'hostel' },
    { name: 'other' }
  ];

  const handleResendOtp = async () => {
    if (!email) {
      setError('Please enter email address to resend OTP.');
      return;
    }
    try {
      setIsSendingOtp(true);
      setError('');
      const resp = await registerOtpWithEmail(email);
      const ok = resp && resp.status >= 200 && resp.status < 300;
      if (ok) {
        setOtp(['', '', '', '', '', '']);
        setShowResendOtp(false);
        setOtpTimer(300); // 5 minutes
      } else {
        const errResp = resp?.response || null;
        const errData = errResp?.data ?? resp?.data;
        const message = errData?.message || errData?.error || 'Failed to resend OTP. Please try again.';
        setError(message);
      }
    } catch (e) {
      const message = e?.response?.data?.message || e?.message || 'Failed to resend OTP. Please try again.';
      setError(message);
    } finally {
      setIsSendingOtp(false);
    }
  };

  // OTP Timer useEffect
  useEffect(() => {
    let timer;
    if (showOtpSection && otpTimer > 0) {
      timer = setInterval(() => {
        setOtpTimer(prevTime => prevTime - 1);
      }, 1000);
    } else if (otpTimer === 0 && showOtpSection) {
      setShowResendOtp(true);
    }
    return () => clearInterval(timer);
  }, [otpTimer, showOtpSection]);

  // Verify OTP via API when triggered
  useEffect(() => {
    const doVerify = async () => {
      if (!triggerVerifyOtp) return;
      try {
        setIsVerifyingOtp(true);
        setError('');
        const resp = await verifyOtpWithEmail(email, otpToVerify);
        const ok = resp && resp.status >= 200 && resp.status < 300;
        if (ok) {
          const token = resp?.data?.data?.token || resp?.data?.token;
          if (token) setAuthToken(token);
          // Proceed to registration fields
          setShowRegistrationFields(true);
          setShowOtpSection(false);
          setOtp(['', '', '', '', '', '']);
          setOtpTimer(0);
        } else {
          const errResp = resp?.response || null;
          const status = errResp?.status ?? resp?.status;
          const data = errResp?.data ?? resp?.data;
          let message = data?.message || data?.error || 'OTP verification failed. Please try again.';
          if (status === 422) {
            const otpError = Array.isArray(data?.errors?.otp) ? data.errors.otp[0] : undefined;
            if (otpError) message = otpError;
          }
          setError(message);
        }
      } catch (e) {
        const status = e?.response?.status;
        const data = e?.response?.data;
        let message = data?.message || e?.message || 'OTP verification failed. Please try again.';
        if (status === 422) {
          const otpError = Array.isArray(data?.errors?.otp) ? data.errors.otp[0] : undefined;
          if (otpError) message = otpError;
        }
        setError(message);
      } finally {
        setIsVerifyingOtp(false);
        setTriggerVerifyOtp(false);
      }
    };
    doVerify();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [triggerVerifyOtp]);

  // Register user details via API when triggered
  useEffect(() => {
    const doRegister = async () => {
      if (!triggerRegister || !userDetailsPayload) return;
      try {
        setIsRegistering(true);
        setError('');
        const resp = await registerUserDetails(userDetailsPayload, authToken);
        const ok = resp && resp.status >= 200 && resp.status < 300;
        if (ok) {
          // Success: navigate to login
          navigate('/login');
        } else {
          const errResp = resp?.response || null;
          const status = errResp?.status ?? resp?.status;
          const data = errResp?.data ?? resp?.data;
          let message = data?.message || data?.error || 'Failed to submit details. Please try again.';
          if (status === 500 && typeof data?.error === 'string' && data.error.includes('duplicate key error') && data.error.includes('email')) {
            message = 'This email is already registered. Please log in or use a different email.';
          }
          if (status === 422 && data?.errors && typeof data.errors === 'object') {
            const firstKey = Object.keys(data.errors)[0];
            const firstMsg = Array.isArray(data.errors[firstKey]) ? data.errors[firstKey][0] : undefined;
            if (firstMsg) message = firstMsg;
          }
          try { console.error('completeUserProfile error (non-OK):', { status, data }); } catch (_) {}
          setError(message);
        }
      } catch (e) {
        const status = e?.response?.status;
        const data = e?.response?.data;
        let message = data?.message || e?.message || 'Failed to submit details. Please try again.';
        if (status === 500 && typeof data?.error === 'string' && data.error.includes('duplicate key error') && data.error.includes('email')) {
          message = 'This email is already registered. Please log in or use a different email.';
        }
        if (status === 422 && data?.errors && typeof data.errors === 'object') {
          const firstKey = Object.keys(data.errors)[0];
          const firstMsg = Array.isArray(data.errors[firstKey]) ? data.errors[firstKey][0] : undefined;
          if (firstMsg) message = firstMsg;
        }
        try { console.error('completeUserProfile error (caught):', { status, data }); } catch (_) {}
        setError(message);
      } finally {
        setIsRegistering(false);
        setTriggerRegister(false);
      }
    };
    doRegister();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [triggerRegister]);

  // Marquee: continuous scroll using requestAnimationFrame
  const marqueeContainerRef = useRef(null);
  const marqueeContentRef = useRef(null);
  const [marqueeOffsetX, setMarqueeOffsetX] = useState(0);

  useEffect(() => {
    let animationFrameId;
    let lastTimestamp = 0;
    const speedPxPerSec = 80; // adjust speed here

    const step = (timestamp) => {
      if (!lastTimestamp) lastTimestamp = timestamp;
      const deltaMs = timestamp - lastTimestamp;
      lastTimestamp = timestamp;

      const contentEl = marqueeContentRef.current;
      const containerEl = marqueeContainerRef.current;
      if (!contentEl || !containerEl) {
        animationFrameId = requestAnimationFrame(step);
        return;
      }

      const contentWidth = contentEl.scrollWidth / 2; // since content is duplicated
      const distance = (speedPxPerSec * deltaMs) / 1000;

      setMarqueeOffsetX(prev => {
        const next = prev - distance;
        // wrap when the first copy has fully left the view
        return next <= -contentWidth ? next + contentWidth : next;
      });

      animationFrameId = requestAnimationFrame(step);
    };

    animationFrameId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  return (
    <>
      <div className="complete-registration-main-section min-h-screen bg-[#F7F7F7] pt-40 flex items-center">
        {/* Header Section */}
        <header className="bg-white shadow-md w-full absolute top-0 left-0">
          <div className="container mx-auto px-4 py-3 flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center">
              <img src={LocalMartIcon} alt="Local Mart Logo" className="h-10 mr-2" />
            </div>

            {/* Navigation / Actions */}
            <nav className="hidden md:flex items-center space-x-6">
              <a href="#" className="text-gray-700 hover:text-gray-900 flex items-center">
                <BsMegaphoneFill className="mr-1 w-6 h-6" />
                Advertise
              </a>
              <button className="bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 px-4 rounded-full flex items-center">
                <IoMdLogIn className="mr-2 w-6 h-6" />
                Login | Signup
              </button>
            </nav>

            {/* Hamburger Menu Icon for Mobile */}
            <div className="md:hidden flex items-center">
              <button onClick={() => setIsMobileMenuOpen(true)} className="text-gray-700 focus:outline-none">
                <RxHamburgerMenu className="w-8 h-8" />
              </button>
            </div>
          </div>
          {/* Blue Marquee Section */}
          <div className="bg-blue-600 py-2 overflow-hidden" ref={marqueeContainerRef}>
            <div
              className="flex whitespace-nowrap"
              ref={marqueeContentRef}
              style={{ transform: `translateX(${marqueeOffsetX}px)` }}
            >
              {/* duplicate content for seamless loop */}
              <span className="text-white text-sm mx-4">
                Development At INCROSYS IT SOLUTIONS PVT LTD • All In One Super Mobile App Launching Soon • Website and App Development fee 50% off • Exclusive Deals Every Day • Free Shipping on All Orders
              </span>
              <span className="text-white text-sm mx-4">
                Development At INCROSYS IT SOLUTIONS PVT LTD • All In One Super Mobile App Launching Soon • Website and App Development fee 50% off • Exclusive Deals Every Day • Free Shipping on All Orders
              </span>
            </div>
          </div>
        </header>

        {/* Mobile Menu Sidebar */}
        <div
          className={`fixed inset-0 bg-white z-50 transform ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out md:hidden`}
        >
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <button onClick={() => setIsMobileMenuOpen(false)} className="text-gray-700 focus:outline-none">
              <IoIosArrowBack className="w-6 h-6" />
            </button>
            <span className="text-lg font-semibold">Menu</span>
          </div>
          <nav className="flex flex-col p-4 space-y-4">
            <a href="#" className="text-gray-700 hover:text-gray-900 text-lg flex items-center">
              Advertise
            </a>
            <a href="#" className="text-gray-700 hover:text-gray-900 text-lg flex items-center">
              Business
            </a>
            <button
              className="w-40 bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 px-4 rounded-full text-lg flex items-center justify-center"
              onClick={() => {
                navigate('/login');
                setIsMobileMenuOpen(false);
              }}
            >
              Login
            </button>
          </nav>
        </div>
        {/* Main Content Start */}
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-[20px] overflow-hidden shadow-lg max-w-6xl mx-auto w-full">
            <div className="grid grid-cols-12 gap-0 md:gap-6">
              {/* Left Image Section */}
              <div className="col-span-12 md:order-first md:col-span-5 left-register-page-image-section">
                <div className="h-full">
                  <img
                    src={RegisterImage}
                    className="h-full w-full object-cover max-h-[500px] md:max-h-[800px] sm:max-h-[400px] rounded-l-[20px] md:rounded-l-[20px] md:rounded-tr-none rounded-t-[20px]"
                    alt=""
                  />
                </div>
              </div>
              {/* Right Form Section */}
              <div className="col-span-12 md:col-span-7 right-register-page-form-changer">
                <div className="px-6 md:px-12 py-10 right-side-user-register-form-section max-w-md mx-auto md:max-w-none">
                  <div className="mb-10">
                    <h2 className="text-3xl md:text-[32px] font-semibold text-black">Register your account</h2>
                    <p className="text-gray-500 mt-1 leading-relaxed">
                      fill details and Register to explore more on localmart
                    </p>
                  </div>
                  {/* Registration Form */}
                  <form className="w-full flex flex-col gap-6" onSubmit={async e => {
                    e.preventDefault();
                    setError(''); // Clear previous errors

                    if (!showOtpSection && !showRegistrationFields) {
                      // Stage 1: Get OTP (Initial validation)
                      if (emailLogin) {
                        if (!email) {
                          setError('Please enter email address.');
                          return;
                        }
                        if (!/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email)) {
                          setError('Please enter a valid email address.');
                          return;
                        }
                      } else {
                        if (!mobile) {
                          setError('Please enter mobile number.');
                          return;
                        }
                        if (!/^\d{10}$/.test(mobile)) {
                          setError('Please enter a valid 10-digit mobile number.');
                          return;
                        }
                      }

                      if (!recaptchaChecked) {
                        setError('Please confirm you are not a robot.');
                        return;
                      }

                      // If initial validation passes
                      if (emailLogin) {
                        // Send OTP via API and show OTP section with 5 min validity
                        try {
                          setIsSendingOtp(true);
                          const resp = await registerOtpWithEmail(email);
                          const ok = resp && resp.status >= 200 && resp.status < 300;
                          if (ok) {
                            setShowOtpSection(true);
                            setOtpTimer(300); // 5 minutes
                            setShowResendOtp(false);
                          } else {
                            const errResp = resp?.response || null;
                            const errData = errResp?.data ?? resp?.data;
                            const message = errData?.message || errData?.error || 'Failed to send OTP. Please try again.';
                            setError(message);
                            return;
                          }
                        } catch (apiErr) {
                          const message = apiErr?.response?.data?.message || apiErr?.message || 'Failed to send OTP. Please try again.';
                          setError(message);
                          return;
                        } finally {
                          setIsSendingOtp(false);
                        }
                      } else {
                        // For mobile path, keep current flow (no email OTP API)
                        setShowOtpSection(true);
                        setOtpTimer(300);
                        setShowResendOtp(false);
                      }
                    } else if (showOtpSection && !showRegistrationFields) {
                      // Stage 2: Verify OTP
                      const enteredOtp = otp.join('');
                      if (enteredOtp.length !== 6) {
                        setError('Please enter the 6-digit OTP sent to your email.');
                        return;
                      }
                      if (otpTimer <= 0) {
                        setError('OTP expired. Please resend OTP and try again.');
                        return;
                      }
                      if (!emailLogin) {
                        // keep existing behavior for mobile path
                        setShowRegistrationFields(true);
                        setShowOtpSection(false);
                        setOtp(['', '', '', '', '', '']);
                        setOtpTimer(0);
                        return;
                      }
                      // Trigger API verification for email flow
                      setOtpToVerify(enteredOtp);
                      setTriggerVerifyOtp(true);
                    } else if (showRegistrationFields) {
                      // Stage 3: Submit & Register
                      // Perform validation for new registration fields
                      if (!firstName || !lastName || !newPassword || !birthDate || !address || !addressType || !selectedCountry || !selectedState || !selectedCity || !selectedPincode) {
                        setError('Please fill in all registration details, including your new password.');
                        return;
                      }
                      if (addressType === 'other' && !otherAddressType) {
                        setError('Please specify the other address type.');
                        return;
                      }
                      // Pincode: basic presence already checked; backend will validate format

                      // Build flat payload with exact field names expected by backend
                      const normalizedAddressType = addressType === 'other' ? 'Other' : addressType.charAt(0).toUpperCase() + addressType.slice(1);
                      // Build flat payload with exact field names expected by backend
                      const payload = {
                        email,
                        firstName,
                        lastName,
                        mobileNumber: mobile,
                        password: newPassword,
                        dateOfBirth: birthDate,
                        addressType: normalizedAddressType,
                        customAddressType: addressType === 'other' ? (otherAddressType || null) : null,
                        description: address,
                        // If your selects provide IDs, prefer .value; otherwise send label as fallback
                        countryId: selectedCountry?.value || selectedCountry?.label || '',
                        stateId: selectedState?.value || selectedState?.label || '',
                        cityId: selectedCity?.value || selectedCity?.label || '',
                        pincode: selectedPincode
                      };

                      // Debug: log payload before submit
                      try { console.log('completeUserProfile payload =>', payload); } catch (_) {}
                      setUserDetailsPayload(payload);
                      setTriggerRegister(true);
                    }
                  }}>
                    {/* Email or Mobile Field */}
                    {(!showRegistrationFields) && (
                    <div className="flex items-center border border-gray-300 rounded-2xl px-4 py-3 md:px-5 md:py-4 bg-white text-black">
                      {emailLogin ? (
                        <>
                          <span className="mr-3 flex-shrink-0">
                            <FaEnvelope className="text-gray-600" />
                          </span>
                          <input
                            type="email"
                            placeholder="Enter Email Address*"
                            className="flex-1 outline-none border-none bg-transparent text-sm sm:text-base md:text-lg font-medium placeholder:text-gray-400"
                            required
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                          />
                        </>
                      ) : (
                        <>
                          <span className="font-semibold text-base sm:text-lg md:text-[22px] mr-3 flex-shrink-0">+91</span>
                          <input
                            type="tel"
                            placeholder="Enter Mobile Number*"
                            className="flex-1 outline-none border-none bg-transparent text-sm sm:text-base md:text-lg font-medium placeholder:text-gray-400"
                            required
                            pattern="[0-9]{10}"
                            title="Please enter a valid 10-digit mobile number"
                            value={mobile}
                            onChange={e => setMobile(e.target.value)}
                          />
                        </>
                      )}
                    </div>
                    )}
                    {/* Password Field */}
                    {/* <div className="flex items-center border border-gray-300 rounded-2xl px-5 py-4 bg-white text-black relative">
                      <span className="mr-3 flex-shrink-0">
                        <FaLock className="text-gray-600" />
                      </span>
                      <input
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter Password*"
                        className="flex-1 outline-none border-none bg-transparent text-lg font-medium placeholder:text-gray-400 pr-10"
                        required
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                      />
                      <button
                        type="button"
                        className="absolute right-4 top-1/2 -translate-y-1/2 flex-shrink-0"
                        onClick={() => setShowPassword(!showPassword)}
                        tabIndex={-1}
                        aria-label={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? <FaEye className="stroke-gray-500 md:w-6 md:h-6" /> : <FaEyeSlash className="stroke-gray-500 md:w-6 md:h-6" />}
                      </button>
                    </div> */}

                    {showRegistrationFields && (
                      <div className="grid grid-cols-12 gap-4 w-full">
                        {/* First Name */}
                        <div className="col-span-12 md:col-span-6 flex items-center border border-gray-300 rounded-2xl px-3 py-2.5 sm:px-4 sm:py-3 md:px-5 md:py-4 min-h-[48px] md:min-h-[56px] bg-white text-black overflow-hidden">
                            <span className="mr-3 flex-shrink-0">
                              <FaUser className="text-gray-600" />
                            </span>
                            <input
                              type="text"
                              placeholder="Enter First Name*"
                              className="flex-1 outline-none border-none bg-transparent text-xs sm:text-sm md:text-base font-medium placeholder:text-gray-400 text-black leading-[1.2]"
                              required
                              value={firstName}
                              onChange={e => setFirstName(e.target.value)}
                            />
                          </div>
                        {/* Last Name */}
                        <div className="col-span-12 md:col-span-6 flex items-center border border-gray-300 rounded-2xl px-3 py-2.5 sm:px-4 sm:py-3 md:px-5 md:py-4 min-h-[48px] md:min-h-[56px] bg-white text-black overflow-hidden">
                            <span className="mr-3 flex-shrink-0">
                              <FaUser className="text-gray-600" />
                            </span>
                            <input
                              type="text"
                              placeholder="Enter Last Name*"
                              className="flex-1 outline-none border-none bg-transparent text-xs sm:text-sm md:text-base font-medium placeholder:text-gray-400 text-black leading-[1.2]"
                              required
                              value={lastName}
                              onChange={e => setLastName(e.target.value)}
                            />
                          </div>

                        {/* Email Address (required if OTP verified via mobile) */}
                        <div className="col-span-12 md:col-span-6 flex items-center border border-gray-300 rounded-2xl px-3 py-2.5 sm:px-4 sm:py-3 md:px-5 md:py-4 min-h-[48px] md:min-h-[56px] bg-white text-black focus-within:ring-2 focus-within:ring-blue-500/40 overflow-hidden">
                            <span className="mr-3 flex-shrink-0">
                              <FaEnvelope className="text-gray-600" />
                            </span>
                            <input
                              type="email"
                              placeholder="Enter Email Address*"
                              className="flex-1 outline-none border-none bg-transparent text-xs sm:text-sm md:text-base font-medium placeholder:text-gray-400 text-black leading-[1.2] truncate"
                              required={!emailLogin}
                              disabled={emailLogin}
                              value={email}
                              onChange={e => setEmail(e.target.value)}
                            />
                          </div>

                        {/* Mobile Number (required if OTP verified via email) */}
                        <div className="col-span-12 md:col-span-6 flex items-center border border-gray-300 rounded-2xl px-3 py-2.5 sm:px-4 sm:py-3 md:px-5 md:py-4 min-h-[48px] md:min-h-[56px] bg-white text-black focus-within:ring-2 focus-within:ring-blue-500/40 overflow-hidden">
                            <span className="font-semibold text-base sm:text-lg md:text-[22px] mr-3 flex-shrink-0">+91</span>
                            <input
                              type="tel"
                              placeholder="Enter Mobile Number*"
                              className="flex-1 outline-none border-none bg-transparent text-sm md:text-base font-medium placeholder:text-gray-400 text-black leading-[1.2]"
                              required={emailLogin}
                              disabled={!emailLogin}
                              pattern="[0-9]{10}"
                              title="Please enter a valid 10-digit mobile number"
                              value={mobile}
                              onChange={e => setMobile(e.target.value)}
                            />
                          </div>

                        {/* New Password Field */}
                        <div className="col-span-12 md:col-span-6 flex items-center border border-gray-300 rounded-2xl px-3 py-2.5 sm:px-4 sm:py-3 md:px-5 md:py-4 min-h-[48px] md:min-h-[56px] bg-white text-black relative focus-within:ring-2 focus-within:ring-blue-500/40 overflow-hidden">
                            <span className="mr-3 flex-shrink-0">
                              <FaLock className="text-gray-600" />
                            </span>
                            <input
                              type={showNewPassword ? "text" : "password"}
                              placeholder="Enter New Password*"
                              className="flex-1 outline-none border-none bg-transparent text-xs sm:text-sm md:text-base font-medium placeholder:text-gray-400 text-black pr-10 leading-[1.2] truncate"
                              required
                              value={newPassword}
                              onChange={e => setNewPassword(e.target.value)}
                            />
                            <button
                              type="button"
                              className="absolute right-4 top-1/2 -translate-y-1/2 flex-shrink-0"
                              onClick={() => setShowNewPassword(!showNewPassword)}
                              tabIndex={-1}
                              aria-label={showNewPassword ? "Hide password" : "Show password"}
                            >
                              {showNewPassword ? <FaEye className="stroke-gray-500 w-6 h-6" /> : <FaEyeSlash className="stroke-gray-500 w-6 h-6" />}
                            </button>
                          </div>

                        {/* Date of Birth */}
                        <div className="col-span-12 md:col-span-6 flex items-center border border-gray-300 rounded-2xl px-3 py-2.5 sm:px-4 sm:py-3 md:px-5 md:py-4 min-h-[48px] md:min-h-[56px] bg-white text-black">
                            <span className="mr-3 flex-shrink-0">
                              <FaCalendarAlt className="text-gray-600" />
                            </span>
                            <input
                              type="date"
                              placeholder="Select Birthdate*"
                              className="flex-1 outline-none border-none bg-transparent text-xs sm:text-sm md:text-base font-medium placeholder:text-gray-400 text-black leading-[1.2] truncate"
                              required
                              value={birthDate}
                              onChange={e => setBirthDate(e.target.value)}
                            />
                          </div>

                        {/* Complete Address */}
                        <div className="col-span-12 md:col-span-6 flex items-center border border-gray-300 rounded-2xl px-3 py-2.5 sm:px-4 sm:py-3 min-h-[90px] md:min-h-[110px] bg-white text-black focus-within:ring-2 focus-within:ring-blue-500/40">
                           <textarea
                             placeholder="Enter Complete Address*"
                             className="flex-1 outline-none border-none bg-transparent text-xs md:text-sm font-medium placeholder:text-gray-400 text-black resize-none leading-[1.6]"
                             rows="3"
                             required
                             value={address}
                             onChange={e => setAddress(e.target.value)}
                           ></textarea>
                         </div>

                        <div className="col-span-12 md:col-span-6 min-h-[52px]">
                          <p className='font-medium text-black mb-2'>Select Address type</p>
                          <div className="grid grid-cols-3 gap-2 sm:gap-3">
                            {addressTypesArray.filter(it => it.name !== 'other').map((item, index) => (
                              <button
                                type='button'
                                key={index}
                                className={`single-address-item relative w-full py-1.5 px-3 sm:py-2 sm:px-2 rounded text-xs sm:text-xs ${item.name === addressType ? 'bg-orange-400 text-white' : 'bg-gray-200 text-black'} duration-300 capitalize font-medium`}
                                onClick={() => handleAddressTypeChange(item.name)}
                              >
                                {item.name}
                              </button>
                            ))}
                          </div>
                          <div className="mt-4">
                            <input
                              type="text"
                              placeholder="others ? please enter"
                              className="outline-none border focus:border-blue-500 placeholder:text-gray-400 duration-300 py-2 px-3 sm:py-2.5 sm:px-4 rounded-xl bg-white w-full text-black text-xs md:text-sm"
                              value={otherAddressType}
                              onChange={e => { setOtherAddressType(e.target.value); if (e.target.value && addressType !== 'other') setAddressType('other'); }}
                            />
                          </div>
                        </div>

                        {/* State, City, Pincode */}
                        <div className="col-span-12 md:col-span-4 flex items-center bg-white text-black text-xs md:text-sm font-medium focus:outline-none">
                            <select
                              className="w-full border border-gray-300 rounded-2xl px-4 py-3 bg-white text-black text-xs md:text-sm font-medium focus:outline-none"
                              value={selectedCity?.value || ''}
                              onChange={e => setSelectedCity(cityOptions.find(option => option.value === e.target.value))}
                            >
                              <option value="" disabled>City</option>
                              {cityOptions.map(option => (
                                <option key={option.value} value={option.value}>{option.label}</option>
                              ))}
                            </select>
                          </div>
                        <div className="col-span-12 md:col-span-4 flex items-center bg-white text-black text-xs md:text-sm font-medium focus:outline-none">
                            <select
                              className="w-full border border-gray-300 rounded-2xl px-4 py-3 bg-white text-black text-xs md:text-sm font-medium focus:outline-none"
                              value={selectedState?.value || ''}
                              onChange={e => setSelectedState(stateOptions.find(option => option.value === e.target.value))}
                            >
                              <option value="" disabled>State</option>
                              {stateOptions.map(option => (
                                <option key={option.value} value={option.value}>{option.label}</option>
                              ))}
                            </select>
                          </div>
                          {/* Country */}
                        <div className="col-span-12 md:col-span-4 flex items-center bg-white text-black text-xs md:text-sm font-medium focus:outline-none">
                            <select
                              className="w-full border border-gray-300 rounded-2xl px-4 py-3 bg-white text-black text-xs md:text-sm font-medium focus:outline-none"
                              value={selectedCountry?.value || ''}
                              onChange={e => setSelectedCountry(countryOptions.find(option => option.value === e.target.value))}
                            >
                              <option value="" disabled>Country</option>
                              {countryOptions.map(option => (
                                <option key={option.value} value={option.value}>{option.label}</option>
                              ))}
                            </select>
                          </div>
                        <div className="col-span-12 md:col-span-4 flex items-center bg-white text-black text-xs md:text-sm font-medium focus:outline-none">
                            <input
                              type="text"
                              placeholder="Pincode*"
                              pattern="[0-9]{6}"
                              className="w-full border border-gray-300 rounded-2xl px-4 py-3 bg-white text-black text-xs md:text-sm font-medium focus:outline-none leading-[1.2]"
                              value={selectedPincode}
                              onChange={e => setSelectedPincode(e.target.value)}
                            />
                          </div>
                      </div>
                    )}

                    {showOtpSection && (
                      <div className="w-full flex flex-col gap-4 mt-4">
                        <p className="text-black text-lg font-medium">Enter OTP</p>
                        <div className="flex justify-between gap-2">
                          {otp.map((digit, index) => (
                            <input
                              key={index}
                              type="text"
                              maxLength="1"
                              value={digit}
                              onChange={e => {
                                const newOtp = [...otp];
                                newOtp[index] = e.target.value;
                                setOtp(newOtp);
                                // Move to next input if a digit is entered
                                if (e.target.value && index < 5) {
                                  document.getElementById(`otp-input-${index + 1}`).focus();
                                }
                              }}
                              onKeyDown={e => {
                                // Move to previous input on backspace if current is empty
                                if (e.key === 'Backspace' && !e.target.value && index > 0) {
                                  document.getElementById(`otp-input-${index - 1}`).focus();
                                }
                              }}
                              className="w-12 h-12 text-center text-xl font-semibold border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                              id={`otp-input-${index}`}
                            />
                          ))}
                        </div>
                        <div className="flex justify-between items-center mt-2">
                          <span className="text-gray-500">{otpTimer > 0 ? `${Math.floor(otpTimer/60)}:${String(otpTimer%60).padStart(2,'0')}` : ''}</span>
                          {showResendOtp && (
                            <button type="button" className={`text-blue-500 hover:underline ${isSendingOtp ? 'opacity-60 cursor-not-allowed' : ''}`} onClick={handleResendOtp} disabled={isSendingOtp}>
                              {isSendingOtp ? 'Sending…' : 'Resend OTP'}
                            </button>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Error Message */}
                    {error && <p className="text-red-500 text-center font-medium">{error}</p>}

                    {/* reCAPTCHA Placeholder */}
                    {(!showOtpSection && !showRegistrationFields) && (
                      <div className="w-full flex justify-center">
                        <div className="rounded-xl border border-gray-300 bg-white py-3 px-4 flex items-center min-h-[56px] w-full max-w-[380px]">
                          <input type="checkbox" className="w-5 h-5 accent-blue-600" id="recaptcha-checkbox"
                            checked={recaptchaChecked}
                            onChange={e => setRecaptchaChecked(e.target.checked)}
                          />
                          <label
                            htmlFor="recaptcha-checkbox"
                            className="text-black font-semibold ml-3 cursor-pointer select-none"
                          >
                            I'm not a robot
                          </label>
                          <span className="ml-auto flex flex-col items-center select-none">
                            <img
                              src="https://www.gstatic.com/recaptcha/api2/logo_48.png"
                              alt="reCAPTCHA"
                              className="h-6 mb-0.5"
                            />
                            <span className="text-[10px] text-gray-400 leading-none">
                              reCAPTCHA
                              <br />
                              Privacy - Terms
                            </span>
                          </span>
                        </div>
                      </div>
                    )}
                    {/* Register Button */}
                    <button
                      type="submit"
                      disabled={(!showOtpSection && !showRegistrationFields && (!recaptchaChecked || isSendingOtp)) || (showOtpSection && isVerifyingOtp) || (showRegistrationFields && isRegistering)}
                      className={`w-full bg-orange-500 hover:bg-orange-600 rounded-xl text-white font-semibold text-[22px] py-3 mt-1 mb-1 transition-colors duration-200 ${showRegistrationFields ? '' : ''} 
                      ${((!showOtpSection && !showRegistrationFields && (!recaptchaChecked || isSendingOtp)) || (showOtpSection && isVerifyingOtp) || (showRegistrationFields && isRegistering)) ? 'opacity-60 cursor-not-allowed' : ''}`}
                    >
                      {showOtpSection ? (isVerifyingOtp ? "Verifying…" : "Verify OTP") : (showRegistrationFields ? (isRegistering ? "Submitting…" : "Submit & Register") : (isSendingOtp ? "Sending OTP…" : "Get OTP"))}
                    </button>
                  </form>
                  {/* OR Separator */}
                  {!showRegistrationFields && (
                  <div className="pt-6">
                    <div className="relative my-5">
                      <div className="bg-gray-300 w-full h-[1px]"></div>
                      <div className="absolute -top-[15px] left-1/2 -translate-x-1/2 px-3 bg-white text-black font-medium">
                        Or
                      </div>
                    </div>
                    </div>
                    )}
                    {/* Register with Number/Email Switch */}
                    {(!showOtpSection && !showRegistrationFields) && (
                    <div className="pt-3 register-withnumber-section">
                      {emailLogin ? (
                        <button
                          type="button"
                          className="flex items-center gap-3 w-full group hover:text-blue-500 transition-colors"
                          onClick={() => setEmailLogin(false)}
                          aria-label="Switch to mobile number registration"
                        >
                          <FaMobileAlt className="text-blue-600 text-xl group-hover:text-blue-400" />
                          <p className="text-blue-600 font-semibold text-xl duration-500 group-hover:text-blue-400">
                            Register With Mobile Number
                          </p>
                        </button>
                      ) : (
                        <button
                          type="button"
                          className="flex items-center gap-3 w-full group hover:text-blue-500 transition-colors"
                          onClick={() => setEmailLogin(true)}
                          aria-label="Switch to email registration"
                        >
                          <FaEnvelope className="text-blue-600 text-xl group-hover:text-blue-400" />
                          <p className="text-blue-600 font-semibold text-xl duration-500 group-hover:text-blue-400">
                            Register With Email Address
                          </p>
                        </button>
                      )}
                    </div>
                    )}
                    {/* Login Link */}
                    <div className="mt-3">
                      <button
                        type="button"
                        className="text-black"
                        onClick={() => navigate('/login')}
                      >
                        <p>
                          Already Have an Account? Click here to{' '}
                          <span className="text-blue-500 font-medium hover:underline">Login</span>
                        </p>
                      </button>
                    </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Main Content End */}
      </div>
      {/*Footer Section */}
      <Footer />
    </>
  );
};

export default CompleteRegistration;
