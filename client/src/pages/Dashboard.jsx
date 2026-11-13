import { useState, useEffect } from "react";
import { apiRequest } from "../services/api";

const Dashboard = ({ user, onLogout }) => {
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0],
  );

  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDailyReport = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await apiRequest(
          `/api/reports/daily?date=${selectedDate}`,
        );

        setReport(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDailyReport();
  }, [selectedDate]);

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div>
          <h1>Sweety 🍬</h1>
          <p>Welcome back, {user.name}!</p>
        </div>

        <button onClick={onLogout}>Logout</button>
      </header>

      <section className="dashboard-content">
        <div className="dashboard-title">
          <div>
            <h2>Your health overview</h2>
            <p>Keep track of your glucose levels.</p>
          </div>

          <input
            type="date"
            value={selectedDate}
            max={new Date().toISOString().split("T")[0]}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
        </div>

        {loading && <p>Loading report...</p>}

        {error && <p className="error">{error}</p>}

        {report && (
          <div className="summary-grid">
            <div className="summary-card">
              <p>Highest</p>
              <h2>{report.summary.highest ?? "--"}</h2>
              <span>mg/dL</span>
            </div>

            <div className="summary-card">
              <p>Lowest</p>
              <h2>{report.summary.lowest ?? "--"}</h2>
              <span>mg/dL</span>
            </div>

            <div className="summary-card">
              <p>Average</p>
              <h2>{report.summary.average ?? "--"}</h2>
              <span>mg/dL</span>
            </div>

            <div className="summary-card">
              <p>Total readings</p>
              <h2>{report.summary.count}</h2>
              <span>Selected day</span>
            </div>
          </div>
        )}
      </section>
    </div>
  );
};

export default Dashboard;
