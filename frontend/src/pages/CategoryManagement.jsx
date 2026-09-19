import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  AlertCircle,
  CheckCircle2,
  Edit3,
  Layers3,
  Plus,
  Power,
  RefreshCw,
  Search,
  ShieldCheck,
  X,
} from "lucide-react";

import {
  activateCategory,
  createCategory,
  deactivateCategory,
  getAdminCategories,
  getApiErrorMessage,
  getCurrentUser,
  updateCategory,
} from "../services/api";

const CategoryManagement = () => {
  const currentUser = getCurrentUser();

  const role =
    currentUser?.role
      ?.trim()
      ?.toUpperCase() || "";

  const allowed =
    role === "ADMIN";

  const [categories, setCategories] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  const [search, setSearch] =
    useState("");

  const [statusFilter, setStatusFilter] =
    useState("ALL");

  const [showModal, setShowModal] =
    useState(false);

  const [editingCategory, setEditingCategory] =
    useState(null);

  const [formData, setFormData] =
    useState({
      name: "",
      description: "",
    });

  // ========================================================
  // LOAD CATEGORIES
  // ========================================================

  const loadCategories =
    useCallback(
      async (showRefresh = false) => {
        try {
          if (showRefresh) {
            setRefreshing(true);
          } else {
            setLoading(true);
          }

          setError("");

          const data =
            await getAdminCategories();

          setCategories(
            Array.isArray(data)
              ? data
              : []
          );
        } catch (err) {
          setError(
            getApiErrorMessage(err)
          );
        } finally {
          setLoading(false);
          setRefreshing(false);
        }
      },
      []
    );

  useEffect(() => {
    if (allowed) {
      loadCategories();
    } else {
      setLoading(false);
    }
  }, [
    allowed,
    loadCategories,
  ]);

  // ========================================================
  // FILTER
  // ========================================================

  const filteredCategories =
    useMemo(() => {
      const query =
        search
          .trim()
          .toLowerCase();

      return categories.filter(
        (category) => {
          const matchesSearch =
            !query ||
            category.name
              ?.toLowerCase()
              .includes(query) ||
            category.description
              ?.toLowerCase()
              .includes(query);

          const matchesStatus =
            statusFilter === "ALL" ||
            (
              statusFilter === "ACTIVE" &&
              category.active
            ) ||
            (
              statusFilter === "INACTIVE" &&
              !category.active
            );

          return (
            matchesSearch &&
            matchesStatus
          );
        }
      );
    }, [
      categories,
      search,
      statusFilter,
    ]);

  // ========================================================
  // STATS
  // ========================================================

  const activeCount =
    categories.filter(
      (item) =>
        item.active
    ).length;

  const inactiveCount =
    categories.filter(
      (item) =>
        !item.active
    ).length;

  // ========================================================
  // OPEN CREATE
  // ========================================================

  const openCreateModal = () => {
    setEditingCategory(null);

    setFormData({
      name: "",
      description: "",
    });

    setError("");
    setSuccess("");

    setShowModal(true);
  };

  // ========================================================
  // OPEN EDIT
  // ========================================================

  const openEditModal = (
    category
  ) => {
    setEditingCategory(
      category
    );

    setFormData({
      name:
        category.name || "",

      description:
        category.description || "",
    });

    setError("");
    setSuccess("");

    setShowModal(true);
  };

  // ========================================================
  // CLOSE MODAL
  // ========================================================

  const closeModal = () => {
    if (saving) {
      return;
    }

    setShowModal(false);
    setEditingCategory(null);

    setFormData({
      name: "",
      description: "",
    });
  };

  // ========================================================
  // CHANGE
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
  };

  // ========================================================
  // SAVE CATEGORY
  // ========================================================

  const handleSubmit =
    async (event) => {
      event.preventDefault();

      setError("");
      setSuccess("");

      if (
        !formData.name.trim()
      ) {
        setError(
          "Category name is required."
        );

        return;
      }

      try {
        setSaving(true);

        const payload = {
          name:
            formData.name.trim(),

          description:
            formData.description
              .trim(),
        };

        if (
          editingCategory
        ) {
          await updateCategory(
            editingCategory.id,
            payload
          );

          setSuccess(
            "Category updated successfully."
          );
        } else {
          await createCategory(
            payload
          );

          setSuccess(
            "Category created successfully."
          );
        }

        closeModal();

        await loadCategories();
      } catch (err) {
        setError(
          getApiErrorMessage(err)
        );
      } finally {
        setSaving(false);
      }
    };

  // ========================================================
  // TOGGLE CATEGORY
  // ========================================================

  const handleToggleStatus =
    async (category) => {
      setError("");
      setSuccess("");

      try {
        if (category.active) {
          await deactivateCategory(
            category.id
          );

          setSuccess(
            `${category.name} deactivated successfully.`
          );
        } else {
          await activateCategory(
            category.id
          );

          setSuccess(
            `${category.name} activated successfully.`
          );
        }

        await loadCategories();
      } catch (err) {
        setError(
          getApiErrorMessage(err)
        );
      }
    };

  // ========================================================
  // ACCESS DENIED
  // ========================================================

  if (!allowed) {
    return (
      <>
        <div className="rx-cat-center">

          <ShieldCheck size={46} />

          <h2>
            Administrator Access Required
          </h2>

          <p>
            Category Management is available
            only to Administrator accounts.
          </p>

        </div>

        <style>{styles}</style>
      </>
    );
  }

  // ========================================================
  // LOADING
  // ========================================================

  if (loading) {
    return (
      <>
        <div className="rx-cat-center">

          <div className="rx-cat-spinner" />

          <p>
            Loading categories...
          </p>

        </div>

        <style>{styles}</style>
      </>
    );
  }

  return (
    <>
      <div className="rx-cat-page">

        {/* HEADER */}

        <div className="rx-cat-header">

          <div>

            <div className="rx-cat-eyebrow">

              <Layers3 size={16} />

              ADMIN MANAGEMENT

            </div>

            <h1>
              Category Management
            </h1>

            <p>
              Manage complaint categories
              available to students.
            </p>

          </div>

          <div className="rx-cat-header-actions">

            <button
              type="button"
              className="rx-cat-refresh"
              disabled={refreshing}
              onClick={() =>
                loadCategories(true)
              }
            >

              <RefreshCw
                size={17}
                className={
                  refreshing
                    ? "rx-cat-spin"
                    : ""
                }
              />

              Refresh

            </button>

            <button
              type="button"
              className="rx-cat-add"
              onClick={
                openCreateModal
              }
            >

              <Plus size={17} />

              Add Category

            </button>

          </div>

        </div>

        {/* MESSAGES */}

        {error && (
          <div className="rx-cat-message error">

            <AlertCircle size={18} />

            {error}

          </div>
        )}

        {success && (
          <div className="rx-cat-message success">

            <CheckCircle2 size={18} />

            {success}

          </div>
        )}

        {/* STATS */}

        <div className="rx-cat-stats">

          <StatCard
            title="Total Categories"
            value={
              categories.length
            }
            type="blue"
          />

          <StatCard
            title="Active Categories"
            value={
              activeCount
            }
            type="green"
          />

          <StatCard
            title="Inactive Categories"
            value={
              inactiveCount
            }
            type="orange"
          />

        </div>

        {/* TOOLBAR */}

        <div className="rx-cat-toolbar">

          <div className="rx-cat-search">

            <Search size={18} />

            <input
              type="text"
              placeholder="Search category..."
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value
                )
              }
            />

          </div>

          <select
            className="rx-cat-filter"
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(
                event.target.value
              )
            }
          >

            <option value="ALL">
              All Categories
            </option>

            <option value="ACTIVE">
              Active
            </option>

            <option value="INACTIVE">
              Inactive
            </option>

          </select>

        </div>

        {/* CATEGORY TABLE */}

        <div className="rx-cat-table-card">

          <div className="rx-cat-table-head">

            <div>

              <h2>
                Complaint Categories
              </h2>

              <p>
                Showing{" "}
                {
                  filteredCategories.length
                }
                {" "}of{" "}
                {
                  categories.length
                }
              </p>

            </div>

          </div>

          {filteredCategories.length ===
          0 ? (

            <div className="rx-cat-empty">

              <Layers3 size={44} />

              <h3>
                No categories found
              </h3>

              <p>
                Create a category or change
                your search filter.
              </p>

            </div>

          ) : (

            <div className="rx-cat-table-wrap">

              <table className="rx-cat-table">

                <thead>

                  <tr>
                    <th>ID</th>
                    <th>Category</th>
                    <th>Description</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>

                </thead>

                <tbody>

                  {filteredCategories.map(
                    (category) => (

                      <tr
                        key={
                          category.id
                        }
                      >

                        <td>
                          #{category.id}
                        </td>

                        <td>

                          <div className="rx-cat-name">

                            <div className="rx-cat-icon">

                              <Layers3
                                size={16}
                              />

                            </div>

                            <strong>
                              {category.name}
                            </strong>

                          </div>

                        </td>

                        <td>

                          <span className="rx-cat-description">

                            {category.description ||
                              "No description"}

                          </span>

                        </td>

                        <td>

                          <span
                            className={
                              category.active
                                ? "rx-cat-status active"
                                : "rx-cat-status inactive"
                            }
                          >

                            {category.active
                              ? "Active"
                              : "Inactive"}

                          </span>

                        </td>

                        <td>

                          <div className="rx-cat-actions">

                            <button
                              type="button"
                              className="edit"
                              onClick={() =>
                                openEditModal(
                                  category
                                )
                              }
                            >

                              <Edit3
                                size={15}
                              />

                              Edit

                            </button>

                            <button
                              type="button"
                              className={
                                category.active
                                  ? "disable"
                                  : "enable"
                              }
                              onClick={() =>
                                handleToggleStatus(
                                  category
                                )
                              }
                            >

                              <Power
                                size={15}
                              />

                              {category.active
                                ? "Deactivate"
                                : "Activate"}

                            </button>

                          </div>

                        </td>

                      </tr>

                    )
                  )}

                </tbody>

              </table>

            </div>

          )}

        </div>

      </div>

      {/* MODAL */}

      {showModal && (
        <div
          className="rx-cat-overlay"
          onMouseDown={(event) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              closeModal();
            }
          }}
        >

          <div className="rx-cat-modal">

            <div className="rx-cat-modal-header">

              <div>

                <span>
                  ADMIN
                </span>

                <h2>
                  {editingCategory
                    ? "Edit Category"
                    : "Add Category"}
                </h2>

              </div>

              <button
                type="button"
                disabled={saving}
                onClick={
                  closeModal
                }
              >

                <X size={20} />

              </button>

            </div>

            <form
              className="rx-cat-form"
              onSubmit={
                handleSubmit
              }
            >

              <label>

                <span>
                  Category Name
                  <b>*</b>
                </span>

                <input
                  type="text"
                  name="name"
                  value={
                    formData.name
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="e.g. Transport"
                  maxLength={100}
                />

              </label>

              <label>

                <span>
                  Description
                </span>

                <textarea
                  name="description"
                  value={
                    formData.description
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="Describe the type of complaints included in this category..."
                  rows={5}
                  maxLength={255}
                />

                <small>
                  {
                    formData
                      .description
                      .length
                  }
                  /255
                </small>

              </label>

              <div className="rx-cat-modal-actions">

                <button
                  type="button"
                  className="secondary"
                  disabled={saving}
                  onClick={
                    closeModal
                  }
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="primary"
                  disabled={saving}
                >

                  {saving ? (
                    <>
                      <RefreshCw
                        size={16}
                        className="rx-cat-spin"
                      />

                      Saving...
                    </>
                  ) : (
                    <>
                      <CheckCircle2
                        size={16}
                      />

                      {editingCategory
                        ? "Update Category"
                        : "Create Category"}
                    </>
                  )}

                </button>

              </div>

            </form>

          </div>

        </div>
      )}

      <style>{styles}</style>
    </>
  );
};

// ==========================================================
// STAT CARD
// ==========================================================

const StatCard = ({
  title,
  value,
  type,
}) => (
  <div className="rx-cat-stat">

    <div
      className={`rx-cat-stat-icon ${type}`}
    >
      <Layers3 size={21} />
    </div>

    <div>

      <span>
        {title}
      </span>

      <strong>
        {value}
      </strong>

    </div>

  </div>
);

// ==========================================================
// CSS
// ==========================================================

const styles = `
.rx-cat-page {
  min-height: calc(100vh - 68px);
  padding: 32px;
  box-sizing: border-box;

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
    sans-serif;
}

.rx-cat-header {
  display: flex;
  justify-content: space-between;
  gap: 20px;

  margin-bottom: 25px;
}

.rx-cat-eyebrow {
  display: flex;
  align-items: center;

  gap: 7px;

  margin-bottom: 7px;

  color: #16865d;

  font-size: 9px;
  font-weight: 800;

  letter-spacing: 1.2px;
}

.rx-cat-header h1 {
  margin: 0;

  font-size: 34px;
  letter-spacing: -.7px;
}

.rx-cat-header p {
  margin: 6px 0 0;

  color: #7d8982;

  font-size: 11px;
}

.rx-cat-header-actions {
  display: flex;

  gap: 9px;
}

.rx-cat-refresh,
.rx-cat-add {
  height: 43px;

  display: flex;
  align-items: center;
  justify-content: center;

  gap: 7px;

  padding: 0 14px;

  border-radius: 10px;

  font-size: 10px;
  font-weight: 800;

  cursor: pointer;
}

.rx-cat-refresh {
  border: 1px solid #dce5e0;

  background: white;

  color: #536159;
}

.rx-cat-add {
  border: 1px solid #16865d;

  background: #16865d;

  color: white;
}

.rx-cat-message {
  display: flex;
  align-items: center;

  gap: 8px;

  padding: 12px 13px;

  margin-bottom: 17px;

  border-radius: 10px;

  font-size: 10px;
  font-weight: 700;
}

.rx-cat-message.error {
  background: #fff0f0;
  color: #ca4747;
}

.rx-cat-message.success {
  background: #eaf8f1;
  color: #16865d;
}

.rx-cat-stats {
  display: grid;

  grid-template-columns:
    repeat(3,1fr);

  gap: 14px;

  margin-bottom: 20px;
}

.rx-cat-stat {
  display: flex;
  align-items: center;

  gap: 12px;

  padding: 18px;

  border: 1px solid #e3ebe7;
  border-radius: 14px;

  background: white;
}

.rx-cat-stat-icon {
  width: 43px;
  height: 43px;

  display: flex;
  align-items: center;
  justify-content: center;

  border-radius: 11px;
}

.rx-cat-stat-icon.blue {
  background: #eaf3ff;
  color: #3672bd;
}

.rx-cat-stat-icon.green {
  background: #e8f8f0;
  color: #16865d;
}

.rx-cat-stat-icon.orange {
  background: #fff3e6;
  color: #c87922;
}

.rx-cat-stat > div:last-child {
  display: flex;
  flex-direction: column;
}

.rx-cat-stat span {
  color: #7d8982;
  font-size: 9px;
}

.rx-cat-stat strong {
  font-size: 23px;
}

.rx-cat-toolbar {
  display: flex;

  gap: 10px;

  margin-bottom: 17px;
}

.rx-cat-search {
  flex: 1;

  height: 44px;

  display: flex;
  align-items: center;

  gap: 8px;

  padding: 0 13px;

  border: 1px solid #dce5e0;
  border-radius: 10px;

  background: white;
}

.rx-cat-search input {
  width: 100%;

  border: 0;
  outline: none;

  font-size: 11px;
}

.rx-cat-filter {
  min-width: 150px;

  padding: 0 11px;

  border: 1px solid #dce5e0;
  border-radius: 10px;

  background: white;

  outline: none;

  font-size: 10px;
}

.rx-cat-table-card {
  overflow: hidden;

  border: 1px solid #e3ebe7;
  border-radius: 16px;

  background: white;
}

.rx-cat-table-head {
  padding: 19px 21px;
}

.rx-cat-table-head h2 {
  margin: 0;

  font-size: 17px;
}

.rx-cat-table-head p {
  margin: 4px 0 0;

  color: #89948e;

  font-size: 9px;
}

.rx-cat-table-wrap {
  overflow-x: auto;
}

.rx-cat-table {
  width: 100%;

  min-width: 900px;

  border-collapse: collapse;
}

.rx-cat-table th {
  padding: 12px 15px;

  background: #f8faf9;

  color: #7c8781;

  text-align: left;

  font-size: 9px;
}

.rx-cat-table td {
  padding: 14px 15px;

  border-top: 1px solid #edf1ef;

  color: #536159;

  font-size: 10px;
}

.rx-cat-name {
  display: flex;
  align-items: center;

  gap: 9px;
}

.rx-cat-icon {
  width: 30px;
  height: 30px;

  display: flex;
  align-items: center;
  justify-content: center;

  border-radius: 8px;

  background: #e8f8f0;

  color: #16865d;
}

.rx-cat-name strong {
  color: #2d3b33;
}

.rx-cat-description {
  display: inline-block;

  max-width: 380px;

  color: #78847d;

  line-height: 1.5;
}

.rx-cat-status {
  display: inline-flex;

  padding: 5px 8px;

  border-radius: 999px;

  font-size: 8px;
  font-weight: 800;
}

.rx-cat-status.active {
  background: #e8f8f0;
  color: #16865d;
}

.rx-cat-status.inactive {
  background: #edf1ef;
  color: #657169;
}

.rx-cat-actions {
  display: flex;

  gap: 6px;
}

.rx-cat-actions button {
  display: flex;
  align-items: center;

  gap: 5px;

  padding: 7px 9px;

  border: 0;
  border-radius: 7px;

  font-size: 8px;
  font-weight: 800;

  cursor: pointer;
}

.rx-cat-actions .edit {
  background: #eaf3ff;
  color: #3672bd;
}

.rx-cat-actions .disable {
  background: #fff0f0;
  color: #cf4848;
}

.rx-cat-actions .enable {
  background: #e8f8f0;
  color: #16865d;
}

.rx-cat-empty {
  padding: 60px;

  color: #89948e;

  text-align: center;
}

.rx-cat-empty h3 {
  margin: 8px 0 4px;

  color: #344139;
}

.rx-cat-empty p {
  margin: 0;
  font-size: 9px;
}

/* MODAL */

.rx-cat-overlay {
  position: fixed;
  inset: 0;

  z-index: 5000;

  display: flex;
  align-items: center;
  justify-content: center;

  padding: 20px;

  background: rgba(8,25,18,.6);

  backdrop-filter: blur(5px);
}

.rx-cat-modal {
  width: min(540px,100%);

  border-radius: 17px;

  background: white;

  box-shadow:
    0 30px 80px
    rgba(0,0,0,.22);
}

.rx-cat-modal-header {
  display: flex;
  justify-content: space-between;

  padding: 20px 22px;

  border-bottom: 1px solid #e9eeeb;
}

.rx-cat-modal-header span {
  color: #16865d;

  font-size: 8px;
  font-weight: 800;
}

.rx-cat-modal-header h2 {
  margin: 3px 0 0;

  font-size: 20px;
}

.rx-cat-modal-header button {
  width: 34px;
  height: 34px;

  border: 0;
  border-radius: 8px;

  background: #f3f6f4;

  cursor: pointer;
}

.rx-cat-form {
  display: flex;
  flex-direction: column;

  gap: 16px;

  padding: 21px 22px;
}

.rx-cat-form label {
  display: flex;
  flex-direction: column;

  gap: 7px;
}

.rx-cat-form label > span {
  color: #536159;

  font-size: 10px;
  font-weight: 750;
}

.rx-cat-form label b {
  margin-left: 2px;
  color: #cf4848;
}

.rx-cat-form input,
.rx-cat-form textarea {
  width: 100%;

  box-sizing: border-box;

  border: 1px solid #dce5e0;
  border-radius: 9px;

  outline: none;

  font: inherit;

  font-size: 11px;
}

.rx-cat-form input {
  height: 43px;

  padding: 0 11px;
}

.rx-cat-form textarea {
  padding: 11px;

  resize: vertical;
}

.rx-cat-form input:focus,
.rx-cat-form textarea:focus {
  border-color: #16865d;
}

.rx-cat-form small {
  align-self: flex-end;

  color: #98a19c;

  font-size: 8px;
}

.rx-cat-modal-actions {
  display: flex;
  justify-content: flex-end;

  gap: 8px;
}

.rx-cat-modal-actions button {
  min-height: 40px;

  padding: 0 14px;

  border-radius: 8px;

  font-size: 9px;
  font-weight: 800;

  cursor: pointer;
}

.rx-cat-modal-actions .secondary {
  border: 1px solid #dce5e0;

  background: white;

  color: #536159;
}

.rx-cat-modal-actions .primary {
  display: flex;
  align-items: center;

  gap: 6px;

  border: 1px solid #16865d;

  background: #16865d;

  color: white;
}

.rx-cat-center {
  min-height: 70vh;

  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  text-align: center;

  color: #7d8982;
}

.rx-cat-center h2 {
  margin: 12px 0 5px;

  color: #344139;
}

.rx-cat-center p {
  margin: 0;
}

.rx-cat-spinner {
  width: 36px;
  height: 36px;

  margin-bottom: 12px;

  border: 4px solid #dceae3;
  border-top-color: #16865d;

  border-radius: 50%;

  animation:
    rxCatSpin
    .8s
    linear
    infinite;
}

.rx-cat-spin {
  animation:
    rxCatSpin
    .8s
    linear
    infinite;
}

@keyframes rxCatSpin {
  to {
    transform: rotate(360deg);
  }
}

@media(max-width:800px) {
  .rx-cat-page {
    padding: 20px 15px;
  }

  .rx-cat-header {
    flex-direction: column;
  }

  .rx-cat-header-actions {
    width: 100%;
  }

  .rx-cat-header-actions button {
    flex: 1;
  }

  .rx-cat-stats {
    grid-template-columns: 1fr;
  }

  .rx-cat-toolbar {
    flex-direction: column;
  }

  .rx-cat-filter {
    min-height: 44px;
  }
}
`;

export default CategoryManagement;