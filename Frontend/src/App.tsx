import { useState } from "react";
import {
  validateStudentId,
  validatePassword,
  validateTransactionNumber,
  validatePaymentScreenshot,
} from "./utils/validation";
import "./App.css";

type Page = "login" | "dashboard" | "payment" | "registration" | "results";

function App() {
  const [page, setPage] = useState<Page>("login");

  const [studentId, setStudentId] = useState("");
  const [password, setPassword] = useState("");
  const [studentName, setStudentName] = useState("");

  // Login states
  const [studentIdError, setStudentIdError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [loginError, setLoginError] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Payment states
  const [transactionNumber, setTransactionNumber] = useState("");
  const [paymentScreenshot, setPaymentScreenshot] = useState<File | null>(null);

  const [transactionError, setTransactionError] = useState("");
  const [screenshotError, setScreenshotError] = useState("");
  const [paymentMessage, setPaymentMessage] = useState("");
  const [paymentError, setPaymentError] = useState("");
  const [isSubmittingPayment, setIsSubmittingPayment] = useState(false);

  // =========================
  // LOGIN
  // =========================

  const handleLogin = async () => {
    setStudentIdError("");
    setPasswordError("");
    setLoginError("");

    const validStudentId = validateStudentId(studentId);
    const validPassword = validatePassword(password);

    setStudentIdError(
      validStudentId ? "" : "Student ID must contain exactly 8 digits.",
    );

    setPasswordError(
      validPassword
        ? ""
        : "Password must be 8–12 characters and contain uppercase, lowercase, and a number.",
    );

    if (!validStudentId || !validPassword) {
      return;
    }

    try {
      setIsLoggingIn(true);

      const response = await fetch("http://localhost:5050/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          studentId,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setLoginError(data.message || "Login failed.");
        return;
      }

      setStudentName(data.student.name);
      setPage("dashboard");
    } catch (error) {
      console.error("Login error:", error);

      setLoginError(
        "Unable to connect to the backend. Make sure the backend server is running on port 5050.",
      );
    } finally {
      setIsLoggingIn(false);
    }
  };

  // =========================
  // PAYMENT
  // =========================

  const handlePayment = async () => {
    setTransactionError("");
    setScreenshotError("");
    setPaymentMessage("");
    setPaymentError("");

    const validTransaction = validateTransactionNumber(transactionNumber);

    setTransactionError(
      validTransaction
        ? ""
        : "Transaction number must follow the format 123-123456789.",
    );

    if (!paymentScreenshot) {
      setScreenshotError("Payment screenshot is mandatory.");
    } else if (!validatePaymentScreenshot(paymentScreenshot.name)) {
      setScreenshotError("Only JPG, JPEG, and PNG files are allowed.");
    }

    const validScreenshot =
      paymentScreenshot !== null &&
      validatePaymentScreenshot(paymentScreenshot.name);

    if (!validTransaction || !validScreenshot) {
      return;
    }

    try {
      setIsSubmittingPayment(true);

      const response = await fetch(
        "http://localhost:5050/api/payments/submit",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            studentId,
            transactionNumber,
            screenshotName: paymentScreenshot.name,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        setPaymentError(data.message || "Payment submission failed.");
        return;
      }

      setPaymentMessage(
        `${data.message} Transaction: ${data.receipt.transactionNumber}`,
      );

      // Clear form after successful payment
      setTransactionNumber("");
      setPaymentScreenshot(null);

      const fileInput = document.getElementById(
        "paymentScreenshot",
      ) as HTMLInputElement | null;

      if (fileInput) {
        fileInput.value = "";
      }
    } catch (error) {
      console.error("Payment error:", error);

      setPaymentError(
        "Unable to connect to the backend. Make sure the backend server is running.",
      );
    } finally {
      setIsSubmittingPayment(false);
    }
  };

  // =========================
  // LOGOUT
  // =========================

  const handleLogout = () => {
    setStudentId("");
    setPassword("");
    setStudentName("");

    setStudentIdError("");
    setPasswordError("");
    setLoginError("");

    setTransactionNumber("");
    setPaymentScreenshot(null);
    setTransactionError("");
    setScreenshotError("");
    setPaymentMessage("");
    setPaymentError("");

    setPage("login");
  };

  // =========================
  // LOGIN PAGE
  // =========================

  if (page === "login") {
    return (
      <div className="app">
        <header className="header">
          <h1>CST Student Management System</h1>

          <p>Royal University of Bhutan, College of Science and Technology</p>
        </header>

        <main className="login-container">
          <div className="login-card">
            <h2>Student Login</h2>

            <p className="subtitle">Enter your Student ID and password</p>

            <div className="form-group">
              <label htmlFor="studentId">Student ID</label>

              <input
                id="studentId"
                type="text"
                placeholder="e.g. 02240371"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
              />

              {studentIdError && <p className="error">{studentIdError}</p>}
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>

              <input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />

              {passwordError && <p className="error">{passwordError}</p>}
            </div>

            {loginError && <p className="error">{loginError}</p>}

            <button onClick={handleLogin} disabled={isLoggingIn}>
              {isLoggingIn ? "Logging in..." : "Login"}
            </button>
          </div>
        </main>
      </div>
    );
  }

  // =========================
  // DASHBOARD PAGE
  // =========================

  if (page === "dashboard") {
    return (
      <div className="app">
        <header className="dashboard-header">
          <div>
            <h1>CST Student Management System</h1>

            <p>Student ID: {studentId}</p>
          </div>

          <button className="logout-button" onClick={handleLogout}>
            Logout
          </button>
        </header>

        <main className="dashboard">
          <section className="welcome-section">
            <h2>Welcome, {studentName || `Student ${studentId}`}</h2>

            <p>Select a service below to continue.</p>
          </section>

          <section className="dashboard-grid">
            <div className="dashboard-card">
              <div className="card-icon">💳</div>

              <h3>Tuition Payment</h3>

              <p>
                Submit your mobile banking payment and upload the payment
                screenshot.
              </p>

              <button onClick={() => setPage("payment")}>Open Payment</button>
            </div>

            <div className="dashboard-card">
              <div className="card-icon">📝</div>

              <h3>Module Registration</h3>

              <p>
                Register for your modules after completing all requirements.
              </p>

              <button onClick={() => setPage("registration")}>
                Open Registration
              </button>
            </div>

            <div className="dashboard-card">
              <div className="card-icon">📊</div>

              <h3>Results</h3>

              <p>
                View your academic results and download your result information.
              </p>

              <button onClick={() => setPage("results")}>View Results</button>
            </div>
          </section>
        </main>
      </div>
    );
  }

  // =========================
  // PAYMENT PAGE
  // =========================

  if (page === "payment") {
    return (
      <div className="app">
        <header className="dashboard-header">
          <div>
            <h1>Tuition Payment</h1>

            <p>Student ID: {studentId}</p>
          </div>

          <button
            className="logout-button"
            onClick={() => setPage("dashboard")}
          >
            Back
          </button>
        </header>

        <main className="page-container">
          <div className="service-card">
            <h2>Tuition Payment</h2>

            <p>
              Payment must be made using Mobile Banking to the official CST bank
              account.
            </p>

            <div className="info-box">
              <strong>Official CST Bank Account</strong>
              <br />
              Bank: Bhutan National Bank
              <br />
              Account No: 123456789
              <br />
              Account Name: CST College
            </div>

            <div className="form-group">
              <label htmlFor="transactionNumber">Transaction Number</label>

              <input
                id="transactionNumber"
                type="text"
                placeholder="123-123456789"
                value={transactionNumber}
                onChange={(e) => setTransactionNumber(e.target.value)}
              />

              {transactionError && <p className="error">{transactionError}</p>}

              <p className="help-text">Format: 3 digits - 9 digits</p>
            </div>

            <div className="form-group">
              <label htmlFor="paymentScreenshot">Payment Screenshot</label>

              <input
                id="paymentScreenshot"
                type="file"
                accept=".jpg,.jpeg,.png"
                onChange={(e) =>
                  setPaymentScreenshot(e.target.files?.[0] || null)
                }
              />

              {screenshotError && <p className="error">{screenshotError}</p>}

              <p className="help-text">Accepted formats: JPG, JPEG, PNG</p>
            </div>

            {paymentError && <p className="error">{paymentError}</p>}

            {paymentMessage && (
              <p className="success-message">{paymentMessage}</p>
            )}

            <button onClick={handlePayment} disabled={isSubmittingPayment}>
              {isSubmittingPayment ? "Submitting Payment..." : "Submit Payment"}
            </button>
          </div>
        </main>
      </div>
    );
  }

  // =========================
  // REGISTRATION PAGE
  // =========================

  if (page === "registration") {
    return (
      <div className="app">
        <header className="dashboard-header">
          <div>
            <h1>Module Registration</h1>

            <p>Student ID: {studentId}</p>
          </div>

          <button
            className="logout-button"
            onClick={() => setPage("dashboard")}
          >
            Back
          </button>
        </header>

        <main className="page-container">
          <div className="service-card">
            <h2>Module Registration</h2>

            <p>
              Registration is allowed only when all required conditions are
              satisfied.
            </p>

            <div className="status-box">
              <p>
                <strong>Tuition Payment:</strong> Not Verified
              </p>

              <p>
                <strong>Drug Testing Report:</strong> Not Verified
              </p>

              <p>
                <strong>Registration Period:</strong> Open
              </p>
            </div>

            <label htmlFor="module">Select Module</label>

            <select id="module">
              <option value="">Select a module</option>

              <option value="SWE302">SWE302 - Software Testing</option>

              <option value="WEB303">WEB303 - Microservices</option>

              <option value="SWE303">SWE303 - Software Engineering</option>
            </select>

            <button className="register-button">Register Module</button>
          </div>
        </main>
      </div>
    );
  }

  // =========================
  // RESULTS PAGE
  // =========================

  if (page === "results") {
    return (
      <div className="app">
        <header className="dashboard-header">
          <div>
            <h1>Academic Results</h1>

            <p>Student ID: {studentId}</p>
          </div>

          <button
            className="logout-button"
            onClick={() => setPage("dashboard")}
          >
            Back
          </button>
        </header>

        <main className="page-container">
          <div className="service-card">
            <h2>Academic Results</h2>

            <p>
              Registered students can view and download their academic results.
            </p>

            <table className="results-table">
              <thead>
                <tr>
                  <th>Module</th>
                  <th>Module Name</th>
                  <th>Grade</th>
                </tr>
              </thead>

              <tbody>
                <tr>
                  <td>SWE302</td>
                  <td>Software Testing</td>
                  <td>A</td>
                </tr>

                <tr>
                  <td>WEB303</td>
                  <td>Microservices</td>
                  <td>A-</td>
                </tr>

                <tr>
                  <td>SWE303</td>
                  <td>Software Engineering</td>
                  <td>B+</td>
                </tr>
              </tbody>
            </table>

            <button className="download-button">Download Results</button>
          </div>
        </main>
      </div>
    );
  }

  return null;
}

export default App;
