import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  ArrowRight,
  BarChart3,
  Bell,
  BookOpen,
  Building2,
  Bus,
  Check,
  CheckCircle2,
  ChevronDown,
  Clock3,
  Menu,
  Monitor,
  Moon,
  Search,
  ShieldCheck,
  Sparkles,
  Sun,
  Users,
  Wrench,
  X,
  Zap,
} from "lucide-react";

import resolveXMark from "../assets/resolvex-mark.png";

/* =========================================================
   DATA
========================================================= */

const services = [
  {
    icon: Monitor,
    title: "IT & Network",
    text: "Report Wi-Fi, computers, software, ERP and network-related campus issues.",
  },
  {
    icon: Building2,
    title: "Classroom & Lab",
    text: "Report classroom, laboratory, furniture, projector and equipment issues.",
  },
  {
    icon: Zap,
    title: "Electrical",
    text: "Report lights, fans, switches, power supply and other electrical problems.",
  },
  {
    icon: Wrench,
    title: "Plumbing & Water",
    text: "Report water supply, leakage, taps, washrooms and plumbing problems.",
  },
  {
    icon: Sparkles,
    title: "Cleanliness",
    text: "Report cleanliness and sanitation issues across the university campus.",
  },
  {
    icon: Building2,
    title: "Hostel",
    text: "Report hostel room, water, electricity, furniture and maintenance issues.",
  },
  {
    icon: BookOpen,
    title: "Library",
    text: "Report library resources, systems, seating and facility-related issues.",
  },
  {
    icon: Bus,
    title: "Transport",
    text: "Report university bus, route, timing and transportation-related issues.",
  },
];

const steps = [
  {
    number: "01",
    title: "Report",
    text: "Student, faculty or staff reports a campus issue with the required details.",
  },
  {
    number: "02",
    title: "Assign",
    text: "ResolveX forwards the complaint to the appropriate university department.",
  },
  {
    number: "03",
    title: "Track",
    text: "The user follows complaint progress and receives status updates.",
  },
  {
    number: "04",
    title: "Resolve",
    text: "The service team resolves the issue and closes the complaint.",
  },
];

const faqs = [
  {
    question: "What does ResolveX mean?",
    answer:
      "Resolve means solving or fixing a problem, while X represents any campus issue. ResolveX therefore means resolving any campus issue efficiently.",
  },
  {
    question: "Who can use Sanjivani ResolveX?",
    answer:
      "Sanjivani ResolveX is designed for Sanjivani University students, faculty members and university staff.",
  },
  {
    question: "How do I submit a complaint?",
    answer:
      "Create an account, sign in, select the correct campus service category, choose the location and describe your issue.",
  },
  {
    question: "How can I track my complaint?",
    answer:
      "Enter your complaint ID in the Track Complaint section or sign in to view all complaints submitted from your account.",
  },
  {
    question: "Who handles my complaint?",
    answer:
      "ResolveX assigns the complaint to the appropriate university department or service staff according to the selected category.",
  },
  {
    question: "Will I receive complaint updates?",
    answer:
      "Yes. The system is designed to show progress from submission and assignment through final resolution.",
  },
];

/* =========================================================
   MAIN
========================================================= */

function LandingPage() {
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  const [homeMenuOpen, setHomeMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("resolvex-theme") === "dark";
  });

  const [complaintId, setComplaintId] = useState("");
  const [trackError, setTrackError] = useState("");
  const [trackResult, setTrackResult] = useState(null);

  const [openFaq, setOpenFaq] = useState(null);

  /* THEME */

  useEffect(() => {
    const theme = darkMode ? "dark" : "light";

    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("resolvex-theme", theme);
  }, [darkMode]);

  /* SCROLL ANIMATION */

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("show");
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.12,
      }
    );

    const elements = document.querySelectorAll(".reveal");

    elements.forEach((element) => {
      observer.observe(element);
    });

    return () => observer.disconnect();
  }, []);

  /* CLOSE DROPDOWN */

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        setHomeMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };
  }, []);

  const scrollToSection = (id) => {
    document.getElementById(id)?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });

    setHomeMenuOpen(false);
    setMobileMenuOpen(false);
  };

  const toggleTheme = () => {
    setDarkMode((current) => !current);
  };

  const handleTrack = (event) => {
    event.preventDefault();

    const value = complaintId.trim();

    if (!value) {
      setTrackError("Please enter your complaint ID.");
      setTrackResult(null);
      return;
    }

    setTrackError("");

    /* Temporary demo data */

    setTrackResult({
      id: value.toUpperCase(),
      title: "Wi-Fi not working in AI & DS Lab",
      department: "IT & Network Support",
      location: "Academic Block",
      priority: "Normal",
      status: "In Progress",
    });
  };

  return (
    <div className="site">
      {/* BACKGROUND */}

      <div
        className="background-decoration"
        aria-hidden="true"
      >
        <div className="background-dot dot-one" />
        <div className="background-dot dot-two" />
      </div>

      {/* =====================================================
          NAVBAR
      ===================================================== */}

      <header className="navbar">
        <div className="container navbar-inner">
          <button
            className="brand"
            onClick={() => scrollToSection("home")}
          >
            <img
              src={resolveXMark}
              alt="Sanjivani ResolveX"
              className="brand-mark"
            />

            <span className="brand-name">
              Sanjivani Resolve<span>X</span>
            </span>
          </button>

          <div className="navbar-right">
            <div
              className="home-dropdown"
              ref={dropdownRef}
            >
              <button
                className="nav-home-button"
                onClick={() =>
                  setHomeMenuOpen((current) => !current)
                }
              >
                Home

                <ChevronDown
                  size={17}
                  className={
                    homeMenuOpen
                      ? "chevron rotate"
                      : "chevron"
                  }
                />
              </button>

              {homeMenuOpen && (
                <div className="dropdown-menu">
                  <span className="dropdown-title">
                    Page Sections
                  </span>

                  <button
                    onClick={() =>
                      scrollToSection("services")
                    }
                  >
                    Campus Services
                  </button>

                  <button
                    onClick={() =>
                      scrollToSection("how-it-works")
                    }
                  >
                    How It Works
                  </button>

                  <button
                    onClick={() =>
                      scrollToSection("track")
                    }
                  >
                    Track Complaint
                  </button>

                  <button
                    onClick={() =>
                      scrollToSection("faq")
                    }
                  >
                    FAQ
                  </button>
                </div>
              )}
            </div>

            <button
              className="theme-button"
              onClick={toggleTheme}
              aria-label="Toggle theme"
            >
              {darkMode ? (
                <Sun size={19} />
              ) : (
                <Moon size={19} />
              )}
            </button>

            <button
              className="nav-signin"
              onClick={() => navigate("/login")}
            >
              Sign In
            </button>

            <button
              className="nav-register"
              onClick={() => navigate("/register")}
            >
              Register
            </button>

            <button
              className="mobile-menu-button"
              onClick={() =>
                setMobileMenuOpen((current) => !current)
              }
              aria-label="Menu"
            >
              {mobileMenuOpen ? (
                <X size={22} />
              ) : (
                <Menu size={22} />
              )}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="mobile-menu">
            <button onClick={() => scrollToSection("home")}>
              Home
            </button>

            <button onClick={() => scrollToSection("services")}>
              Campus Services
            </button>

            <button
              onClick={() =>
                scrollToSection("how-it-works")
              }
            >
              How It Works
            </button>

            <button onClick={() => scrollToSection("track")}>
              Track Complaint
            </button>

            <button onClick={() => scrollToSection("faq")}>
              FAQ
            </button>

            <div className="mobile-controls">
              <button
                className="mobile-theme-button"
                onClick={toggleTheme}
              >
                {darkMode ? (
                  <>
                    <Sun size={18} />
                    Light Mode
                  </>
                ) : (
                  <>
                    <Moon size={18} />
                    Dark Mode
                  </>
                )}
              </button>

              <button onClick={() => navigate("/login")}>
                Sign In
              </button>

              <button
                className="mobile-register"
                onClick={() => navigate("/register")}
              >
                Register
              </button>
            </div>
          </div>
        )}
      </header>

      <main>
        {/* ===================================================
            HERO
        =================================================== */}

        <section id="home" className="hero-section">
          <div className="container hero-container">
            <div className="hero-content hero-enter">
              <div className="hero-badge">
                <span className="live-dot" />

                SANJIVANI RESOLVEX
              </div>

              <h1>
                Campus issues.
                <br />

                <span>
                  Resolved smarter.
                </span>
              </h1>

              <p>
                Sanjivani ResolveX is a Smart Campus Complaint
                & Service Request Management System that helps
                Sanjivani University students, faculty and staff
                report issues, track progress and stay informed
                until resolution.
              </p>

              <div className="hero-buttons">
                <button
                  className="main-button"
                  onClick={() => navigate("/register")}
                >
                  Report a Complaint

                  <ArrowRight size={18} />

                  <span className="button-glare" />
                </button>

                <button
                  className="outline-button"
                  onClick={() =>
                    scrollToSection("track")
                  }
                >
                  <Search size={18} />

                  Track Complaint
                </button>
              </div>

              <div className="hero-benefits">
                <span>
                  <Check size={15} />
                  Report
                </span>

                <span>
                  <Check size={15} />
                  Track
                </span>

                <span>
                  <Check size={15} />
                  Resolve
                </span>
              </div>
            </div>

            {/* DASHBOARD PREVIEW */}

            <div className="preview-wrapper hero-preview-enter">
              <div className="preview-window">
                <div className="preview-window-header">
                  <div className="window-dots">
                    <span />
                    <span />
                    <span />
                  </div>

                  <span className="window-title">
                    Sanjivani ResolveX
                  </span>

                  <div className="preview-avatar">
                    SU
                  </div>
                </div>

                <div className="preview-body">
                  <aside className="preview-sidebar">
                    <div className="preview-sidebar-logo">
                      <CheckCircle2 size={18} />
                    </div>

                    <span className="active">
                      <BarChart3 size={18} />
                    </span>

                    <span>
                      <Monitor size={18} />
                    </span>

                    <span>
                      <Wrench size={18} />
                    </span>

                    <span>
                      <Bell size={18} />
                    </span>
                  </aside>

                  <div className="preview-main">
                    <div className="preview-heading">
                      <div>
                        <span>
                          SMART CAMPUS COMPLAINT MANAGEMENT
                        </span>

                        <h3>
                          Sanjivani ResolveX
                        </h3>
                      </div>

                      <button>
                        + New Complaint
                      </button>
                    </div>

                    <div className="preview-stats">
                      <PreviewStat value="24" label="Total" />
                      <PreviewStat value="06" label="Open" />
                      <PreviewStat value="04" label="Working" />
                      <PreviewStat value="14" label="Resolved" />
                    </div>

                    <div className="preview-content-grid">
                      <div className="preview-list">
                        <div className="preview-card-title">
                          <div>
                            <strong>
                              Recent Campus Complaints
                            </strong>

                            <span>
                              Latest service requests
                            </span>
                          </div>

                          <button>
                            View all
                          </button>
                        </div>

                        <ComplaintPreview
                          title="Wi-Fi not working in Lab"
                          category="IT & Network"
                          status="In Progress"
                          type="working"
                        />

                        <ComplaintPreview
                          title="Water leakage in Hostel"
                          category="Hostel"
                          status="High"
                          type="high"
                        />

                        <ComplaintPreview
                          title="Projector issue in Classroom"
                          category="Classroom & Lab"
                          status="Resolved"
                          type="resolved"
                        />
                      </div>

                      <div className="preview-performance">
                        <span>
                          RESOLUTION RATE
                        </span>

                        <div className="score-circle">
                          <div>
                            <strong>94%</strong>
                            <span>Excellent</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="floating-status floating-one">
                <CheckCircle2 size={18} />

                <div>
                  <strong>Resolved</strong>
                  <span>SU-CMP-1024</span>
                </div>
              </div>

              <div className="floating-status floating-two">
                <Clock3 size={18} />

                <div>
                  <strong>In Progress</strong>
                  <span>IT Team Assigned</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ===================================================
            SERVICES
        =================================================== */}

        <section id="services" className="section">
          <div className="container">
            <SectionHeading
              label="CAMPUS SERVICES"
              title="What can you report?"
              text="Choose the Sanjivani University service category that best matches your campus issue."
            />

            <div className="services-grid">
              {services.map((service) => {
                const Icon = service.icon;

                return (
                  <article
                    className="service-card reveal"
                    key={service.title}
                  >
                    <div className="service-icon">
                      <Icon size={23} />
                    </div>

                    <h3>{service.title}</h3>

                    <p>{service.text}</p>

                    <span className="service-link">
                      Report Issue
                      <ArrowRight size={14} />
                    </span>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        {/* ===================================================
            HOW IT WORKS
        =================================================== */}

        <section
          id="how-it-works"
          className="section process-section"
        >
          <div className="container">
            <SectionHeading
              label="REPORT. TRACK. RESOLVE."
              title="A simple path from issue to solution"
              text="Every complaint follows a clear process from reporting to final resolution."
            />

            <div className="process-grid">
              {steps.map((step, index) => (
                <article
                  className="process-card reveal"
                  key={step.number}
                >
                  <div className="process-number">
                    {step.number}
                  </div>

                  <h3>{step.title}</h3>

                  <p>{step.text}</p>

                  {index < steps.length - 1 && (
                    <div className="process-line" />
                  )}
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* ===================================================
            TRACK
        =================================================== */}

        <section
          id="track"
          className="section track-section"
        >
          <div className="container track-layout">
            <div className="track-copy reveal">
              <span className="section-kicker">
                TRACK CAMPUS COMPLAINT
              </span>

              <h2>
                Know exactly what is happening with your request.
              </h2>

              <p>
                Enter your Sanjivani ResolveX complaint ID to
                check its current progress.
              </p>

              <form
                className="track-form"
                onSubmit={handleTrack}
              >
                <label htmlFor="complaint-id">
                  Complaint ID
                </label>

                <div className="track-field">
                  <Search size={19} />

                  <input
                    id="complaint-id"
                    type="text"
                    placeholder="Example: SU-CMP-1024"
                    value={complaintId}
                    onChange={(event) =>
                      setComplaintId(event.target.value)
                    }
                  />

                  <button type="submit">
                    Track
                  </button>
                </div>

                {trackError && (
                  <span className="track-error">
                    {trackError}
                  </span>
                )}
              </form>
            </div>

            <div className="track-result reveal">
              {!trackResult ? (
                <div className="track-empty">
                  <div className="track-empty-icon">
                    <Search size={26} />
                  </div>

                  <h3>
                    Track your complaint
                  </h3>

                  <p>
                    Enter your complaint ID to view its current
                    progress.
                  </p>
                </div>
              ) : (
                <>
                  <div className="result-header">
                    <div>
                      <span>COMPLAINT ID</span>
                      <strong>{trackResult.id}</strong>
                    </div>

                    <span className="result-badge">
                      {trackResult.status}
                    </span>
                  </div>

                  <h3 className="result-title">
                    {trackResult.title}
                  </h3>

                  <ResultRow
                    label="Department"
                    value={trackResult.department}
                  />

                  <ResultRow
                    label="Location"
                    value={trackResult.location}
                  />

                  <ResultRow
                    label="Priority"
                    value={trackResult.priority}
                  />

                  <ResultRow
                    label="Status"
                    value={trackResult.status}
                  />

                  <div className="result-progress">
                    <div />
                  </div>
                </>
              )}
            </div>
          </div>
        </section>

        {/* ===================================================
            WHY RESOLVEX
        =================================================== */}

        <section className="section benefits-section">
          <div className="container benefits-layout">
            <div className="benefits-copy reveal">
              <span className="section-kicker">
                WHY RESOLVEX?
              </span>

              <h2>
                Resolve any campus issue efficiently.
              </h2>

              <p>
                “Resolve” represents solving or fixing a
                problem, while “X” represents any campus issue.
                Together, ResolveX represents a system designed
                to resolve any campus complaint.
              </p>
            </div>

            <div className="benefits-list">
              <BenefitItem
                icon={<CheckCircle2 size={20} />}
                title="Campus focused"
                text="Designed for Sanjivani University campus complaints."
              />

              <BenefitItem
                icon={<Bell size={20} />}
                title="Status updates"
                text="Follow the complaint from submission to resolution."
              />

              <BenefitItem
                icon={<ShieldCheck size={20} />}
                title="Role-based access"
                text="Separate access for students, faculty, staff and administrators."
              />

              <BenefitItem
                icon={<BarChart3 size={20} />}
                title="Better management"
                text="Reports and analytics help improve university services."
              />
            </div>
          </div>
        </section>

        {/* ===================================================
            FAQ
        =================================================== */}

        <section
          id="faq"
          className="section faq-section"
        >
          <div className="container faq-layout">
            <div className="faq-copy reveal">
              <span className="section-kicker">
                FAQ
              </span>

              <h2>
                Frequently asked questions
              </h2>

              <p>
                Common questions about Sanjivani ResolveX.
              </p>
            </div>

            <div className="faq-list reveal">
              {faqs.map((faq, index) => {
                const opened = openFaq === index;

                return (
                  <div
                    className={`faq-item ${
                      opened ? "open" : ""
                    }`}
                    key={faq.question}
                  >
                    <button
                      className="faq-question"
                      onClick={() =>
                        setOpenFaq(
                          opened ? null : index
                        )
                      }
                    >
                      <span>{faq.question}</span>

                      <ChevronDown
                        size={19}
                        className={
                          opened ? "rotate" : ""
                        }
                      />
                    </button>

                    {opened && (
                      <div className="faq-answer">
                        {faq.answer}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ===================================================
            CTA
        =================================================== */}

        <section className="cta-section">
          <div className="container">
            <div className="cta-card reveal">
              <span>
                SANJIVANI RESOLVEX
              </span>

              <h2>
                Report. Track. Resolve.
              </h2>

              <p>
                Smart Campus Complaint & Service Request
                Management System for Sanjivani University.
              </p>

              <button
                onClick={() => navigate("/register")}
              >
                Get Started

                <ArrowRight size={18} />
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* =====================================================
          FOOTER
      ===================================================== */}

      <footer className="footer">
        <div className="container footer-main">
          <div className="footer-brand">
            <button
              className="footer-brand-button"
              onClick={() => scrollToSection("home")}
            >
              <img
                src={resolveXMark}
                alt="Sanjivani ResolveX"
                className="footer-brand-mark"
              />

              <span>
                Sanjivani Resolve<span>X</span>
              </span>
            </button>

            <p>
              Smart Campus Complaint & Service Request Management
              System for Sanjivani University.
            </p>

            <div className="footer-socials">
              <SocialLink
                href="https://github.com/harshadahire77"
                title="GitHub"
              >
                <GitHubIcon />
              </SocialLink>

              <SocialLink
                href="https://harshadahire.vercel.app/"
                title="Portfolio"
              >
                <PortfolioIcon />
              </SocialLink>

              <SocialLink
                href="https://www.linkedin.com/in/harshad-ahire/"
                title="LinkedIn"
              >
                <LinkedInIcon />
              </SocialLink>

              <SocialLink
                href="https://x.com/Harshadahire05"
                title="X"
              >
                <XSocialIcon />
              </SocialLink>
            </div>
          </div>

          <div className="footer-column">
            <h4>Product</h4>

            <button onClick={() => scrollToSection("home")}>
              Home
            </button>

            <button onClick={() => scrollToSection("services")}>
              Campus Services
            </button>

            <button
              onClick={() =>
                scrollToSection("how-it-works")
              }
            >
              How It Works
            </button>

            <button onClick={() => scrollToSection("track")}>
              Track Complaint
            </button>
          </div>

          <div className="footer-column">
            <h4>Account</h4>

            <button onClick={() => navigate("/login")}>
              Sign In
            </button>

            <button onClick={() => navigate("/register")}>
              Register
            </button>

            <button onClick={() => scrollToSection("faq")}>
              FAQ
            </button>
          </div>
        </div>

        <div className="container footer-border" />

        <div className="container footer-bottom">
          <p>
            © 2026 Sanjivani ResolveX — Smart Campus Complaint
            & Service Request Management System. Created by{" "}
            <a
              href="https://harshadahire.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
            >
              <strong>Harshad Ahire</strong>
            </a>{" "}
            as a DBMS Project.
          </p>
        </div>
      </footer>
    </div>
  );
}

/* =========================================================
   COMPONENTS
========================================================= */

function SectionHeading({ label, title, text }) {
  return (
    <div className="section-heading reveal">
      <span>{label}</span>
      <h2>{title}</h2>
      <p>{text}</p>
    </div>
  );
}

function PreviewStat({ value, label }) {
  return (
    <div className="preview-stat">
      <strong>{value}</strong>
      <span>{label}</span>
    </div>
  );
}

function ComplaintPreview({
  title,
  category,
  status,
  type,
}) {
  return (
    <div className="complaint-preview">
      <div className="complaint-preview-icon">
        <Wrench size={15} />
      </div>

      <div className="complaint-preview-copy">
        <strong>{title}</strong>
        <span>{category}</span>
      </div>

      <span className={`complaint-status ${type}`}>
        {status}
      </span>
    </div>
  );
}

function ResultRow({ label, value }) {
  return (
    <div className="result-row">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function BenefitItem({ icon, title, text }) {
  return (
    <article className="benefit-item reveal">
      <div className="benefit-icon">
        {icon}
      </div>

      <div>
        <h3>{title}</h3>
        <p>{text}</p>
      </div>
    </article>
  );
}

function SocialLink({
  href,
  title,
  children,
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      title={title}
      aria-label={title}
    >
      {children}
    </a>
  );
}

/* =========================================================
   SOCIAL ICONS
========================================================= */

function GitHubIcon({ size = 20 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
    >
      <path d="M12 .7C5.7.7.6 5.8.6 12.1c0 5 3.3 9.3 7.8 10.8.6.1.8-.3.8-.6v-2.2c-3.2.7-3.9-1.4-3.9-1.4-.5-1.3-1.3-1.7-1.3-1.7-1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1 1.8 2.7 1.3 3.4 1 .1-.8.4-1.3.8-1.6-2.6-.3-5.3-1.3-5.3-5.7 0-1.3.5-2.3 1.2-3.1-.1-.3-.5-1.5.1-3.1 0 0 1-.3 3.2 1.2a11 11 0 0 1 5.8 0C15.9 4.7 17 5 17 5c.6 1.6.2 2.8.1 3.1.8.8 1.2 1.8 1.2 3.1 0 4.4-2.7 5.4-5.3 5.7.4.4.8 1.1.8 2.1v3.2c0 .4.2.8.8.6a11.5 11.5 0 0 0 7.8-10.8C23.4 5.8 18.3.7 12 .7Z" />
    </svg>
  );
}

function PortfolioIcon({ size = 20 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M15 3h6v6" />
      <path d="M10 14 21 3" />
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
    </svg>
  );
}

function LinkedInIcon({ size = 20 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
    >
      <path d="M5.3 3.6A2.3 2.3 0 1 1 .7 3.6a2.3 2.3 0 0 1 4.6 0ZM1.1 7.2h4.3V21H1.1V7.2ZM8.1 7.2h4.1v1.9h.1c.6-1.1 2-2.3 4.1-2.3 4.4 0 5.2 2.9 5.2 6.7V21h-4.3v-6.6c0-1.6 0-3.6-2.2-3.6s-2.6 1.7-2.6 3.5V21H8.1V7.2Z" />
    </svg>
  );
}

function XSocialIcon({ size = 20 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
    >
      <path d="M18.9 2H22l-6.8 7.8L23.2 22H17l-4.9-6.4L6.5 22H3.4l7.2-8.3L2.9 2h6.3l4.4 5.8L18.9 2Zm-1.1 17.9h1.7L8.3 4H6.5l11.3 15.9Z" />
    </svg>
  );
}

export default LandingPage;