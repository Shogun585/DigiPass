import React, { useState, useEffect, useRef } from 'react';
import { LogOut, Search, Download, Play, ChevronDown, ChevronUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { passAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import '../../styles/ApprovalPage.css';

const ApprovalPage = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  // Filters state (input form controls)
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isReturned, setIsReturned] = useState(false);
  const [isNotReturned, setIsNotReturned] = useState(false);

  // Active filters currently applied to queries
  const [appliedFilters, setAppliedFilters] = useState({
    searchQuery: '',
    statusFilter: 'All',
    startDate: '',
    endDate: '',
    isReturned: false,
    isNotReturned: false,
  });

  const appliedFiltersRef = useRef(appliedFilters);
  useEffect(() => {
    appliedFiltersRef.current = appliedFilters;
  }, [appliedFilters]);

  // Data state
  const [displayData, setDisplayData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [expandedPasses, setExpandedPasses] = useState({});

  const toggleExpand = (passId) => {
    setExpandedPasses(prev => ({
      ...prev,
      [passId]: !prev[passId]
    }));
  };

  const fetchData = async (filtersToUse = appliedFiltersRef.current, isBackground = false) => {
    if (!isBackground) {
      setLoading(true);
    }
    try {
      const params = new URLSearchParams();
      if (filtersToUse.searchQuery) params.append('college_id', filtersToUse.searchQuery);
      if (filtersToUse.statusFilter && filtersToUse.statusFilter !== 'All') {
        params.append('status', filtersToUse.statusFilter.toLowerCase());
      }
      if (filtersToUse.startDate) params.append('start_date', filtersToUse.startDate);
      if (filtersToUse.endDate) params.append('end_date', filtersToUse.endDate);
      if (filtersToUse.isReturned) params.append('returned', 'true');
      if (filtersToUse.isNotReturned) params.append('not_returned', 'true');

      const response = await passAPI.getUnified(params);
      setDisplayData(response.data || []);
      setLastUpdated(new Date());
    } catch (error) {
      console.error("Error fetching unified passes:", error);
    } finally {
      if (!isBackground) {
        setLoading(false);
      }
    }
  };

  // Explicit query trigger via Go button or Enter key
  const handleSearch = () => {
    const newFilters = {
      searchQuery,
      statusFilter,
      startDate,
      endDate,
      isReturned,
      isNotReturned,
    };
    setAppliedFilters(newFilters);
    appliedFiltersRef.current = newFilters;
    fetchData(newFilters, false);
  };

  // Initial load and recurring background polling every 10 seconds
  useEffect(() => {
    fetchData(appliedFiltersRef.current, false);

    const intervalId = setInterval(() => {
      fetchData(appliedFiltersRef.current, true);
    }, 10000);

    return () => clearInterval(intervalId);
  }, []);

  const handleApprove = async (passId) => {
    try {
      await passAPI.updatePassStatus(passId, 'approved');
      // update local state immediately
      setDisplayData(prev => prev.map(p => p.pass_id === passId ? { ...p, pass_status: 'approved' } : p));
      // background refresh to sync any logs/updates
      fetchData(appliedFiltersRef.current, true);
    } catch (error) {
      console.error("Failed to approve:", error);
    }
  };

  const handleReject = async (passId) => {
    try {
      await passAPI.updatePassStatus(passId, 'rejected');
      // update local state immediately
      setDisplayData(prev => prev.map(p => p.pass_id === passId ? { ...p, pass_status: 'rejected' } : p));
      // background refresh to sync any logs/updates
      fetchData(appliedFiltersRef.current, true);
    } catch (error) {
      console.error("Failed to reject:", error);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return '-';
    const d = new Date(dateString);
    const date = d.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '-');
    const time = d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    return `${date} [${time}]`;
  };

  const getLogTime = (logs, action) => {
    if (!logs) return '-';
    const log = logs.find(l => l.action === action);
    return log ? formatDateTime(log.scan_time) : '-';
  };

  const handleExport = () => {
    if (displayData.length === 0) {
      alert("No data to export");
      return;
    }

    const headers = [
      "Student Name", "College ID", "Student Contact", 
      "Course", "Stream", "Building", "Room", 
      "Pass Type", "Start Time", "End Time", 
      "Check Out Time", "Check In Time", 
      "Father Contact", "Mother Contact", "Status"
    ];

    const rows = displayData.map(pass => {
      const student = pass.college || {};
      return [
        `"${student.first_name || ''} ${student.last_name || ''}"`,
        `"${student.id || pass.college_id}"`,
        `"${student.contact_details || ''}"`,
        `"${student.course || ''}"`,
        `"${student.stream || ''}"`,
        `"${student.building || ''}"`,
        `"${student.room || ''}"`,
        `"${pass.pass_type}"`,
        `"${formatDateTime(pass.leave_start)}"`,
        `"${formatDateTime(pass.leave_end)}"`,
        `"${getLogTime(pass.logs, 'checked_out')}"`,
        `"${getLogTime(pass.logs, 'checked_in')}"`,
        `"${student.father_phone || ''}"`,
        `"${student.mother_phone || ''}"`,
        `"${pass.pass_status}"`
      ].join(',');
    });

    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "passes_export.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-20 bg-gradient-to-r from-[#10162F] to-[#10162F]/80 text-white shadow-lg border-b border-indigo-950/50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex justify-between items-center transition-all duration-300">
          <div className="flex items-center gap-3">
            <img src="/digipass logo lateral.png" alt="DigiPass Logo" className="h-14 w-auto object-contain" />
            <span className="hidden sm:flex ml-2 px-2.5 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-200 text-[10px] font-bold tracking-widest uppercase">
              Warden
            </span>
          </div>
          <button onClick={handleLogout} className="group h-10 px-4 text-xs font-semibold rounded-[3.19px] bg-white/5 hover:bg-red-500/10 ring-1 ring-white/20 hover:ring-red-500/50 transition-all duration-300 text-white hover:text-red-400 flex items-center justify-center gap-2 active:scale-95">
            <span className="hidden sm:inline">Logout</span>
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      <main className="max-w-[1400px] mx-auto px-4 sm:px-6 py-8">
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Pass Management</h2>
            <p className="text-sm text-slate-500 mt-1">Review requests, monitor active passes, and view logs.</p>
          </div>
        </div>

        {/* Filters Section */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 mb-6 flex flex-col gap-4">
          <div className="flex flex-wrap gap-4 items-end">
            
            {/* Search */}
            <div className="flex flex-col gap-1.5 flex-1 min-w-[200px]">
              <label className="text-xs font-semibold text-slate-600">Search</label>
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="College ID..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') handleSearch(); }}
                  className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>

            {/* Status */}
            <div className="flex flex-col gap-1.5 min-w-[150px]">
              <label className="text-xs font-semibold text-slate-600">Status</label>
              <select 
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="All">All</option>
                <option value="Pending">Pending</option>
                <option value="Approved">Approved</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>

            {/* Date Range */}
            <div className="flex flex-col gap-1.5 w-full sm:w-auto">
              <label className="text-xs font-semibold text-slate-600">Date Range</label>
              <div className="flex items-center gap-1.5 sm:gap-2 w-full">
                <input 
                  type="date"
                  value={startDate}
                  onChange={e => setStartDate(e.target.value)}
                  className="flex-1 min-w-0 max-w-full px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <span className="text-slate-500 text-xs sm:text-sm shrink-0">to</span>
                <input 
                  type="date"
                  value={endDate}
                  onChange={e => setEndDate(e.target.value)}
                  className="flex-1 min-w-0 max-w-full px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-slate-100">
            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={isReturned} 
                  onChange={e => setIsReturned(e.target.checked)}
                  className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
                />
                Returned
              </label>
              <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={isNotReturned} 
                  onChange={e => setIsNotReturned(e.target.checked)}
                  className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
                />
                Not Returned
              </label>
            </div>

            <div className="flex items-center gap-3">
              <button 
                onClick={handleSearch}
                disabled={loading}
                className="flex items-center gap-2 px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg transition-colors shadow-sm disabled:opacity-70"
              >
                <Play className="w-4 h-4" />
                {loading ? 'Loading...' : 'Go'}
              </button>
              <button 
                onClick={handleExport}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-sm font-semibold rounded-lg transition-colors shadow-sm"
              >
                <Download className="w-4 h-4" />
                Export
              </button>
            </div>
          </div>
        </div>

        {/* Data Table */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto hide-scrollbar">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase text-slate-500 font-semibold">
                <tr>
                  <th className="px-4 py-3 min-w-[200px]">Student Info</th>
                  <th className="px-4 py-3 min-w-[150px]">Academics</th>
                  <th className="px-4 py-3 min-w-[150px]">Housing</th>
                  <th className="px-4 py-3">Pass Type</th>
                  <th className="px-4 py-3 min-w-[180px]">Pass Duration</th>
                  <th className="px-4 py-3 min-w-[150px]">Check out</th>
                  <th className="px-4 py-3 min-w-[150px]">Check In</th>
                  <th className="px-4 py-3 min-w-[200px]">Parent's Contact</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 min-w-[150px] text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {displayData.length > 0 ? displayData.map((pass, idx) => {
                  const student = pass.college || {};
                  
                  return (
                    <tr key={pass.pass_id || idx} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-4 py-4">
                        <div className="font-bold text-slate-900">{student.first_name || 'Unknown'} {student.last_name || ''}</div>
                        <div className="text-xs text-slate-500 font-mono mt-0.5">{student.id || pass.college_id}</div>
                        <div className="text-xs text-slate-600 mt-1">{student.contact_details || 'No contact'}</div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="font-medium text-slate-800">{student.course || 'N/A'}</div>
                        <div className="text-xs text-slate-500 mt-0.5">{student.stream || '-'}</div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="text-slate-800">{student.building || 'N/A'}</div>
                        <div className="text-xs text-slate-500 mt-0.5">{student.room ? `${student.room}` : '-'}</div>
                      </td>
                      <td className="px-4 py-4">
                        <span className="font-semibold text-slate-700 capitalize">[{pass.pass_type}]</span>
                      </td>
                      <td className="px-4 py-4 text-xs text-slate-600 space-y-1">
                        {/* {console.log(pass.college_id)}
                        {console.log(formatDateTime(pass.leave_start))}
                        {console.log(formatDateTime(pass.leave_end))} */}
                        <div>{formatDateTime(pass.leave_start)}</div>
                        <div className="text-slate-400">to</div>
                        <div>{formatDateTime(pass.leave_end)}</div>
                      </td>
                      <td className="px-4 py-4 text-xs font-mono text-slate-600">
                        {getLogTime(pass.logs, 'checked_out')}
                      </td>
                      <td className="px-4 py-4 text-xs font-mono text-slate-600">
                        {getLogTime(pass.logs, 'checked_in')}
                      </td>
                      <td className="px-4 py-4 text-xs text-slate-700">
                        <div className="mb-2">
                          <span className="text-slate-500">Father - </span>
                          <span className="font-medium">{student.father_phone || 'N/A'}</span>
                        </div>
                        <div>
                          <span className="text-slate-500">Mother - </span>
                          <span className="font-medium">{student.mother_phone || 'N/A'}</span>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${
                          pass.pass_status === 'approved' ? 'bg-emerald-100 text-emerald-800' :
                          pass.pass_status === 'rejected' ? 'bg-rose-100 text-rose-800' :
                          'bg-amber-100 text-amber-800'
                        }`}>
                          {pass.pass_status ? pass.pass_status.charAt(0).toUpperCase() + pass.pass_status.slice(1) : 'Unknown'}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        {pass.pass_status === 'pending' ? (
                          <div className="flex items-center justify-center gap-2">
                            <button 
                              onClick={() => handleApprove(pass.pass_id)}
                              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-md shadow-sm transition-colors"
                            >
                              Approve
                            </button>
                            <button 
                              onClick={() => handleReject(pass.pass_id)}
                              className="px-3 py-1.5 bg-white border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-bold rounded-md shadow-sm transition-colors"
                            >
                              Reject
                            </button>
                          </div>
                        ) : (
                          <div className="text-center text-slate-400 text-xs font-medium">-</div>
                        )}
                      </td>
                    </tr>
                  );
                }) : (
                  <tr>
                    <td colSpan="10" className="px-4 py-16 text-center">
                      <div className="flex flex-col items-center justify-center text-slate-500">
                        <Search className="w-8 h-8 mb-3 text-slate-400" />
                        <p className="text-base font-semibold text-slate-900">No records found</p>
                        <p className="text-sm mt-1">Try adjusting your filters and click 'Go'</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile Tile / Accordion View (visible on small screens) */}
          <div className="md:hidden divide-y divide-slate-100">
            {displayData.length > 0 ? (
              displayData.map((pass, idx) => {
                const student = pass.college || {};
                const passKey = pass.pass_id || idx;
                const isExpanded = !!expandedPasses[passKey];

                return (
                  <div key={passKey} className="p-4 bg-white hover:bg-slate-50/50 transition-colors">
                    {/* Collapsed Tile Header: Student Info, Pass Type, Status & Dropdown Icon */}
                    <div 
                      onClick={() => toggleExpand(passKey)}
                      className="flex items-start justify-between gap-3 cursor-pointer select-none"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-slate-900 text-sm">
                            {student.first_name || 'Unknown'} {student.last_name || ''}
                          </span>
                          <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700 capitalize">
                            [{pass.pass_type}]
                          </span>
                        </div>
                        <div className="text-xs text-slate-500 font-mono mt-0.5">
                          {student.id || pass.college_id}
                        </div>
                        <div className="text-xs text-slate-600 mt-0.5">
                          {student.contact_details || 'No contact'}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 pt-0.5">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${
                          pass.pass_status === 'approved' ? 'bg-emerald-100 text-emerald-800' :
                          pass.pass_status === 'rejected' ? 'bg-rose-100 text-rose-800' :
                          'bg-amber-100 text-amber-800'
                        }`}>
                          {pass.pass_status ? pass.pass_status.charAt(0).toUpperCase() + pass.pass_status.slice(1) : 'Unknown'}
                        </span>
                        <div 
                          className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md transition-colors"
                          aria-label={isExpanded ? "Collapse details" : "Expand details"}
                        >
                          {isExpanded ? (
                            <ChevronUp className="w-5 h-5 text-indigo-600" />
                          ) : (
                            <ChevronDown className="w-5 h-5 text-slate-400" />
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Expanded Details Section */}
                    {isExpanded && (
                      <div className="mt-3.5 pt-3.5 border-t border-slate-100 text-xs space-y-3 bg-slate-50/70 p-3 rounded-lg">
                        <div className="grid grid-cols-2 gap-3 ">
                          <div>
                            <span className="text-slate-500 block font-medium">Academics</span>
                            <span className="text-slate-800 font-semibold">{student.course || 'N/A'}</span>
                            <span className="text-slate-500 block text-[11px]">{student.stream || '-'}</span>
                          </div>
                          <div>
                            <span className="text-slate-500 block font-medium">Housing</span>
                            <span className="text-slate-800 font-semibold">{student.building || 'N/A'}</span>
                            <span className="text-slate-500 block text-[11px]">{student.room ? `Room ${student.room}` : '-'}</span>
                          </div>
                        </div>

                        <div>
                          <span className="text-slate-500 block font-medium">Pass Duration</span>
                          <div className="text-slate-700 font-medium">
                            {formatDateTime(pass.leave_start)} <span className="text-slate-400">to</span> {formatDateTime(pass.leave_end)}
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <span className="text-slate-500 block font-medium">Check out</span>
                            <span className="font-mono text-slate-700">{getLogTime(pass.logs, 'checked_out')}</span>
                          </div>
                          <div>
                            <span className="text-slate-500 block font-medium">Check In</span>
                            <span className="font-mono text-slate-700">{getLogTime(pass.logs, 'checked_in')}</span>
                          </div>
                        </div>

                        <div>
                          <span className="text-slate-500 block font-medium">Parent's Contact</span>
                          <div className="text-slate-700">
                            <span className="text-slate-500">Father - </span>
                            <span className="font-medium">{student.father_phone || 'N/A'}</span>
                          </div>
                          <div className="text-slate-700 mt-0.5">
                            <span className="text-slate-500">Mother - </span>
                            <span className="font-medium">{student.mother_phone || 'N/A'}</span>
                          </div>
                        </div>

                        {pass.pass_status === 'pending' && (
                          <div className="pt-2 flex items-center gap-2 border-t border-slate-200/60">
                            <button 
                              onClick={(e) => { e.stopPropagation(); handleApprove(pass.pass_id); }}
                              className="flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-md shadow-sm transition-colors text-center"
                            >
                              Approve
                            </button>
                            <button 
                              onClick={(e) => { e.stopPropagation(); handleReject(pass.pass_id); }}
                              className="flex-1 py-1.5 bg-white border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-bold rounded-md shadow-sm transition-colors text-center"
                            >
                              Reject
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="px-4 py-12 text-center">
                <Search className="w-8 h-8 mx-auto mb-2 text-slate-400" />
                <p className="text-sm font-semibold text-slate-800">No records found</p>
                <p className="text-xs text-slate-500 mt-0.5">Try adjusting your filters and click 'Go'</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default ApprovalPage;
