import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Activity,
  AlertTriangle,
  BarChart3,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  Clock3,
  Download,
  FileSpreadsheet,
  FileText,
  Filter,
  Layers3,
  RefreshCw,
  Search,
  ShieldCheck,
  TrendingUp,
  Users,
  XCircle,
} from "lucide-react";

import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

import {
  getAllComplaints,
  getApiErrorMessage,
  getAssignableUsers,
  getCategories,
  getCurrentUser,
} from "../services/api";

// ==========================================================
// REPORTS & ANALYTICS
// ADMIN ONLY
// ==========================================================

const ReportsAnalytics = () => {
  const currentUser =
    getCurrentUser();

  const role =
    currentUser?.role
      ?.trim()
      ?.toUpperCase() || "";

  const allowed =
    role === "ADMIN";

  // ========================================================
  // DATA
  // ========================================================

  const [complaints, setComplaints] =
    useState([]);

  const [
    assignableUsers,
    setAssignableUsers,
  ] = useState([]);

  const [categories, setCategories] =
    useState([]);

  // ========================================================
  // PAGE STATE
  // ========================================================

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  // ========================================================
  // FILTERS
  // ========================================================

  const [search, setSearch] =
    useState("");

  const [
    statusFilter,
    setStatusFilter,
  ] = useState("ALL");

  const [
    categoryFilter,
    setCategoryFilter,
  ] = useState("ALL");

  const [
    priorityFilter,
    setPriorityFilter,
  ] = useState("ALL");

  const [
    assigneeFilter,
    setAssigneeFilter,
  ] = useState("ALL");

  const [startDate, setStartDate] =
    useState("");

  const [endDate, setEndDate] =
    useState("");

  // ========================================================
  // HELPERS
  // ========================================================

  const getUserId = (user) => {
    return (
      user?.userId ??
      user?.id ??
      null
    );
  };

  const formatDate = (
    value
  ) => {
    if (!value) {
      return "-";
    }

    const date =
      new Date(value);

    if (
      Number.isNaN(
        date.getTime()
      )
    ) {
      return "-";
    }

    return date.toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }
    );
  };

  const formatDateTime = (
    value
  ) => {
    if (!value) {
      return "-";
    }

    const date =
      new Date(value);

    if (
      Number.isNaN(
        date.getTime()
      )
    ) {
      return "-";
    }

    return date.toLocaleString(
      "en-IN",
      {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }
    );
  };

  const getFileDate = () => {
    const date =
      new Date();

    const year =
      date.getFullYear();

    const month =
      String(
        date.getMonth() + 1
      ).padStart(
        2,
        "0"
      );

    const day =
      String(
        date.getDate()
      ).padStart(
        2,
        "0"
      );

    return `${year}-${month}-${day}`;
  };

  // ========================================================
  // LOAD DATA
  // ========================================================

  const loadData =
    useCallback(
      async (
        showRefresh = false
      ) => {
        try {
          if (showRefresh) {
            setRefreshing(true);
          } else {
            setLoading(true);
          }

          setError("");
          setSuccess("");

          const [
            complaintData,
            staffData,
            categoryData,
          ] = await Promise.all([
            getAllComplaints(),
            getAssignableUsers(),
            getCategories(),
          ]);

          setComplaints(
            Array.isArray(
              complaintData
            )
              ? complaintData
              : []
          );

          setAssignableUsers(
            Array.isArray(
              staffData
            )
              ? staffData
              : []
          );

          setCategories(
            Array.isArray(
              categoryData
            )
              ? categoryData
              : []
          );
        } catch (err) {
          setError(
            getApiErrorMessage(
              err
            )
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
      loadData();
    } else {
      setLoading(false);
    }
  }, [
    allowed,
    loadData,
  ]);

  // ========================================================
  // FILTERED COMPLAINTS
  // ========================================================

  const filteredComplaints =
    useMemo(() => {
      const query =
        search
          .trim()
          .toLowerCase();

      let start = null;
      let end = null;

      if (startDate) {
        start =
          new Date(
            `${startDate}T00:00:00`
          );
      }

      if (endDate) {
        end =
          new Date(
            `${endDate}T23:59:59`
          );
      }

      return complaints.filter(
        (complaint) => {
          const createdAt =
            complaint.createdAt
              ? new Date(
                  complaint.createdAt
                )
              : null;

          const matchesSearch =
            !query ||
            complaint.title
              ?.toLowerCase()
              .includes(query) ||
            complaint
              .complaintCode
              ?.toLowerCase()
              .includes(query) ||
            complaint.category
              ?.toLowerCase()
              .includes(query) ||
            complaint.location
              ?.toLowerCase()
              .includes(query) ||
            complaint.user?.name
              ?.toLowerCase()
              .includes(query) ||
            complaint.user
              ?.universityId
              ?.toLowerCase()
              .includes(query) ||
            complaint
              .assignedUser
              ?.name
              ?.toLowerCase()
              .includes(query);

          const matchesStatus =
            statusFilter ===
              "ALL" ||
            complaint.status ===
              statusFilter;

          const matchesCategory =
            categoryFilter ===
              "ALL" ||
            complaint.category ===
              categoryFilter;

          const matchesPriority =
            priorityFilter ===
              "ALL" ||
            complaint.priority ===
              priorityFilter;

          let matchesAssignee =
            true;

          if (
            assigneeFilter ===
            "UNASSIGNED"
          ) {
            matchesAssignee =
              !complaint.assignedUser;
          } else if (
            assigneeFilter !==
            "ALL"
          ) {
            matchesAssignee =
              String(
                getUserId(
                  complaint.assignedUser
                ) || ""
              ) ===
              String(
                assigneeFilter
              );
          }

          const matchesStart =
            !start ||
            (
              createdAt &&
              createdAt >= start
            );

          const matchesEnd =
            !end ||
            (
              createdAt &&
              createdAt <= end
            );

          return (
            matchesSearch &&
            matchesStatus &&
            matchesCategory &&
            matchesPriority &&
            matchesAssignee &&
            matchesStart &&
            matchesEnd
          );
        }
      );
    }, [
      complaints,
      search,
      statusFilter,
      categoryFilter,
      priorityFilter,
      assigneeFilter,
      startDate,
      endDate,
    ]);

  // ========================================================
  // SUMMARY
  // ========================================================

  const summary =
    useMemo(() => {
      const total =
        filteredComplaints.length;

      const open =
        filteredComplaints.filter(
          (item) =>
            item.status === "OPEN"
        ).length;

      const assigned =
        filteredComplaints.filter(
          (item) =>
            item.status ===
            "ASSIGNED"
        ).length;

      const inProgress =
        filteredComplaints.filter(
          (item) =>
            item.status ===
            "IN_PROGRESS"
        ).length;

      const resolved =
        filteredComplaints.filter(
          (item) =>
            item.status ===
            "RESOLVED"
        ).length;

      const closed =
        filteredComplaints.filter(
          (item) =>
            item.status ===
            "CLOSED"
        ).length;

      const urgent =
        filteredComplaints.filter(
          (item) =>
            item.priority ===
            "URGENT"
        ).length;

      const completed =
        resolved + closed;

      const resolutionRate =
        total > 0
          ? Math.round(
              (
                completed /
                total
              ) * 100
            )
          : 0;

      return {
        total,
        open,
        assigned,
        inProgress,
        resolved,
        closed,
        urgent,
        completed,
        resolutionRate,
      };
    }, [
      filteredComplaints,
    ]);

  // ========================================================
  // STATUS ANALYTICS
  // ========================================================

  const statusAnalytics =
    useMemo(
      () => [
        {
          label: "Open",
          value:
            filteredComplaints.filter(
              (item) =>
                item.status ===
                "OPEN"
            ).length,
          className: "orange",
        },
        {
          label: "Assigned",
          value:
            filteredComplaints.filter(
              (item) =>
                item.status ===
                "ASSIGNED"
            ).length,
          className: "purple",
        },
        {
          label: "In Progress",
          value:
            filteredComplaints.filter(
              (item) =>
                item.status ===
                "IN_PROGRESS"
            ).length,
          className: "blue",
        },
        {
          label: "Resolved",
          value:
            filteredComplaints.filter(
              (item) =>
                item.status ===
                "RESOLVED"
            ).length,
          className: "green",
        },
        {
          label: "Closed",
          value:
            filteredComplaints.filter(
              (item) =>
                item.status ===
                "CLOSED"
            ).length,
          className: "gray",
        },
      ],
      [
        filteredComplaints,
      ]
    );

  // ========================================================
  // PRIORITY ANALYTICS
  // ========================================================

  const priorityAnalytics =
    useMemo(
      () => [
        {
          label: "Low",
          value:
            filteredComplaints.filter(
              (item) =>
                item.priority ===
                "LOW"
            ).length,
          className: "green",
        },
        {
          label: "Medium",
          value:
            filteredComplaints.filter(
              (item) =>
                item.priority ===
                "MEDIUM"
            ).length,
          className: "blue",
        },
        {
          label: "High",
          value:
            filteredComplaints.filter(
              (item) =>
                item.priority ===
                "HIGH"
            ).length,
          className: "orange",
        },
        {
          label: "Urgent",
          value:
            filteredComplaints.filter(
              (item) =>
                item.priority ===
                "URGENT"
            ).length,
          className: "red",
        },
      ],
      [
        filteredComplaints,
      ]
    );

  // ========================================================
  // CATEGORY ANALYTICS
  // ========================================================

  const categoryAnalytics =
    useMemo(() => {
      const countMap = {};

      filteredComplaints.forEach(
        (complaint) => {
          const name =
            complaint.category ||
            "Uncategorized";

          countMap[name] =
            (
              countMap[name] ||
              0
            ) + 1;
        }
      );

      return Object.entries(
        countMap
      )
        .map(
          ([
            label,
            value,
          ]) => ({
            label,
            value,
          })
        )
        .sort(
          (a, b) =>
            b.value -
            a.value
        );
    }, [
      filteredComplaints,
    ]);

  // ========================================================
  // STAFF WORKLOAD
  // ========================================================

  const staffWorkload =
    useMemo(() => {
      const workload = {};

      assignableUsers.forEach(
        (user) => {
          const id =
            getUserId(
              user
            );

          if (!id) {
            return;
          }

          workload[
            String(id)
          ] = {
            id,
            name:
              user.name ||
              "Unknown User",

            role:
              user.role ||
              "STAFF",

            department:
              user.department ||
              "",

            assigned: 0,
            active: 0,
            resolved: 0,
          };
        }
      );

      filteredComplaints.forEach(
        (complaint) => {
          const user =
            complaint.assignedUser;

          if (!user) {
            return;
          }

          const id =
            getUserId(
              user
            );

          if (!id) {
            return;
          }

          const key =
            String(id);

          if (!workload[key]) {
            workload[key] = {
              id,
              name:
                user.name ||
                "Unknown User",

              role:
                user.role ||
                "STAFF",

              department:
                user.department ||
                "",

              assigned: 0,
              active: 0,
              resolved: 0,
            };
          }

          workload[key].assigned +=
            1;

          if (
            complaint.status ===
              "ASSIGNED" ||
            complaint.status ===
              "IN_PROGRESS"
          ) {
            workload[
              key
            ].active += 1;
          }

          if (
            complaint.status ===
              "RESOLVED" ||
            complaint.status ===
              "CLOSED"
          ) {
            workload[
              key
            ].resolved += 1;
          }
        }
      );

      return Object.values(
        workload
      ).sort(
        (a, b) =>
          b.assigned -
          a.assigned
      );
    }, [
      assignableUsers,
      filteredComplaints,
    ]);

  // ========================================================
  // MONTHLY TREND
  // ========================================================

  const monthlyTrend =
    useMemo(() => {
      const now =
        new Date();

      const months = [];

      for (
        let index = 5;
        index >= 0;
        index -= 1
      ) {
        const date =
          new Date(
            now.getFullYear(),
            now.getMonth() -
              index,
            1
          );

        months.push({
          year:
            date.getFullYear(),

          month:
            date.getMonth(),

          label:
            date.toLocaleString(
              "en-IN",
              {
                month:
                  "short",
              }
            ),

          value: 0,
        });
      }

      filteredComplaints.forEach(
        (complaint) => {
          if (
            !complaint.createdAt
          ) {
            return;
          }

          const created =
            new Date(
              complaint.createdAt
            );

          if (
            Number.isNaN(
              created.getTime()
            )
          ) {
            return;
          }

          const target =
            months.find(
              (month) =>
                month.year ===
                  created.getFullYear() &&
                month.month ===
                  created.getMonth()
            );

          if (target) {
            target.value += 1;
          }
        }
      );

      return months;
    }, [
      filteredComplaints,
    ]);

  // ========================================================
  // RESET FILTERS
  // ========================================================

  const resetFilters = () => {
    setSearch("");
    setStatusFilter("ALL");
    setCategoryFilter("ALL");
    setPriorityFilter("ALL");
    setAssigneeFilter("ALL");
    setStartDate("");
    setEndDate("");
    setError("");
    setSuccess("");
  };

  // ========================================================
  // CSV HELPERS
  // ========================================================

  const escapeCSV = (
    value
  ) => {
    if (
      value === null ||
      value === undefined
    ) {
      return "";
    }

    const stringValue =
      String(value);

    return `"${stringValue.replace(
      /"/g,
      '""'
    )}"`;
  };

  // ========================================================
  // EXPORT CSV
  // ========================================================

  const handleExportCSV =
    () => {
      setError("");
      setSuccess("");

      if (
        filteredComplaints.length ===
        0
      ) {
        setError(
          "No complaint data available to export."
        );

        return;
      }

      try {
        const headers = [
          "Complaint Code",
          "Title",
          "Student Name",
          "University ID",
          "Student Email",
          "Category",
          "Location",
          "Priority",
          "Status",
          "Assigned To",
          "Assigned Role",
          "Created Date",
          "Updated Date",
          "Resolved Date",
          "Resolution Note",
        ];

        const rows =
          filteredComplaints.map(
            (complaint) => [
              complaint
                .complaintCode ||
                "",

              complaint.title ||
                "",

              complaint.user
                ?.name ||
                "",

              complaint.user
                ?.universityId ||
                "",

              complaint.user
                ?.email ||
                "",

              complaint.category ||
                "",

              complaint.location ||
                "",

              complaint.priority ||
                "",

              complaint.status ||
                "",

              complaint
                .assignedUser
                ?.name ||
                "Unassigned",

              complaint
                .assignedUser
                ?.role ||
                "",

              formatDateTime(
                complaint.createdAt
              ),

              formatDateTime(
                complaint.updatedAt
              ),

              formatDateTime(
                complaint.resolvedAt
              ),

              complaint
                .resolutionNote ||
                "",
            ]
          );

        const csvContent = [
          headers
            .map(
              escapeCSV
            )
            .join(","),

          ...rows.map(
            (row) =>
              row
                .map(
                  escapeCSV
                )
                .join(",")
          ),
        ].join("\n");

        // UTF-8 BOM improves Excel compatibility.
        const blob =
          new Blob(
            [
              "\uFEFF" +
                csvContent,
            ],
            {
              type:
                "text/csv;charset=utf-8;",
            }
          );

        const url =
          URL.createObjectURL(
            blob
          );

        const link =
          document.createElement(
            "a"
          );

        link.href = url;

        link.download =
          `ResolveX_Complaint_Report_${getFileDate()}.csv`;

        document.body.appendChild(
          link
        );

        link.click();

        document.body.removeChild(
          link
        );

        URL.revokeObjectURL(
          url
        );

        setSuccess(
          `${filteredComplaints.length} complaint record(s) exported to CSV successfully.`
        );
      } catch (err) {
        console.error(
          "CSV export failed:",
          err
        );

        setError(
          "Unable to export CSV report."
        );
      }
    };

  // ========================================================
  // EXPORT PDF
  // ========================================================

  const handleExportPDF =
    () => {
      setError("");
      setSuccess("");

      if (
        filteredComplaints.length ===
        0
      ) {
        setError(
          "No complaint data available to export."
        );

        return;
      }

      try {
        const doc =
          new jsPDF({
            orientation:
              "landscape",
            unit: "mm",
            format: "a4",
          });

        const pageWidth =
          doc.internal.pageSize.getWidth();

        // -----------------------------------------------
        // TITLE
        // -----------------------------------------------

        doc.setFontSize(18);

        doc.setFont(
          "helvetica",
          "bold"
        );

        doc.text(
          "SANJIVANI RESOLVEX",
          14,
          16
        );

        doc.setFontSize(12);

        doc.text(
          "Complaint Reports & Analytics",
          14,
          23
        );

        doc.setFontSize(8);

        doc.setFont(
          "helvetica",
          "normal"
        );

        doc.text(
          `Generated: ${new Date().toLocaleString(
            "en-IN"
          )}`,
          14,
          29
        );

        doc.text(
          `Generated By: ${
            currentUser?.name ||
            "Administrator"
          }`,
          14,
          34
        );

        // -----------------------------------------------
        // FILTER INFORMATION
        // -----------------------------------------------

        let filterText =
          "Filters: ";

        filterText +=
          `Status=${
            statusFilter ===
            "ALL"
              ? "All"
              : statusFilter.replaceAll(
                  "_",
                  " "
                )
          }`;

        filterText +=
          ` | Priority=${
            priorityFilter ===
            "ALL"
              ? "All"
              : priorityFilter
          }`;

        filterText +=
          ` | Category=${
            categoryFilter ===
            "ALL"
              ? "All"
              : categoryFilter
          }`;

        if (
          startDate ||
          endDate
        ) {
          filterText +=
            ` | Date=${
              startDate ||
              "Beginning"
            } to ${
              endDate ||
              "Today"
            }`;
        }

        doc.text(
          filterText,
          14,
          40
        );

        // -----------------------------------------------
        // SUMMARY BOX
        // -----------------------------------------------

        doc.setFontSize(9);

        doc.setFont(
          "helvetica",
          "bold"
        );

        doc.text(
          "Summary",
          14,
          48
        );

        doc.setFont(
          "helvetica",
          "normal"
        );

        const summaryText = [
          `Total: ${summary.total}`,
          `Open: ${summary.open}`,
          `Assigned: ${summary.assigned}`,
          `In Progress: ${summary.inProgress}`,
          `Resolved: ${summary.resolved}`,
          `Closed: ${summary.closed}`,
          `Urgent: ${summary.urgent}`,
          `Resolution Rate: ${summary.resolutionRate}%`,
        ];

        let summaryX = 14;

        summaryText.forEach(
          (
            item,
            index
          ) => {
            doc.text(
              item,
              summaryX,
              55
            );

            summaryX +=
              index === 7
                ? 0
                : 31;
          }
        );

        // -----------------------------------------------
        // TABLE
        // -----------------------------------------------

        const tableRows =
          filteredComplaints.map(
            (complaint) => [
              complaint
                .complaintCode ||
                "-",

              complaint.title ||
                "-",

              complaint.user
                ?.name ||
                "-",

              complaint.category ||
                "-",

              complaint.location ||
                "-",

              complaint.priority ||
                "-",

              complaint.status
                ?.replaceAll(
                  "_",
                  " "
                ) ||
                "-",

              complaint
                .assignedUser
                ?.name ||
                "Unassigned",

              formatDate(
                complaint.createdAt
              ),

              complaint
                .resolutionNote ||
                "-",
            ]
          );

        autoTable(
          doc,
          {
            startY: 63,

            head: [[
              "Code",
              "Title",
              "Student",
              "Category",
              "Location",
              "Priority",
              "Status",
              "Assigned To",
              "Created",
              "Resolution Note",
            ]],

            body:
              tableRows,

            theme:
              "grid",

            styles: {
              fontSize: 6.5,
              cellPadding: 2,
              valign: "middle",
              overflow:
                "linebreak",
            },

            headStyles: {
              fillColor: [
                22,
                134,
                93,
              ],
              textColor: [
                255,
                255,
                255,
              ],
              fontStyle:
                "bold",
            },

            alternateRowStyles: {
              fillColor: [
                247,
                249,
                248,
              ],
            },

            columnStyles: {
              0: {
                cellWidth: 26,
              },

              1: {
                cellWidth: 38,
              },

              2: {
                cellWidth: 27,
              },

              3: {
                cellWidth: 25,
              },

              4: {
                cellWidth: 27,
              },

              5: {
                cellWidth: 18,
              },

              6: {
                cellWidth: 23,
              },

              7: {
                cellWidth: 27,
              },

              8: {
                cellWidth: 21,
              },

              9: {
                cellWidth: 45,
              },
            },

            margin: {
              left: 14,
              right: 14,
            },

            didDrawPage:
              () => {
                const pageNumber =
                  doc.internal
                    .getCurrentPageInfo()
                    .pageNumber;

                const pageHeight =
                  doc.internal.pageSize.getHeight();

                doc.setFontSize(
                  7
                );

                doc.setTextColor(
                  120
                );

                doc.text(
                  `ResolveX Complaint Report`,
                  14,
                  pageHeight -
                    6
                );

                doc.text(
                  `Page ${pageNumber}`,
                  pageWidth -
                    28,
                  pageHeight -
                    6
                );
              },
          }
        );

        doc.save(
          `ResolveX_Complaint_Report_${getFileDate()}.pdf`
        );

        setSuccess(
          `${filteredComplaints.length} complaint record(s) exported to PDF successfully.`
        );
      } catch (err) {
        console.error(
          "PDF export failed:",
          err
        );

        setError(
          "Unable to export PDF report. Make sure jspdf and jspdf-autotable are installed."
        );
      }
    };

  // ========================================================
  // ACCESS
  // ========================================================

  if (!allowed) {
    return (
      <>
        <div className="rx-ra-center">

          <ShieldCheck
            size={48}
          />

          <h2>
            Administrator Access Required
          </h2>

          <p>
            Reports & Analytics is
            available only to
            Administrator accounts.
          </p>

        </div>

        <style>
          {styles}
        </style>
      </>
    );
  }

  // ========================================================
  // LOADING
  // ========================================================

  if (loading) {
    return (
      <>
        <div className="rx-ra-center">

          <div className="rx-ra-spinner" />

          <p>
            Loading reports and
            analytics...
          </p>

        </div>

        <style>
          {styles}
        </style>
      </>
    );
  }

  // ========================================================
  // PAGE
  // ========================================================

  return (
    <>
      <div className="rx-ra-page">

        {/* =================================================
            HEADER
        ================================================== */}

        <div className="rx-ra-header">

          <div>

            <div className="rx-ra-eyebrow">

              <BarChart3
                size={16}
              />

              ADMIN ANALYTICS

            </div>

            <h1>
              Reports & Analytics
            </h1>

            <p>
              Analyze complaints,
              service performance and
              export filtered reports.
            </p>

          </div>

          <div className="rx-ra-header-actions">

            <button
              type="button"
              className="rx-ra-export csv"
              onClick={
                handleExportCSV
              }
            >

              <FileSpreadsheet
                size={17}
              />

              Export CSV

            </button>

            <button
              type="button"
              className="rx-ra-export pdf"
              onClick={
                handleExportPDF
              }
            >

              <FileText
                size={17}
              />

              Export PDF

            </button>

            <button
              type="button"
              className="rx-ra-refresh"
              disabled={
                refreshing
              }
              onClick={() =>
                loadData(true)
              }
            >

              <RefreshCw
                size={17}
                className={
                  refreshing
                    ? "rx-ra-spin"
                    : ""
                }
              />

              {refreshing
                ? "Refreshing..."
                : "Refresh"}

            </button>

          </div>

        </div>

        {/* =================================================
            MESSAGES
        ================================================== */}

        {error && (
          <div className="rx-ra-message error">

            <AlertTriangle
              size={18}
            />

            <span>
              {error}
            </span>

            <button
              type="button"
              onClick={() =>
                setError("")
              }
            >
              ×
            </button>

          </div>
        )}

        {success && (
          <div className="rx-ra-message success">

            <CheckCircle2
              size={18}
            />

            <span>
              {success}
            </span>

            <button
              type="button"
              onClick={() =>
                setSuccess("")
              }
            >
              ×
            </button>

          </div>
        )}

        {/* =================================================
            FILTERS
        ================================================== */}

        <section className="rx-ra-filter-card">

          <div className="rx-ra-filter-title">

            <Filter
              size={17}
            />

            <div>

              <strong>
                Report Filters
              </strong>

              <span>
                Export buttons use the
                currently filtered data.
              </span>

            </div>

          </div>

          <div className="rx-ra-search">

            <Search
              size={18}
            />

            <input
              type="text"
              value={search}
              placeholder="Search complaint, student, category, location or assignee..."
              onChange={(event) =>
                setSearch(
                  event.target.value
                )
              }
            />

          </div>

          <div className="rx-ra-filter-grid">

            <label>

              <span>
                Start Date
              </span>

              <div className="rx-ra-control">

                <CalendarDays
                  size={15}
                />

                <input
                  type="date"
                  value={
                    startDate
                  }
                  onChange={(event) =>
                    setStartDate(
                      event.target.value
                    )
                  }
                />

              </div>

            </label>

            <label>

              <span>
                End Date
              </span>

              <div className="rx-ra-control">

                <CalendarDays
                  size={15}
                />

                <input
                  type="date"
                  value={
                    endDate
                  }
                  onChange={(event) =>
                    setEndDate(
                      event.target.value
                    )
                  }
                />

              </div>

            </label>

            <label>

              <span>
                Status
              </span>

              <select
                value={
                  statusFilter
                }
                onChange={(event) =>
                  setStatusFilter(
                    event.target.value
                  )
                }
              >

                <option value="ALL">
                  All Status
                </option>

                <option value="OPEN">
                  Open
                </option>

                <option value="ASSIGNED">
                  Assigned
                </option>

                <option value="IN_PROGRESS">
                  In Progress
                </option>

                <option value="RESOLVED">
                  Resolved
                </option>

                <option value="CLOSED">
                  Closed
                </option>

              </select>

            </label>

            <label>

              <span>
                Priority
              </span>

              <select
                value={
                  priorityFilter
                }
                onChange={(event) =>
                  setPriorityFilter(
                    event.target.value
                  )
                }
              >

                <option value="ALL">
                  All Priority
                </option>

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

            </label>

            <label>

              <span>
                Category
              </span>

              <select
                value={
                  categoryFilter
                }
                onChange={(event) =>
                  setCategoryFilter(
                    event.target.value
                  )
                }
              >

                <option value="ALL">
                  All Categories
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

            </label>

            <label>

              <span>
                Staff / Faculty
              </span>

              <select
                value={
                  assigneeFilter
                }
                onChange={(event) =>
                  setAssigneeFilter(
                    event.target.value
                  )
                }
              >

                <option value="ALL">
                  All Assignees
                </option>

                <option value="UNASSIGNED">
                  Unassigned
                </option>

                {assignableUsers.map(
                  (user) => {
                    const id =
                      getUserId(
                        user
                      );

                    return (
                      <option
                        key={id}
                        value={id}
                      >
                        {user.name}
                        {" — "}
                        {user.role}
                      </option>
                    );
                  }
                )}

              </select>

            </label>

          </div>

          <div className="rx-ra-filter-footer">

            <div>

              <Download
                size={15}
              />

              <span>
                <strong>
                  {
                    filteredComplaints.length
                  }
                </strong>
                {" "}of{" "}
                <strong>
                  {
                    complaints.length
                  }
                </strong>
                {" "}complaints selected
                for report
              </span>

            </div>

            <button
              type="button"
              onClick={
                resetFilters
              }
            >
              Reset Filters
            </button>

          </div>

        </section>

        {/* =================================================
            SUMMARY
        ================================================== */}

        <div className="rx-ra-summary-grid">

          <SummaryCard
            title="Total Complaints"
            value={
              summary.total
            }
            subtitle="Filtered records"
            icon={
              <ClipboardList
                size={21}
              />
            }
            type="dark"
          />

          <SummaryCard
            title="Open"
            value={
              summary.open
            }
            subtitle="Waiting for action"
            icon={
              <Clock3
                size={21}
              />
            }
            type="orange"
          />

          <SummaryCard
            title="In Progress"
            value={
              summary.inProgress
            }
            subtitle="Currently handled"
            icon={
              <Activity
                size={21}
              />
            }
            type="blue"
          />

          <SummaryCard
            title="Resolved"
            value={
              summary.resolved
            }
            subtitle="Issues resolved"
            icon={
              <CheckCircle2
                size={21}
              />
            }
            type="green"
          />

          <SummaryCard
            title="Closed"
            value={
              summary.closed
            }
            subtitle="Completed"
            icon={
              <XCircle
                size={21}
              />
            }
            type="gray"
          />

          <SummaryCard
            title="Urgent"
            value={
              summary.urgent
            }
            subtitle="Urgent priority"
            icon={
              <AlertTriangle
                size={21}
              />
            }
            type="red"
          />

        </div>

        {/* =================================================
            RESOLUTION RATE
        ================================================== */}

        <section className="rx-ra-resolution">

          <div className="rx-ra-resolution-icon">

            <TrendingUp
              size={27}
            />

          </div>

          <div className="rx-ra-resolution-content">

            <span>
              RESOLUTION PERFORMANCE
            </span>

            <h2>
              {
                summary
                  .resolutionRate
              }
              %
            </h2>

            <p>
              {
                summary.completed
              }
              {" "}of{" "}
              {
                summary.total
              }
              {" "}complaints resolved
              or closed.
            </p>

          </div>

          <div className="rx-ra-resolution-bar">

            <div>

              <span
                style={{
                  width:
                    `${summary.resolutionRate}%`,
                }}
              />

            </div>

            <small>
              Resolution Rate
            </small>

          </div>

        </section>

        {/* =================================================
            STATUS + PRIORITY
        ================================================== */}

        <div className="rx-ra-two-grid">

          <AnalyticsCard
            title="Complaints by Status"
            subtitle="Workflow distribution."
            icon={
              <BarChart3
                size={18}
              />
            }
            data={
              statusAnalytics
            }
            total={
              summary.total
            }
          />

          <AnalyticsCard
            title="Complaints by Priority"
            subtitle="Priority distribution."
            icon={
              <AlertTriangle
                size={18}
              />
            }
            data={
              priorityAnalytics
            }
            total={
              summary.total
            }
          />

        </div>

        {/* =================================================
            CATEGORY ANALYTICS
        ================================================== */}

        <section className="rx-ra-panel">

          <div className="rx-ra-panel-heading">

            <div>

              <Layers3
                size={19}
              />

              <div>

                <h2>
                  Complaints by Category
                </h2>

                <p>
                  Categories receiving the
                  most complaints.
                </p>

              </div>

            </div>

          </div>

          {categoryAnalytics.length ===
          0 ? (

            <EmptyState
              text="No category data available."
            />

          ) : (

            <div className="rx-ra-category-list">

              {categoryAnalytics.map(
                (
                  item,
                  index
                ) => {
                  const maximum =
                    categoryAnalytics[
                      0
                    ]?.value ||
                    1;

                  const percentage =
                    Math.round(
                      (
                        item.value /
                        maximum
                      ) * 100
                    );

                  return (
                    <div
                      key={
                        item.label
                      }
                      className="rx-ra-category-row"
                    >

                      <div className="rx-ra-category-number">
                        {index + 1}
                      </div>

                      <div className="rx-ra-category-main">

                        <div className="rx-ra-category-title">

                          <strong>
                            {
                              item.label
                            }
                          </strong>

                          <span>
                            {
                              item.value
                            }
                          </span>

                        </div>

                        <div className="rx-ra-category-bar">

                          <span
                            style={{
                              width:
                                `${percentage}%`,
                            }}
                          />

                        </div>

                      </div>

                    </div>
                  );
                }
              )}

            </div>

          )}

        </section>

        {/* =================================================
            MONTHLY TREND
        ================================================== */}

        <section className="rx-ra-panel">

          <div className="rx-ra-panel-heading">

            <div>

              <TrendingUp
                size={19}
              />

              <div>

                <h2>
                  Monthly Complaint Trend
                </h2>

                <p>
                  Complaint submissions
                  during the last six months.
                </p>

              </div>

            </div>

          </div>

          <MonthlyChart
            data={
              monthlyTrend
            }
          />

        </section>

        {/* =================================================
            STAFF WORKLOAD
        ================================================== */}

        <section className="rx-ra-panel">

          <div className="rx-ra-panel-heading">

            <div>

              <Users
                size={19}
              />

              <div>

                <h2>
                  Staff & Faculty Workload
                </h2>

                <p>
                  Assignment and completion
                  workload.
                </p>

              </div>

            </div>

          </div>

          {staffWorkload.length ===
          0 ? (

            <EmptyState
              text="No Staff or Faculty accounts available."
            />

          ) : (

            <div className="rx-ra-workload-wrap">

              <table className="rx-ra-workload">

                <thead>

                  <tr>
                    <th>
                      Staff / Faculty
                    </th>
                    <th>
                      Role
                    </th>
                    <th>
                      Department
                    </th>
                    <th>
                      Assigned
                    </th>
                    <th>
                      Active
                    </th>
                    <th>
                      Completed
                    </th>
                  </tr>

                </thead>

                <tbody>

                  {staffWorkload.map(
                    (user) => (
                      <tr
                        key={
                          user.id
                        }
                      >

                        <td>

                          <div className="rx-ra-person">

                            <div>
                              {user.name
                                ?.charAt(
                                  0
                                )
                                ?.toUpperCase() ||
                                "U"}
                            </div>

                            <strong>
                              {
                                user.name
                              }
                            </strong>

                          </div>

                        </td>

                        <td>

                          <span className="rx-ra-role">
                            {
                              user.role
                            }
                          </span>

                        </td>

                        <td>
                          {user.department ||
                            "-"}
                        </td>

                        <td>
                          <strong>
                            {
                              user.assigned
                            }
                          </strong>
                        </td>

                        <td>

                          <span className="rx-ra-active-work">
                            {
                              user.active
                            }
                          </span>

                        </td>

                        <td>

                          <span className="rx-ra-completed">
                            {
                              user.resolved
                            }
                          </span>

                        </td>

                      </tr>
                    )
                  )}

                </tbody>

              </table>

            </div>

          )}

        </section>

      </div>

      <style>
        {styles}
      </style>
    </>
  );
};

// ==========================================================
// SUMMARY CARD
// ==========================================================

const SummaryCard = ({
  title,
  value,
  subtitle,
  icon,
  type,
}) => (
  <div className="rx-ra-summary-card">

    <div
      className={`rx-ra-summary-icon ${type}`}
    >
      {icon}
    </div>

    <div>

      <span>
        {title}
      </span>

      <strong>
        {value}
      </strong>

      <small>
        {subtitle}
      </small>

    </div>

  </div>
);

// ==========================================================
// ANALYTICS CARD
// ==========================================================

const AnalyticsCard = ({
  title,
  subtitle,
  icon,
  data,
  total,
}) => (
  <section className="rx-ra-panel">

    <div className="rx-ra-panel-heading">

      <div>

        {icon}

        <div>

          <h2>
            {title}
          </h2>

          <p>
            {subtitle}
          </p>

        </div>

      </div>

    </div>

    <div className="rx-ra-bars">

      {data.map(
        (item) => {
          const percentage =
            total > 0
              ? Math.round(
                  (
                    item.value /
                    total
                  ) * 100
                )
              : 0;

          return (
            <div
              className="rx-ra-bar-row"
              key={
                item.label
              }
            >

              <div className="rx-ra-bar-title">

                <span>
                  {item.label}
                </span>

                <strong>
                  {item.value}
                </strong>

              </div>

              <div className="rx-ra-bar-track">

                <span
                  className={
                    item.className
                  }
                  style={{
                    width:
                      `${percentage}%`,
                  }}
                />

              </div>

              <small>
                {percentage}%
              </small>

            </div>
          );
        }
      )}

    </div>

  </section>
);

// ==========================================================
// MONTHLY CHART
// ==========================================================

const MonthlyChart = ({
  data,
}) => {
  const maxValue =
    Math.max(
      ...data.map(
        (item) =>
          item.value
      ),
      1
    );

  return (
    <div className="rx-ra-month-chart">

      {data.map(
        (item) => {
          const height =
            item.value === 0
              ? 4
              : Math.max(
                  12,
                  Math.round(
                    (
                      item.value /
                      maxValue
                    ) * 100
                  )
                );

          return (
            <div
              className="rx-ra-month"
              key={`${item.year}-${item.month}`}
            >

              <div className="rx-ra-month-value">
                {item.value}
              </div>

              <div className="rx-ra-month-column">

                <span
                  style={{
                    height:
                      `${height}%`,
                  }}
                />

              </div>

              <strong>
                {item.label}
              </strong>

            </div>
          );
        }
      )}

    </div>
  );
};

// ==========================================================
// EMPTY STATE
// ==========================================================

const EmptyState = ({
  text,
}) => (
  <div className="rx-ra-empty">

    <BarChart3
      size={39}
    />

    <p>
      {text}
    </p>

  </div>
);

// ==========================================================
// STYLES
// ==========================================================

const styles = `
.rx-ra-page {
  min-height: calc(100vh - 68px);
  box-sizing: border-box;
  padding: 32px;

  background:
    radial-gradient(
      circle at top right,
      rgba(22,134,93,.07),
      transparent 28%
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

.rx-ra-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;

  gap: 20px;

  margin-bottom: 24px;
}

.rx-ra-eyebrow {
  display: flex;
  align-items: center;

  gap: 7px;

  margin-bottom: 7px;

  color: #16865d;

  font-size: 9px;
  font-weight: 850;
  letter-spacing: 1.2px;
}

.rx-ra-header h1 {
  margin: 0;

  font-size: 34px;
  letter-spacing: -.8px;
}

.rx-ra-header p {
  margin: 6px 0 0;

  color: #7d8982;

  font-size: 11px;
}

.rx-ra-header-actions {
  display: flex;
  align-items: center;

  gap: 8px;

  flex-wrap: wrap;
}

.rx-ra-refresh,
.rx-ra-export {
  min-height: 43px;

  display: flex;
  align-items: center;
  justify-content: center;

  gap: 7px;

  padding: 0 14px;

  border-radius: 10px;

  font-size: 9px;
  font-weight: 800;

  cursor: pointer;
}

.rx-ra-refresh {
  border: 1px solid #dce5e0;

  background: #ffffff;

  color: #46534c;
}

.rx-ra-export.csv {
  border: 1px solid #16865d;

  background: #e8f8f0;

  color: #16865d;
}

.rx-ra-export.pdf {
  border: 1px solid #b84040;

  background: #fff0f0;

  color: #c94747;
}

.rx-ra-refresh:disabled {
  opacity: .6;
  cursor: not-allowed;
}

/* MESSAGES */

.rx-ra-message {
  display: flex;
  align-items: center;

  gap: 8px;

  padding: 12px 14px;

  margin-bottom: 17px;

  border-radius: 10px;

  font-size: 10px;
  font-weight: 700;
}

.rx-ra-message span {
  flex: 1;
}

.rx-ra-message button {
  border: 0;

  background: transparent;

  color: inherit;

  font-size: 18px;

  cursor: pointer;
}

.rx-ra-message.error {
  border: 1px solid #f1cccc;

  background: #fff0f0;

  color: #c94747;
}

.rx-ra-message.success {
  border: 1px solid #cae9d8;

  background: #eaf8f1;

  color: #16865d;
}

/* FILTER */

.rx-ra-filter-card {
  padding: 18px;

  margin-bottom: 19px;

  border: 1px solid #e3ebe7;
  border-radius: 15px;

  background: #ffffff;
}

.rx-ra-filter-title {
  display: flex;
  align-items: center;

  gap: 9px;

  margin-bottom: 14px;

  color: #16865d;
}

.rx-ra-filter-title > div {
  display: flex;
  flex-direction: column;
}

.rx-ra-filter-title strong {
  color: #344139;

  font-size: 11px;
}

.rx-ra-filter-title span {
  margin-top: 2px;

  color: #89948e;

  font-size: 8px;
}

.rx-ra-search {
  min-height: 43px;

  display: flex;
  align-items: center;

  gap: 8px;

  padding: 0 12px;

  margin-bottom: 11px;

  border: 1px solid #dce5e0;
  border-radius: 9px;

  color: #849089;
}

.rx-ra-search input {
  width: 100%;

  border: 0;
  outline: none;

  background: transparent;

  font-size: 10px;
}

.rx-ra-filter-grid {
  display: grid;

  grid-template-columns:
    repeat(3,minmax(0,1fr));

  gap: 10px;
}

.rx-ra-filter-grid label {
  display: flex;
  flex-direction: column;

  gap: 6px;
}

.rx-ra-filter-grid label > span {
  color: #66736c;

  font-size: 8px;
  font-weight: 750;
}

.rx-ra-control,
.rx-ra-filter-grid select {
  min-height: 40px;

  border: 1px solid #dce5e0;
  border-radius: 9px;

  background: #ffffff;
}

.rx-ra-control {
  display: flex;
  align-items: center;

  gap: 7px;

  padding: 0 10px;

  color: #87928c;
}

.rx-ra-control input {
  width: 100%;

  border: 0;
  outline: none;

  background: transparent;

  font-size: 9px;
}

.rx-ra-filter-grid select {
  padding: 0 10px;

  outline: none;

  color: #455249;

  font-size: 9px;
}

.rx-ra-filter-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;

  gap: 10px;

  margin-top: 13px;
  padding-top: 12px;

  border-top: 1px solid #edf1ef;

  color: #89948e;

  font-size: 9px;
}

.rx-ra-filter-footer > div {
  display: flex;
  align-items: center;

  gap: 7px;
}

.rx-ra-filter-footer strong {
  color: #344139;
}

.rx-ra-filter-footer button {
  min-height: 34px;

  padding: 0 11px;

  border: 1px solid #dce5e0;
  border-radius: 8px;

  background: #f8faf9;

  color: #536159;

  font-size: 8px;
  font-weight: 800;

  cursor: pointer;
}

/* SUMMARY */

.rx-ra-summary-grid {
  display: grid;

  grid-template-columns:
    repeat(6,minmax(0,1fr));

  gap: 11px;

  margin-bottom: 18px;
}

.rx-ra-summary-card {
  display: flex;
  align-items: center;

  gap: 10px;

  padding: 15px;

  border: 1px solid #e3ebe7;
  border-radius: 13px;

  background: #ffffff;
}

.rx-ra-summary-icon {
  width: 40px;
  height: 40px;

  display: flex;
  align-items: center;
  justify-content: center;

  flex-shrink: 0;

  border-radius: 10px;
}

.rx-ra-summary-icon.dark {
  background: #edf1ef;
  color: #455249;
}

.rx-ra-summary-icon.orange {
  background: #fff3e6;
  color: #c87922;
}

.rx-ra-summary-icon.blue {
  background: #eaf3ff;
  color: #3672bd;
}

.rx-ra-summary-icon.green {
  background: #e8f8f0;
  color: #16865d;
}

.rx-ra-summary-icon.gray {
  background: #edf1ef;
  color: #68746d;
}

.rx-ra-summary-icon.red {
  background: #fff0f0;
  color: #d04848;
}

.rx-ra-summary-card > div:last-child {
  min-width: 0;

  display: flex;
  flex-direction: column;
}

.rx-ra-summary-card span {
  color: #7c8781;

  font-size: 8px;
}

.rx-ra-summary-card strong {
  margin-top: 1px;

  font-size: 20px;
}

.rx-ra-summary-card small {
  margin-top: 1px;

  color: #9aa39e;

  font-size: 7px;
}

/* RESOLUTION */

.rx-ra-resolution {
  display: grid;

  grid-template-columns:
    auto 1fr 1.5fr;

  align-items: center;

  gap: 17px;

  padding: 20px;

  margin-bottom: 18px;

  border: 1px solid #d6e9df;
  border-radius: 15px;

  background:
    linear-gradient(
      135deg,
      #ffffff,
      #f2fbf6
    );
}

.rx-ra-resolution-icon {
  width: 52px;
  height: 52px;

  display: flex;
  align-items: center;
  justify-content: center;

  border-radius: 14px;

  background: #e5f8ee;

  color: #16865d;
}

.rx-ra-resolution-content span {
  color: #16865d;

  font-size: 8px;
  font-weight: 850;
  letter-spacing: 1px;
}

.rx-ra-resolution-content h2 {
  margin: 3px 0;

  font-size: 28px;
}

.rx-ra-resolution-content p {
  margin: 0;

  color: #7b8780;

  font-size: 8px;
}

.rx-ra-resolution-bar > div {
  height: 10px;

  overflow: hidden;

  border-radius: 999px;

  background: #e0ebe5;
}

.rx-ra-resolution-bar > div span {
  display: block;

  height: 100%;

  border-radius: inherit;

  background:
    linear-gradient(
      90deg,
      #16865d,
      #37b47f
    );
}

.rx-ra-resolution-bar small {
  display: block;

  margin-top: 6px;

  color: #89948e;

  font-size: 8px;

  text-align: right;
}

/* PANELS */

.rx-ra-two-grid {
  display: grid;

  grid-template-columns:
    repeat(2,minmax(0,1fr));

  gap: 16px;

  margin-bottom: 16px;
}

.rx-ra-panel {
  margin-bottom: 16px;

  overflow: hidden;

  border: 1px solid #e3ebe7;
  border-radius: 15px;

  background: #ffffff;
}

.rx-ra-panel-heading {
  padding: 17px 19px;

  border-bottom: 1px solid #edf1ef;
}

.rx-ra-panel-heading > div {
  display: flex;
  align-items: center;

  gap: 9px;

  color: #16865d;
}

.rx-ra-panel-heading h2 {
  margin: 0;

  color: #344139;

  font-size: 14px;
}

.rx-ra-panel-heading p {
  margin: 3px 0 0;

  color: #89948e;

  font-size: 8px;
}

/* ANALYTICS BARS */

.rx-ra-bars {
  display: flex;
  flex-direction: column;

  gap: 15px;

  padding: 19px;
}

.rx-ra-bar-row {
  display: grid;

  grid-template-columns:
    100px 1fr 38px;

  align-items: center;

  gap: 10px;
}

.rx-ra-bar-title {
  display: flex;
  justify-content: space-between;

  gap: 5px;

  color: #536159;

  font-size: 8px;
}

.rx-ra-bar-title strong {
  color: #344139;
}

.rx-ra-bar-track {
  height: 9px;

  overflow: hidden;

  border-radius: 999px;

  background: #edf1ef;
}

.rx-ra-bar-track span {
  display: block;

  height: 100%;

  border-radius: inherit;
}

.rx-ra-bar-track .green {
  background: #35a976;
}

.rx-ra-bar-track .blue {
  background: #4a85cd;
}

.rx-ra-bar-track .orange {
  background: #d49342;
}

.rx-ra-bar-track .red {
  background: #d85b5b;
}

.rx-ra-bar-track .purple {
  background: #846ac8;
}

.rx-ra-bar-track .gray {
  background: #7e8b84;
}

.rx-ra-bar-row > small {
  color: #89948e;

  font-size: 8px;

  text-align: right;
}

/* CATEGORY */

.rx-ra-category-list {
  display: flex;
  flex-direction: column;

  gap: 13px;

  padding: 19px;
}

.rx-ra-category-row {
  display: flex;
  align-items: center;

  gap: 11px;
}

.rx-ra-category-number {
  width: 28px;
  height: 28px;

  display: flex;
  align-items: center;
  justify-content: center;

  flex-shrink: 0;

  border-radius: 8px;

  background: #edf7f2;

  color: #16865d;

  font-size: 8px;
  font-weight: 850;
}

.rx-ra-category-main {
  flex: 1;
}

.rx-ra-category-title {
  display: flex;
  justify-content: space-between;

  gap: 10px;

  margin-bottom: 6px;
}

.rx-ra-category-title strong {
  color: #455249;

  font-size: 9px;
}

.rx-ra-category-title span {
  color: #16865d;

  font-size: 9px;
  font-weight: 850;
}

.rx-ra-category-bar {
  height: 8px;

  overflow: hidden;

  border-radius: 999px;

  background: #edf1ef;
}

.rx-ra-category-bar span {
  display: block;

  height: 100%;

  border-radius: inherit;

  background:
    linear-gradient(
      90deg,
      #16865d,
      #55c28f
    );
}

/* MONTHLY CHART */

.rx-ra-month-chart {
  height: 265px;

  display: grid;

  grid-template-columns:
    repeat(6,1fr);

  align-items: end;

  gap: 17px;

  padding:
    25px
    30px
    20px;
}

.rx-ra-month {
  height: 100%;

  display: flex;
  flex-direction: column;
  align-items: center;

  gap: 7px;
}

.rx-ra-month-value {
  color: #536159;

  font-size: 8px;
  font-weight: 850;
}

.rx-ra-month-column {
  width: 55px;

  flex: 1;

  display: flex;
  align-items: flex-end;

  overflow: hidden;

  border-radius:
    10px
    10px
    4px
    4px;

  background:
    linear-gradient(
      180deg,
      #f1f6f3,
      #e9efec
    );
}

.rx-ra-month-column span {
  width: 100%;

  min-height: 4px;

  border-radius:
    9px
    9px
    3px
    3px;

  background:
    linear-gradient(
      180deg,
      #2bae79,
      #16865d
    );
}

.rx-ra-month strong {
  color: #66736c;

  font-size: 8px;
}

/* WORKLOAD */

.rx-ra-workload-wrap {
  overflow-x: auto;
}

.rx-ra-workload {
  width: 100%;

  min-width: 850px;

  border-collapse: collapse;
}

.rx-ra-workload th {
  padding:
    11px
    15px;

  background: #f8faf9;

  color: #7b8780;

  text-align: left;

  font-size: 8px;
}

.rx-ra-workload td {
  padding:
    13px
    15px;

  border-top:
    1px solid #edf1ef;

  color: #536159;

  font-size: 9px;
}

.rx-ra-person {
  display: flex;
  align-items: center;

  gap: 8px;
}

.rx-ra-person > div {
  width: 30px;
  height: 30px;

  display: flex;
  align-items: center;
  justify-content: center;

  border-radius: 8px;

  background: #e8f8f0;

  color: #16865d;

  font-size: 9px;
  font-weight: 850;
}

.rx-ra-person strong {
  color: #344139;
}

.rx-ra-role {
  display: inline-flex;

  padding:
    4px
    7px;

  border-radius: 999px;

  background: #eef4ff;

  color: #4770aa;

  font-size: 7px;
  font-weight: 800;
}

.rx-ra-active-work {
  display: inline-flex;

  min-width: 28px;

  justify-content: center;

  padding:
    4px
    7px;

  border-radius: 999px;

  background: #fff3e6;

  color: #c87922;

  font-weight: 850;
}

.rx-ra-completed {
  display: inline-flex;

  min-width: 28px;

  justify-content: center;

  padding:
    4px
    7px;

  border-radius: 999px;

  background: #e8f8f0;

  color: #16865d;

  font-weight: 850;
}

/* EMPTY */

.rx-ra-empty {
  display: flex;
  flex-direction: column;
  align-items: center;

  gap: 7px;

  padding: 45px;

  color: #97a19b;

  text-align: center;
}

.rx-ra-empty p {
  margin: 0;

  font-size: 9px;
}

/* CENTER */

.rx-ra-center {
  min-height: 70vh;

  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  padding: 20px;

  color: #7d8982;

  text-align: center;
}

.rx-ra-center h2 {
  margin:
    12px
    0
    5px;

  color: #344139;
}

.rx-ra-center p {
  margin: 0;
}

.rx-ra-spinner {
  width: 36px;
  height: 36px;

  margin-bottom: 12px;

  border:
    4px solid
    #dceae3;

  border-top-color:
    #16865d;

  border-radius:
    50%;

  animation:
    rxRaSpin
    .8s
    linear
    infinite;
}

.rx-ra-spin {
  animation:
    rxRaSpin
    .8s
    linear
    infinite;
}

@keyframes rxRaSpin {
  to {
    transform:
      rotate(360deg);
  }
}

/* RESPONSIVE */

@media(max-width:1250px) {
  .rx-ra-summary-grid {
    grid-template-columns:
      repeat(3,1fr);
  }
}

@media(max-width:950px) {
  .rx-ra-header {
    flex-direction:
      column;
  }

  .rx-ra-header-actions {
    width: 100%;
  }

  .rx-ra-two-grid {
    grid-template-columns:
      1fr;
  }

  .rx-ra-filter-grid {
    grid-template-columns:
      repeat(2,1fr);
  }

  .rx-ra-resolution {
    grid-template-columns:
      auto 1fr;
  }

  .rx-ra-resolution-bar {
    grid-column:
      1 / -1;
  }
}

@media(max-width:700px) {
  .rx-ra-page {
    padding:
      20px
      15px;
  }

  .rx-ra-header-actions {
    display: grid;

    grid-template-columns:
      1fr;
  }

  .rx-ra-summary-grid,
  .rx-ra-filter-grid {
    grid-template-columns:
      1fr;
  }

  .rx-ra-filter-footer {
    align-items:
      stretch;

    flex-direction:
      column;
  }

  .rx-ra-filter-footer button {
    min-height:
      38px;
  }

  .rx-ra-resolution {
    grid-template-columns:
      1fr;
  }

  .rx-ra-month-chart {
    gap: 7px;

    padding:
      20px
      10px;
  }

  .rx-ra-month-column {
    width: 32px;
  }

  .rx-ra-bar-row {
    grid-template-columns:
      80px
      1fr
      32px;
  }
}
`;

export default ReportsAnalytics;