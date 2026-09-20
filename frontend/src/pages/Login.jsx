import { useState } from "react";

import {
  Link,
  useNavigate,
} from "react-router-dom";

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
  getApiErrorMessage,
  loginUser,
} from "../services/api";

const Login = () => {
  const navigate = useNavigate();

  const [formData, setFormData] =
    useState({
      email: "",
      password: "",
    });

  const [showPassword, setShowPassword] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const handleChange = (event) => {
    const {
      name,
      value,
    } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      const data =
        await loginUser({
          email:
            formData.email
              .trim()
              .toLowerCase(),

          password:
            formData.password,
        });

      // loginUser always returns
      // a normalized "user" object.
      const user =
        data?.user || data;

      const role =
        String(
          user?.role ||
          data?.role ||
          ""
        )
          .trim()
          .toUpperCase();

      console.log(
        "ResolveX logged-in user:",
        user
      );

      console.log(
        "ResolveX role:",
        role
      );

      // ==========================================
      // ADMIN
      // ==========================================

      if (role === "ADMIN") {
        navigate(
          "/admin",
          {
            replace: true,
          }
        );

        return;
      }

      // ==========================================
      // STAFF
      // ==========================================

      if (role === "STAFF") {
        navigate(
          "/staff",
          {
            replace: true,
          }
        );

        return;
      }

      // ==========================================
      // FACULTY
      // ==========================================

      if (role === "FACULTY") {
        navigate(
          "/staff",
          {
            replace: true,
          }
        );

        return;
      }

      // ==========================================
      // STUDENT
      // ==========================================

      navigate(
        "/dashboard",
        {
          replace: true,
        }
      );
    } catch (err) {
      console.error(
        "ResolveX login error:",
        err
      );

      setError(
        getApiErrorMessage(
          err,
          "Invalid email or password."
        )
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="rx-login-page">

        {/* LEFT SIDE */}

        <section className="rx-login-left">

          <div className="rx-login-left-inner">

            <Link
              to="/"
              className="rx-login-back"
            >
              <ArrowLeft size={16} />
              Back to Home
            </Link>

            <div className="rx-brand">

              <div className="rx-brand-icon">
                <CheckCircle2 size={31} />
              </div>

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
                <ShieldCheck size={31} />
              </div>

              <span className="rx-eyebrow">
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

              <Feature
                text="Secure role-based access"
              />

              <Feature
                text="Real-time complaint tracking"
              />

              <Feature
                text="Student, Staff, Faculty and Admin workflows"
              />

            </div>

            <div className="rx-footer">
              Sanjivani University · ResolveX
            </div>

          </div>

        </section>

        {/* RIGHT SIDE */}

        <section className="rx-login-right">

          <div className="rx-login-card">

            <div className="rx-mobile-brand">

              <div className="rx-mobile-icon">
                <CheckCircle2 size={27} />
              </div>

              <strong>
                ResolveX
              </strong>

            </div>

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

            {error && (
              <div className="rx-login-error">

                <AlertCircle size={18} />

                <span>
                  {error}
                </span>

              </div>
            )}

            <form
              className="rx-login-form"
              onSubmit={handleSubmit}
            >

              <label>

                <span>
                  Email Address
                </span>

                <div className="rx-login-input">

                  <Mail size={19} />

                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter your email"
                    autoComplete="email"
                    required
                  />

                </div>

              </label>

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
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    required
                  />

                  <button
                    type="button"
                    className="rx-eye"
                    onClick={() =>
                      setShowPassword(
                        (previous) =>
                          !previous
                      )
                    }
                    aria-label={
                      showPassword
                        ? "Hide password"
                        : "Show password"
                    }
                  >

                    {showPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}

                  </button>

                </div>

              </label>

              <button
                type="submit"
                className="rx-login-submit"
                disabled={loading}
              >

                {loading ? (
                  <>
                    <span className="rx-spinner" />
                    Signing In...
                  </>
                ) : (
                  <>
                    <LogIn size={18} />
                    Sign In
                  </>
                )}

              </button>

            </form>

            <div className="rx-register">

              <span>
                New student?
              </span>

              <Link to="/register">
                Create Account
              </Link>

            </div>

            <p className="rx-note">
              Staff and Faculty accounts
              are created by the ResolveX
              Administrator.
            </p>

          </div>

        </section>

      </div>

      <style>{styles}</style>
    </>
  );
};

const Feature = ({
  text,
}) => {
  return (
    <div className="rx-feature">
      <CheckCircle2 size={17} />
      <span>{text}</span>
    </div>
  );
};

const styles = `
* {
  box-sizing: border-box;
}

.rx-login-page {
  min-height: 100vh;
  display: grid;
  grid-template-columns:
    minmax(370px, 0.9fr)
    minmax(540px, 1.1fr);
  font-family:
    Inter,
    system-ui,
    -apple-system,
    BlinkMacSystemFont,
    "Segoe UI",
    sans-serif;
  background: #f6f8f7;
  color: #17251e;
}

/* LEFT */

.rx-login-left {
  min-height: 100vh;
  color: white;
  background:
    radial-gradient(
      circle at 20% 15%,
      rgba(42, 201, 138, 0.16),
      transparent 30%
    ),
    linear-gradient(
      145deg,
      #081d15,
      #0d3022
    );
}

.rx-login-left-inner {
  min-height: 100vh;
  padding: 35px 48px;
  display: flex;
  flex-direction: column;
}

.rx-login-back {
  display: flex;
  align-items: center;
  gap: 7px;
  width: fit-content;
  color: rgba(255,255,255,.65);
  font-size: 12px;
  font-weight: 700;
  text-decoration: none;
}

.rx-login-back:hover {
  color: white;
}

.rx-brand {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 42px;
}

.rx-brand-icon {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #35c98a;
}

.rx-brand > div:last-child {
  display: flex;
  flex-direction: column;
}

.rx-brand strong {
  font-size: 22px;
}

.rx-brand span {
  margin-top: 2px;
  color: rgba(255,255,255,.55);
  font-size: 10px;
}

.rx-login-hero {
  margin: auto 0;
  max-width: 440px;
}

.rx-login-shield {
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 22px;
  border: 1px solid rgba(92,226,172,.2);
  border-radius: 17px;
  background: rgba(33,174,117,.13);
  color: #6ce1b2;
}

.rx-eyebrow {
  color: #65d8aa;
  font-size: 11px;
  font-weight: 850;
  letter-spacing: 1.7px;
}

.rx-login-hero h1 {
  margin: 12px 0 18px;
  font-size: clamp(46px,5vw,65px);
  line-height: .96;
  letter-spacing: -2.5px;
}

.rx-login-hero > p {
  max-width: 400px;
  margin-bottom: 28px;
  color: rgba(255,255,255,.6);
  font-size: 14px;
  line-height: 1.7;
}

.rx-feature {
  display: flex;
  align-items: center;
  gap: 9px;
  margin: 12px 0;
  color: rgba(255,255,255,.75);
  font-size: 11px;
}

.rx-feature svg {
  color: #66dcae;
}

.rx-footer {
  color: rgba(255,255,255,.3);
  font-size: 9px;
  letter-spacing: .8px;
}

/* RIGHT */

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
      transparent 28%
    ),
    #f6f8f7;
}

.rx-login-card {
  width: min(480px,100%);
  padding: 42px;
  border: 1px solid #e0e8e4;
  border-radius: 23px;
  background: rgba(255,255,255,.96);
  box-shadow:
    0 20px 60px
    rgba(23,60,42,.08);
}

.rx-mobile-brand {
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

.rx-login-error {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 13px;
  margin-bottom: 18px;
  border: 1px solid #f2cccc;
  border-radius: 10px;
  background: #fff1f1;
  color: #c73d32;
  font-size: 11px;
  font-weight: 700;
}

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
  border: 1px solid #dce5e0;
  border-radius: 11px;
  background: white;
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
  font-size: 13px;
}

.rx-login-input input::placeholder {
  color: #a0aaa4;
}

.rx-eye {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 0;
  border-radius: 7px;
  background: transparent;
  color: #87938d;
  cursor: pointer;
}

.rx-eye:hover {
  background: #f2f6f4;
  color: #16865d;
}

.rx-login-submit {
  width: 100%;
  min-height: 54px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-top: 5px;
  border: 1px solid #16865d;
  border-radius: 11px;
  background:
    linear-gradient(
      135deg,
      #16865d,
      #12a06b
    );
  color: white;
  font-size: 13px;
  font-weight: 800;
  cursor: pointer;
  box-shadow:
    0 10px 26px
    rgba(22,134,93,.18);
}

.rx-login-submit:disabled {
  opacity: .65;
  cursor: not-allowed;
}

.rx-spinner {
  width: 16px;
  height: 16px;
  border:
    2px solid
    rgba(255,255,255,.35);
  border-top-color: white;
  border-radius: 50%;
  animation:
    rxSpin .7s
    linear infinite;
}

@keyframes rxSpin {
  to {
    transform: rotate(360deg);
  }
}

.rx-register {
  display: flex;
  justify-content: center;
  gap: 5px;
  margin-top: 23px;
  color: #7b8780;
  font-size: 10px;
}

.rx-register a {
  color: #16865d;
  font-weight: 800;
  text-decoration: none;
}

.rx-note {
  margin-top: 13px;
  color: #9aa39e;
  font-size: 9px;
  line-height: 1.6;
  text-align: center;
}

@media(max-width:900px) {
  .rx-login-page {
    display: block;
  }

  .rx-login-left {
    display: none;
  }

  .rx-login-right {
    padding: 30px 18px;
  }

  .rx-login-card {
    padding: 35px 28px;
  }

  .rx-mobile-brand {
    display: flex;
    align-items: center;
    gap: 9px;
    margin-bottom: 28px;
  }

  .rx-mobile-icon {
    color: #16865d;
  }

  .rx-mobile-brand strong {
    font-size: 19px;
  }
}

@media(max-width:500px) {
  .rx-login-card {
    padding: 28px 20px;
  }

  .rx-login-header h2 {
    font-size: 31px;
  }
}
`;

export default Login;