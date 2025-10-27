import React, { useState, useMemo } from 'react';
import './SaveSegmentModal.css';

const ALL_OPTIONS = [
  { label: 'First Name', value: 'first_name' },
  { label: 'Last Name', value: 'last_name' },
  { label: 'Gender', value: 'gender' },
  { label: 'Age', value: 'age' },
  { label: 'Account Name', value: 'account_name' },
  { label: 'City', value: 'city' },
  { label: 'State', value: 'state' }
];

// const WEBHOOK_URL = 'https://webhook.site/a56b8fca-d0b2-429d-b92d-dc48115a7fd5';
const WEBHOOK_URL = 'https://hook.eu2.make.com/g9tbogfa7ie37qk1gqetuo5ubzpygftd';


function SaveSegmentModal({ onClose }) {
  const [segmentName, setSegmentName] = useState('');
  const [baseSelect, setBaseSelect] = useState('');
  const [addedSchemas, setAddedSchemas] = useState([]);

  const selectedSet = useMemo(() => {
    const s = new Set();
    if (baseSelect) s.add(baseSelect);
    addedSchemas.forEach(a => { if (a.value) s.add(a.value); });
    return s;
  }, [baseSelect, addedSchemas]);
  const baseOptions = ALL_OPTIONS.filter(opt => !addedSchemas.some(a => a.value === opt.value));

  function handleAddNewSchema() {
    if (!baseSelect) return;
    setAddedSchemas(prev => [...prev, { id: Date.now() + Math.random(), value: baseSelect }]);
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

  function optionsForAdded(currentValue) {
    return ALL_OPTIONS.filter(opt => {
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
