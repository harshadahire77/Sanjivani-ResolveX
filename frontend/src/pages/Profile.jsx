import {
  useEffect,
  useState,
} from "react";

import {
  AlertCircle,
  Building2,
  CheckCircle2,
  GraduationCap,
  IdCard,
  Loader2,
  Mail,
  Phone,
  Save,
  ShieldCheck,
  User,
} from "lucide-react";

import api, {
  getApiErrorMessage,
  getCurrentUser,
} from "../services/api";

const Profile = () => {
  // ========================================================
  // CURRENT LOGGED-IN USER FROM LOCAL STORAGE
  // ========================================================

  const storedUser =
    getCurrentUser();

  const userId =
    storedUser?.userId ??
    storedUser?.id ??
    null;

  // ========================================================
  // STATE
  // ========================================================

  const [profile, setProfile] =
    useState(null);

  const [formData, setFormData] =
    useState({
      name: "",
      phone: "",
      department: "",
      program: "",
      year: "",
    });

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  // ========================================================
  // LOAD PROFILE FROM BACKEND
  // ========================================================

  useEffect(() => {
    const loadProfile =
      async () => {
        if (!userId) {
          setError(
            "Unable to identify the logged-in user. Please login again."
          );

          setLoading(false);
          return;
        }

        try {
          setLoading(true);
          setError("");

          const response =
            await api.get(
              `/users/${userId}`
            );

          const data =
            response.data;

          setProfile(data);

          setFormData({
            name:
              data?.name || "",

            phone:
              data?.phone || "",

            department:
              data?.department || "",

            program:
              data?.program || "",

            year:
              data?.year || "",
          });

          // Update localStorage with latest backend data
          const updatedLocalUser = {
            ...storedUser,
            ...data,
          };

          localStorage.setItem(
            "resolvex_user",
            JSON.stringify(
              updatedLocalUser
            )
          );
        } catch (err) {
          console.error(
            "Profile load error:",
            err
          );

          setError(
            getApiErrorMessage(err)
          );
        } finally {
          setLoading(false);
        }
      };

    loadProfile();
  }, [userId]);

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

    setFormData(
      (previous) => ({
        ...previous,
        [name]: value,
      })
    );

    setSuccess("");
  };

  // ========================================================
  // SAVE PROFILE
  // ========================================================

  const handleSubmit =
    async (event) => {
      event.preventDefault();

      if (!userId) {
        setError(
          "User session not found."
        );

        return;
      }

      if (
        !formData.name.trim()
      ) {
        setError(
          "Full name is required."
        );

        return;
      }

      try {
        setSaving(true);

        setError("");
        setSuccess("");

        const response =
          await api.put(
            `/users/${userId}`,
            {
              name:
                formData.name.trim(),

              phone:
                formData.phone.trim(),

              department:
                formData.department.trim(),

              program:
                formData.program.trim(),

              year:
                formData.year.trim(),
            }
          );

        const updated =
          response.data;

        setProfile(updated);

        setFormData({
          name:
            updated?.name ||
            formData.name,

          phone:
            updated?.phone ||
            formData.phone,

          department:
            updated?.department ||
            formData.department,

          program:
            updated?.program ||
            formData.program,

          year:
            updated?.year ||
            formData.year,
        });

        // ==================================================
        // UPDATE LOCAL STORAGE
        // ==================================================

        const latestUser = {
          ...storedUser,
          ...updated,
        };

        localStorage.setItem(
          "resolvex_user",
          JSON.stringify(
            latestUser
          )
        );

        setSuccess(
          "Profile updated successfully."
        );
      } catch (err) {
        console.error(
          "Profile update error:",
          err
        );

        setError(
          getApiErrorMessage(err)
        );
      } finally {
        setSaving(false);
      }
    };

  // ========================================================
  // FORMAT ROLE
  // ========================================================

  const formatRole = (
    role
  ) => {
    switch (
      role
        ?.trim()
        ?.toUpperCase()
    ) {
      case "ADMIN":
        return "Administrator";

      case "STAFF":
        return "Service Staff";

      case "FACULTY":
        return "Faculty";

      default:
        return "Student";
    }
  };

  // ========================================================
  // INITIALS
  // ========================================================

  const getInitials = (
    name
  ) => {
    if (!name) {
      return "U";
    }

    const words =
      name
        .trim()
        .split(/\s+/);

    if (
      words.length === 1
    ) {
      return words[0]
        .charAt(0)
        .toUpperCase();
    }

    return (
      words[0].charAt(0) +
      words[
        words.length - 1
      ].charAt(0)
    ).toUpperCase();
  };

  // ========================================================
  // LOADING
  // ========================================================

  if (loading) {
    return (
      <div className="rx-profile-center">

        <Loader2
          size={38}
          className="rx-profile-spin"
        />

        <h3>
          Loading your profile...
        </h3>

        <p>
          Fetching your account details
          from ResolveX.
        </p>

        <style>
          {styles}
        </style>

      </div>
    );
  }

  // ========================================================
  // ERROR WITHOUT PROFILE
  // ========================================================

  if (
    error &&
    !profile
  ) {
    return (
      <div className="rx-profile-center">

        <AlertCircle
          size={43}
        />

        <h3>
          Unable to Load Profile
        </h3>

        <p>
          {error}
        </p>

        <style>
          {styles}
        </style>

      </div>
    );
  }

  // ========================================================
  // PAGE
  // ========================================================

  return (
    <>
      <div className="rx-profile-page">

        {/* HEADER */}

        <div className="rx-profile-header">

          <div>

            <div className="rx-profile-eyebrow">

              <User size={15} />

              ACCOUNT

            </div>

            <h1>
              My Profile
            </h1>

            <p>
              Manage your Sanjivani
              University account
              information.
            </p>

          </div>

        </div>

        {/* MESSAGES */}

        {error && (
          <div className="rx-profile-alert error">

            <AlertCircle
              size={18}
            />

            {error}

          </div>
        )}

        {success && (
          <div className="rx-profile-alert success">

            <CheckCircle2
              size={18}
            />

            {success}

          </div>
        )}

        {/* MAIN GRID */}

        <div className="rx-profile-grid">

          {/* ===============================================
              PROFILE CARD
          ================================================ */}

          <aside className="rx-profile-card">

            <div className="rx-profile-avatar">

              {getInitials(
                profile?.name
              )}

            </div>

            <h2>
              {profile?.name ||
                "ResolveX User"}
            </h2>

            <span className="rx-profile-role">

              {formatRole(
                profile?.role
              )}

            </span>

            <div className="rx-profile-university">

              <GraduationCap
                size={15}
              />

              SANJIVANI UNIVERSITY

            </div>

            <div className="rx-profile-card-details">

              <ProfileSummary
                label="University ID"
                value={
                  profile?.universityId ||
                  "-"
                }
              />

              <ProfileSummary
                label="Program"
                value={
                  profile?.program ||
                  "-"
                }
              />

              <ProfileSummary
                label="Academic Year"
                value={
                  profile?.year ||
                  "-"
                }
              />

              <ProfileSummary
                label="Department"
                value={
                  profile?.department ||
                  "-"
                }
              />

            </div>

          </aside>

          {/* ===============================================
              DETAILS FORM
          ================================================ */}

          <section className="rx-profile-details">

            <div className="rx-profile-section-heading">

              <div className="rx-profile-section-icon">

                <ShieldCheck
                  size={19}
                />

              </div>

              <div>

                <span>
                  ACCOUNT DETAILS
                </span>

                <h2>
                  Personal Information
                </h2>

                <p>
                  Your account details
                  stored in ResolveX.
                </p>

              </div>

            </div>

            <form
              onSubmit={
                handleSubmit
              }
            >

              <div className="rx-profile-form-grid">

                {/* NAME */}

                <ProfileField
                  icon={User}
                  label="Full Name"
                >

                  <input
                    type="text"
                    name="name"
                    value={
                      formData.name
                    }
                    onChange={
                      handleChange
                    }
                    required
                  />

                </ProfileField>

                {/* UNIVERSITY ID */}

                <ProfileField
                  icon={IdCard}
                  label="PRN / University ID"
                >

                  <input
                    type="text"
                    value={
                      profile
                        ?.universityId ||
                      ""
                    }
                    readOnly
                  />

                </ProfileField>

                {/* EMAIL */}

                <ProfileField
                  icon={Mail}
                  label="Email Address"
                >

                  <input
                    type="email"
                    value={
                      profile?.email ||
                      ""
                    }
                    readOnly
                  />

                </ProfileField>

                {/* PHONE */}

                <ProfileField
                  icon={Phone}
                  label="Mobile Number"
                >

                  <input
                    type="text"
                    name="phone"
                    value={
                      formData.phone
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="Enter mobile number"
                  />

                </ProfileField>

                {/* DEPARTMENT */}

                <ProfileField
                  icon={Building2}
                  label="Department / School"
                >

                  <input
                    type="text"
                    name="department"
                    value={
                      formData.department
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="Enter department"
                  />

                </ProfileField>

                {/* PROGRAM */}

                <ProfileField
                  icon={GraduationCap}
                  label="Program / Course"
                >

                  <input
                    type="text"
                    name="program"
                    value={
                      formData.program
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="Enter program"
                  />

                </ProfileField>

                {/* YEAR */}

                <ProfileField
                  icon={GraduationCap}
                  label="Academic Year"
                >

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

                </ProfileField>

                {/* ROLE */}

                <ProfileField
                  icon={ShieldCheck}
                  label="Role"
                >

                  <input
                    type="text"
                    value={
                      formatRole(
                        profile?.role
                      )
                    }
                    readOnly
                  />

                </ProfileField>

              </div>

              {/* INFO */}

              <div className="rx-profile-info">

                <ShieldCheck
                  size={17}
                />

                <div>

                  <strong>
                    Protected account fields
                  </strong>

                  <span>
                    University ID, email and
                    role cannot be changed
                    from your profile.
                  </span>

                </div>

              </div>

              {/* SAVE */}

              <div className="rx-profile-actions">

                <button
                  type="submit"
                  disabled={saving}
                >

                  {saving ? (
                    <>
                      <Loader2
                        size={17}
                        className="rx-profile-spin"
                      />

                      Saving...
                    </>
                  ) : (
                    <>
                      <Save
                        size={17}
                      />

                      Save Changes
                    </>
                  )}

                </button>

              </div>

            </form>

          </section>

        </div>

      </div>

      <style>
        {styles}
      </style>
    </>
  );
};

// ==========================================================
// PROFILE FIELD
// ==========================================================

const ProfileField = ({
  icon: Icon,
  label,
  children,
}) => {
  return (
    <label className="rx-profile-field">

      <span>
        {label}
      </span>

      <div>

        <Icon
          size={18}
        />

        {children}

      </div>

    </label>
  );
};

// ==========================================================
// PROFILE SUMMARY
// ==========================================================

const ProfileSummary = ({
  label,
  value,
}) => {
  return (
    <div className="rx-profile-summary">

      <span>
        {label}
      </span>

      <strong>
        {value}
      </strong>

    </div>
  );
};

// ==========================================================
// STYLES
// ==========================================================

const styles = `
.rx-profile-page {
  min-height:
    calc(100vh - 68px);

  padding: 30px;

  background:
    radial-gradient(
      circle at top right,
      rgba(22,163,106,.055),
      transparent 30%
    ),
    var(--rx-bg, #f5f7f6);

  color: #17251e;
}

.rx-profile-header {
  margin-bottom: 25px;
}

.rx-profile-eyebrow {
  display: flex;
  align-items: center;

  gap: 7px;

  margin-bottom: 7px;

  color: #16a36a;

  font-size: 10px;
  font-weight: 800;

  letter-spacing: 1.1px;
}

.rx-profile-header h1 {
  margin: 0;

  font-size: 34px;
}

.rx-profile-header p {
  margin: 7px 0 0;

  color: #75827b;

  font-size: 13px;
}

/* ALERT */

.rx-profile-alert {
  display: flex;
  align-items: center;

  gap: 8px;

  margin-bottom: 18px;

  padding: 12px 14px;

  border-radius: 10px;

  font-size: 12px;
  font-weight: 600;
}

.rx-profile-alert.error {
  background: #fff0f0;

  color: #dc4c4c;
}

.rx-profile-alert.success {
  background: #eaf8f1;

  color: #16a36a;
}

/* GRID */

.rx-profile-grid {
  display: grid;

  grid-template-columns:
    300px
    minmax(0, 1fr);

  gap: 20px;
}

/* PROFILE CARD */

.rx-profile-card {
  height: fit-content;

  padding: 30px 22px;

  border: 1px solid #e2eae6;
  border-radius: 18px;

  background: white;

  text-align: center;

  box-shadow:
    0 5px 20px
    rgba(15,40,29,.04);
}

.rx-profile-avatar {
  width: 88px;
  height: 88px;

  display: flex;
  align-items: center;
  justify-content: center;

  margin: 0 auto 17px;

  border-radius: 25px;

  background:
    linear-gradient(
      135deg,
      #16a36a,
      #118457
    );

  color: white;

  font-size: 27px;
  font-weight: 800;

  box-shadow:
    0 12px 30px
    rgba(22,163,106,.2);
}

.rx-profile-card h2 {
  margin: 0;

  font-size: 20px;
}

.rx-profile-role {
  display: block;

  margin-top: 5px;

  color: #75827b;

  font-size: 12px;
}

.rx-profile-university {
  display: flex;
  align-items: center;
  justify-content: center;

  gap: 6px;

  margin: 23px 0 18px;

  padding: 9px;

  border-radius: 9px;

  background: #eaf8f1;

  color: #118457;

  font-size: 9px;
  font-weight: 800;

  letter-spacing: .6px;
}

.rx-profile-card-details {
  display: flex;
  flex-direction: column;
}

.rx-profile-summary {
  padding: 13px 3px;

  border-bottom:
    1px solid #edf1ef;

  text-align: left;
}

.rx-profile-summary:last-child {
  border-bottom: 0;
}

.rx-profile-summary span {
  display: block;

  margin-bottom: 3px;

  color: #8a9690;

  font-size: 10px;
}

.rx-profile-summary strong {
  display: block;

  overflow-wrap: anywhere;

  color: #344139;

  font-size: 12px;
}

/* DETAILS */

.rx-profile-details {
  padding: 28px;

  border: 1px solid #e2eae6;
  border-radius: 18px;

  background: white;

  box-shadow:
    0 5px 20px
    rgba(15,40,29,.04);
}

.rx-profile-section-heading {
  display: flex;
  align-items: center;

  gap: 13px;

  margin-bottom: 27px;
}

.rx-profile-section-icon {
  width: 45px;
  height: 45px;

  display: flex;
  align-items: center;
  justify-content: center;

  border-radius: 12px;

  background: #eaf8f1;

  color: #16a36a;
}

.rx-profile-section-heading span {
  color: #16a36a;

  font-size: 9px;
  font-weight: 800;

  letter-spacing: 1px;
}

.rx-profile-section-heading h2 {
  margin: 3px 0 2px;

  font-size: 22px;
}

.rx-profile-section-heading p {
  margin: 0;

  color: #89948e;

  font-size: 11px;
}

/* FORM */

.rx-profile-form-grid {
  display: grid;

  grid-template-columns:
    repeat(2, minmax(0,1fr));

  gap: 20px;
}

.rx-profile-field {
  display: flex;
  flex-direction: column;

  gap: 7px;
}

.rx-profile-field > span {
  color: #425047;

  font-size: 11px;
  font-weight: 700;
}

.rx-profile-field > div {
  height: 50px;

  display: flex;
  align-items: center;

  gap: 9px;

  padding: 0 13px;

  border: 1px solid #dfe7e3;
  border-radius: 11px;

  color: #9aa49f;

  transition:
    border-color .2s ease,
    box-shadow .2s ease;
}

.rx-profile-field > div:focus-within {
  border-color: #16a36a;

  box-shadow:
    0 0 0 3px
    rgba(22,163,106,.08);
}

.rx-profile-field input,
.rx-profile-field select {
  width: 100%;
  height: 100%;

  border: 0 !important;
  outline: 0 !important;

  background: transparent;

  box-shadow: none !important;

  color: #344139;

  font: inherit;
  font-size: 12px;
}

.rx-profile-field input[readonly] {
  color: #69756e;

  cursor: not-allowed;
}

.rx-profile-field select {
  cursor: pointer;
}

/* INFO */

.rx-profile-info {
  display: flex;
  align-items: flex-start;

  gap: 9px;

  margin-top: 23px;

  padding: 12px 14px;

  border-radius: 10px;

  background: #f4faf7;

  color: #168b5e;
}

.rx-profile-info > div {
  display: flex;
  flex-direction: column;

  gap: 2px;
}

.rx-profile-info strong {
  font-size: 11px;
}

.rx-profile-info span {
  color: #718078;

  font-size: 10px;
}

/* SAVE */

.rx-profile-actions {
  display: flex;
  justify-content: flex-end;

  margin-top: 24px;
}

.rx-profile-actions button {
  min-height: 44px;

  display: flex;
  align-items: center;
  justify-content: center;

  gap: 7px;

  padding: 0 18px;

  border: 0;
  border-radius: 10px;

  background:
    linear-gradient(
      135deg,
      #16a36a,
      #118457
    );

  color: white;

  font-size: 12px;
  font-weight: 700;

  box-shadow:
    0 6px 18px
    rgba(22,163,106,.18);

  cursor: pointer;
}

.rx-profile-actions button:hover:not(:disabled) {
  transform:
    translateY(-2px);

  box-shadow:
    0 9px 24px
    rgba(22,163,106,.24);
}

/* CENTER */

.rx-profile-center {
  min-height: 70vh;

  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  padding: 30px;

  color: #75827b;

  text-align: center;
}

.rx-profile-center h3 {
  margin: 13px 0 5px;

  color: #344139;
}

.rx-profile-center p {
  max-width: 440px;

  margin: 0;
}

.rx-profile-spin {
  animation:
    rxProfileSpin
    .8s linear infinite;
}

@keyframes rxProfileSpin {
  to {
    transform:
      rotate(360deg);
  }
}

/* RESPONSIVE */

@media(max-width:1000px) {
  .rx-profile-grid {
    grid-template-columns: 1fr;
  }

  .rx-profile-card {
    width: 100%;
  }
}

@media(max-width:700px) {
  .rx-profile-page {
    padding: 20px 15px;
  }

  .rx-profile-form-grid {
    grid-template-columns: 1fr;
  }

  .rx-profile-details {
    padding: 20px;
  }

  .rx-profile-actions button {
    width: 100%;
  }
}
`;

export default Profile;