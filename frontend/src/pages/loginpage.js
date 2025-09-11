import React, { useState, useEffect } from "react";
import axios from "axios";
import image1 from "../assets/image1.png";
import image2 from "../assets/image2.png";
import image3 from "../assets/image3.png";
import logo from "../assets/orderbizlogo.png";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

export default function LoginPage() {
  const [currentImage, setCurrentImage] = useState(0);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetErrors, setResetErrors] = useState({}); // State for reset form errors
  const [resetEmailSent, setResetEmailSent] = useState(false);

  const navigate = useNavigate();
  const images = [image1, image2, image3];

  useEffect(() => {
    // Check if user credentials were saved in localStorage
    const rememberedEmail = localStorage.getItem("rememberedEmail");
    if (rememberedEmail) {
      setFormData((prev) => ({
        ...prev,
        email: rememberedEmail,
        rememberMe: true,
      }));
    }

    // Image slideshow interval
    const interval = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % images.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });

    // Clear validation error when user starts typing
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  const handleResetEmailChange = (e) => {
    setResetEmail(e.target.value);
    // Clear validation error for reset form when user starts typing
    if (resetErrors.email) {
      setResetErrors({ ...resetErrors, email: "" });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      // Added password length validation
      newErrors.password = "Password must be at least 6 characters";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateResetEmail = () => {
    const newResetErrors = {};
    if (!resetEmail) {
      newResetErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(resetEmail)) {
      newResetErrors.email = "Email is invalid";
    }
    setResetErrors(newResetErrors);
    return Object.keys(newResetErrors).length === 0;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const res = await axios.post("http://localhost:4000/api/users/login", {
        email: formData.email,
        password: formData.password,
      });

      toast.success(res.data.message || "Login successful!");
      const { token, user } = res.data;

      // Store token and user info in localStorage
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      // Handle "Remember Me" functionality
      if (formData.rememberMe) {
        localStorage.setItem("rememberedEmail", formData.email);
      } else {
        localStorage.removeItem("rememberedEmail");
      }

      if (user?.role === "admin") {
        navigate("/admindashboard");
      } else if (user?.role === "shop_owner") {
        navigate("/shopdashboard");
      } else {
        navigate("/user/dashboard");
      }
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Login failed. Please check your credentials."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    if (!validateResetEmail()) return;

    setIsSubmitting(true);
    try {
      await axios.post(
        "http://localhost:4000/api/otp/request-password-reset",
        { email: resetEmail }
      );
      toast.success("Password reset email sent. Please check your inbox.");
      setResetEmailSent(true);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to send reset email.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{
        background:
          "linear-gradient(139deg, rgba(255, 255, 255, 1) 8%, rgba(0, 103, 216, 1) 84%)",
      }}
    >
      <div className="bg-white rounded-3xl shadow-xl flex w-full max-w-6xl overflow-hidden h-[550px]">
        {/* Slideshow */}
        <div className="hidden md:flex relative overflow-hidden justify-center items-center bg-gradient-to-br from-blue-600 to-blue-800 w-1/2 p-6">
          {images.map((img, index) => {
            const isActive = index === currentImage;
            const isPrev =
              (currentImage === 0 && index === images.length - 1) ||
              index === currentImage - 1;
            return (
              <img
                key={index}
                src={img}
                alt={`Slide ${index}`}
                className={`absolute w-4/5 h-auto object-contain transition-all duration-700 ease-in-out ${
                  isActive ? "translate-x-0 opacity-100 z-20 scale-100" : ""
                } ${
                  isPrev ? "-translate-x-full opacity-0 z-10 scale-90" : ""
                } ${
                  !isActive && !isPrev
                    ? "translate-x-full opacity-0 z-0 scale-90"
                    : ""
                }`}
              />
            );
          })}
          <div className="absolute bottom-6 left-0 right-0 flex justify-center space-x-2">
            {images.map((_, index) => (
              <div
                key={index}
                className={`h-2 w-2 rounded-full transition-all duration-300 ${
                  index === currentImage ? "bg-white w-6" : "bg-blue-300"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Form */}
        <div className="w-full md:w-1/2 p-6 xl:px-10 md:px-10 overflow-y-auto flex flex-col justify-center">
          {!showForgotPassword ? (
            <>
              <div className="text-center mb-2">
                <img
                  src={logo}
                  alt="OrdeBiz Logo"
                  className="xl:w-[16rem] mx-auto w-[14rem] "
                />
                <p className="text-gray-600 font-bold ">
                  Sign in to your account
                </p>
              </div>
              <form className="space-y-5 mt-6" onSubmit={handleLogin}>
                <div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 text-gray-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"
                        />
                      </svg>
                    </div>
                    <input
                      type="email"
                      name="email"
                      required
                      placeholder="Email address"
                      value={formData.email}
                      onChange={handleChange}
                      className={`w-full pl-10 pr-4 py-3 border rounded-full focus:outline-none focus:ring-2 ${
                        errors.email
                          ? "border-red-500 focus:ring-red-300"
                          : "border-gray-300 focus:ring-blue-300"
                      }`}
                    />
                  </div>
                  {errors.email && (
                    <p className="text-red-500 text-sm mt-1 ml-4">
                      {errors.email}
                    </p>
                  )}
                </div>
                <div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 text-gray-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                        />
                      </svg>
                    </div>
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      required
                      placeholder="Password"
                      value={formData.password}
                      onChange={handleChange}
                      className={`w-full pl-10 pr-12 py-3 border rounded-full focus:outline-none focus:ring-2 ${
                        errors.password
                          ? "border-red-500 focus:ring-red-300"
                          : "border-gray-300 focus:ring-blue-300"
                      }`}
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-blue-600"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                          />
                        </svg>
                      ) : (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                          />
                        </svg>
                      )}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-red-500 text-sm mt-1 ml-4">
                      {errors.password}
                    </p>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <input
                      id="remember-me"
                      name="rememberMe"
                      type="checkbox"
                      checked={formData.rememberMe}
                      onChange={handleChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label
                      htmlFor="remember-me"
                      className="ml-2 block text-sm text-gray-700"
                    >
                      Remember me
                    </label>
                  </div>
                  <div className="text-sm">
                    <button
                      type="button"
                      onClick={() => setShowForgotPassword(true)}
                      className="font-medium text-blue-600 hover:text-blue-500"
                    >
                      Forgot your password?
                    </button>
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 px-4 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Signing in...
                    </>
                  ) : (
                    "Sign in"
                  )}
                </button>
              </form>
              <p className="text-sm text-center mt-6 text-gray-600">
                Don't have an account?{" "}
                <a
                  href="/register"
                  className="font-medium text-blue-600 hover:text-blue-500"
                >
                  Sign up
                </a>
              </p>
            </>
          ) : (
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-800">
                  {resetEmailSent ? "Check Your Email" : "Reset Your Password"}
                </h2>
                <p className="text-gray-600 mt-2">
                  {resetEmailSent
                    ? `We've sent a password reset link to ${resetEmail}`
                    : "Enter your email and we'll send you a reset link."}
                </p>
              </div>
              {!resetEmailSent ? (
                <form onSubmit={handlePasswordReset} className="space-y-4">
                  <div>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5 text-gray-400"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"
                          />
                        </svg>
                      </div>
                      <input
                        type="email"
                        placeholder="Email address"
                        value={resetEmail}
                        onChange={handleResetEmailChange}
                        className={`w-full pl-10 pr-4 py-3 border rounded-full focus:outline-none focus:ring-2 ${
                          resetErrors.email
                            ? "border-red-500 focus:ring-red-300"
                            : "border-gray-300 focus:ring-blue-300"
                        }`}
                      />
                    </div>
                    {/* Display inline error for reset form */}
                    {resetErrors.email && (
                      <p className="text-red-500 text-sm mt-1 ml-4">
                        {resetErrors.email}
                      </p>
                    )}
                  </div>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 px-4 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <>
                        <svg
                          className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Sending...
                      </>
                    ) : (
                      "Send Reset Link"
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowForgotPassword(false)}
                    className="w-full py-3 px-4 bg-gray-200 text-gray-800 rounded-full hover:bg-gray-300 transition"
                  >
                    Back to Login
                  </button>
                </form>
              ) : (
                <div className="text-center">
                  <button
                    onClick={() => {
                      setShowForgotPassword(false);
                      setResetEmailSent(false);
                    }}
                    className="w-full py-3 px-4 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition"
                  >
                    Return to Login
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
