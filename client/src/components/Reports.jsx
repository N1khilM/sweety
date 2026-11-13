import { useEffect, useState } from "react";
import { apiRequest } from "../services/api";

const Reports = ({ selectedDate }) => {
  const [mtd, setMtd] = useState(null);
  const [monthly, setMonthly] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchReports = async () => {
      try {
        setLoading(true);
        setError("");

        const date = new Date(`${selectedDate}T00:00:00`);
        const previousMonth = new Date(
          date.getFullYear(),
          date.getMonth() - 1,
          1,
        );

        const month = [
          previousMonth.getFullYear(),
          String(previousMonth.getMonth() + 1).padStart(2, "0"),
        ].join("-");

        const [mtdData, monthlyData] = await Promise.all([
          apiRequest(`/api/reports/month-to-date?date=${selectedDate}`),
          apiRequest(`/api/reports/monthly?month=${month}`),
        ]);

        setMtd(mtdData.summary);
        setMonthly(monthlyData.summary);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, [selectedDate]);

  const StatCard = ({ title, data }) => (
    <div className="report-card">
      <h3>{title}</h3>
      <div className="report-stats">
        <div>
          <span>Highest</span>
          <strong>{data?.highest ?? "--"}</strong>
        </div>
        <div>
          <span>Lowest</span>
          <strong>{data?.lowest ?? "--"}</strong>
        </div>
        <div>
          <span>Average</span>
          <strong>{data?.average ?? "--"}</strong>
        </div>
        <div>
          <span>Readings</span>
          <strong>{data?.count ?? 0}</strong>
        </div>
      </div>
      <p className="report-unit">Glucose values in mg/dL</p>
    </div>
  );

  return (
    <section className="reports-section">
      <div className="reports-heading">
        <div>
          <h2>Reports & Insights</h2>
          <p>Understand your glucose history.</p>
        </div>
      </div>

      {loading && <p>Loading reports...</p>}
      {error && <p className="error">{error}</p>}

      {!loading && !error && (
        <div className="reports-grid">
          <StatCard title="Month to date" data={mtd} />
          <StatCard title="Previous month" data={monthly} />
        </div>
      )}
    </section>
  );
};

export default Reports;
