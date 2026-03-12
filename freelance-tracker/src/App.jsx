import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wallet, Briefcase, Activity, RefreshCw, TrendingUp, Plus, X, Trash2, Edit3, Save, Globe, Search } from 'lucide-react';
import axios from 'axios';
import './App.css';

const SHEET_ID = "1ks1kqNq6rHshI-WUr9YYzQzCGLtzF5Nvrocxo972Fio"; 
const API_KEY = "AIzaSyDztCY5Q_3U6JZdJVukZ5V3OAa0RI510U8"; 
const RANGE = "Sheet1!A2:E50"; 
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbw-uPYzIh4FdSQp6XrV4OZXipgiAHPPCtyQZ9184quk1hcRVZ-VteImq61KYVli4_g8Rg/exec"; 

export default function App() {
  const [projects, setProjects] = useState([]);
  const [allRates, setAllRates] = useState({});
  const [loading, setLoading] = useState(true);
  const [targetCurrency, setTargetCurrency] = useState('PKR');
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(null);
  
  // Search & Suggestion States
  const [searchQuery, setSearchQuery] = useState('');
  const [searchCriteria, setSearchCriteria] = useState('name');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const suggestionRef = useRef(null);

  const [formData, setFormData] = useState({ name: '', client: '', earnings: '', category: '' });

  const fetchData = async () => {
    setLoading(true);
    try {
      const sheetUrl = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${RANGE}?key=${API_KEY}`;
      const rateUrl = 'https://open.er-api.com/v6/latest/PKR';
      const [sheetRes, rateRes] = await Promise.all([axios.get(sheetUrl), axios.get(rateUrl)]);
      
      const rawValues = sheetRes.data.values || [];
      
      // PROCESS & FILTER: 
      // 1. Map row to original index for targeting.
      // 2. Filter out rows where Project Name is empty OR Status (Index 2) is "Disabled".
      const processedData = rawValues
        .map((row, index) => ({ data: row, originalIndex: index }))
        .filter(item => 
          item.data[0] && 
          item.data[0].trim() !== "" && 
          item.data[2] !== "Disabled"
        );

      setProjects(processedData);
      setAllRates(rateRes.data.rates);
    } catch (err) { console.error("Fetch Error:", err.message); }
    finally { setLoading(false); }
  };

  useEffect(() => { 
    fetchData();
    const handleClickOutside = (e) => {
      if (suggestionRef.current && !suggestionRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);

    if (value.length > 0) {
      const colIndex = searchCriteria === 'name' ? 0 : searchCriteria === 'client' ? 1 : 4;
      const matches = projects
        .map(p => p.data[colIndex])
        .filter((val, index, self) => 
          val && val.toLowerCase().includes(value.toLowerCase()) && self.indexOf(val) === index
        )
        .slice(0, 5);
      setSuggestions(matches);
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  };

  const selectSuggestion = (val) => {
    setSearchQuery(val);
    setShowSuggestions(false);
  };

  const filteredProjects = projects.filter(item => {
    const val = searchQuery.toLowerCase();
    if (searchCriteria === 'name') return item.data[0].toLowerCase().includes(val);
    if (searchCriteria === 'client') return item.data[1].toLowerCase().includes(val);
    if (searchCriteria === 'category') return item.data[4].toLowerCase().includes(val);
    return true;
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const payload = { ...formData, action: isEditing !== null ? "UPDATE" : "ADD", rowIndex: isEditing };
    try {
      await axios.post(SCRIPT_URL, JSON.stringify(payload));
      resetForm();
      setTimeout(fetchData, 2000); 
    } catch (err) { alert("Action failed."); }
    finally { setLoading(false); }
  };

  const deleteProject = async (originalIndex) => {
    if (!window.confirm("Mark this project as disabled?")) return;
    
    // Optimistic Update: Hide from UI immediately
    setProjects(prev => prev.filter(item => item.originalIndex !== originalIndex));
    
    try {
      // Tells Apps Script to set status to "Disabled"
      await axios.post(SCRIPT_URL, JSON.stringify({ action: "DELETE", rowIndex: originalIndex }));
      setTimeout(fetchData, 1500);
    } catch (err) { 
      alert("Server sync failed. Refreshing..."); 
      fetchData(); 
    }
  };

  const startEdit = (item) => {
    setFormData({ name: item.data[0], client: item.data[1], earnings: item.data[3], category: item.data[4] });
    setIsEditing(item.originalIndex);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetForm = () => {
    setFormData({ name: '', client: '', earnings: '', category: '' });
    setIsEditing(null);
    setShowForm(false);
  };

  const convert = (pkrAmount) => {
    if (targetCurrency === 'PKR') return Number(pkrAmount);
    const rate = allRates[targetCurrency] || 0;
    return Number(pkrAmount) * rate;
  };

  const totalPKR = projects.reduce((sum, item) => sum + Number(item.data[3] || 0), 0);
  const formattedTotal = targetCurrency === 'PKR' 
    ? `Rs. ${totalPKR.toLocaleString()}` 
    : `${convert(totalPKR).toLocaleString(undefined, {minimumFractionDigits: 2})} ${targetCurrency}`;

  return (
    <div className="dashboard">
      <header className="top-nav">
        <div className="brand"><TrendingUp className="logo-icon" size={28} /><h1>Freelance<span>Flow</span></h1></div>
        <div className="actions">
          <div className="currency-selector-wrapper">
            <Globe size={16} className="globe-icon" />
            <select className="toggle-btn" value={targetCurrency} onChange={(e) => setTargetCurrency(e.target.value)}>
              {Object.keys(allRates).sort().map(curr => <option key={curr} value={curr}>{curr}</option>)}
            </select>
          </div>
          <button className="toggle-btn" onClick={() => { if(showForm) resetForm(); else setShowForm(true); }}>
            {showForm ? <X size={18} /> : <Plus size={18} />} {showForm ? "Cancel" : "New Project"}
          </button>
          <button className="refresh-btn" onClick={fetchData}><RefreshCw size={18} className={loading ? "spin" : ""} /></button>
        </div>
      </header>

      <div className="search-container" ref={suggestionRef}>
        <div className="search-wrapper">
          <Search size={18} className="search-icon" />
          <input 
            type="text" 
            placeholder={`Search by ${searchCriteria}...`} 
            value={searchQuery}
            onChange={handleSearchChange}
            onFocus={() => searchQuery.length > 0 && setShowSuggestions(true)}
            className="search-input"
          />
          <select className="search-criteria-select" value={searchCriteria} onChange={(e) => setSearchCriteria(e.target.value)}>
            <option value="name">Project</option>
            <option value="client">Client</option>
            <option value="category">Category</option>
          </select>
        </div>

        <AnimatePresence>
          {showSuggestions && suggestions.length > 0 && (
            <motion.ul 
              initial={{ opacity: 0, y: -10 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0 }}
              className="suggestion-dropdown"
            >
              {suggestions.map((item, i) => (
                <li key={i} onClick={() => selectSuggestion(item)} className="suggestion-item">
                  <Search size={14} style={{marginRight: '10px', opacity: 0.5}} />
                  {item}
                </li>
              ))}
            </motion.ul>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="stat-card form-box">
            <h3 style={{marginTop: 0, color: '#60a5fa'}}>{isEditing !== null ? "Update Project" : "Add New Project"}</h3>
            <form onSubmit={handleSubmit} className="project-form">
              <input className="toggle-btn text-left" placeholder="Project Name" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              <input className="toggle-btn text-left" placeholder="Client Name" required value={formData.client} onChange={e => setFormData({...formData, client: e.target.value})} />
              <input className="toggle-btn text-left" type="number" placeholder="Earnings" required value={formData.earnings} onChange={e => setFormData({...formData, earnings: e.target.value})} />
              <input className="toggle-btn text-left" placeholder="Category" required value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} />
              <button type="submit" className="refresh-btn submit-btn">
                <Save size={18} /> {isEditing !== null ? "Update Project" : "Save Project"}
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid">
        <StatCard title="Total Revenue" value={formattedTotal} icon={<Wallet />} color="#10b981" />
        <StatCard title="Total Projects" value={projects.length} icon={<Briefcase />} color="#3b82f6" />
        <StatCard title={`Rate: 1/${targetCurrency}`} value={allRates[targetCurrency]?.toFixed(4) || "0.00"} icon={<Activity />} color="#f59e0b" />
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr><th>PROJECT</th><th>CLIENT</th><th>CATEGORY</th><th style={{textAlign: 'right'}}>VALUE</th><th style={{textAlign: 'center'}}>ACTIONS</th></tr>
          </thead>
          <tbody>
            <AnimatePresence>
              {filteredProjects.map((item) => (
                <motion.tr layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} key={item.originalIndex}>
                  <td className="font-bold">{item.data[0]}</td>
                  <td className="text-dim">{item.data[1]}</td>
                  <td><span className="chip">{item.data[4]}</span></td>
                  <td className="value-cell">
                      {targetCurrency === 'PKR' ? `Rs. ${Number(item.data[3]).toLocaleString()}` : convert(item.data[3]).toLocaleString(undefined, {minimumFractionDigits: 2})}
                  </td>
                  <td style={{textAlign: 'center'}}>
                    <button onClick={() => startEdit(item)} className="action-icon-btn"><Edit3 size={16} color="#60a5fa"/></button>
                    <button onClick={() => deleteProject(item.originalIndex)} className="action-icon-btn"><Trash2 size={16} color="#ef4444"/></button>
                  </td>
                </motion.tr>
              ))}
            </AnimatePresence>
          </tbody>
        </table>
        {filteredProjects.length === 0 && <div className="empty-state">No matching projects found.</div>}
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, color }) {
  return (
    <div className="stat-card">
      <div className="stat-icon" style={{ color }}>{icon}</div>
      <div className="stat-info"><p className="stat-label">{title}</p><p className="stat-val">{value}</p></div>
    </div>
  );
}