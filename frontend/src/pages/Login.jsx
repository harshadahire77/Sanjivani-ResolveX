import {
  useState,
} from "react";

import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Eye,
  EyeOff,
  LockKeyhole,
  LogIn,
  Mail,
  ShieldCheck,
} from "lucide-react";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import {
  getApiErrorMessage,
  loginUser,
} from "../services/api";

import logo from "../assets/resolvex-mark.png";

// ==========================================================
// LOGIN
// ==========================================================

const Login = () => {
  const navigate =
    useNavigate();

  const [formData, setFormData] =
    useState({
      email: "",
      password: "",
    });

  const [
    showPassword,
    setShowPassword,
  ] = useState(false);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  // ========================================================
  // INPUT
  // ========================================================

  const handleChange = (
    event
  ) => {
    const {
      name,
      value,
    } = event.target;

    setFormData(
      (previous) => ({
        ...previous,

        [name]:
          name === "email"
            ? value.toLowerCase()
            : value,
      })
    );

    setError("");
  };

  // ========================================================
  // VALIDATION
  // ========================================================

  const validateForm = () => {
    if (
      !formData.email.trim()
    ) {
      return "Please enter your email address.";
    }

    const emailPattern =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (
      !emailPattern.test(
        formData.email.trim()
      )
    ) {
      return "Please enter a valid email address.";
    }

    if (
      !formData.password
    ) {
      return "Please enter your password.";
    }

    return "";
  };

  // ========================================================
  // LOGIN
  // ========================================================

  const handleSubmit =
    async (event) => {
      event.preventDefault();

      setError("");

      const validationError =
        validateForm();

      if (validationError) {
        setError(
          validationError
        );

        return;
      }

      try {
        setLoading(true);

        // ================================================
        // IMPORTANT:
        // Send BOTH email + password as JSON object.
        // ================================================

        const response =
          await loginUser({
            email:
              formData.email
                .trim()
                .toLowerCase(),

            password:
              formData.password,
          });

        const role =
          response?.role
            ?.trim()
            ?.toUpperCase() ||
          "";

        // ADMIN
        if (
          role === "ADMIN"
        ) {
          navigate(
            "/admin",
            {
              replace: true,
            }
          );

          return;
        }

        // STAFF / FACULTY / STUDENT
        navigate(
          "/dashboard",
          {
            replace: true,
          }
        );
      } catch (err) {
        setError(
          getApiErrorMessage(
            err
          )
        );
      } finally {
        setLoading(false);
      }
    };

  return (
    <>
      <div className="rx-login-page">

        {/* =================================================
            LEFT PANEL
        ================================================== */}

        <section className="rx-login-left">

          <div className="rx-login-left-inner">

            <Link
              to="/"
              className="rx-login-back"
            >

              <ArrowLeft
                size={16}
              />

              Back to Home

            </Link>

            <div className="rx-login-brand">

              <img
                src={logo}
                alt="ResolveX"
              />

              <div>

                <strong>
                  ResolveX
                </strong>

                <span>
                  Sanjivani University
                </span>

              </div>

            </div>

            <div className="rx-login-hero">

              <div className="rx-login-shield">

                <ShieldCheck
                  size={31}
                />

              </div>

              <span className="rx-login-eyebrow">
                SANJIVANI RESOLVEX
              </span>

              <h1>
                Report.
                <br />
                Track.
                <br />
                Resolve.
              </h1>

              <p>
                Smart campus complaint and
                service request management
                for Sanjivani University.
              </p>

              <div className="rx-login-feature">

                <CheckCircle2
                  size={17}
                />

                <span>
                  Secure role-based access
                </span>

              </div>

              <div className="rx-login-feature">

                <CheckCircle2
                  size={17}
                />

                <span>
                  Real-time complaint tracking
                </span>

              </div>

              <div className="rx-login-feature">

                <CheckCircle2
                  size={17}
                />

                <span>
                  Student, Staff, Faculty
                  and Admin workflows
                </span>

              </div>

            </div>

            <div className="rx-login-left-footer">
              Sanjivani University · ResolveX
            </div>

          </div>

        </section>

        {/* =================================================
            LOGIN PANEL
        ================================================== */}

        <section className="rx-login-right">

          <div className="rx-login-card">

            {/* MOBILE LOGO */}

            <div className="rx-login-mobile-brand">

              <img
                src={logo}
                alt="ResolveX"
              />

              <strong>
                ResolveX
              </strong>

            </div>

            {/* HEADER */}

            <div className="rx-login-header">

              <span>
                SANJIVANI RESOLVEX
              </span>

              <h2>
                Welcome back
              </h2>

              <p>
                Sign in to access your
                ResolveX dashboard.
              </p>

            </div>

            {/* ERROR */}

            {error && (
              <div className="rx-login-error">

                <AlertCircle
                  size={18}
                />

                <span>
                  {error}
                </span>

              </div>
            )}

            {/* FORM */}

            <form
              className="rx-login-form"
              onSubmit={
                handleSubmit
              }
            >

              {/* EMAIL */}

              <label>

                <span>
                  Email Address
                </span>

                <div className="rx-login-input">

                  <Mail
                    size={19}
                  />

                  <input
                    type="email"
                    name="email"
                    value={
                      formData.email
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="Enter your email"
                    autoComplete="email"
                  />

                </div>

              </label>

              {/* PASSWORD */}

              <label>

                <span>
                  Password
                </span>

                <div className="rx-login-input">

                  <LockKeyhole
                    size={19}
                  />

                  <input
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    name="password"
                    value={
                      formData.password
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="Enter your password"
                    autoComplete="current-password"
                  />

                  <button
                    type="button"
                    className="rx-login-eye"
                    aria-label={
                      showPassword
                        ? "Hide password"
                        : "Show password"
                    }
                    onClick={() =>
                      setShowPassword(
                        (previous) =>
                          !previous
                      )
                    }
                  >

                    {showPassword ? (
                      <EyeOff
                        size={18}
                      />
                    ) : (
                      <Eye
                        size={18}
                      />
                    )}

                  </button>

                </div>

              </label>

              {/* BUTTON */}

              <button
                type="submit"
                className="rx-login-submit"
                disabled={loading}
              >

                {loading ? (
                  <>
                    <span className="rx-login-spinner" />

                    Signing In...
                  </>
                ) : (
                  <>
                    <LogIn
                      size={18}
                    />

                    Sign In
                  </>
                )}

              </button>

            </form>

            {/* REGISTER */}

            <div className="rx-login-register">

              <span>
                New student?
              </span>

              <Link to="/register">
                Create Account
              </Link>

            </div>

            <div className="rx-login-account-note">

              Staff and Faculty accounts
              are created by the ResolveX
              Administrator.

            </div>

          </div>

        </section>

      </div>

      <style>
        {styles}
      </style>
    </>
  );
};

// ==========================================================
// CSS
// ==========================================================

const styles = `
* {
  box-sizing: border-box;
}

.rx-login-page {
  min-height: 100vh;

  display: grid;

  grid-template-columns:
    minmax(370px, .9fr)
    minmax(540px, 1.1fr);

  background: #f6f8f7;

  color: #17251e;

  font-family:
    Inter,
    system-ui,
    -apple-system,
    BlinkMacSystemFont,
    "Segoe UI",
    sans-serif;
}

/* ==========================================================
   LEFT
========================================================== */

.rx-login-left {
  position: relative;

  min-height: 100vh;

  overflow: hidden;

  color: #ffffff;

  background:
    radial-gradient(
      circle at 20% 15%,
      rgba(42, 201, 138, .16),
      transparent 29%
    ),
    radial-gradient(
      circle at 85% 85%,
      rgba(30, 177, 119, .10),
      transparent 32%
    ),
    linear-gradient(
      145deg,
      #081d15,
      #0d3022
    );
}

.rx-login-left::before {
  content: "";

  position: absolute;

  width: 430px;
  height: 430px;

  top: -200px;
  right: -210px;

  border:
    1px solid
    rgba(255,255,255,.06);

  border-radius: 50%;
}

.rx-login-left::after {
  content: "";

  position: absolute;

  width: 330px;
  height: 330px;

  left: -175px;
  bottom: -125px;

  border:
    1px solid
    rgba(255,255,255,.05);

  border-radius: 50%;
}

.rx-login-left-inner {
  position: relative;

  z-index: 2;

  min-height: 100vh;

  display: flex;
  flex-direction: column;

  padding: 35px 48px;
}

.rx-login-back {
  width: fit-content;

  display: flex;
  align-items: center;

  gap: 7px;

  color:
    rgba(255,255,255,.6);

  font-size: 11px;
  font-weight: 650;

  text-decoration: none;
}

.rx-login-back:hover {
  color: #ffffff;
}

.rx-login-brand {
  display: flex;
  align-items: center;

  gap: 11px;

  margin-top: 43px;
}

.rx-login-brand img {
  width: 47px;
  height: 47px;

  object-fit: contain;
}

.rx-login-brand > div {
  display: flex;
  flex-direction: column;
}

.rx-login-brand strong {
  font-size: 20px;
  font-weight: 800;
}

.rx-login-brand span {
  margin-top: 2px;

  color:
    rgba(255,255,255,.5);

  font-size: 9px;
}

.rx-login-hero {
  margin: auto 0;

  max-width: 430px;
}

.rx-login-shield {
  width: 59px;
  height: 59px;

  display: flex;
  align-items: center;
  justify-content: center;

  margin-bottom: 20px;

  border:
    1px solid
    rgba(92,226,172,.18);

  border-radius: 17px;

  background:
    rgba(33,174,117,.13);

  color: #6ce1b2;
}

.rx-login-eyebrow {
  color: #65d8aa;

  font-size: 10px;
  font-weight: 850;

  letter-spacing: 1.6px;
}

.rx-login-hero h1 {
  margin: 11px 0 16px;

  font-size:
    clamp(
      45px,
      5vw,
      64px
    );

  line-height: .95;

  letter-spacing: -2px;
}

.rx-login-hero > p {
  max-width: 390px;

  margin-bottom: 27px;

  color:
    rgba(255,255,255,.56);

  font-size: 13px;

  line-height: 1.75;
}

.rx-login-feature {
  display: flex;
  align-items: center;

  gap: 9px;

  margin: 11px 0;

  color:
    rgba(255,255,255,.72);

  font-size: 10px;
}

.rx-login-feature svg {
  color: #66dcae;
}

.rx-login-left-footer {
  color:
    rgba(255,255,255,.28);

  font-size: 9px;

  letter-spacing: .8px;
}

/* ==========================================================
   RIGHT
========================================================== */

.rx-login-right {
  min-height: 100vh;

  display: flex;
  align-items: center;
  justify-content: center;

  padding: 45px;

  background:
    radial-gradient(
      circle at top right,
      rgba(22,134,93,.07),
      transparent 27%
    ),
    #f6f8f7;
}

.rx-login-card {
  width:
    min(
      480px,
      100%
    );

  padding: 42px;

  border:
    1px solid #e0e8e4;

  border-radius: 23px;

  background:
    rgba(255,255,255,.94);

  box-shadow:
    0 20px 60px
    rgba(23,60,42,.08);
}

.rx-login-mobile-brand {
  display: none;
}

.rx-login-header {
  margin-bottom: 29px;
}

.rx-login-header > span {
  display: block;

  margin-bottom: 8px;

  color: #16865d;

  font-size: 10px;
  font-weight: 850;

  letter-spacing: 1.5px;
}

.rx-login-header h2 {
  margin: 0;

  color: #101c16;

  font-size: 38px;

  letter-spacing: -1.2px;
}

.rx-login-header p {
  margin: 8px 0 0;

  color: #75827b;

  font-size: 13px;
}

/* ==========================================================
   ERROR
========================================================== */

.rx-login-error {
  display: flex;
  align-items: center;

  gap: 8px;

  padding: 12px 13px;

  margin-bottom: 18px;

  border:
    1px solid #f2cccc;

  border-radius: 10px;

  background: #fff1f1;

  color: #c73d32;

  font-size: 11px;
  font-weight: 700;
}

/* ==========================================================
   FORM
========================================================== */

.rx-login-form {
  display: flex;
  flex-direction: column;

  gap: 20px;
}

.rx-login-form label {
  display: flex;
  flex-direction: column;

  gap: 8px;
}

.rx-login-form label > span {
  color: #2c3831;

  font-size: 11px;
  font-weight: 750;
}

.rx-login-input {
  min-height: 53px;

  display: flex;
  align-items: center;

  gap: 10px;

  padding: 0 14px;

  border:
    1px solid #dce5e0;

  border-radius: 11px;

  background: #ffffff;

  color: #87938d;

  transition: .2s ease;
}

.rx-login-input:focus-within {
  border-color: #16865d;

  box-shadow:
    0 0 0 3px
    rgba(22,134,93,.07);
}

.rx-login-input input {
  width: 100%;

  height: 50px;

  border: 0;

  outline: none;

  background: transparent;

  color: #25332c;

  font-size: 12px;
}

.rx-login-input input::placeholder {
  color: #a0aaa4;
}

.rx-login-eye {
  width: 31px;
  height: 31px;

  display: flex;
  align-items: center;
  justify-content: center;

  flex-shrink: 0;

  border: 0;

  border-radius: 7px;

  background: transparent;

  color: #87938d;

  cursor: pointer;
}

.rx-login-eye:hover {
  background: #f2f6f4;

  color: #16865d;
}

/* ==========================================================
   SUBMIT
========================================================== */

.rx-login-submit {
  width: 100%;

  min-height: 53px;

  display: flex;
  align-items: center;
  justify-content: center;

  gap: 8px;

  margin-top: 5px;

  border:
    1px solid #16865d;

  border-radius: 11px;

  background:
    linear-gradient(
      135deg,
      #16865d,
      #12a06b
    );

  color: #ffffff;

  font-size: 12px;
  font-weight: 800;

  cursor: pointer;

  box-shadow:
    0 10px 26px
    rgba(22,134,93,.18);

  transition:
    .2s ease;
}

.rx-login-submit:hover:not(:disabled) {
  transform:
    translateY(-1px);

  box-shadow:
    0 14px 30px
    rgba(22,134,93,.24);
}

.rx-login-submit:disabled {
  opacity: .65;

  cursor: not-allowed;
}

.rx-login-spinner {
  width: 16px;
  height: 16px;

  border:
    2px solid
    rgba(255,255,255,.35);

  border-top-color:
    #ffffff;

  border-radius: 50%;

  animation:
    rxLoginSpin
    .7s
    linear
    infinite;
}

@keyframes rxLoginSpin {
  to {
    transform:
      rotate(360deg);
  }
}

/* ==========================================================
   REGISTER
========================================================== */

.rx-login-register {
  display: flex;
  justify-content: center;

  gap: 5px;

  margin-top: 23px;

  color: #7b8780;

  font-size: 10px;
}

.rx-login-register a {
  color: #16865d;

  font-weight: 800;

  text-decoration: none;
}

.rx-login-account-note {
  margin-top: 13px;

  color: #9aa39e;

  font-size: 9px;

  line-height: 1.6;

  text-align: center;
}

/* ==========================================================
   RESPONSIVE
========================================================== */

@media(max-width:900px) {

  .rx-login-page {
    display: block;
  }

  .rx-login-left {
    display: none;
  }

  .rx-login-right {
    padding:
      30px 18px;
  }

  .rx-login-card {
    padding:
      35px 28px;
  }

  .rx-login-mobile-brand {
    display: flex;
    align-items: center;

    gap: 9px;

    margin-bottom: 28px;
  }

  .rx-login-mobile-brand img {
    width: 39px;
    height: 39px;
  }

  .rx-login-mobile-brand strong {
    font-size: 18px;
  }
}

@media(max-width:500px) {

  .rx-login-card {
    padding:
      28px 20px;
  }

  .rx-login-header h2 {
    font-size: 31px;
  }
}
`;

export default Login;