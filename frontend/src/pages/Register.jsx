import {
  useState,
} from "react";

import {
  ArrowLeft,
  CheckCircle2,
  Eye,
  EyeOff,
  GraduationCap,
  LockKeyhole,
  Mail,
  Phone,
  School,
  User,
  UserRoundPlus,
} from "lucide-react";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import {
  getApiErrorMessage,
  registerUser,
} from "../services/api";

import logo from "../assets/resolvex-mark.png";

// ==========================================================
// REGISTER PAGE
// PUBLIC REGISTRATION = STUDENT ONLY
// ==========================================================

const Register = () => {
  const navigate =
    useNavigate();

  // ========================================================
  // FORM
  // ========================================================

  const [formData, setFormData] =
    useState({
      name: "",
      universityId: "",
      email: "",
      phone: "",
      department: "",
      program: "",
      year: "",
      password: "",
      confirmPassword: "",
    });

  const [showPassword, setShowPassword] =
    useState(false);

  const [
    showConfirmPassword,
    setShowConfirmPassword,
  ] = useState(false);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  // ========================================================
  // INPUT CHANGE
  // ========================================================

  const handleChange = (
    event
  ) => {
    const {
      name,
      value,
    } = event.target;

    let finalValue = value;

    // University ID in uppercase
    if (
      name === "universityId"
    ) {
      finalValue =
        value.toUpperCase();
    }

    // Email in lowercase
    if (name === "email") {
      finalValue =
        value.toLowerCase();
    }

    // Phone - numbers only
    if (name === "phone") {
      finalValue =
        value
          .replace(
            /\D/g,
            ""
          )
          .slice(
            0,
            10
          );
    }

    setFormData(
      (previous) => ({
        ...previous,
        [name]: finalValue,
      })
    );
  };

  // ========================================================
  // VALIDATION
  // ========================================================

  const validateForm = () => {
    if (
      !formData.name.trim()
    ) {
      return "Please enter your full name.";
    }

    if (
      !formData
        .universityId
        .trim()
    ) {
      return "Please enter your University ID.";
    }

    if (
      !formData.email.trim()
    ) {
      return "Please enter your email address.";
    }

    const emailPattern =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (
      !emailPattern.test(
        formData.email
      )
    ) {
      return "Please enter a valid email address.";
    }

    if (
      formData.phone &&
      formData.phone.length !== 10
    ) {
      return "Phone number must contain 10 digits.";
    }

    if (
      !formData
        .department
        .trim()
    ) {
      return "Please enter your department.";
    }

    if (
      !formData.program.trim()
    ) {
      return "Please enter your program.";
    }

    if (!formData.year) {
      return "Please select your academic year.";
    }

    if (
      !formData.password
    ) {
      return "Please enter a password.";
    }

    if (
      formData.password.length <
      6
    ) {
      return "Password must contain at least 6 characters.";
    }

    if (
      !formData.confirmPassword
    ) {
      return "Please confirm your password.";
    }

    if (
      formData.password !==
      formData.confirmPassword
    ) {
      return "Passwords do not match.";
    }

    return "";
  };

  // ========================================================
  // REGISTER
  // ========================================================

  const handleSubmit =
    async (event) => {
      event.preventDefault();

      setError("");
      setSuccess("");

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

        // ==================================================
        // IMPORTANT
        //
        // No role is sent from the frontend.
        //
        // Backend AuthController forces:
        //
        // user.setRole("STUDENT");
        // ==================================================

        const payload = {
          name:
            formData
              .name
              .trim(),

          universityId:
            formData
              .universityId
              .trim()
              .toUpperCase(),

          email:
            formData
              .email
              .trim()
              .toLowerCase(),

          phone:
            formData.phone
              ? formData.phone.trim()
              : null,

          department:
            formData
              .department
              .trim(),

          program:
            formData
              .program
              .trim(),

          year:
            formData.year,

          password:
            formData.password,
        };

        const response =
          await registerUser(
            payload
          );

        setSuccess(
          response?.message ||
            "Student account created successfully."
        );

        // Clear form
        setFormData({
          name: "",
          universityId: "",
          email: "",
          phone: "",
          department: "",
          program: "",
          year: "",
          password: "",
          confirmPassword: "",
        });

        // Redirect to login
        setTimeout(() => {
          navigate(
            "/login",
            {
              replace: true,
            }
          );
        }, 1000);

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
      <div className="rx-register-page">

        {/* =================================================
            LEFT SIDE
        ================================================== */}

        <section className="rx-register-brand">

          <div className="rx-register-brand-inner">

            <Link
              to="/"
              className="rx-register-back"
            >

              <ArrowLeft
                size={17}
              />

              Back to Home

            </Link>

            <div className="rx-register-brand-logo">

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

            <div className="rx-register-brand-content">

              <div className="rx-register-brand-icon">

                <GraduationCap
                  size={30}
                />

              </div>

              <h1>
                Join ResolveX
              </h1>

              <p>
                Create your student account
                and get a simple way to report,
                track and resolve campus
                complaints.
              </p>

              <div className="rx-register-features">

                <Feature
                  title="Report Issues"
                  text="Submit campus complaints quickly."
                />

                <Feature
                  title="Track Progress"
                  text="Follow complaint status in real time."
                />

                <Feature
                  title="Get Notifications"
                  text="Receive updates when work progresses."
                />

              </div>

            </div>

            <div className="rx-register-brand-footer">
              Report. Track. Resolve.
            </div>

          </div>

        </section>

        {/* =================================================
            RIGHT SIDE
        ================================================== */}

        <section className="rx-register-form-side">

          <div className="rx-register-container">

            {/* HEADER */}

            <div className="rx-register-header">

              <div className="rx-register-mobile-logo">

                <img
                  src={logo}
                  alt="ResolveX"
                />

                <strong>
                  ResolveX
                </strong>

              </div>

              <div className="rx-register-icon">

                <UserRoundPlus
                  size={23}
                />

              </div>

              <h2>
                Create Student Account
              </h2>

              <p>
                Register to access the
                Sanjivani ResolveX portal.
              </p>

            </div>

            {/* STUDENT NOTICE */}

            <div className="rx-register-role-note">

              <GraduationCap
                size={18}
              />

              <div>

                <strong>
                  Student Registration
                </strong>

                <span>
                  Public registration creates
                  a Student account only.
                </span>

              </div>

            </div>

            {/* ERROR */}

            {error && (
              <div className="rx-register-message error">

                <span className="rx-register-message-icon">
                  !
                </span>

                {error}

              </div>
            )}

            {/* SUCCESS */}

            {success && (
              <div className="rx-register-message success">

                <CheckCircle2
                  size={18}
                />

                {success}

              </div>
            )}

            {/* FORM */}

            <form
              className="rx-register-form"
              onSubmit={
                handleSubmit
              }
            >

              {/* NAME */}

              <FormField
                label="Full Name"
                required
              >

                <div className="rx-register-input">

                  <User
                    size={17}
                  />

                  <input
                    type="text"
                    name="name"
                    value={
                      formData.name
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="Enter your full name"
                    autoComplete="name"
                  />

                </div>

              </FormField>

              {/* UNIVERSITY ID + PHONE */}

              <div className="rx-register-grid">

                <FormField
                  label="University ID"
                  required
                >

                  <div className="rx-register-input">

                    <School
                      size={17}
                    />

                    <input
                      type="text"
                      name="universityId"
                      value={
                        formData.universityId
                      }
                      onChange={
                        handleChange
                      }
                      placeholder="e.g. SU2026001"
                    />

                  </div>

                </FormField>

                <FormField
                  label="Phone Number"
                >

                  <div className="rx-register-input">

                    <Phone
                      size={17}
                    />

                    <input
                      type="tel"
                      name="phone"
                      value={
                        formData.phone
                      }
                      onChange={
                        handleChange
                      }
                      placeholder="10 digit number"
                      inputMode="numeric"
                    />

                  </div>

                </FormField>

              </div>

              {/* EMAIL */}

              <FormField
                label="Email Address"
                required
              >

                <div className="rx-register-input">

                  <Mail
                    size={17}
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

              </FormField>

              {/* DEPARTMENT + PROGRAM */}

              <div className="rx-register-grid">

                <FormField
                  label="Department"
                  required
                >

                  <div className="rx-register-input">

                    <School
                      size={17}
                    />

                    <input
                      type="text"
                      name="department"
                      value={
                        formData.department
                      }
                      onChange={
                        handleChange
                      }
                      placeholder="e.g. AI & DS"
                    />

                  </div>

                </FormField>

                <FormField
                  label="Program"
                  required
                >

                  <div className="rx-register-input">

                    <GraduationCap
                      size={17}
                    />

                    <input
                      type="text"
                      name="program"
                      value={
                        formData.program
                      }
                      onChange={
                        handleChange
                      }
                      placeholder="e.g. B.Tech"
                    />

                  </div>

                </FormField>

              </div>

              {/* ACADEMIC YEAR */}

              <FormField
                label="Academic Year"
                required
              >

                <div className="rx-register-select">

                  <GraduationCap
                    size={17}
                  />

                  <select
                    name="year"
                    value={
                      formData.year
                    }
                    onChange={
                      handleChange
                    }
                  >

                    <option value="">
                      Select academic year
                    </option>

                    <option value="1st Year">
                      1st Year
                    </option>

                    <option value="2nd Year">
                      2nd Year
                    </option>

                    <option value="3rd Year">
                      3rd Year
                    </option>

                    <option value="4th Year">
                      4th Year
                    </option>

                  </select>

                </div>

              </FormField>

              {/* PASSWORDS */}

              <div className="rx-register-grid">

                <FormField
                  label="Password"
                  required
                >

                  <div className="rx-register-input">

                    <LockKeyhole
                      size={17}
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
                      placeholder="Minimum 6 characters"
                      autoComplete="new-password"
                    />

                    <button
                      type="button"
                      className="rx-register-eye"
                      onClick={() =>
                        setShowPassword(
                          (previous) =>
                            !previous
                        )
                      }
                    >

                      {showPassword ? (
                        <EyeOff
                          size={17}
                        />
                      ) : (
                        <Eye
                          size={17}
                        />
                      )}

                    </button>

                  </div>

                </FormField>

                <FormField
                  label="Confirm Password"
                  required
                >

                  <div className="rx-register-input">

                    <LockKeyhole
                      size={17}
                    />

                    <input
                      type={
                        showConfirmPassword
                          ? "text"
                          : "password"
                      }
                      name="confirmPassword"
                      value={
                        formData.confirmPassword
                      }
                      onChange={
                        handleChange
                      }
                      placeholder="Re-enter password"
                      autoComplete="new-password"
                    />

                    <button
                      type="button"
                      className="rx-register-eye"
                      onClick={() =>
                        setShowConfirmPassword(
                          (previous) =>
                            !previous
                        )
                      }
                    >

                      {showConfirmPassword ? (
                        <EyeOff
                          size={17}
                        />
                      ) : (
                        <Eye
                          size={17}
                        />
                      )}

                    </button>

                  </div>

                </FormField>

              </div>

              {/* SUBMIT */}

              <button
                type="submit"
                className="rx-register-submit"
                disabled={loading}
              >

                {loading ? (
                  <>
                    <span className="rx-register-spinner" />
                    Creating Account...
                  </>
                ) : (
                  <>
                    <UserRoundPlus
                      size={18}
                    />

                    Create Student Account
                  </>
                )}

              </button>

            </form>

            {/* LOGIN */}

            <div className="rx-register-login">

              <span>
                Already have an account?
              </span>

              <Link to="/login">
                Sign In
              </Link>

            </div>

            {/* ADMIN NOTICE */}

            <div className="rx-register-admin-note">

              Staff and Faculty accounts are
              created by the ResolveX
              Administrator.

            </div>

          </div>

        </section>

      </div>

      <style>{styles}</style>
    </>
  );
};

// ==========================================================
// FORM FIELD
// ==========================================================

const FormField = ({
  label,
  required,
  children,
}) => {
  return (
    <label className="rx-register-field">

      <span className="rx-register-field-label">

        {label}

        {required && (
          <b>*</b>
        )}

      </span>

      {children}

    </label>
  );
};

// ==========================================================
// FEATURE
// ==========================================================

const Feature = ({
  title,
  text,
}) => {
  return (
    <div className="rx-register-feature">

      <div className="rx-register-feature-check">

        <CheckCircle2
          size={16}
        />

      </div>

      <div>

        <strong>
          {title}
        </strong>

        <span>
          {text}
        </span>

      </div>

    </div>
  );
};

// ==========================================================
// STYLES
// ==========================================================

const styles = `
* {
  box-sizing: border-box;
}

.rx-register-page {
  min-height: 100vh;
  display: grid;
  grid-template-columns:
    minmax(340px, 0.82fr)
    minmax(520px, 1.18fr);
  background: #f7f9f8;
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
   LEFT SIDE
========================================================== */

.rx-register-brand {
  position: relative;
  overflow: hidden;
  min-height: 100vh;
  background:
    radial-gradient(
      circle at 15% 15%,
      rgba(48, 203, 143, 0.14),
      transparent 30%
    ),
    radial-gradient(
      circle at 80% 75%,
      rgba(48, 203, 143, 0.08),
      transparent 34%
    ),
    linear-gradient(
      145deg,
      #091d16,
      #0e3023
    );
  color: white;
}

.rx-register-brand::before {
  content: "";
  position: absolute;
  width: 420px;
  height: 420px;
  right: -210px;
  top: -120px;
  border:
    1px solid rgba(255,255,255,.06);
  border-radius: 50%;
}

.rx-register-brand::after {
  content: "";
  position: absolute;
  width: 300px;
  height: 300px;
  left: -150px;
  bottom: -100px;
  border:
    1px solid rgba(255,255,255,.05);
  border-radius: 50%;
}

.rx-register-brand-inner {
  position: relative;
  z-index: 2;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  padding: 35px 46px;
}

.rx-register-back {
  width: fit-content;
  display: flex;
  align-items: center;
  gap: 7px;
  color: rgba(255,255,255,.62);
  font-size: 11px;
  font-weight: 650;
  text-decoration: none;
}

.rx-register-back:hover {
  color: #ffffff;
}

.rx-register-brand-logo {
  display: flex;
  align-items: center;
  gap: 11px;
  margin-top: 46px;
}

.rx-register-brand-logo img {
  width: 46px;
  height: 46px;
  object-fit: contain;
}

.rx-register-brand-logo > div {
  display: flex;
  flex-direction: column;
}

.rx-register-brand-logo strong {
  font-size: 20px;
  font-weight: 800;
}

.rx-register-brand-logo span {
  margin-top: 2px;
  color: rgba(255,255,255,.52);
  font-size: 9px;
}

.rx-register-brand-content {
  margin: auto 0;
  max-width: 430px;
}

.rx-register-brand-icon {
  width: 58px;
  height: 58px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 22px;
  border:
    1px solid rgba(98,225,174,.2);
  border-radius: 17px;
  background:
    rgba(35,174,119,.14);
  color: #6de0b3;
}

.rx-register-brand-content h1 {
  margin: 0;
  font-size: clamp(
    34px,
    4vw,
    49px
  );
  line-height: 1.05;
  letter-spacing: -1.5px;
}

.rx-register-brand-content > p {
  max-width: 400px;
  margin: 17px 0 27px;
  color: rgba(255,255,255,.6);
  font-size: 13px;
  line-height: 1.75;
}

.rx-register-features {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.rx-register-feature {
  display: flex;
  align-items: center;
  gap: 11px;
}

.rx-register-feature-check {
  width: 31px;
  height: 31px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  border-radius: 9px;
  background:
    rgba(37,190,129,.13);
  color: #69deb0;
}

.rx-register-feature > div:last-child {
  display: flex;
  flex-direction: column;
}

.rx-register-feature strong {
  font-size: 11px;
}

.rx-register-feature span {
  margin-top: 2px;
  color: rgba(255,255,255,.47);
  font-size: 9px;
}

.rx-register-brand-footer {
  color: rgba(255,255,255,.32);
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 1px;
}

/* ==========================================================
   FORM SIDE
========================================================== */

.rx-register-form-side {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  padding: 45px 35px;
  overflow-y: auto;
  background:
    radial-gradient(
      circle at top right,
      rgba(22,134,93,.06),
      transparent 27%
    ),
    #f7f9f8;
}

.rx-register-container {
  width: min(
    680px,
    100%
  );
  margin: auto 0;
}

.rx-register-header {
  margin-bottom: 20px;
}

.rx-register-mobile-logo {
  display: none;
}

.rx-register-icon {
  width: 46px;
  height: 46px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 14px;
  border-radius: 13px;
  background: #e7f8ef;
  color: #16865d;
}

.rx-register-header h2 {
  margin: 0;
  color: #17251e;
  font-size: 29px;
  letter-spacing: -.6px;
}

.rx-register-header p {
  margin: 6px 0 0;
  color: #7d8982;
  font-size: 12px;
}

/* ==========================================================
   ROLE NOTE
========================================================== */

.rx-register-role-note {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 13px 14px;
  margin-bottom: 17px;
  border:
    1px solid #d4eadf;
  border-radius: 11px;
  background: #effaf4;
  color: #16865d;
}

.rx-register-role-note > div {
  display: flex;
  flex-direction: column;
}

.rx-register-role-note strong {
  font-size: 11px;
}

.rx-register-role-note span {
  margin-top: 2px;
  color: #668177;
  font-size: 9px;
}

/* ==========================================================
   MESSAGES
========================================================== */

.rx-register-message {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 13px;
  margin-bottom: 16px;
  border-radius: 10px;
  font-size: 11px;
  font-weight: 650;
}

.rx-register-message.error {
  border: 1px solid #f1d1d1;
  background: #fff0f0;
  color: #c94a4a;
}

.rx-register-message.success {
  border: 1px solid #cae8d8;
  background: #eaf8f1;
  color: #16865d;
}

.rx-register-message-icon {
  width: 18px;
  height: 18px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  border: 1px solid currentColor;
  border-radius: 50%;
  font-size: 10px;
  font-weight: 800;
}

/* ==========================================================
   FORM
========================================================== */

.rx-register-form {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.rx-register-grid {
  display: grid;
  grid-template-columns:
    repeat(
      2,
      minmax(0,1fr)
    );
  gap: 13px;
}

.rx-register-field {
  display: flex;
  flex-direction: column;
  gap: 7px;
}

.rx-register-field-label {
  color: #4e5c54;
  font-size: 10px;
  font-weight: 750;
}

.rx-register-field-label b {
  margin-left: 2px;
  color: #dc5151;
}

.rx-register-input,
.rx-register-select {
  min-height: 46px;
  display: flex;
  align-items: center;
  gap: 9px;
  padding: 0 13px;
  border: 1px solid #dce5e0;
  border-radius: 11px;
  background: #ffffff;
  color: #89948e;
  transition:
    border-color .2s ease,
    box-shadow .2s ease;
}

.rx-register-input:focus-within,
.rx-register-select:focus-within {
  border-color: #1a986a;
  box-shadow:
    0 0 0 3px
    rgba(26,152,106,.07);
}

.rx-register-input input {
  width: 100%;
  min-width: 0;
  height: 43px;
  border: 0;
  outline: none;
  background: transparent;
  color: #26362d;
  font-size: 12px;
}

.rx-register-input input::placeholder {
  color: #a4ada8;
}

.rx-register-select select {
  width: 100%;
  height: 43px;
  border: 0;
  outline: none;
  background: transparent;
  color: #39473f;
  font-size: 12px;
}

.rx-register-eye {
  width: 29px;
  height: 29px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  border: 0;
  border-radius: 7px;
  background: transparent;
  color: #89948e;
  cursor: pointer;
}

.rx-register-eye:hover {
  background: #f3f6f4;
  color: #16865d;
}

/* ==========================================================
   SUBMIT
========================================================== */

.rx-register-submit {
  width: 100%;
  min-height: 47px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-top: 3px;
  border: 1px solid #16865d;
  border-radius: 11px;
  background:
    linear-gradient(
      135deg,
      #16865d,
      #119d68
    );
  color: #ffffff;
  font-size: 12px;
  font-weight: 800;
  cursor: pointer;
  box-shadow:
    0 8px 20px
    rgba(22,134,93,.14);
  transition:
    transform .2s ease,
    box-shadow .2s ease;
}

.rx-register-submit:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow:
    0 12px 26px
    rgba(22,134,93,.2);
}

.rx-register-submit:disabled {
  opacity: .65;
  cursor: not-allowed;
}

.rx-register-spinner {
  width: 16px;
  height: 16px;
  border:
    2px solid
    rgba(255,255,255,.4);
  border-top-color: #ffffff;
  border-radius: 50%;
  animation:
    rxRegisterSpin
    .7s
    linear
    infinite;
}

@keyframes rxRegisterSpin {
  to {
    transform:
      rotate(360deg);
  }
}

/* ==========================================================
   LOGIN / FOOTER
========================================================== */

.rx-register-login {
  display: flex;
  justify-content: center;
  gap: 5px;
  margin-top: 19px;
  color: #7d8982;
  font-size: 10px;
}

.rx-register-login a {
  color: #16865d;
  font-weight: 800;
  text-decoration: none;
}

.rx-register-admin-note {
  margin-top: 13px;
  color: #9aa39e;
  font-size: 9px;
  text-align: center;
}

/* ==========================================================
   RESPONSIVE
========================================================== */

@media (
  max-width: 920px
) {
  .rx-register-page {
    display: block;
  }

  .rx-register-brand {
    display: none;
  }

  .rx-register-form-side {
    padding:
      35px 20px;
  }

  .rx-register-mobile-logo {
    display: flex;
    align-items: center;
    gap: 9px;
    margin-bottom: 25px;
  }

  .rx-register-mobile-logo img {
    width: 38px;
    height: 38px;
  }

  .rx-register-mobile-logo strong {
    font-size: 18px;
  }
}

@media (
  max-width: 600px
) {
  .rx-register-form-side {
    padding:
      25px 15px;
  }

  .rx-register-grid {
    grid-template-columns:
      1fr;
  }

  .rx-register-header h2 {
    font-size: 25px;
  }
}
`;

export default Register;