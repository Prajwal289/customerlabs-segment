import React, { useState, useMemo } from 'react';
import './SaveSegmentModal.css';

/*
  Implements:
  - segment name
  - base dropdown "Add schema to segment"
  - "+ Add new schema" adds the selected option as a new dropdown inside the blue box
  - new dropdowns can change; they only show options that remain unselected
  - save sends data to webhook (replace webhook URL)
*/

const ALL_OPTIONS = [
  { label: 'First Name', value: 'first_name' },
  { label: 'Last Name', value: 'last_name' },
  { label: 'Gender', value: 'gender' },
  { label: 'Age', value: 'age' },
  { label: 'Account Name', value: 'account_name' },
  { label: 'City', value: 'city' },
  { label: 'State', value: 'state' }
];

// Replace with your webhook from https://webhook.site/
const WEBHOOK_URL = 'REPLACE_WITH_YOUR_WEBHOOK_URL';

function SaveSegmentModal({ onClose }) {
  const [segmentName, setSegmentName] = useState('');
  const [baseSelect, setBaseSelect] = useState('');
  // array of selections for the blue box; each item is an object {id, value}
  const [addedSchemas, setAddedSchemas] = useState([]);

  // compute selected values to remove from other dropdowns
  const selectedSet = useMemo(() => {
    const s = new Set();
    if (baseSelect) s.add(baseSelect);
    addedSchemas.forEach(a => { if (a.value) s.add(a.value); });
    return s;
  }, [baseSelect, addedSchemas]);

  // options for base select are those not currently chosen in addedSchemas
  const baseOptions = ALL_OPTIONS.filter(opt => !addedSchemas.some(a => a.value === opt.value));

  function handleAddNewSchema() {
    if (!baseSelect) return;
    // add a new schema entry with unique id
    setAddedSchemas(prev => [...prev, { id: Date.now() + Math.random(), value: baseSelect }]);
    // reset base select and keep it showing only unselected options
    setBaseSelect('');
  }

  function handleChangeAdded(id, newValue) {
    setAddedSchemas(prev => prev.map(a => a.id === id ? { ...a, value: newValue } : a));
  }

  function handleRemoveSchema(id) {
    setAddedSchemas(prev => prev.filter(a => a.id !== id));
  }

  function buildPayload() {
    const schemaArray = addedSchemas
      .filter(a => a.value)
      .map(a => {
        const opt = ALL_OPTIONS.find(o => o.value === a.value);
        return { [a.value]: opt ? opt.label : a.value };
      });

    return {
      segment_name: segmentName,
      schema: schemaArray
    };
  }

  async function handleSave() {
    if (!segmentName) {
      alert('Please provide segment name');
      return;
    }
    const payload = buildPayload();

    try {
      const res = await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) {
        console.warn('Webhook responded with non-OK status', res.status);
      }
      alert('Segment saved (check your webhook.site to see the payload).');
      onClose();
    } catch (err) {
      console.error('Failed to send webhook', err);
      alert('Failed to send data — check console for error.');
    }
  }

  // For each added dropdown, compute available options: all options not selected by others (except keep current selection)
  function optionsForAdded(currentValue) {
    return ALL_OPTIONS.filter(opt => {
      // allow the current value (so existing selection stays present) OR not selected elsewhere
      const usedElsewhere = addedSchemas.some(a => a.value === opt.value && a.value !== currentValue);
      return !usedElsewhere;
    });
  }

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <div className="modal-header">
          <h2>Save Segment</h2>
          <button className="close" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">
          <label>Segment name</label>
          <input
            placeholder="e.g. last_10_days_blog_visits"
            value={segmentName}
            onChange={e => setSegmentName(e.target.value)}
          />

          <label>Add schema to segment</label>
          <div className="row">
            <select value={baseSelect} onChange={e => setBaseSelect(e.target.value)}>
              <option value="">-- select --</option>
              {baseOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            <button className="link" onClick={handleAddNewSchema}>+ Add new schema</button>
          </div>

          <div className="blue-box">
            {addedSchemas.length === 0 && <p className="hint">No schemas added yet</p>}
            {addedSchemas.map(entry => (
              <div className="schema-row" key={entry.id}>
                <select
                  value={entry.value}
                  onChange={e => handleChangeAdded(entry.id, e.target.value)}
                >
                  <option value="">-- select --</option>
                  {optionsForAdded(entry.value).map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
                <button className="remove" onClick={() => handleRemoveSchema(entry.id)}>Remove</button>
              </div>
            ))}
          </div>
        </div>

        <div className="modal-actions">
          <button onClick={onClose}>Cancel</button>
          <button className="primary" onClick={handleSave}>Save the segment</button>
        </div>
      </div>
    </div>
  );
}

export default SaveSegmentModal;
