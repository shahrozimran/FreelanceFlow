import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Wallet, Briefcase, Activity, RefreshCw, TrendingUp, Plus, 
  X, Trash2, Edit3, Save, Globe, Search, RotateCcw, Archive, FileText, CheckSquare, Square, ListChecks, Info
} from 'lucide-react';
import axios from 'axios';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import './App.css';

// Using environment variables for security
const SHEET_ID = import.meta.env.VITE_SHEET_ID;
const API_KEY = import.meta.env.VITE_API_KEY;
const RANGE = "Sheet1!A2:E50"; 
const SCRIPT_URL = import.meta.env.VITE_SCRIPT_URL;
const GITHUB_URL = import.meta.env.VITE_GITHUB_URL;
const LINKEDIN_URL = import.meta.env.VITE_LINKEDIN_URL;

export default function App() {
  const [projects, setProjects] = useState([]);
  const [selectedIndices, setSelectedIndices] = useState([]); 
  const [allRates, setAllRates] = useState({});
  const [loading, setLoading] = useState(true);
  const [targetCurrency, setTargetCurrency] = useState('PKR');
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(null);
  const [view, setView] = useState('active'); 
  
  const [searchQuery, setSearchQuery] = useState('');
  const [searchCriteria, setSearchCriteria] = useState('name');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const suggestionRef = useRef(null);

  const [formData, setFormData] = useState({ name: '', client: '', earnings: '', category: '' });
  const [formSuggestions, setFormSuggestions] = useState({ name: [], client: [], category: [] });
  const [showFormSuggestions, setShowFormSuggestions] = useState({ name: false, client: false, category: false });
  const formRef = useRef(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const sheetUrl = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${RANGE}?key=${API_KEY}`;
      const rateUrl = 'https://open.er-api.com/v6/latest/PKR';
      const [sheetRes, rateRes] = await Promise.all([axios.get(sheetUrl), axios.get(rateUrl)]);
      const rawValues = sheetRes.data.values || [];
      const processedData = rawValues.map((row, index) => ({ data: row, originalIndex: index }));
      setProjects(processedData.filter(item => item.data[0] && item.data[0].trim() !== ""));
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
      if (formRef.current && !formRef.current.contains(e.target)) {
        setShowFormSuggestions({ name: false, client: false, category: false });
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const convert = (pkrAmount) => {
    if (targetCurrency === 'PKR') return Number(pkrAmount);
    const rate = allRates[targetCurrency] || 0;
    return Number(pkrAmount) * rate;
  };

  // --- OPTIMISTIC UI ACTIONS WITH DATA NORMALIZATION ---
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Helper: Proper Case capitalization to solve case-sensitivity issues
    const normalize = (str) => 
      str ? str.trim().toLowerCase().split(' ').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)).join(' ') : "";

    const cleanName = normalize(formData.name);
    const cleanClient = normalize(formData.client);
    const cleanCategory = normalize(formData.category);

    const actionType = isEditing !== null ? "UPDATE" : "ADD";
    
    const normalizedData = {
      ...formData,
      name: cleanName,
      client: cleanClient,
      category: cleanCategory,
      action: actionType,
      rowIndex: isEditing
    };

    const optimisticProject = {
      data: [cleanName, cleanClient, "Active", formData.earnings, cleanCategory],
      originalIndex: isEditing !== null ? isEditing : projects.length
    };
    
    const previousProjects = [...projects];

    if (actionType === "ADD") {
      setProjects([optimisticProject, ...projects]);
    } else {
      setProjects(projects.map(p => p.originalIndex === isEditing ? optimisticProject : p));
    }

    resetForm();

    try {
      await axios.post(SCRIPT_URL, JSON.stringify(normalizedData));
      fetchData(); 
    } catch (err) {
      alert("Sync failed. Rolling back changes.");
      setProjects(previousProjects);
    }
  };

  const deleteProject = async (originalIndex) => {
    if (!window.confirm("Archive project?")) return;
    const previousProjects = [...projects];
    setProjects(projects.map(p => p.originalIndex === originalIndex ? { ...p, data: [p.data[0], p.data[1], "Disabled", p.data[3], p.data[4]] } : p));
    try {
      await axios.post(SCRIPT_URL, JSON.stringify({ action: "DELETE", rowIndex: originalIndex }));
    } catch (err) {
      setProjects(previousProjects);
      alert("Archive failed.");
    }
  };

  const restoreProject = async (originalIndex) => {
    const previousProjects = [...projects];
    setProjects(projects.map(p => p.originalIndex === originalIndex ? { ...p, data: [p.data[0], p.data[1], "Active", p.data[3], p.data[4]] } : p));
    try {
      await axios.post(SCRIPT_URL, JSON.stringify({ action: "RESTORE", rowIndex: originalIndex }));
    } catch (err) {
      setProjects(previousProjects);
      alert("Restore failed.");
    }
  };

  // --- PDF GENERATION WITH NOTE WINDOW AND SIGNATURE ---
  const generatePDF = (items) => {
    if (!items || items.length === 0) return;

    // Open window to enter optional note
    const userNote = window.prompt("Enter a custom note for this invoice (Optional):");

    try {
      const doc = new jsPDF();
      const date = new Date().toLocaleDateString();
      const uniqueClients = [...new Set(items.map(item => item.data[1]))].join(", ");
      const totalSumRaw = items.reduce((sum, item) => sum + Number(item.data[3] || 0), 0);
      const formattedTotal = targetCurrency === 'PKR' 
        ? `Rs. ${totalSumRaw.toLocaleString()}` 
        : `${convert(totalSumRaw).toLocaleString(undefined, {minimumFractionDigits: 2})} ${targetCurrency}`;

      doc.setFillColor(59, 130, 246);
      doc.rect(0, 0, 210, 40, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(24);
      doc.setFont("helvetica", "bold");
      doc.text("FreelanceFlow", 20, 25);
      doc.setFontSize(10);
      doc.text(items.length > 1 ? "MULTI-PROJECT SUMMARY" : "PROJECT INVOICE", 140, 25);

      doc.setTextColor(40, 40, 40);
      doc.setFontSize(12);
      doc.text(`Client(s): ${uniqueClients}`, 20, 60);
      doc.text(`Date Generated: ${date}`, 20, 68);

      const tableBody = items.map(item => [
        item.data[0],
        item.data[1],
        item.data[4],
        targetCurrency === 'PKR' ? `Rs. ${Number(item.data[3]).toLocaleString()}` : `${convert(item.data[3]).toLocaleString(undefined, {minimumFractionDigits: 2})} ${targetCurrency}`
      ]);

      tableBody.push([{ content: 'TOTAL AMOUNT', colSpan: 3, styles: { halign: 'right', fontStyle: 'bold', fillColor: [241, 245, 249] } }, { content: formattedTotal, styles: { fontStyle: 'bold', fillColor: [241, 245, 249] } }]);

      autoTable(doc, { startY: 80, head: [['Project', 'Client', 'Category', 'Value']], body: tableBody, headStyles: { fillColor: [59, 130, 246] }, theme: 'grid' });

      // After Table content
      let currentY = doc.lastAutoTable.finalY + 15;

      // Add User Note if entered
      if (userNote && userNote.trim() !== "") {
        doc.setFontSize(10);
        doc.setFont("helvetica", "bold");
        doc.text("Note:", 20, currentY);
        doc.setFont("helvetica", "normal");
        const splitNote = doc.splitTextToSize(userNote, 170);
        doc.text(splitNote, 20, currentY + 7);
        currentY += (splitNote.length * 7) + 15;
      }

      // Professional Signature/Regards
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.text("Regards,", 20, currentY);
      doc.setTextColor(59, 130, 246);
      doc.text("Shahroz Imran", 20, currentY + 7);
      doc.setFontSize(9);
      doc.setTextColor(100, 100, 100);
      doc.setFont("helvetica", "normal");
      doc.text("AI Automation & Cybersecurity Specialist", 20, currentY + 12);

      const fileName = items.length > 1 ? "Bulk_Invoice" : `${items[0].data[1]}_Invoice`;
      doc.save(`${fileName.replace(/\s+/g, '_')}.pdf`);
      setSelectedIndices([]); 
    } catch (error) { console.error("PDF Error:", error); }
  };

  // --- UI HELPERS ---
  const toggleSelect = (idx) => {
    setSelectedIndices(prev => prev.includes(idx) ? prev.filter(i => i !== idx) : [...prev, idx]);
  };

  const handleSelectAll = () => {
    if (selectedIndices.length === filteredProjects.length) setSelectedIndices([]);
    else setSelectedIndices(filteredProjects.map(p => p.originalIndex));
  };

  const selectAllForClient = (clientName) => {
    const clientIndices = filteredProjects.filter(p => p.data[1] === clientName).map(p => p.originalIndex);
    setSelectedIndices(prev => Array.from(new Set([...prev, ...clientIndices])));
  };

  const selectedTotalRaw = projects.filter(p => selectedIndices.includes(p.originalIndex)).reduce((sum, item) => sum + Number(item.data[3] || 0), 0);
  const selectedTotalFormatted = targetCurrency === 'PKR' ? `Rs. ${selectedTotalRaw.toLocaleString()}` : `${convert(selectedTotalRaw).toLocaleString(undefined, {minimumFractionDigits: 2})} ${targetCurrency}`;

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    if (value.length > 0) {
      const colIndex = searchCriteria === 'name' ? 0 : searchCriteria === 'client' ? 1 : 4;
      const matches = projects.filter(p => (view === 'active' ? p.data[2] !== "Disabled" : p.data[2] === "Disabled")).map(p => p.data[colIndex]).filter((val, index, self) => val && val.toLowerCase().includes(value.toLowerCase()) && self.indexOf(val) === index).slice(0, 5);
      setSuggestions(matches);
      setShowSuggestions(true);
    } else { setShowSuggestions(false); }
  };

  const getFormSuggestions = (fieldType, inputValue) => {
    if (!inputValue || inputValue.length === 0) return [];
    
    let colIndex = fieldType === 'name' ? 0 : fieldType === 'client' ? 1 : 4;
    const activeProjects = projects.filter(p => p.data[2] !== "Disabled");
    
    const matches = activeProjects
      .map(p => p.data[colIndex])
      .filter((val, index, self) => 
        val && val.toLowerCase().includes(inputValue.toLowerCase()) && self.indexOf(val) === index
      )
      .slice(0, 5);
    
    return matches;
  };

  const handleFormInputChange = (fieldType, value) => {
    setFormData({ ...formData, [fieldType]: value });
    const suggestions = getFormSuggestions(fieldType, value);
    setFormSuggestions({ ...formSuggestions, [fieldType]: suggestions });
    setShowFormSuggestions({ ...showFormSuggestions, [fieldType]: suggestions.length > 0 });
  };

  const selectFormSuggestion = (fieldType, value) => {
    setFormData({ ...formData, [fieldType]: value });
    setShowFormSuggestions({ ...showFormSuggestions, [fieldType]: false });
  };

  const filteredProjects = projects.filter(item => {
    const isCorrectView = view === 'active' ? item.data[2] !== "Disabled" : item.data[2] === "Disabled";
    if (!isCorrectView) return false;
    const val = searchQuery.toLowerCase();
    if (searchCriteria === 'name') return item.data[0].toLowerCase().includes(val);
    if (searchCriteria === 'client') return item.data[1].toLowerCase().includes(val);
    if (searchCriteria === 'category') return item.data[4].toLowerCase().includes(val);
    return true;
  });

  const startEdit = (item) => {
    setFormData({ name: item.data[0], client: item.data[1], earnings: item.data[3], category: item.data[4] });
    setIsEditing(item.originalIndex);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetForm = () => { setFormData({ name: '', client: '', earnings: '', category: '' }); setIsEditing(null); setShowForm(false); };

  const totalPKR = projects.filter(p => p.data[2] !== "Disabled").reduce((sum, item) => sum + Number(item.data[3] || 0), 0);
  const formattedTotal = targetCurrency === 'PKR' ? `Rs. ${totalPKR.toLocaleString()}` : `${convert(totalPKR).toLocaleString(undefined, {minimumFractionDigits: 2})} ${targetCurrency}`;

  return (
    <div className="dashboard">
      <header className="top-nav">
        <div className="brand"><TrendingUp className="logo-icon" size={28} /><h1>Freelance<span>Flow</span></h1></div>
        <div className="actions">
          {selectedIndices.length > 0 && (
            <button className="toggle-btn" style={{background: '#10b981', color: 'white', border: 'none'}} onClick={() => generatePDF(projects.filter(p => selectedIndices.includes(p.originalIndex)))}>
              <FileText size={18} /> Export Selected ({selectedIndices.length})
            </button>
          )}
          <button className={`toggle-btn ${view === 'trash' ? 'active-trash' : ''}`} onClick={() => setView(view === 'active' ? 'trash' : 'active')}>
            {view === 'active' ? <Archive size={18} /> : <Briefcase size={18} />} {view === 'active' ? "Trash" : "Active Pipeline"}
          </button>
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
          <input type="text" placeholder={`Search...`} value={searchQuery} onChange={handleSearchChange} onFocus={() => searchQuery.length > 0 && setShowSuggestions(true)} className="search-input" />
          <select className="search-criteria-select" value={searchCriteria} onChange={(e) => setSearchCriteria(e.target.value)}>
            <option value="name">Project</option><option value="client">Client</option><option value="category">Category</option>
          </select>
        </div>
        <AnimatePresence>
          {showSuggestions && suggestions.length > 0 && (
            <motion.ul initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="suggestion-dropdown">
              {suggestions.map((item, i) => <li key={i} onClick={() => {setSearchQuery(item); setShowSuggestions(false);}} className="suggestion-item"><Search size={14} style={{marginRight: '10px', opacity: 0.5}} />{item}</li>)}
            </motion.ul>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="stat-card form-box" ref={formRef}>
            <h3 style={{marginTop: 0, color: '#60a5fa'}}>{isEditing !== null ? "Update Project" : "Add New Project"}</h3>
            <form onSubmit={handleSubmit} className="project-form">
              <div className="form-input-wrapper">
                <input 
                  className="toggle-btn text-left" 
                  placeholder="Project Name" 
                  required 
                  value={formData.name} 
                  onChange={e => handleFormInputChange('name', e.target.value)}
                  onFocus={() => formSuggestions.name.length > 0 && setShowFormSuggestions({ ...showFormSuggestions, name: true })}
                />
                <AnimatePresence>
                  {showFormSuggestions.name && formSuggestions.name.length > 0 && (
                    <motion.ul initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="form-suggestion-dropdown">
                      {formSuggestions.name.map((item, i) => <li key={i} onClick={() => selectFormSuggestion('name', item)} className="suggestion-item"><Search size={14} style={{marginRight: '10px', opacity: 0.5}} />{item}</li>)}
                    </motion.ul>
                  )}
                </AnimatePresence>
              </div>
              <div className="form-input-wrapper">
                <input 
                  className="toggle-btn text-left" 
                  placeholder="Client Name" 
                  required 
                  value={formData.client} 
                  onChange={e => handleFormInputChange('client', e.target.value)}
                  onFocus={() => formSuggestions.client.length > 0 && setShowFormSuggestions({ ...showFormSuggestions, client: true })}
                />
                <AnimatePresence>
                  {showFormSuggestions.client && formSuggestions.client.length > 0 && (
                    <motion.ul initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="form-suggestion-dropdown">
                      {formSuggestions.client.map((item, i) => <li key={i} onClick={() => selectFormSuggestion('client', item)} className="suggestion-item"><Search size={14} style={{marginRight: '10px', opacity: 0.5}} />{item}</li>)}
                    </motion.ul>
                  )}
                </AnimatePresence>
              </div>
              <input className="toggle-btn text-left" type="number" placeholder="Earnings" required value={formData.earnings} onChange={e => setFormData({...formData, earnings: e.target.value})} />
              <div className="form-input-wrapper">
                <input 
                  className="toggle-btn text-left" 
                  placeholder="Category" 
                  required 
                  value={formData.category} 
                  onChange={e => handleFormInputChange('category', e.target.value)}
                  onFocus={() => formSuggestions.category.length > 0 && setShowFormSuggestions({ ...showFormSuggestions, category: true })}
                />
                <AnimatePresence>
                  {showFormSuggestions.category && formSuggestions.category.length > 0 && (
                    <motion.ul initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="form-suggestion-dropdown">
                      {formSuggestions.category.map((item, i) => <li key={i} onClick={() => selectFormSuggestion('category', item)} className="suggestion-item"><Search size={14} style={{marginRight: '10px', opacity: 0.5}} />{item}</li>)}
                    </motion.ul>
                  )}
                </AnimatePresence>
              </div>
              <button type="submit" className="refresh-btn submit-btn"><Save size={18} /> {isEditing !== null ? "Update" : "Save Project"}</button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid">
        <StatCard title="Portfolio Value" value={formattedTotal} icon={<Wallet />} color="#10b981" />
        <StatCard title={`${view === 'active' ? 'Active' : 'Archived'} Projects`} value={filteredProjects.length} icon={<Briefcase />} color="#3b82f6" />
        <StatCard title={`Rate: 1 PKR`} value={allRates[targetCurrency]?.toFixed(4) || "1.00"} icon={<Activity />} color="#f59e0b" />
      </div>

      <div className="table-container">
        <div className="table-header"><h2>{view === 'active' ? "Active Pipeline" : "Archive View"}</h2></div>
        <table>
          <thead>
            <tr>
              <th style={{width: '50px'}}><button className="action-icon-btn" onClick={handleSelectAll}>{selectedIndices.length === filteredProjects.length && filteredProjects.length > 0 ? <CheckSquare size={18} color="#3b82f6" /> : <Square size={18} />}</button></th>
              <th>PROJECT</th><th>CLIENT</th><th>CATEGORY</th><th style={{textAlign: 'right'}}>VALUE</th><th style={{textAlign: 'center'}}>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            <AnimatePresence>
              {filteredProjects.map((item) => (
                <motion.tr layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} key={item.originalIndex}>
                  <td><button className="action-icon-btn" onClick={() => toggleSelect(item.originalIndex)}>{selectedIndices.includes(item.originalIndex) ? <CheckSquare size={18} color="#3b82f6" /> : <Square size={18} />}</button></td>
                  <td className="font-bold">{item.data[0]}</td>
                  <td>
                    <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                      {item.data[1]}
                      <button className="action-icon-btn" title="Select all for client" onClick={() => selectAllForClient(item.data[1])}>
                        <ListChecks size={14} color="#60a5fa" />
                      </button>
                    </div>
                  </td>
                  <td><span className="chip">{item.data[4]}</span></td>
                  <td className="value-cell">{targetCurrency === 'PKR' ? `Rs. ${Number(item.data[3]).toLocaleString()}` : convert(item.data[3]).toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                  <td style={{textAlign: 'center'}}>
                    {view === 'active' ? (
                      <>
                        <button onClick={() => generatePDF([item])} className="action-icon-btn" title="Export PDF"><FileText size={16} color="#60a5fa"/></button>
                        <button onClick={() => startEdit(item)} className="action-icon-btn" title="Edit"><Edit3 size={16} color="#3b82f6"/></button>
                        <button onClick={() => deleteProject(item.originalIndex)} className="action-icon-btn" title="Archive"><Trash2 size={16} color="#ef4444"/></button>
                      </>
                    ) : (
                      <button onClick={() => restoreProject(item.originalIndex)} className="action-icon-btn" title="Restore"><RotateCcw size={16} color="#10b981"/></button>
                    )}
                  </td>
                </motion.tr>
              ))}
            </AnimatePresence>
          </tbody>
        </table>
      </div>

      <AnimatePresence>
        {selectedIndices.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }} 
            animate={{ opacity: 1, y: 0 }} 
            exit={{ opacity: 0, y: 10 }} 
            className="selection-bar"
          >
            <div className="selection-info"><Info size={18} color="#3b82f6" /><span>{selectedIndices.length} items selected</span></div>
            <div className="selection-sum"><span className="sum-label">Selected Total:</span><span className="sum-value">{selectedTotalFormatted}</span></div>
          </motion.div>
        )}
      </AnimatePresence>

      <footer className="footer">
        <div className="footer-content">
          <div className="footer-left"><p>© 2026 FreelanceFlow. Developed by <span>Shahroz Imran</span></p></div>
          <div className="footer-center"><p>AI Automation & Cybersecurity Specialist</p></div>
          <div className="footer-right">
            <a href={GITHUB_URL} target="_blank" rel="noreferrer" className="footer-link">GitHub</a>
            <span className="footer-divider">|</span>
            <a href={LINKEDIN_URL} target="_blank" rel="noreferrer" className="footer-link">LinkedIn</a>
          </div>
        </div>
      </footer>
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