import LocalMartIconBot from '../../assets/Website logos/LocalMartIconBot.png';
import InstagramIcon from '../../assets/Website logos/instagram.png';
import FacebookIcon from '../../assets/Website logos/facebook.jpg';
import TwitterIcon from '../../assets/Website logos/twitter logo.jpg';
import LinkedinIcon from '../../assets/Website logos/linkedin.png';
import { useNavigate } from 'react-router-dom';

const Footer = () => {
    const navigate = useNavigate();
  return (
    <footer className="bg-white mt-5 p-4 pt-8 pb-4 border-t border-gray-200">
            <div className="max-w-6xl mx-auto flex flex-wrap justify-between items-start gap-2 sm:gap-8">
              <div>
                <img src={LocalMartIconBot} alt="Local Mart Logo" className="h-9 cursor-pointer" 
                onClick={() => navigate("/homepage")} />
                <div className="text-gray-800 max-w-xs font-semibold mt-1 sm:mt-3">
                  We gather and verify service provider details across various categories & display them on our website
                </div>
                <div className="flex gap-6 mt-3 sm:mt-8">
                  <img src={InstagramIcon} onClick={() => window.open("https://www.instagram.com/localmart", "_blank")} alt="Instagram" className="cursor-pointer h-6" />
                  <img src={FacebookIcon} onClick={() => window.open("https://www.facebook.com/localmart", "_blank")} alt="Facebook" className="cursor-pointer h-6" />
                  <img src={TwitterIcon} onClick={() => window.open("https://www.twitter.com/localmart", "_blank")} alt="Twitter" className="cursor-pointer h-6" />
                  <img src={LinkedinIcon} onClick={() => window.open("https://www.linkedin.com/company/localmart", "_blank")} alt="LinkedIn" className="cursor-pointer h-6" />            </div>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Our Services</h4>
                <ul className="text-gray-900">
                  <li onClick={() => navigate("/business-2-business")} className="cursor-pointer mb-1 sm:mb-2">Business 2 Business</li>
                  <li onClick={() => navigate("/booking-services")} className="cursor-pointer mb-1 sm:mb-2">Booking Services</li>
                  <li onClick={() => navigate("/food-delivery")} className="cursor-pointer mb-1 sm:mb-2">Food Delivery</li>
                  <li onClick={() => navigate("/local-businesses")} className="cursor-pointer mb-1 sm:mb-2">Local Businesses</li>
                  <li onClick={() => navigate("/e-commerce")} className="cursor-pointer mb-1 sm:mb-2">E-Commerce</li>
                </ul>
              </div>
              <div>
                <ul className="text-gray-900"><br />
                  <li onClick={() => navigate("/advertise-here")} className="cursor-pointer mb-1 sm:mb-2">Advertise Here</li>
                  <li onClick={() => navigate("/buy-sell")} className="cursor-pointer mb-1 sm:mb-2">Buy & Sell</li>
                  <li onClick={() => navigate("/local-stores")} className="cursor-pointer mb-1 sm:mb-2">Local Stores</li>
                  <li onClick={() => navigate("/explore-brands")} className="cursor-pointer mb-1 sm:mb-2">Explore Brands</li>
                  <li onClick={() => navigate("/shopping")} className="cursor-pointer mb-1 sm:mb-2">Shopping</li>
                </ul>
              </div>
              <div>
                <ul className="text-gray-900"><br />
                  <li onClick={() => navigate("/privacy-policy")} className="cursor-pointer mb-1 sm:mb-2">Terms & Conditions</li>
                  <li onClick={() => navigate("/privacy-policy")} className="cursor-pointer mb-1 sm:mb-2">Privacy Policy</li>
                  <li onClick={() => navigate("/cancellation-policy")} className="cursor-pointer mb-1 sm:mb-2">Cancellation Policy</li>
                  <li onClick={() => navigate("/local-mart")} className="cursor-pointer mb-1 sm:mb-2">Local Mart</li>
                </ul>
              </div>
            </div>
          </footer>
  );
};

export default Footer;