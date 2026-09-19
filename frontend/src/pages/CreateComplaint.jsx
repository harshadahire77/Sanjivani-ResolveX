import {
  useEffect,
  useState,
} from "react";

import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  ClipboardPlus,
  FileText,
  Flag,
  Layers3,
  MapPin,
  RefreshCw,
  Send,
} from "lucide-react";

import {
  useNavigate,
} from "react-router-dom";

import {
  createComplaint,
  getApiErrorMessage,
  getCategories,
  getCurrentUser,
} from "../services/api";

const CreateComplaint = () => {
  const navigate =
    useNavigate();

  const currentUser =
    getCurrentUser();

  // ========================================================
  // FORM
  // ========================================================

  const [formData, setFormData] =
    useState({
      title: "",
      category: "",
      location: "",
      priority: "MEDIUM",
      description: "",
    });

  // ========================================================
  // CATEGORIES
  // ========================================================

  const [categories, setCategories] =
    useState([]);

  const [
    categoryLoading,
    setCategoryLoading,
  ] = useState(true);

  const [
    categoryError,
    setCategoryError,
  ] = useState("");

  // ========================================================
  // PAGE STATES
  // ========================================================

  const [submitting, setSubmitting] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  // ========================================================
  // LOAD CATEGORIES
  // ========================================================

  const loadCategories =
    async () => {
      try {
        setCategoryLoading(true);
        setCategoryError("");

        const data =
          await getCategories();

        const activeCategories =
          Array.isArray(data)
            ? data.filter(
                (category) =>
                  category.active !== false
              )
            : [];

        setCategories(
          activeCategories
        );
      } catch (err) {
        setCategoryError(
          getApiErrorMessage(err) ||
            "Unable to load categories."
        );
      } finally {
        setCategoryLoading(false);
      }
    };

  useEffect(() => {
    loadCategories();
  }, []);

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

    setError("");
    setSuccess("");
  };

  // ========================================================
  // VALIDATION
  // ========================================================

  const validateForm = () => {
    if (
      !formData.title.trim()
    ) {
      return "Please enter a complaint title.";
    }

    if (
      formData.title.trim().length <
      4
    ) {
      return "Complaint title is too short.";
    }

    if (
      !formData.category
    ) {
      return "Please select a complaint category.";
    }

    if (
      !formData.location.trim()
    ) {
      return "Please enter the complaint location.";
    }

    if (
      !formData.description.trim()
    ) {
      return "Please describe the problem.";
    }

    if (
      formData.description
        .trim()
        .length < 10
    ) {
      return "Please provide a little more detail about the complaint.";
    }

    return "";
  };

  // ========================================================
  // SUBMIT
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
        setSubmitting(true);

        const payload = {
          title:
            formData.title.trim(),

          category:
            formData.category,

          location:
            formData.location.trim(),

          description:
            formData.description.trim(),

          priority:
            formData.priority,
        };

        const response =
          await createComplaint(
            payload
          );

        setSuccess(
          response?.message ||
            "Complaint submitted successfully."
        );

        setFormData({
          title: "",
          category: "",
          location: "",
          priority: "MEDIUM",
          description: "",
        });

        setTimeout(() => {
          navigate(
            "/complaints"
          );
        }, 1200);
      } catch (err) {
        setError(
          getApiErrorMessage(err) ||
            "Unable to submit complaint."
        );
      } finally {
        setSubmitting(false);
      }
    };

  return (
    <>
      <div className="rx-create-page">

        {/* HEADER */}

        <div className="rx-create-header">

          <div>

            <button
              type="button"
              className="rx-create-back"
              onClick={() =>
                navigate(
                  "/dashboard"
                )
              }
            >
              <ArrowLeft
                size={16}
              />

              Dashboard
            </button>

            <div className="rx-create-eyebrow">

              <ClipboardPlus
                size={16}
              />

              STUDENT SERVICE REQUEST

            </div>

            <h1>
              Report a Complaint
            </h1>

            <p>
              Tell us about the campus issue
              and ResolveX will help you track
              it until resolution.
            </p>

          </div>

          <div className="rx-create-user">

            <div className="rx-create-avatar">

              {currentUser?.name
                ?.charAt(0)
                ?.toUpperCase() ||
                "S"}

            </div>

            <div>

              <strong>
                {currentUser?.name ||
                  "Student"}
              </strong>

              <span>
                {currentUser
                  ?.universityId ||
                  "Sanjivani University"}
              </span>

            </div>

          </div>

        </div>

        {/* MAIN GRID */}

        <div className="rx-create-layout">

          {/* FORM */}

          <section className="rx-create-card">

            <div className="rx-create-card-heading">

              <div className="rx-create-card-icon">

                <FileText
                  size={21}
                />

              </div>

              <div>

                <h2>
                  Complaint Details
                </h2>

                <p>
                  Provide accurate information
                  so the complaint can be assigned
                  correctly.
                </p>

              </div>

            </div>

            {/* ERROR */}

            {error && (
              <div className="rx-create-message error">

                <AlertCircle
                  size={18}
                />

                {error}

              </div>
            )}

            {/* SUCCESS */}

            {success && (
              <div className="rx-create-message success">

                <CheckCircle2
                  size={18}
                />

                {success}

              </div>
            )}

            <form
              onSubmit={
                handleSubmit
              }
              className="rx-create-form"
            >

              {/* TITLE */}

              <label className="rx-create-field">

                <span>
                  Complaint Title
                  <b>*</b>
                </span>

                <div className="rx-create-input">

                  <FileText
                    size={17}
                  />

                  <input
                    type="text"
                    name="title"
                    value={
                      formData.title
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="e.g. Wi-Fi not working in Lab 2"
                    maxLength={150}
                  />

                </div>

              </label>

              {/* CATEGORY + PRIORITY */}

              <div className="rx-create-grid">

                <label className="rx-create-field">

                  <span>
                    Category
                    <b>*</b>
                  </span>

                  <div className="rx-create-select">

                    <Layers3
                      size={17}
                    />

                    <select
                      name="category"
                      value={
                        formData.category
                      }
                      onChange={
                        handleChange
                      }
                      disabled={
                        categoryLoading
                      }
                    >

                      <option value="">

                        {categoryLoading
                          ? "Loading categories..."
                          : "Select category"}

                      </option>

                      {categories.map(
                        (category) => (

                          <option
                            key={
                              category.id
                            }
                            value={
                              category.name
                            }
                          >
                            {
                              category.name
                            }
                          </option>

                        )
                      )}

                    </select>

                  </div>

                  {categoryError && (
                    <div className="rx-create-category-error">

                      <span>
                        {categoryError}
                      </span>

                      <button
                        type="button"
                        onClick={
                          loadCategories
                        }
                      >
                        <RefreshCw
                          size={13}
                        />

                        Retry
                      </button>

                    </div>
                  )}

                </label>

                <label className="rx-create-field">

                  <span>
                    Priority
                  </span>

                  <div className="rx-create-select">

                    <Flag
                      size={17}
                    />

                    <select
                      name="priority"
                      value={
                        formData.priority
                      }
                      onChange={
                        handleChange
                      }
                    >

                      <option value="LOW">
                        Low
                      </option>

                      <option value="MEDIUM">
                        Medium
                      </option>

                      <option value="HIGH">
                        High
                      </option>

                      <option value="URGENT">
                        Urgent
                      </option>

                    </select>

                  </div>

                </label>

              </div>

              {/* LOCATION */}

              <label className="rx-create-field">

                <span>
                  Location
                  <b>*</b>
                </span>

                <div className="rx-create-input">

                  <MapPin
                    size={17}
                  />

                  <input
                    type="text"
                    name="location"
                    value={
                      formData.location
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="e.g. AI & DS Building, Lab 2"
                    maxLength={150}
                  />

                </div>

              </label>

              {/* DESCRIPTION */}

              <label className="rx-create-field">

                <span>
                  Description
                  <b>*</b>
                </span>

                <div className="rx-create-textarea">

                  <textarea
                    name="description"
                    value={
                      formData.description
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="Explain the problem clearly. Mention what happened, where it happened and any useful details..."
                    rows={7}
                    maxLength={2000}
                  />

                </div>

                <small>
                  {
                    formData
                      .description
                      .length
                  }
                  /2000 characters
                </small>

              </label>

              {/* ACTIONS */}

              <div className="rx-create-actions">

                <button
                  type="button"
                  className="rx-create-cancel"
                  disabled={
                    submitting
                  }
                  onClick={() =>
                    navigate(
                      "/dashboard"
                    )
                  }
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="rx-create-submit"
                  disabled={
                    submitting ||
                    categoryLoading ||
                    categories.length === 0
                  }
                >

                  {submitting ? (
                    <>
                      <RefreshCw
                        size={17}
                        className="rx-create-spin"
                      />

                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send
                        size={17}
                      />

                      Submit Complaint
                    </>
                  )}

                </button>

              </div>

            </form>

          </section>

          {/* RIGHT INFO */}

          <aside className="rx-create-side">

            <div className="rx-create-info-card">

              <div className="rx-create-side-icon">
                <Layers3
                  size={21}
                />
              </div>

              <h3>
                Database Categories
              </h3>

              <p>
                Complaint categories are now
                managed by the ResolveX
                administrator and loaded
                directly from the database.
              </p>

              <div className="rx-create-category-count">

                <strong>
                  {
                    categories.length
                  }
                </strong>

                <span>
                  Active Categories
                </span>

              </div>

            </div>

            <div className="rx-create-info-card">

              <h3>
                What happens next?
              </h3>

              <div className="rx-create-step">

                <span>1</span>

                <div>
                  <strong>
                    Complaint Submitted
                  </strong>

                  <p>
                    Your complaint gets a
                    unique tracking code.
                  </p>
                </div>

              </div>

              <div className="rx-create-step">

                <span>2</span>

                <div>
                  <strong>
                    Admin Assignment
                  </strong>

                  <p>
                    An administrator assigns
                    suitable staff or faculty.
                  </p>
                </div>

              </div>

              <div className="rx-create-step">

                <span>3</span>

                <div>
                  <strong>
                    Work Begins
                  </strong>

                  <p>
                    Assigned personnel update
                    the complaint progress.
                  </p>
                </div>

              </div>

              <div className="rx-create-step">

                <span>4</span>

                <div>
                  <strong>
                    Resolution
                  </strong>

                  <p>
                    You receive an update
                    when the issue is resolved.
                  </p>
                </div>

              </div>

            </div>

          </aside>

        </div>

      </div>

      <style>
        {styles}
      </style>
    </>
  );
};

const styles = `
.rx-create-page {
  min-height: calc(100vh - 68px);
  box-sizing: border-box;
  padding: 32px;

  background:
    radial-gradient(
      circle at top right,
      rgba(22,134,93,.07),
      transparent 30%
    ),
    #f6f8f7;

  color: #17251e;

  font-family:
    Inter,
    system-ui,
    -apple-system,
    BlinkMacSystemFont,
    "Segoe UI",
    sans-serif;
}

/* HEADER */

.rx-create-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 25px;
  margin-bottom: 25px;
}

.rx-create-back {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 0;
  margin-bottom: 17px;
  border: 0;
  background: transparent;
  color: #748179;
  font-size: 10px;
  font-weight: 700;
  cursor: pointer;
}

.rx-create-back:hover {
  color: #16865d;
}

.rx-create-eyebrow {
  display: flex;
  align-items: center;
  gap: 7px;
  margin-bottom: 7px;
  color: #16865d;
  font-size: 9px;
  font-weight: 800;
  letter-spacing: 1.2px;
}

.rx-create-header h1 {
  margin: 0;
  color: #17251e;
  font-size: 34px;
  letter-spacing: -.7px;
}

.rx-create-header > div:first-child > p {
  margin: 7px 0 0;
  color: #7d8982;
  font-size: 12px;
}

.rx-create-user {
  min-width: 205px;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 11px 13px;
  border: 1px solid #e1e9e5;
  border-radius: 13px;
  background: #ffffff;
}

.rx-create-avatar {
  width: 38px;
  height: 38px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  border-radius: 10px;
  background: #e8f8f0;
  color: #16865d;
  font-weight: 800;
}

.rx-create-user > div:last-child {
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.rx-create-user strong {
  overflow: hidden;
  color: #2e3b34;
  font-size: 10px;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.rx-create-user span {
  margin-top: 2px;
  color: #909a95;
  font-size: 8px;
}

/* LAYOUT */

.rx-create-layout {
  display: grid;
  grid-template-columns:
    minmax(0, 1.8fr)
    minmax(260px, .7fr);
  gap: 18px;
}

.rx-create-card,
.rx-create-info-card {
  border: 1px solid #e3ebe7;
  border-radius: 17px;
  background: #ffffff;
  box-shadow:
    0 8px 26px
    rgba(23,60,42,.04);
}

.rx-create-card {
  padding: 24px;
}

.rx-create-card-heading {
  display: flex;
  align-items: center;
  gap: 12px;
  padding-bottom: 19px;
  margin-bottom: 20px;
  border-bottom: 1px solid #edf1ef;
}

.rx-create-card-icon {
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  border-radius: 12px;
  background: #e8f8f0;
  color: #16865d;
}

.rx-create-card-heading h2 {
  margin: 0;
  color: #29382f;
  font-size: 18px;
}

.rx-create-card-heading p {
  margin: 4px 0 0;
  color: #89948e;
  font-size: 9px;
}

/* MESSAGE */

.rx-create-message {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 13px;
  margin-bottom: 17px;
  border-radius: 10px;
  font-size: 10px;
  font-weight: 650;
}

.rx-create-message.error {
  border: 1px solid #f0d0d0;
  background: #fff0f0;
  color: #c94747;
}

.rx-create-message.success {
  border: 1px solid #cae8d8;
  background: #eaf8f1;
  color: #16865d;
}

/* FORM */

.rx-create-form {
  display: flex;
  flex-direction: column;
  gap: 17px;
}

.rx-create-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 13px;
}

.rx-create-field {
  display: flex;
  flex-direction: column;
  gap: 7px;
}

.rx-create-field > span {
  color: #4f5d55;
  font-size: 10px;
  font-weight: 750;
}

.rx-create-field > span b {
  margin-left: 2px;
  color: #d44c4c;
}

.rx-create-field small {
  align-self: flex-end;
  color: #9aa39e;
  font-size: 8px;
}

.rx-create-input,
.rx-create-select {
  min-height: 45px;
  display: flex;
  align-items: center;
  gap: 9px;
  padding: 0 12px;
  border: 1px solid #dce5e0;
  border-radius: 10px;
  background: #ffffff;
  color: #849089;
  transition: .2s ease;
}

.rx-create-input:focus-within,
.rx-create-select:focus-within,
.rx-create-textarea:focus-within {
  border-color: #16865d;
  box-shadow:
    0 0 0 3px
    rgba(22,134,93,.07);
}

.rx-create-input input {
  width: 100%;
  height: 42px;
  border: 0;
  outline: none;
  background: transparent;
  color: #354139;
  font-size: 11px;
}

.rx-create-input input::placeholder,
.rx-create-textarea textarea::placeholder {
  color: #a4ada8;
}

.rx-create-select select {
  width: 100%;
  height: 42px;
  border: 0;
  outline: none;
  background: transparent;
  color: #354139;
  font-size: 11px;
}

.rx-create-select select:disabled {
  color: #9da7a1;
  cursor: wait;
}

.rx-create-textarea {
  border: 1px solid #dce5e0;
  border-radius: 10px;
  background: white;
  transition: .2s ease;
}

.rx-create-textarea textarea {
  width: 100%;
  box-sizing: border-box;
  padding: 13px;
  border: 0;
  outline: none;
  resize: vertical;
  background: transparent;
  color: #354139;
  font: inherit;
  font-size: 11px;
  line-height: 1.6;
}

.rx-create-category-error {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 7px;
  color: #c94747;
  font-size: 8px;
}

.rx-create-category-error button {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 7px;
  border: 1px solid #efd1d1;
  border-radius: 6px;
  background: #fff5f5;
  color: #c94747;
  font-size: 8px;
  font-weight: 700;
  cursor: pointer;
}

/* ACTIONS */

.rx-create-actions {
  display: flex;
  justify-content: flex-end;
  gap: 9px;
  padding-top: 5px;
}

.rx-create-actions button {
  min-height: 43px;
  padding: 0 17px;
  border-radius: 10px;
  font-size: 10px;
  font-weight: 800;
  cursor: pointer;
}

.rx-create-cancel {
  border: 1px solid #dce5e0;
  background: #ffffff;
  color: #536159;
}

.rx-create-submit {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  min-width: 150px;
  border: 1px solid #16865d;
  background: #16865d;
  color: #ffffff;
}

.rx-create-submit:hover:not(:disabled) {
  background: #10704e;
}

.rx-create-submit:disabled {
  opacity: .55;
  cursor: not-allowed;
}

/* SIDE */

.rx-create-side {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.rx-create-info-card {
  padding: 20px;
}

.rx-create-side-icon {
  width: 42px;
  height: 42px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 13px;
  border-radius: 11px;
  background: #e8f8f0;
  color: #16865d;
}

.rx-create-info-card h3 {
  margin: 0 0 7px;
  color: #2d3b33;
  font-size: 14px;
}

.rx-create-info-card > p {
  margin: 0;
  color: #7f8b84;
  font-size: 10px;
  line-height: 1.6;
}

.rx-create-category-count {
  display: flex;
  align-items: center;
  gap: 8px;
  padding-top: 15px;
  margin-top: 15px;
  border-top: 1px solid #edf1ef;
}

.rx-create-category-count strong {
  color: #16865d;
  font-size: 23px;
}

.rx-create-category-count span {
  color: #808c85;
  font-size: 9px;
}

.rx-create-step {
  display: flex;
  gap: 10px;
  padding: 11px 0;
  border-bottom: 1px solid #edf1ef;
}

.rx-create-step:last-child {
  border-bottom: 0;
}

.rx-create-step > span {
  width: 25px;
  height: 25px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  border-radius: 7px;
  background: #e8f8f0;
  color: #16865d;
  font-size: 9px;
  font-weight: 800;
}

.rx-create-step > div {
  display: flex;
  flex-direction: column;
}

.rx-create-step strong {
  color: #39473f;
  font-size: 9px;
}

.rx-create-step p {
  margin: 2px 0 0;
  color: #8b9690;
  font-size: 8px;
  line-height: 1.5;
}

/* LOADING */

.rx-create-spin {
  animation:
    rxCreateSpin
    .8s
    linear
    infinite;
}

@keyframes rxCreateSpin {
  to {
    transform: rotate(360deg);
  }
}

/* RESPONSIVE */

@media(max-width:1050px) {
  .rx-create-layout {
    grid-template-columns: 1fr;
  }

  .rx-create-side {
    display: grid;
    grid-template-columns: 1fr 1fr;
  }
}

@media(max-width:700px) {
  .rx-create-page {
    padding: 20px 15px;
  }

  .rx-create-header {
    flex-direction: column;
  }

  .rx-create-user {
    width: 100%;
  }

  .rx-create-grid,
  .rx-create-side {
    grid-template-columns: 1fr;
  }

  .rx-create-actions {
    flex-direction: column-reverse;
  }

  .rx-create-actions button {
    width: 100%;
  }
}
`;

export default CreateComplaint;