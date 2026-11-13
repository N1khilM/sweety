import { useState } from "react";
import { apiRequest } from "../services/api";

const slotLabels = {
  morning: "Morning (fasting)",
  after_breakfast: "After breakfast",
  after_lunch: "After lunch",
  after_dinner: "After dinner",
};

const ReadingList = ({ readings, onRefresh }) => {
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState("");
  const [editSlot, setEditSlot] = useState("");
  const [error, setError] = useState("");

  const handleEdit = (reading) => {
    setEditingId(reading.id);
    setEditValue(String(reading.value));
    setEditSlot(reading.slot);
    setError("");
  };

  const handleUpdate = async (reading) => {
    setError("");

    if (
      !Number.isInteger(Number(editValue)) ||
      Number(editValue) < 40 ||
      Number(editValue) > 600
    ) {
      setError("Value must be between 40 and 600 mg/dl.");
      return;
    }

    try {
      await apiRequest(`/api/readings/${reading.id}`, {
        method: "PUT",
        body: JSON.stringify({
          reading_date: reading.reading_date,
          value: Number(editValue),
          slot: editSlot,
        }),
      });

      setEditingId(null);
      onRefresh();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this glucose reading?")) return;

    try {
      await apiRequest(`/api/readings/${id}`, {
        method: "DELETE",
      });

      onRefresh();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <section className="reading-list">
      <h2>Today's readings</h2>

      {error && <p className="error">{error}</p>}

      {readings.length === 0 ? (
        <p className="empty-state">No readings recorded for this date yet.</p>
      ) : (
        readings.map((reading) => (
          <div className="reading-item" key={reading.id}>
            {editingId === reading.id ? (
              <div className="edit-reading">
                <select
                  value={editSlot}
                  onChange={(e) => setEditSlot(e.target.value)}
                >
                  {Object.entries(slotLabels).map(([key, label]) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  ))}
                </select>

                <input
                  type="number"
                  min="40"
                  max="600"
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                />

                <button onClick={() => handleUpdate(reading)}>Save</button>

                <button onClick={() => setEditingId(null)}>Cancel</button>
              </div>
            ) : (
              <>
                <div>
                  <h3>{slotLabels[reading.slot]}</h3>
                  <p>{reading.value} mg/dL</p>
                </div>

                <div className="reading-actions">
                  <button onClick={() => handleEdit(reading)}>Edit</button>

                  <button
                    className="delete-btn"
                    onClick={() => handleDelete(reading.id)}
                  >
                    Delete
                  </button>
                </div>
              </>
            )}
          </div>
        ))
      )}
    </section>
  );
};

export default ReadingList;
