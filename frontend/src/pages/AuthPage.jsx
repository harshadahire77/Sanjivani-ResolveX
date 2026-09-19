import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import {
  BookOpen,
  Building2,
  CheckCircle2,
  Eye,
  EyeOff,
  GraduationCap,
  IdCard,
  Lock,
  Mail,
  Phone,
  User,
  Users,
} from "lucide-react";

import resolveXMark from "../assets/resolvex-mark.png";

import {
  loginUser,
  registerUser,
  saveCurrentUser,
} from "../services/api";

function AuthPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const isRegisterPage = location.pathname === "/register";

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  const [showLoginPassword, setShowLoginPassword] =
    useState(false);

  const [showRegisterPassword, setShowRegisterPassword] =
    useState(false);

  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [confirmed, setConfirmed] = useState(false);

  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  });

  const [registerData, setRegisterData] = useState({
    name: "",
    universityId: "",
    email: "",
    phone: "",
    role: "STUDENT",
    department: "",
    program: "",
    year: "",
    password: "",
    confirmPassword: "",
  });

  useEffect(() => {
    setMessage("");
    setMessageType("");
  }, [location.pathname]);

  const handleRegisterChange = (event) => {
    const { name, value } = event.target;

    setRegisterData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleLoginChange = (event) => {
    const { name, value } = event.target;

    setLoginData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const showError = (text) => {
    setMessage(text);
    setMessageType("error");
  };

  const handleRegister = async (event) => {
    event.preventDefault();

    setMessage("");
    setMessageType("");

    if (!registerData.name.trim()) {
      showError("Please enter your full name.");
      return;
    }

    if (!registerData.universityId.trim()) {
      showError("Please enter your PRN / University ID.");
      return;
    }

    if (!registerData.email.trim()) {
      showError("Please enter your email address.");
      return;
    }

    if (!registerData.phone.trim()) {
      showError("Please enter your mobile number.");
      return;
    }

    if (!registerData.department.trim()) {
      showError("Please enter your department / school.");
      return;
    }

    if (!registerData.program.trim()) {
      showError("Please enter your program / course.");
      return;
    }

    if (!registerData.year) {
      showError("Please select your academic year.");
      return;
    }

    if (registerData.password.length < 6) {
      showError(
        "Password must contain at least 6 characters."
      );
      return;
    }

    if (
      registerData.password !==
      registerData.confirmPassword
    ) {
      showError(
        "Password and Confirm Password do not match."
      );
      return;
    }

    if (!confirmed) {
      showError(
        "Please confirm that the entered details belong to your Sanjivani University account."
      );
      return;
    }

    try {
      setLoading(true);

      const response = await registerUser({
        name: registerData.name.trim(),
        universityId:
          registerData.universityId.trim(),
        email: registerData.email
          .trim()
          .toLowerCase(),
        phone: registerData.phone.trim(),
        role: registerData.role,
        department:
          registerData.department.trim(),
        program: registerData.program.trim(),
        year: registerData.year,
        password: registerData.password,
      });

      setMessage(
        response?.message ||
          "Account created successfully."
      );

      setMessageType("success");

      setRegisterData({
        name: "",
        universityId: "",
        email: "",
        phone: "",
        role: "STUDENT",
        department: "",
        program: "",
        year: "",
        password: "",
        confirmPassword: "",
      });

      setConfirmed(false);

      setTimeout(() => {
        navigate("/login");
      }, 1200);
    } catch (error) {
      showError(
        error.response?.data?.message ||
          "Unable to create account."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (event) => {
    event.preventDefault();

    setMessage("");
    setMessageType("");

    if (!loginData.email.trim()) {
      showError("Please enter your email address.");
      return;
    }

    if (!loginData.password) {
      showError("Please enter your password.");
      return;
    }

    try {
      setLoading(true);

      const response = await loginUser(
        loginData.email.trim().toLowerCase(),
        loginData.password
      );

      saveCurrentUser(response);

      setMessage(
        response?.message || "Login successful."
      );

      setMessageType("success");

      setTimeout(() => {
        navigate("/dashboard");
      }, 500);
    } catch (error) {
      showError(
        error.response?.data?.message ||
          "Invalid email or password."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        * {
          box-sizing: border-box;
        }

        .rx-auth-page {
          min-height: 100vh;
          width: 100%;
          padding: 34px 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          background:
            radial-gradient(
              circle at top left,
              rgba(15, 150, 105, 0.13),
              transparent 33%
            ),
            radial-gradient(
              circle at bottom right,
              rgba(15, 150, 105, 0.10),
              transparent 35%
            ),
            #f7faf8;
          font-family:
            Inter,
            system-ui,
            -apple-system,
            BlinkMacSystemFont,
            "Segoe UI",
            sans-serif;
        }

        .rx-auth-card {
          width: min(1160px, 100%);
          min-height: 710px;
          display: grid;
          grid-template-columns: 48% 52%;
          background: #ffffff;
          border: 1px solid #e4e9e6;
          border-radius: 28px;
          overflow: hidden;
          box-shadow:
            0 25px 70px
            rgba(15, 23, 42, 0.11);
        }

        .rx-auth-green {
          position: relative;
          display: flex;
          align-items: center;
          overflow: hidden;
          color: white;
          background:
            linear-gradient(
              145deg,
              #087b58,
              #0d9067 55%,
              #18a477
            );
        }

        .rx-auth-green::before {
          content: "";
          position: absolute;
          inset: 0;
          opacity: 0.45;
          background:
            linear-gradient(
              45deg,
              transparent 47%,
              rgba(255,255,255,.04) 48%,
              rgba(255,255,255,.04) 51%,
              transparent 52%
            );
          background-size: 48px 48px;
        }

        .rx-auth-green-inner {
          position: relative;
          z-index: 2;
          width: 100%;
          padding: 62px 56px;
        }

        .rx-auth-logo-box {
          width: 70px;
          height: 70px;
          margin-bottom: 34px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 19px;
          border: 1px solid
            rgba(255,255,255,.28);
          background:
            rgba(255,255,255,.12);
        }

        .rx-auth-logo-box img {
          width: 48px !important;
          height: 48px !important;
          max-width: 48px !important;
          max-height: 48px !important;
          display: block !important;
          object-fit: contain !important;
          margin: 0 !important;
          padding: 0 !important;
          background: transparent !important;
        }

        .rx-auth-mini-title {
          margin: 0 0 12px;
          font-size: 13px;
          font-weight: 800;
          letter-spacing: 2px;
          color:
            rgba(255,255,255,.82);
        }

        .rx-auth-green h1 {
          margin: 0;
          max-width: 450px;
          font-size: 50px;
          line-height: 1.02;
          letter-spacing: -2px;
          color: #ffffff;
        }

        .rx-auth-green-description {
          max-width: 410px;
          margin: 23px 0 30px;
          font-size: 15px;
          line-height: 1.7;
          color:
            rgba(255,255,255,.88);
        }

        .rx-auth-feature-list {
          display: flex;
          flex-direction: column;
          gap: 14px;
          margin-bottom: 36px;
        }

        .rx-auth-feature {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 14px;
          font-weight: 600;
        }

        .rx-auth-switch-btn {
          min-width: 112px;
          height: 48px;
          padding: 0 22px;
          border-radius: 11px;
          border: 1px solid
            rgba(255,255,255,.6);
          background:
            rgba(255,255,255,.06);
          color: white;
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
          transition: .2s ease;
        }

        .rx-auth-switch-btn:hover {
          background: white;
          color: #087b58;
          transform: translateY(-2px);
        }

        .rx-auth-form-side {
          display: flex;
          align-items: center;
          justify-content: center;
          background: #ffffff;
        }

        .rx-auth-form-inner {
          width: 100%;
          max-width: 590px;
          padding: 38px 40px;
        }

        .rx-auth-form-brand {
          margin: 0 0 15px;
          font-size: 12px;
          font-weight: 800;
          letter-spacing: 2px;
          color: #087e5b;
        }

        .rx-auth-form-inner h2 {
          margin: 0;
          font-size: 34px;
          line-height: 1.15;
          letter-spacing: -1px;
          color: #121816;
        }

        .rx-auth-subtitle {
          margin: 13px 0 26px;
          font-size: 15px;
          line-height: 1.6;
          color: #707873;
        }

        .rx-register-grid {
          display: grid;
          grid-template-columns:
            repeat(2, minmax(0, 1fr));
          gap: 15px 14px;
        }

        .rx-field {
          min-width: 0;
        }

        .rx-field label {
          display: block;
          margin-bottom: 7px;
          font-size: 13px;
          font-weight: 700;
          color: #252c29;
        }

        .rx-input {
          position: relative;
          width: 100%;
          height: 50px;
          display: flex;
          align-items: center;
          border: 1px solid #dde4e0;
          border-radius: 11px;
          background: #ffffff;
          transition: .2s ease;
        }

        .rx-input:focus-within {
          border-color: #0c9468;
          box-shadow:
            0 0 0 3px
            rgba(12,148,104,.10);
        }

        .rx-input > svg:first-child {
          position: absolute;
          left: 14px;
          color: #8b9891;
          pointer-events: none;
        }

        .rx-input input,
        .rx-input select {
          width: 100%;
          height: 100%;
          margin: 0 !important;
          padding:
            0 42px 0 43px !important;
          border: none !important;
          outline: none !important;
          box-shadow: none !important;
          border-radius: 11px;
          background: transparent !important;
          font-family: inherit;
          font-size: 14px;
          color: #202824;
        }

        .rx-input input::placeholder {
          color: #9da7a2;
        }

        .rx-eye {
          position: absolute;
          right: 8px;
          top: 50%;
          transform:
            translateY(-50%);
          width: 35px;
          height: 35px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: none;
          padding: 0;
          margin: 0;
          background: transparent;
          color: #87928c;
          cursor: pointer;
        }

        .rx-confirm {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          margin: 16px 4px 13px;
          font-size: 12px;
          line-height: 1.5;
          color: #69736e;
        }

        .rx-confirm input {
          width: 16px !important;
          height: 16px !important;
          min-width: 16px;
          margin: 1px 0 0 !important;
          accent-color: #0c8b63;
        }

        .rx-message {
          width: 100%;
          margin: 10px 0;
          padding: 10px 13px;
          border-radius: 9px;
          font-size: 13px;
          font-weight: 600;
        }

        .rx-message.error {
          color: #b42318;
          background: #fef3f2;
          border: 1px solid #fecaca;
        }

        .rx-message.success {
          color: #067647;
          background: #ecfdf3;
          border: 1px solid #bbf7d0;
        }

        .rx-submit {
          width: 100%;
          height: 52px;
          margin-top: 4px;
          border: none;
          border-radius: 11px;
          background:
            linear-gradient(
              135deg,
              #087e5a,
              #15996e
            );
          color: white;
          font-family: inherit;
          font-size: 14px;
          font-weight: 800;
          cursor: pointer;
          box-shadow:
            0 9px 24px
            rgba(9,138,97,.18);
          transition: .2s ease;
        }

        .rx-submit:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow:
            0 13px 30px
            rgba(9,138,97,.24);
        }

        .rx-submit:disabled {
          opacity: .65;
          cursor: not-allowed;
        }

        .rx-login-form {
          display: flex;
          flex-direction: column;
          gap: 18px;
        }

        .rx-login-card {
          min-height: 650px;
        }

        .rx-login-card
        .rx-auth-form-inner {
          max-width: 470px;
        }

        @media (max-width: 900px) {
          .rx-auth-page {
            align-items: flex-start;
            padding: 20px 14px;
          }

          .rx-auth-card {
            grid-template-columns: 1fr;
          }

          .rx-auth-green-inner {
            padding: 42px 34px;
          }

          .rx-auth-form-inner {
            padding: 38px 28px;
          }

          .rx-auth-green h1 {
            font-size: 42px;
          }
        }

        @media (max-width: 620px) {
          .rx-auth-page {
            padding: 0;
          }

          .rx-auth-card {
            border: none;
            border-radius: 0;
            box-shadow: none;
          }

          .rx-register-grid {
            grid-template-columns: 1fr;
          }

          .rx-auth-green-inner,
          .rx-auth-form-inner {
            padding: 30px 22px;
          }

          .rx-auth-form-inner h2 {
            font-size: 28px;
          }
        }
      `}</style>

      {isRegisterPage ? (
        <main className="rx-auth-page">
          <div className="rx-auth-card">

            <section className="rx-auth-green">
              <div className="rx-auth-green-inner">

                <div className="rx-auth-logo-box">
                  <img
                    src={resolveXMark}
                    alt="ResolveX"
                  />
                </div>

                <p className="rx-auth-mini-title">
                  SANJIVANI RESOLVEX
                </p>

                <h1>
                  Welcome
                  <br />
                  back.
                </h1>

                <p className="rx-auth-green-description">
                  Continue tracking your campus
                  complaints and service requests
                  from one simple dashboard.
                </p>

                <div className="rx-auth-feature-list">
                  <div className="rx-auth-feature">
                    <CheckCircle2 size={18} />
                    Track campus complaints
                  </div>

                  <div className="rx-auth-feature">
                    <CheckCircle2 size={18} />
                    View service progress
                  </div>

                  <div className="rx-auth-feature">
                    <CheckCircle2 size={18} />
                    Receive status updates
                  </div>
                </div>

                <button
                  type="button"
                  className="rx-auth-switch-btn"
                  onClick={() =>
                    navigate("/login")
                  }
                >
                  Sign In
                </button>

              </div>
            </section>

            <section className="rx-auth-form-side">
              <div className="rx-auth-form-inner">

                <p className="rx-auth-form-brand">
                  SANJIVANI RESOLVEX
                </p>

                <h2>Create your account</h2>

                <p className="rx-auth-subtitle">
                  Join Sanjivani ResolveX to
                  report, track and resolve campus
                  service requests.
                </p>

                <form onSubmit={handleRegister}>

                  <div className="rx-register-grid">

                    <AuthInput
                      label="Full Name"
                      icon={<User size={19} />}
                    >
                      <input
                        type="text"
                        name="name"
                        placeholder="Enter full name"
                        value={registerData.name}
                        onChange={
                          handleRegisterChange
                        }
                      />
                    </AuthInput>

                    <AuthInput
                      label="PRN / University ID"
                      icon={<IdCard size={19} />}
                    >
                      <input
                        type="text"
                        name="universityId"
                        placeholder="Enter PRN / ID"
                        value={
                          registerData.universityId
                        }
                        onChange={
                          handleRegisterChange
                        }
                      />
                    </AuthInput>

                    <AuthInput
                      label="Email Address"
                      icon={<Mail size={19} />}
                    >
                      <input
                        type="email"
                        name="email"
                        placeholder="University email"
                        value={registerData.email}
                        onChange={
                          handleRegisterChange
                        }
                      />
                    </AuthInput>

                    <AuthInput
                      label="Mobile Number"
                      icon={<Phone size={19} />}
                    >
                      <input
                        type="tel"
                        name="phone"
                        placeholder="Mobile number"
                        value={registerData.phone}
                        onChange={
                          handleRegisterChange
                        }
                      />
                    </AuthInput>

                    <AuthInput
                      label="Role"
                      icon={<Users size={19} />}
                    >
                      <select
                        name="role"
                        value={registerData.role}
                        onChange={
                          handleRegisterChange
                        }
                      >
                        <option value="STUDENT">
                          Student
                        </option>
                        <option value="FACULTY">
                          Faculty
                        </option>
                        <option value="STAFF">
                          Staff
                        </option>
                      </select>
                    </AuthInput>

                    <AuthInput
                      label="Department / School"
                      icon={
                        <Building2 size={19} />
                      }
                    >
                      <input
                        type="text"
                        name="department"
                        placeholder="e.g. AI & DS"
                        value={
                          registerData.department
                        }
                        onChange={
                          handleRegisterChange
                        }
                      />
                    </AuthInput>

                    <AuthInput
                      label="Program / Course"
                      icon={
                        <BookOpen size={19} />
                      }
                    >
                      <input
                        type="text"
                        name="program"
                        placeholder="e.g. B.Tech AI & DS"
                        value={
                          registerData.program
                        }
                        onChange={
                          handleRegisterChange
                        }
                      />
                    </AuthInput>

                    <AuthInput
                      label="Academic Year"
                      icon={
                        <GraduationCap size={19} />
                      }
                    >
                      <select
                        name="year"
                        value={registerData.year}
                        onChange={
                          handleRegisterChange
                        }
                      >
                        <option value="">
                          Select Year
                        </option>
                        <option value="First Year">
                          First Year
                        </option>
                        <option value="Second Year">
                          Second Year
                        </option>
                        <option value="Third Year">
                          Third Year
                        </option>
                        <option value="Fourth Year">
                          Fourth Year
                        </option>
                      </select>
                    </AuthInput>

                    <AuthInput
                      label="Password"
                      icon={<Lock size={19} />}
                    >
                      <input
                        type={
                          showRegisterPassword
                            ? "text"
                            : "password"
                        }
                        name="password"
                        placeholder="Create password"
                        value={
                          registerData.password
                        }
                        onChange={
                          handleRegisterChange
                        }
                      />

                      <button
                        type="button"
                        className="rx-eye"
                        onClick={() =>
                          setShowRegisterPassword(
                            !showRegisterPassword
                          )
                        }
                      >
                        {showRegisterPassword ? (
                          <EyeOff size={18} />
                        ) : (
                          <Eye size={18} />
                        )}
                      </button>
                    </AuthInput>

                    <AuthInput
                      label="Confirm Password"
                      icon={<Lock size={19} />}
                    >
                      <input
                        type={
                          showConfirmPassword
                            ? "text"
                            : "password"
                        }
                        name="confirmPassword"
                        placeholder="Confirm password"
                        value={
                          registerData.confirmPassword
                        }
                        onChange={
                          handleRegisterChange
                        }
                      />

                      <button
                        type="button"
                        className="rx-eye"
                        onClick={() =>
                          setShowConfirmPassword(
                            !showConfirmPassword
                          )
                        }
                      >
                        {showConfirmPassword ? (
                          <EyeOff size={18} />
                        ) : (
                          <Eye size={18} />
                        )}
                      </button>
                    </AuthInput>

                  </div>

                  <label className="rx-confirm">
                    <input
                      type="checkbox"
                      checked={confirmed}
                      onChange={(event) =>
                        setConfirmed(
                          event.target.checked
                        )
                      }
                    />

                    <span>
                      I confirm that the
                      information entered belongs
                      to my Sanjivani University
                      account.
                    </span>
                  </label>

                  {message && (
                    <div
                      className={`rx-message ${messageType}`}
                    >
                      {message}
                    </div>
                  )}

                  <button
                    type="submit"
                    className="rx-submit"
                    disabled={loading}
                  >
                    {loading
                      ? "Creating Account..."
                      : "Create Account"}
                  </button>

                </form>

              </div>
            </section>

          </div>
        </main>
      ) : (
        <main className="rx-auth-page">
          <div className="rx-auth-card rx-login-card">

            <section className="rx-auth-form-side">
              <div className="rx-auth-form-inner">

                <p className="rx-auth-form-brand">
                  SANJIVANI RESOLVEX
                </p>

                <h2>Welcome back</h2>

                <p className="rx-auth-subtitle">
                  Sign in to access your ResolveX
                  dashboard.
                </p>

                <form
                  className="rx-login-form"
                  onSubmit={handleLogin}
                >

                  <AuthInput
                    label="Email Address"
                    icon={<Mail size={19} />}
                  >
                    <input
                      type="email"
                      name="email"
                      placeholder="Enter email"
                      value={loginData.email}
                      onChange={handleLoginChange}
                    />
                  </AuthInput>

                  <AuthInput
                    label="Password"
                    icon={<Lock size={19} />}
                  >
                    <input
                      type={
                        showLoginPassword
                          ? "text"
                          : "password"
                      }
                      name="password"
                      placeholder="Enter password"
                      value={loginData.password}
                      onChange={handleLoginChange}
                    />

                    <button
                      type="button"
                      className="rx-eye"
                      onClick={() =>
                        setShowLoginPassword(
                          !showLoginPassword
                        )
                      }
                    >
                      {showLoginPassword ? (
                        <EyeOff size={18} />
                      ) : (
                        <Eye size={18} />
                      )}
                    </button>
                  </AuthInput>

                  {message && (
                    <div
                      className={`rx-message ${messageType}`}
                    >
                      {message}
                    </div>
                  )}

                  <button
                    type="submit"
                    className="rx-submit"
                    disabled={loading}
                  >
                    {loading
                      ? "Signing In..."
                      : "Sign In"}
                  </button>

                </form>

              </div>
            </section>

            <section className="rx-auth-green">
              <div className="rx-auth-green-inner">

                <div className="rx-auth-logo-box">
                  <img
                    src={resolveXMark}
                    alt="ResolveX"
                  />
                </div>

                <p className="rx-auth-mini-title">
                  SANJIVANI RESOLVEX
                </p>

                <h1>
                  New
                  <br />
                  here?
                </h1>

                <p className="rx-auth-green-description">
                  Create your account to report,
                  track and manage your campus
                  service requests.
                </p>

                <div className="rx-auth-feature-list">
                  <div className="rx-auth-feature">
                    <CheckCircle2 size={18} />
                    Report campus issues
                  </div>

                  <div className="rx-auth-feature">
                    <CheckCircle2 size={18} />
                    Track complaints
                  </div>

                  <div className="rx-auth-feature">
                    <CheckCircle2 size={18} />
                    Receive updates
                  </div>
                </div>

                <button
                  type="button"
                  className="rx-auth-switch-btn"
                  onClick={() =>
                    navigate("/register")
                  }
                >
                  Create Account
                </button>

              </div>
            </section>

          </div>
        </main>
      )}
    </>
  );
}

function AuthInput({
  label,
  icon,
  children,
}) {
  return (
    <div className="rx-field">
      <label>{label}</label>

      <div className="rx-input">
        {icon}
        {children}
      </div>
    </div>
  );
}

export default AuthPage;