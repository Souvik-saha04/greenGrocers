import './navbar.css'
import { Link, useNavigate } from 'react-router-dom'
import { CgProfile } from "react-icons/cg"
import { MdStorefront } from "react-icons/md"
import { useState, useEffect, useRef } from 'react'
import { CiSearch } from "react-icons/ci";
import { BsCart3 } from "react-icons/bs";
import { PiBuildingOfficeFill } from "react-icons/pi";
import { MdKeyboardArrowDown } from "react-icons/md";
import { MdFamilyRestroom } from "react-icons/md";
import { FaUserFriends } from "react-icons/fa";
import { FaHome } from "react-icons/fa";
import { SlLogout } from "react-icons/sl";
import { FaRegAddressBook } from "react-icons/fa6";
import { FaBoxOpen } from "react-icons/fa6";
import { RiCoupon2Line } from "react-icons/ri";



import axiosInstance from '../api/axiosInstance'

const SAVED_ADDRESSES = [
  { id: 1, label: "Home",    icon: <FaHome />, city: "Gurgaon",   pincode: "700124", full: "BG2, Pocket B, South City I, Sector 41, Gurgaon" },
  { id: 2, label: "Office",  icon: <PiBuildingOfficeFill />, city: "Gurugram",  pincode: "110001", full: "4th Floor, Tower B, Cyber Hub, DLF Phase 2, Gurugram" },
  { id: 3, label: "Parents", icon: <MdFamilyRestroom />, city: "Pune",     pincode: "400053", full: "12, Shivaji Nagar, Near MG Road, Pune" },
  { id: 4, label: "Friend",  icon: <FaUserFriends />, city: "Bengaluru", pincode: "560001", full: "No. 7, Brigade Road, Shivajinagar, Bengaluru" },
]

export default function Navbar({ auth, setauth }) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [showDropdown, setShowDropdown] = useState(false)
  const [searching, setSearching] = useState(false)

  // Address state
  const [selectedAddress, setSelectedAddress] = useState(SAVED_ADDRESSES[0])
  const [showAddrDropdown, setShowAddrDropdown] = useState(false)

  const searchRef = useRef(null)
  const addrRef = useRef(null)
  const navigate = useNavigate()

  useEffect(() => {
    const access = localStorage.getItem('access')
    if (!access) {
      setauth({ isLoggedIn: false, username: null })
      setLoading(false)
      return
    }

    axiosInstance.get('/api/profile/')
      .then((res) => {
        setData(res.data)
        localStorage.setItem("deliveryLocation", JSON.stringify({
          city: res.data.city,
          pincode: res.data.pincode,
          first_name: res.data.first_name
        }))
      })
      .catch(() => setauth({ isLoggedIn: false, username: null }))
      .finally(() => setLoading(false))
  }, [setauth])

  useEffect(() => {
    function handleClickOutside(event) {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowDropdown(false)
      }
      if (addrRef.current && !addrRef.current.contains(event.target)) {
        setShowAddrDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    if (searchQuery.trim().length > 0) {
      setSearching(true)
      const timer = setTimeout(() => {
        axiosInstance.get(`/products/?search=${searchQuery}`)
          .then((res) => { setSearchResults(res.data); setShowDropdown(true) })
          .catch(() => setSearchResults([]))
          .finally(() => setSearching(false))
      }, 300)
      return () => clearTimeout(timer)
    } else {
      setSearchResults([])
      setShowDropdown(false)
    }
  }, [searchQuery])

  const handleProductClick = (productId) => {
    setShowDropdown(false)
    setSearchQuery('')
    navigate(`/product/${productId}`)
  }

  const handleSelectAddress = (addr) => {
    setSelectedAddress(addr)
    setShowAddrDropdown(false)
  }


  const handleLogout = async () => {
    try {
      const refresh = localStorage.getItem("refresh")
      if (refresh) await axiosInstance.post('/api/logout/', { refresh })
    } catch (err) {
      console.error("Logout failed:", err.response?.data || err.message)
    } finally {
      localStorage.removeItem("access")
      localStorage.removeItem("refresh")
      setauth({ isLoggedIn: false, username: null })
      navigate('/login')
    }
  }

  return (
    <header className="header">
      <div style={{ display: "flex", alignItems: "center" }}>
        <div className="logo">
          <span className="logo-it">green</span>
          <span className="logo-blink">Grocers</span>
        </div>

        {/* ── DELIVERY / ADDRESS TRIGGER ── */}
        <div
          className={`delivery-info${showAddrDropdown ? ' delivery-info--open' : ''}`}
          ref={addrRef}
          onClick={() => setShowAddrDropdown(prev => !prev)}
        >
          <div className="delivery-time">
            Delivering to {selectedAddress.city}
            <MdKeyboardArrowDown
              className={`delivery-chevron${showAddrDropdown ? ' delivery-chevron--up' : ''}`}
            />
          </div>
          <div className="delivery-location">
            {selectedAddress.label} · {selectedAddress.pincode}
          </div>

          {/* ── ADDRESS DROPDOWN ── */}
          {showAddrDropdown && (
            <div className="nav-addr-dropdown" onClick={e => e.stopPropagation()}>
              <div className="nav-addr-dropdown-title">Choose delivery address</div>

              {SAVED_ADDRESSES.map(addr => (
                <div
                  key={addr.id}
                  className={`nav-addr-item${selectedAddress.id === addr.id ? ' nav-addr-item--active' : ''}`}
                  onClick={() => handleSelectAddress(addr)}
                >
                  <span className="nav-addr-icon">{addr.icon}</span>
                  <div className="nav-addr-body">
                    <div className="nav-addr-label">
                      {addr.label}
                      <span className="nav-addr-pin">&nbsp;·&nbsp;{addr.pincode}</span>
                    </div>
                    <div className="nav-addr-full">{addr.full}</div>
                  </div>
                  {selectedAddress.id === addr.id && (
                    <span className="nav-addr-check">✓</span>
                  )}
                </div>
              ))}

              <div className="nav-addr-add">
                + Add new address
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── SEARCH ── */}
      <div className="search-box" ref={searchRef}>
        <span className="search-icon"><CiSearch /></span>
        <input
          type="text"
          className="search-input"
          placeholder='Search what you like'
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
        />
        {showDropdown && (
          <div className="search-dropdown">
            {searching ? (
              <div className="search-loading">Searching...</div>
            ) : searchResults.length > 0 ? (
              searchResults.map((product) => (
                <div key={product.id} className="search-item" onClick={() => handleProductClick(product.id)}>
                  <img src={product.image} alt={product.name} className="search-item-image" />
                  <div className="search-item-details">
                    <div className="search-item-name">{product.name}</div>
                    <div className="search-item-category">{product.category}</div>
                    <div className="search-item-price">₹{product.price_per_unit}</div>
                  </div>
                </div>
              ))
            ) : (
              <div className="search-no-results">No products found</div>
            )}
          </div>
        )}
      </div>

      {/* ── ACTIONS ── */}
      <div className="header-actions">
        <Link to="/seller">
          <div className="seller-section">
            <MdStorefront className="seller-icon" />
            <span className="seller-text">Become a Seller</span>
          </div>
        </Link>

        {!auth.isLoggedIn ? (
          <>
            <Link to="/login"><button className="login-btn">Login</button></Link>
            <Link to="/register"><button className="register-btn">Register</button></Link>
            <Link to="/cart"><button className="cart-btn"><BsCart3 /> My Cart</button></Link>
          </>
        ) : (
          <>
            <Link to="/cart"><button className="cart-btn"><BsCart3 /> My Cart</button></Link>
            {/* Replace the existing profile Link + logout button with this */}
            <div className="profile-wrapper">
              <Link to="/profile">
                <div className="profile-section">
                  <CgProfile className="profile-icon" />
                  <span className="profile-name">{data.first_name}</span>
                  <MdKeyboardArrowDown className="delivery-chevron" />
                </div>
              </Link>

              <div className="profile-dropdown">
                <div className="profile-dropdown-header">
                  <span className="profile-dropdown-name">{data.first_name}</span>
                  <span className="profile-dropdown-sub">Welcome back!</span>
                </div>
                <Link to="/profile" className="profile-dropdown-item">
                  <CgProfile /> My Profile
                </Link>
                <Link to="/orders" className="profile-dropdown-item">
                  <FaBoxOpen/> My Orders
                </Link>
                <Link to="/wishlist" className="profile-dropdown-item">
                  <FaRegAddressBook/> Wishlist
                </Link>
                <Link to="/saved-addresses" className="profile-dropdown-item">
                  <FaRegAddressBook/> Saved Addresses
                </Link>
                <Link to="/coupons" className="profile-dropdown-item">
                  <RiCoupon2Line/> Coupons
                </Link>
                <div className="profile-dropdown-divider" />
                <button onClick={handleLogout} className="profile-dropdown-logout">
                  <SlLogout/> Logout
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </header>
  )
}