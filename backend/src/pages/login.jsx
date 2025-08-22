import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import "remixicon/fonts/remixicon.css";
import { rtdb } from "../firebase";
import { ref, get, child } from "firebase/database";
import toast, { Toaster } from "react-hot-toast";
import { AuthContext } from "../context/AuthContext"; // <-- import context

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext); // <-- get login function
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) return;
    if (!isValidEmail(email)) return toast.error("Invalid email format!");

    setLoading(true);

    try {
      const dbRef = ref(rtdb);
      const snapshot = await get(child(dbRef, "logins"));
      const data = snapshot.val();

      const users = data ? Object.values(data) : [];
      const user = users.find(
        (u) => u.email === email && u.password === password
      );

      if (user) {
        toast.success("Login successful!");

        // Use AuthContext login
        login(user, rememberMe); // <-- saves to context + storage

        setTimeout(() => navigate("/"), 500); // redirect to dashboard
      } else {
        toast.error("Invalid credentials!");
      }
    } catch (error) {
      toast.error("Login failed! Try again.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  return (
    <section className="min-h-screen flex items-center justify-center bg-emerald-50 px-4">
      <Toaster position="top-right" reverseOrder={false} />
      <div className="max-w-5xl mx-auto p-4 sm:p-8 bg-white rounded-3xl shadow-lg flex flex-col md:flex-row gap-8">
        {/* Illustration */}
        <div className="w-full md:w-1/2">
          <img
            src="https://readdy.ai/api/search-image?query=3D%20illustration%20of%20a%20young%20man%20sitting%20in%20a%20modern%20chair%20working%20on%20laptop%2C%20wearing%20brown%20sweater%20and%20black%20pants%2C%20white%20sneakers%2C%20thinking%20pose%2C%20minimal%20style%2C%20soft%20colors&width=600&height=600&seq=1&orientation=squarish"
            alt="Login illustration"
            className="w-full h-[300px] md:h-full object-cover rounded-2xl"
          />
        </div>

        {/* Form */}
        <div className="w-full md:w-1/2 flex flex-col justify-center">
          <div className="mb-8 text-center md:text-left">
            <h1 className="text-3xl md:text-4xl font-bold text-secondary mb-2">
              Sign In
            </h1>
            <p className="text-gray-500">Unlock your world.</p>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              {/* Email */}
              <div className="input-group">
                <label className="flex items-center gap-1 mb-2">
                  <span className="text-red-500">*</span>
                  <span className="text-gray-700">Email</span>
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                  placeholder="Enter your email"
                  required
                />
              </div>

              {/* Password */}
              <div className="input-group">
                <label className="flex items-center gap-1 mb-2">
                  <span className="text-red-500">*</span>
                  <span className="text-gray-700">Password</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all pr-10"
                    placeholder="Enter your password"
                    required
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    <i
                      className={
                        showPassword ? "ri-eye-off-line" : "ri-eye-line"
                      }
                    ></i>
                  </button>
                </div>
              </div>

              {/* Remember Me */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={() => setRememberMe(!rememberMe)}
                  className="custom-checkbox"
                />
                <label className="text-gray-700">Remember Me</label>
              </div>
            </div>

            {/* Sign In Button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full border border-gray-200 bg-white text-gray-700 py-3 rounded-xl font-medium transition-all !rounded-button whitespace-nowrap flex justify-center items-center gap-2 ${
                loading ? "cursor-not-allowed opacity-70" : "hover:bg-gray-50"
              }`}
            >
              {loading ? (
                <>
                  Authenticating
                  <span className="animate-pulse">...</span>
                </>
              ) : (
                "Sign In"
              )}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
};

export default LoginPage;
