import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axiosClient from "../../AxiosClient";
import "../../styles/UserLogin.css";

const UserLogin = ({ onLoginStatusChange }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { distance, activeTab, shiftingDate, fromAddress, toAddress, selectedCity } = location.state || {};

  const [mobileNumber, setMobileNumber] = useState("");
  const [loading, setLoading] = useState(false);

  const handleContinue = async () => {
    if (!/^\d{10}$/.test(mobileNumber)) {
      alert("Enter a valid 10-digit mobile number");
      return;
    }

    setLoading(true);
    try {
      // Step 1: Check if user exists
      const checkResponse = await axiosClient.get(`/User/CheckUser/${mobileNumber}`);
      let userData;

      if (checkResponse.status === 200) {
        userData = { userID: checkResponse.data.userID, name: mobileNumber };
      } else {
        // Step 2: Create new user
        const createResponse = await axiosClient.post("/User/CreateUser", {
          name: "User",
          phoneNumber: mobileNumber,
          email: "default@example.com",
          password: "defaultPassword",
          Address: { fromAddress, toAddress },
        });
        userData = { userID: createResponse.data.userID, name: mobileNumber };
      }

      // Store in localStorage
      localStorage.setItem("userID", userData.userID);
      localStorage.setItem("userName", userData.name);
      localStorage.setItem("loginType", "user");

      onLoginStatusChange?.(true);

      // Redirect to booking page
      navigate("/booking", { state: { distance, activeTab, shiftingDate, fromAddress, toAddress, selectedCity } });
    } catch (err) {
      console.error(err);
      alert("Error during login");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <h2>User Login</h2>
      <p>Enter your mobile number to continue</p>
      <input
        type="tel"
        placeholder="Enter Mobile Number"
        value={mobileNumber}
        onChange={(e) => /^\d{0,10}$/.test(e.target.value) && setMobileNumber(e.target.value)}
      />
      <button onClick={handleContinue} disabled={loading}>
        {loading ? "Processing..." : "Continue"}
      </button>
    </div>
  );
};

export default UserLogin;
