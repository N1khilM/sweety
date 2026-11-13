import { useState } from "react";
import { apiRequest } from "../services/api";

const ReadingForm = ({ selectedDate, onSuccess }) => {
  const [value, setValue] = useState("");
  const [slot, setSlot] = useState("morning");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!value) {
      setError("Please enter a glucose value.");
      return;
    }

    if (
      !Number.isInteger(Number(value)) ||
      Number(value) < 40 ||
      Number(value) > 600
    ) {
      setError("Value must be between 40 and 600 mg/dl.");
      return;
    }

    try {
      setLoading(true);

      await apiRequest("/api/readings", {
        method: "POST",
        body: JSON.stringify({
          reading_date: selectedDate,
          slot,
          value: Number(value),
        }),
      });

      setValue("");
      onSuccess();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="reading-form">
      <h2>Add glucose reading</h2>

      <form onSubmit={handleSubmit}>
        <label>Reading date</label>
        <input type="date" value={selectedDate} disabled />

        <label>Reading slot</label>
        <select value={slot} onChange={(e) => setSlot(e.target.value)}>
          <option value="morning">Morning (fasting)</option>
          <option value="after_breakfast">After breakfast</option>
          <option value="after_lunch">After lunch</option>
          <option value="after_dinner">After dinner</option>
        </select>

        <label>Glucose value (mg/dL)</label>
        <input
          type="number"
          min="40"
          max="600"
          step="1"
          placeholder="Enter value"
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />

        {error && <p className="error">{error}</p>}

        <button type="submit" disabled={loading}>
          {loading ? "Saving..." : "Save reading"}
        </button>
      </form>
    </section>
  );
};

export default ReadingForm;
