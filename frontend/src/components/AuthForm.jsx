import React, { useState, useEffect } from 'react';
import styles from './AuthForm.module.css'; // Import your CSS file for styling
import { login } from '../utils/auth';
import { useNavigate } from 'react-router-dom';
import ForgotPassword from './ForgotPassword';
import Swal from 'sweetalert2'; // Import SweetAlert2

const AuthForm = () => {
  // State management for form inputs and UI
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [permissions, setPermissions] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [icons, setIcons] = useState([]);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [logo, setLogo] = useState('img/logo_light-removebg-preview.png');
  const navigate = useNavigate();

  // Detect and set initial theme (dark/light) based on system preference or localStorage
  useEffect(() => {
    const savedMode = localStorage.getItem('darkMode');
    const hours = new Date().getHours();
    const systemDarkMode = hours < 6 || hours >= 18;
    
    if (savedMode === null) {
      setIsDarkMode(systemDarkMode);
      localStorage.setItem('darkMode', systemDarkMode);
    } else {
      setIsDarkMode(savedMode === 'true');
      // Still update localStorage with current time for next visit
      localStorage.setItem('darkMode', systemDarkMode);
    }
  }, []);

  // Apply theme changes when dark mode state changes
  useEffect(() => {
    document.body.classList.toggle('dark-theme', isDarkMode);
    setLogo(isDarkMode ? 'img/logo_dark-removebg-preview.png' : 'img/logo_light-removebg-preview.png');
    localStorage.setItem('darkMode', isDarkMode);
    generateIcons();
  }, [isDarkMode]);

  // Toggle between dark and light theme
  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  // Generate floating social media icons with random positions and animations
  const generateIcons = () => {
    // Expand the form zone to give icons more space to float
    const formZone = { left: 25, right: 75, top: 15, bottom: 85 };
    
    // Create larger zones for floating
    const zones = [
      { left: [0, formZone.left], top: [0, formZone.top] },
      { left: [formZone.right, 100], top: [0, formZone.top] },
      { left: [0, formZone.left], top: [formZone.bottom, 100] },
      { left: [formZone.right, 100], top: [formZone.bottom, 100] },
      { left: [formZone.left, formZone.right], top: [0, formZone.top] },
      { left: [formZone.left, formZone.right], top: [formZone.bottom, 100] },
      { left: [0, formZone.left], top: [formZone.top, formZone.bottom] },
      { left: [formZone.right, 100], top: [formZone.top, formZone.bottom] },
    ];
  
    setIcons([
      { id: 1, name: 'facebook', color: '#1877F2' },
      { id: 2, name: 'instagram', color: '#E4405F' },
      { id: 3, name: 'twitter', color: '#1DA1F2' },
      { id: 4, name: 'linkedin', color: '#0A66C2' },
      { id: 5, name: 'youtube', color: '#FF0000' },
      { id: 6, name: 'tiktok', color: isDarkMode ? '#69C9D0' : '#000000' },
      { id: 7, name: 'whatsapp', color: '#25D366' },
      { id: 8, name: 'reddit', color: '#FF5700' },
      { id: 9, name: 'discord', color: '#5865F2' },
      { id: 10, name: 'pinterest', color: '#E60023' },
      { id: 11, name: 'snapchat', color: isDarkMode ? '#FFFC00' : '#000000' },
      { id: 12, name: 'telegram', color: '#0088CC' },
      { id: 13, name: 'spotify', color: '#1DB954' },
      { id: 14, name: 'twitch', color: '#9146FF' },
      { id: 15, name: 'vimeo', color: '#1AB7EA' },
      // New social media icons
      { id: 16, name: 'github', color: isDarkMode ? '#f0f6fc' : '#24292f' },
      { id: 17, name: 'slack', color: '#4A154B' },
      { id: 18, name: 'microsoft', color: '#00A1F1' },
      { id: 19, name: 'apple', color: isDarkMode ? '#A2AAAD' : '#000000' },
      { id: 20, name: 'amazon', color: '#FF9900' },
      { id: 21, name: 'behance', color: '#1769FF' },
      { id: 22, name: 'dribbble', color: '#EA4C89' },
      { id: 23, name: 'dropbox', color: '#0061FF' },
      { id: 24, name: 'flickr', color: '#FF0084' },
      { id: 25, name: 'medium', color: isDarkMode ? '#f5f5f5' : '#000000' },
      { id: 26, name: 'skype', color: '#00AFF0' },
      { id: 27, name: 'soundcloud', color: '#FF5500' },
      { id: 28, name: 'stackoverflow', color: '#F48024' },
      { id: 29, name: 'wordpress', color: '#21759B' },
      { id: 30, name: 'xing', color: '#006567' },
    ].map((icon, index) => {
      const zone = zones[index % zones.length];
      return {
        ...icon,
        top: zone.top[0] + Math.random() * (zone.top[1] - zone.top[0]),
        left: zone.left[0] + Math.random() * (zone.left[1] - zone.left[0]),
        animationDuration: `${8 + Math.random() * 7}s`,
        scale: 0.4 + Math.random() * 0.5, // Slightly smaller since we have more icons
        glow: isDarkMode ? `drop-shadow(0 0 8px ${icon.color})` : 'none',
        opacity: isDarkMode ? 0.18 : 0.12, // More transparent to avoid clutter
        hoverGlow: isDarkMode ? `drop-shadow(0 0 15px ${icon.color})` : `drop-shadow(0 0 5px ${icon.color})`,
        hoverOpacity: isDarkMode ? 0.4 : 0.2,
      };
    }));
  };

  // Handle form submission with SweetAlert notifications
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { permissions } = await login(email, password);
      setPermissions(permissions);
      
      // Show success notification with SweetAlert
      Swal.fire({
        title: 'Login Successful!',
        text: 'Redirecting to your dashboard...',
        icon: 'success',
        confirmButtonColor: '#3b82f6',
        timer: 2000,
        showConfirmButton: false,
        timerProgressBar: true,
        didOpen: () => {
          Swal.showLoading();
        }
      });
      window.location.href = "/dashboard?loggedIn=true";
    } catch (err) {
      // Show error notification with SweetAlert
      Swal.fire({
        title: 'Login Failed',
        text: err.message,
        icon: 'error',
        confirmButtonColor: '#d33'
      });
    }
  };
  
  // Navigate to dashboard after successful login (when permissions are set)
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (permissions && token) {
      // Optional: Add a small delay to let AuthContext or Navbar load
      const timer = setTimeout(() => {
        navigate("/dashboard");
      }, 100); 

      return () => clearTimeout(timer);
    }
  }, [permissions, navigate]);


  return (
    <div className={styles['authFormContainer', isDarkMode ? styles.dark : styles.light]}>  
      {/* Theme toggle button */}
      <button 
        className={styles['theme-toggle']}
        onClick={toggleTheme}
        aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
      >
      </button>

      {/* Floating social media icons background */}
      <div className={styles['floating-icons']}>
        {icons.map((icon) => (
          <div 
            key={icon.id} 
            className={styles['floating-icon']} 
            style={{
              color: icon.color,
              top: `${icon.top}%`,
              left: `${icon.left}%`,
              animationDuration: icon.animationDuration,
              transform: `scale(${icon.scale})`,
              filter: icon.glow,
              opacity: icon.opacity,
              '--hover-glow': icon.hoverGlow,
              '--hover-opacity': icon.hoverOpacity,
              '--hover-scale': icon.scale * 1.3,
            }}
          >
            {getIconSVG(icon.name)}
          </div>
        ))}
      </div>

      {/* Main auth form */}
      <div className={styles['auth-form']}>
        <div className= {styles['auth-header']}>
          <div className={styles['logo-container']}>
            <img src={logo} alt="Company Logo" />
          </div>
          <h1>Welcome Back</h1>
          <p>Please enter your details to login</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className={styles['form-fields']}>
            {/* Email input field */}
            <div className={styles['form-group']}>
              <label htmlFor="email">Email</label>
              <div className={styles['input-container']}>
                <div className={styles['input-icon']}>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                  </svg>
                </div>
                <div className={styles.inputField}>
                  <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  placeholder="your@email.com"
                  value={email}onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Password input field */}
            <div className={styles['form-group']}>
              <div className={styles['label-container']}>
                <label htmlFor="password">Password</label>
                <a href="/forgotpassword">Forgot password?</a>
              </div>
              <div className={styles['input-container']}>
                <div className={styles['input-icon']}>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path
                      fillRule="evenodd"
                      d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className={styles.inputField}>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    required
                    placeholder="your password"
                    className={styles["password-input"]}
                    value={password}onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                <button 
                  type="button" 
                  className={styles["password-toggle"]}
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                      <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd" />
                      <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Remember me checkbox */}
            <div className={styles["remember-me"]}>
              <input id="remember_me" name="remember_me" type="checkbox" />
              <label htmlFor="remember_me">Stay Signed In</label>
            </div>

            {/* Submit button */}
            <div className={styles["submit-button"]}>
              <button type="submit">Login</button>
            </div>
          </div>
        </form>

        {/* Divider for social login options */}
        <div className={styles["divider-container"]}>
          <div className={styles["divider-line"]}></div>
          <div className={styles["divider-text"]}>Or continue with</div>
          <div className={styles["divider-line"]}></div>
        </div>

        {/* Social login buttons */}
        <div className={styles['social-login-buttons']}>
          <button
            type="button"
            className={styles['google-btn']}
            onClick={() => window.open(`/client-login`, "_blank")}
          >
            Guest Login
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthForm;

// Helper function to get SVG icons for social media (should be defined or imported)
function getIconSVG(name) {
  // This should return the appropriate SVG for each social media icon
  // You'll need to implement this based on your icon library
  return <svg>{/* SVG path for the icon */}</svg>;
}