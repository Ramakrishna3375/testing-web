import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import loginImage from '../../assets/Website logos/loginImage.jpg';
import LocalMartIcon from '../../assets/Website logos/LocalMartIcon.png';
import Footer from "../Header&Footer/Footer";
import { BsMegaphoneFill } from "react-icons/bs"; // For Advertise
import { IoMdLogIn, IoIosArrowBack } from "react-icons/io"; // For Login and Back Arrow
import { RxHamburgerMenu } from "react-icons/rx"; // For Hamburger Menu
import { FaEnvelope, FaMobileAlt, FaLock, FaEye, FaEyeSlash } from "react-icons/fa"; // For input fields and password visibility
import { userLogin } from "../../Services/api";

const UserLogin = () => {
  const navigate = useNavigate();
  const [emailLogin, setEmailLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [recaptchaChecked, setRecaptchaChecked] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [triggerLogin, setTriggerLogin] = useState(false);

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
        return next <= -contentWidth ? next + contentWidth : next;
      });

      animationFrameId = requestAnimationFrame(step);
    };

    animationFrameId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  // Perform login via API when triggered by validated submit
  useEffect(() => {
    const attemptLogin = async () => {
      if (!triggerLogin) return;
      try {
        setIsLoading(true);
        const resp = await userLogin(email, password);
        const isSuccess = resp && resp.status >= 200 && resp.status < 300;
        if (isSuccess) {
          const data = resp?.data;
          const token = data?.data?.token || data?.token || data?.accessToken || data?.jwt;
          const userData = data?.data?.user || data?.user || { email };
          const userId = userData?.id || userData?._id;
          
          if (token) {
            // Store auth data in session storage
            sessionStorage.setItem('token', token);
            sessionStorage.setItem('user', JSON.stringify(userData));
            sessionStorage.setItem('isLoggedIn', 'true');
          }
          navigate('/homepage');
        } else {
          const errResp = resp?.response || null;
          const errStatus = errResp?.status ?? resp?.status;
          const errData = errResp?.data ?? resp?.data;
          let message = errData?.message || errData?.error || 'Login failed. Please try again.';
          if (errStatus === 422) {
            const passwordError = Array.isArray(errData?.errors?.password) ? errData.errors.password[0] : undefined;
            if (passwordError) {
              message = passwordError;
            }
          }
          if (errStatus === 400 || errStatus === 401) {
            message = 'Invalid email or password.';
          }
          setError(message);
          return;
        }
      } catch (err) {
        const status = err?.response?.status;
        const data = err?.response?.data;
        let apiMessage = data?.message || err?.message || 'Something went wrong while logging in.';
        if (status === 422) {
          const passwordError = Array.isArray(data?.errors?.password) ? data.errors.password[0] : undefined;
          if (passwordError) {
            apiMessage = passwordError;
          }
        }
        if (status === 400 || status === 401) {
          apiMessage = 'Invalid email or password.';
        }
        setError(apiMessage);
      } finally {
        setIsLoading(false);
        setTriggerLogin(false);
      }
    };

    attemptLogin();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [triggerLogin]);

  // If already logged in, prevent accessing login page (and back navigation to it)
  

  return (
    <>
    <div className="UserLogin min-h-screen bg-[#F7F7F7] pt-40 flex items-center">
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
            <span className="text-white text-sm mx-4">
              Development At INCROSYS IT SOLUTIONS PVT LTD • All In One Super Mobile App Launching Soon • Website and App Development fee 50% off • Exclusive Deals Every Day • Free Shipping on All Orders
            </span>
            <span className="text-white text-sm mx-4">
              Development At INCROSYS IT SOLUTIONS PVT LTD • All In One Super Mobile App Launching Soon • Website and App Development fee 50% off • Exclusive Deals Every Day • Free Shipping on All Orders
            </span>
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
            <div className="col-span-12 md:order-first md:col-span-6 left-login-page-image-section">
              <div className="h-full">
                <img
                  src={loginImage}
                  className="h-full w-full object-cover max-h-[500px] md:max-h-[764px] sm:max-h-[400px] rounded-l-[20px] md:rounded-l-[20px] md:rounded-tr-none rounded-t-[20px]"
                  alt=""
                />
              </div>
            </div>
            {/* Right Form Section */}
            <div className="col-span-12 md:col-span-6 right-login-page-form-changer">
              <div className="px-6 md:px-12 py-10 right-side-user-login-form-section max-w-md mx-auto md:max-w-none">
                <div className="mb-10">
                  <h2 className="text-2xl font-medium text-black">Log in to your account</h2>
                  <p className="text-black opacity-50 mt-1 leading-relaxed">
                    fill details and login to explore more on localmart
                  </p>
                </div>
                {/* Switchable Input Form */}
                <form className="w-full flex flex-col gap-6" onSubmit={async e => {
                  e.preventDefault();
                  setError(''); // Clear previous errors

                  if (emailLogin) {
                    // Email login validation
                    if (!email || !password) {
                      setError('Please enter both email and password.');
                      return;
                    }
                    // Add more complex email validation if needed
                    if (!/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email)) {
                      setError('Please enter a valid email address.');
                      return;
                    }
                  } else {
                    // Mobile login validation
                    if (!mobile || !password) {
                      setError('Please enter both mobile number and password.');
                      return;
                    }
                    // Basic mobile number validation (10 digits)
                    if (!/^\d{10}$/.test(mobile)) {
                      setError('Please enter a valid 10-digit mobile number.');
                      return;
                    }
                  }

                  // Check reCAPTCHA
                  if (!recaptchaChecked) {
                    setError('Please confirm you are not a robot.');
                    return;
                  }

                  // Trigger login via useEffect to perform API call
                  if (emailLogin) {
                    setTriggerLogin(true);
                  } else {
                    // For now, just navigate on successful mobile validation
                    sessionStorage.setItem('isLoggedIn', 'true');
                    navigate('/homepage', { replace: true });
                  }
                }}>
                  {/* Email or Mobile Field */}
                  <div className="flex items-center border border-gray-300 rounded-2xl px-5 py-4 bg-white text-black">
                    {emailLogin ? (
                      <>
                        <span className="mr-3 flex-shrink-0">
                          {/* Envelope Icon */}
                          <FaEnvelope className="text-gray-600" />
                        </span>
                        <input
                          type="email"
                          placeholder="Enter Email Address*"
                          className="flex-1 outline-none border-none bg-transparent text-lg font-medium placeholder:text-gray-400"
                          required
                          value={email}
                          onChange={e => setEmail(e.target.value)}
                        />
                      </>
                    ) : (
                      <>
                        <span className="font-semibold text-[22px] mr-3 flex-shrink-0">+91</span>
                        <input
                          type="tel"
                          placeholder="Enter Mobile Number*"
                          className="flex-1 outline-none border-none bg-transparent text-lg font-medium placeholder:text-gray-400"
                          required
                          pattern="[0-9]{10}"
                          title="Please enter a valid 10-digit mobile number"
                          value={mobile}
                          onChange={e => setMobile(e.target.value)}
                        />
                      </>
                    )}
                  </div>
                  {/* Password Field */}
                  <div className="flex items-center border border-gray-300 rounded-2xl px-5 py-4 bg-white text-black relative">
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
                      {/* Eye Icon */}
                      {showPassword ? <FaEye className="stroke-gray-500 md:w-6 md:h-6" /> : <FaEyeSlash className="stroke-gray-500 md:w-6 md:h-6" />}
                    </button>
                  </div>
                  {/* Forgot Password Link */}
                  <div className="w-full text-left">
                    <a href="#" className="text-blue-500 text-base font-normal hover:underline block">
                      Forgot Password?
                    </a>
                  </div>
                  {/* reCAPTCHA Placeholder */}
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
                  {/* Error Message */}
                  {error && <p className="text-red-500 text-center font-medium">{error}</p>}

                  {/* Login Button */}
                  <button
                    type="submit"
                    disabled={isLoading}
                    className={`w-full bg-orange-400 hover:bg-orange-500 rounded-xl text-white font-semibold text-[22px] py-3 mt-1 mb-1 transition-colors duration-200 ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                  >
                    {isLoading ? 'Logging in...' : 'Login'}
                  </button>
                </form>
                {/* OR Separator */}
                <div className="pt-6">
                  <div className="relative my-5">
                    <div className="bg-gray-300 w-full h-[1px]"></div>
                    <div className="absolute -top-[15px] left-1/2 -translate-x-1/2 px-3 bg-white text-black font-medium">
                      Or
                    </div>
                  </div>
                  {/* Login with Number/Email Switch */}
                  <div className="pt-3 login-withnumber-section">
                    {emailLogin ? (
                      <button
                        type="button"
                        className="flex items-center gap-3 w-full group hover:text-blue-500 transition-colors"
                        onClick={() => setEmailLogin(false)}
                        aria-label="Switch to mobile number login"
                      >
                        {/* Phone icon */}
                        <FaMobileAlt className="text-blue-600 text-xl group-hover:text-blue-400" />
                        <p className="text-blue-600 font-semibold text-xl duration-500 group-hover:text-blue-400">
                          Login With Mobile Number
                        </p>
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="flex items-center gap-3 w-full group hover:text-blue-500 transition-colors"
                        onClick={() => setEmailLogin(true)}
                        aria-label="Switch to email login"
                      >
                        {/* Envelope icon */}
                        <FaEnvelope className="text-blue-600 text-xl group-hover:text-blue-400" />
                        <p className="text-blue-600 font-semibold text-xl duration-500 group-hover:text-blue-400">
                          Login With Email Address
                        </p>
                      </button>
                    )}
                  </div>
                  {/* Registration Link */}
                  <div className="mt-6 text-center">
                    <button
                      type="button"
                      className="text-black"
                      onClick={() => navigate('/register')}
                    >
                      <p>
                        Don&apos;t Have an Account? Click here to{' '}
                        <span className="text-blue-500 font-medium hover:underline">Register</span>
                      </p>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <Footer />
    </>
  );
};

export default UserLogin;
