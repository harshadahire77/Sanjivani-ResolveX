export const currentUser = {
  id: 1,
  name: "Harshad Ahire",
  universityId: "SU2026AIDS001",
  email: "harshad@example.com",
  phone: "9876543210",
  role: "STUDENT",
  department:
    "Artificial Intelligence & Data Science",
  program: "B.Tech AI & DS",
  year: "Second Year",
};

const defaultComplaints = [
  {
    id: "SU-CMP-1024",
    title:
      "Wi-Fi not working in AI & DS Lab",
    description:
      "The Wi-Fi connection in the AI & DS laboratory is unavailable and students are unable to access online resources.",
    category: "IT & Network",
    location: "AI & DS Lab",
    priority: "Normal",
    status: "In Progress",
    createdAt: "16 Sep 2026",
    updatedAt: "16 Sep 2026",
    assignedTo:
      "IT & Network Support",
    progress: 60,
  },

  {
    id: "SU-CMP-1023",
    title:
      "Water leakage in hostel",
    description:
      "Water is leaking continuously from a pipeline near the hostel washroom.",
    category:
      "Plumbing & Water",
    location:
      "Boys Hostel - Block A",
    priority: "High",
    status: "Assigned",
    createdAt: "15 Sep 2026",
    updatedAt: "16 Sep 2026",
    assignedTo:
      "Maintenance Department",
    progress: 35,
  },

  {
    id: "SU-CMP-1022",
    title:
      "Projector not working",
    description:
      "The classroom projector is not displaying the laptop screen.",
    category:
      "Classroom & Lab",
    location:
      "Academic Block - Room 204",
    priority: "Normal",
    status: "Resolved",
    createdAt: "13 Sep 2026",
    updatedAt: "14 Sep 2026",
    assignedTo:
      "Technical Support",
    progress: 100,
  },

  {
    id: "SU-CMP-1021",
    title:
      "Classroom fan not working",
    description:
      "Two ceiling fans are not working in the classroom.",
    category: "Electrical",
    location:
      "Academic Block - Room 301",
    priority: "Low",
    status: "Submitted",
    createdAt: "12 Sep 2026",
    updatedAt: "12 Sep 2026",
    assignedTo:
      "Not Assigned",
    progress: 10,
  },
];

export const defaultNotifications = [
  {
    id: 1,
    title:
      "Complaint assigned",
    message:
      "SU-CMP-1024 has been assigned to IT & Network Support.",
    time:
      "10 minutes ago",
    read: false,
  },

  {
    id: 2,
    title:
      "Status updated",
    message:
      "SU-CMP-1023 status changed to Assigned.",
    time:
      "1 hour ago",
    read: false,
  },

  {
    id: 3,
    title:
      "Complaint resolved",
    message:
      "SU-CMP-1022 has been successfully resolved.",
    time:
      "Yesterday",
    read: false,
  },

  {
    id: 4,
    title:
      "Welcome to Sanjivani ResolveX",
    message:
      "Your ResolveX account is ready.",
    time:
      "3 days ago",
    read: true,
  },
];

export function getComplaints() {
  try {
    const saved =
      localStorage.getItem(
        "resolvex-complaints"
      );

    if (saved) {
      return JSON.parse(saved);
    }

    localStorage.setItem(
      "resolvex-complaints",
      JSON.stringify(
        defaultComplaints
      )
    );

    return defaultComplaints;
  } catch {
    return defaultComplaints;
  }
}

export function saveComplaint(
  complaint
) {
  const complaints =
    getComplaints();

  const updated = [
    complaint,
    ...complaints,
  ];

  localStorage.setItem(
    "resolvex-complaints",
    JSON.stringify(updated)
  );

  return complaint;
}

export function getComplaintById(
  id
) {
  return getComplaints().find(
    (complaint) =>
      complaint.id === id
  );
}