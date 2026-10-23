import React, { useState, useMemo } from 'react';
import { 
  BarChart, Bar, LineChart, Line, AreaChart, Area, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { 
  BarChart3, LineChart as LineIcon, PieChart as PieIcon, AreaChart as AreaIcon,
  Table as TableIcon, Code2, Download, Copy, Check, Search, ChevronLeft, ChevronRight,
  TrendingUp, Hash, Clock, Layers
} from 'lucide-react';
import Card from './Card';
import Button from './Button';
import Badge from './Badge';
import SQLViewer from './SQLViewer';
import toast from 'react-hot-toast';

const PALETTE = [
  '#4f46e5', '#06b6d4', '#10b981', '#f59e0b', '#8b5cf6', 
  '#ec4899', '#3b82f6', '#14b8a6', '#f97316', '#6366f1'
];

const DataVisualizer = ({ 
  data = [], 
  columns = [], 
  sql = '', 
  chartConfig = {}, 
  executionTimeMs = 0,
  rowCount = 0,
  onRerun
}) => {
  const [activeTab, setActiveTab] = useState('chart'); // 'chart' | 'table' | 'sql'
  const [chartType, setChartType] = useState(() => {
    const rec = chartConfig?.chart_type?.toLowerCase();
    if (['bar', 'line', 'area', 'pie'].includes(rec)) return rec;
    return 'bar';
  });
  
  // Table search & pagination state
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;
  const [copiedJson, setCopiedJson] = useState(false);

  // Determine X key and Y keys
  const xKey = useMemo(() => {
    if (chartConfig?.x_key && columns.includes(chartConfig.x_key)) {
      return chartConfig.x_key;
    }
    // Heuristic: Pick first non-numeric or first column
    if (data.length > 0) {
      const firstRow = data[0];
      const stringCol = columns.find(col => typeof firstRow[col] === 'string');
      if (stringCol) return stringCol;
    }
    return columns[0] || 'label';
  }, [chartConfig, columns, data]);

  const yKeys = useMemo(() => {
    if (chartConfig?.y_keys && Array.isArray(chartConfig.y_keys) && chartConfig.y_keys.length > 0) {
      const valid = chartConfig.y_keys.filter(k => columns.includes(k));
      if (valid.length > 0) return valid;
    }
    // Heuristic: Pick numeric columns
    if (data.length > 0) {
      const firstRow = data[0];
      const numCols = columns.filter(col => col !== xKey && typeof firstRow[col] === 'number');
      if (numCols.length > 0) return numCols.slice(0, 3);
    }
    return columns.filter(c => c !== xKey).slice(0, 2);
  }, [chartConfig, columns, data, xKey]);

  // Compute summary stats for the primary Y metric
  const summaryStats = useMemo(() => {
    if (!data || data.length === 0 || yKeys.length === 0) return null;
    const primaryKey = yKeys[0];
    const vals = data.map(d => Number(d[primaryKey]) || 0).filter(v => !isNaN(v));
    if (vals.length === 0) return null;

    const sum = vals.reduce((a, b) => a + b, 0);
    const avg = sum / vals.length;
    const max = Math.max(...vals);
    const min = Math.min(...vals);

    return {
      metricName: primaryKey.replace(/_/g, ' ').toUpperCase(),
      total: sum >= 1000 ? sum.toLocaleString(undefined, { maximumFractionDigits: 1 }) : sum.toFixed(2),
      average: avg.toLocaleString(undefined, { maximumFractionDigits: 1 }),
      max: max.toLocaleString(undefined, { maximumFractionDigits: 1 }),
      count: data.length
    };
  }, [data, yKeys]);

  // Filtered & Paginated Table Data
  const filteredData = useMemo(() => {
    if (!searchQuery.trim()) return data;
    const q = searchQuery.toLowerCase();
    return data.filter(row => 
      columns.some(col => String(row[col] ?? '').toLowerCase().includes(q))
    );
  }, [data, searchQuery, columns]);

  const totalPages = Math.ceil(filteredData.length / pageSize) || 1;
  const paginatedRows = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredData.slice(start, start + pageSize);
  }, [filteredData, currentPage, pageSize]);

  // Export CSV
  const handleExportCSV = () => {
    if (!data.length) return;
    const headers = columns.join(',');
    const rows = data.map(r => 
      columns.map(col => {
        const val = r[col] ?? '';
        return typeof val === 'string' && val.includes(',') ? `"${val}"` : val;
      }).join(',')
    );
    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `askdb_results_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('CSV downloaded successfully!');
  };

  // Copy JSON
  const handleCopyJSON = async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(data, null, 2));
      setCopiedJson(true);
      toast.success('Data JSON copied to clipboard!');
      setTimeout(() => setCopiedJson(false), 2000);
    } catch {
      toast.error('Failed to copy JSON.');
    }
  };

  // Format tick labels
  const formatValue = (val) => {
    if (typeof val === 'number') {
      if (Math.abs(val) >= 1000000) return `${(val / 1000000).toFixed(1)}M`;
      if (Math.abs(val) >= 1000) return `${(val / 1000).toFixed(1)}k`;
      return val.toLocaleString();
    }
    return val;
  };

  const hasData = Array.isArray(data) && data.length > 0;
  const canVisualize = hasData && yKeys.length > 0;

  return (
    <Card variant="default" className="w-full mt-3 overflow-hidden border border-light-border dark:border-dark-border shadow-sm">
      {/* Top Header & Tab Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 bg-light-hover/30 dark:bg-dark-hover/30 border-b border-light-border dark:border-dark-border">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border rounded-xl">
          <button
            onClick={() => setActiveTab('chart')}
            disabled={!canVisualize}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'chart'
                ? 'bg-accent-primary text-white shadow-sm'
                : 'text-light-muted dark:text-dark-muted hover:text-light-text dark:hover:text-dark-text'
            } ${!canVisualize ? 'opacity-40 cursor-not-allowed' : ''}`}
          >
            <BarChart3 size={13} />
            <span>Visualization</span>
          </button>

          <button
            onClick={() => setActiveTab('table')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'table'
                ? 'bg-accent-primary text-white shadow-sm'
                : 'text-light-muted dark:text-dark-muted hover:text-light-text dark:hover:text-dark-text'
            }`}
          >
            <TableIcon size={13} />
            <span>Table View</span>
            {hasData && (
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                activeTab === 'table' ? 'bg-white/20 text-white' : 'bg-light-hover dark:bg-dark-hover text-light-muted'
              }`}>
                {data.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('sql')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'sql'
                ? 'bg-accent-primary text-white shadow-sm'
                : 'text-light-muted dark:text-dark-muted hover:text-light-text dark:hover:text-dark-text'
            }`}
          >
            <Code2 size={13} />
            <span>SQL Query</span>
          </button>
        </div>

        {/* Latency & Row Count Info Badges */}
        <div className="flex items-center gap-2 text-xs">
          {executionTimeMs > 0 && (
            <div className="flex items-center gap-1 text-[11px] font-mono text-light-muted dark:text-dark-muted bg-light-hover dark:bg-dark-hover px-2.5 py-1 rounded-lg border border-light-border dark:border-dark-border">
              <Clock size={11} className="text-accent-secondary" />
              <span>{executionTimeMs}ms</span>
            </div>
          )}
          <Badge variant="neutral" className="gap-1 text-[11px]">
            <Hash size={11} />
            <span>{rowCount || data.length} rows</span>
          </Badge>
        </div>
      </div>

      {/* Main Body */}
      <div className="p-4 md:p-5">
        {/* TAB 1: VISUALIZATION (CHARTS) */}
        {activeTab === 'chart' && (
          <div className="space-y-4">
            {/* Chart Sub-Controls Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-light-border/60 dark:border-dark-border/60">
              {/* Chart title */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-light-text dark:text-dark-text uppercase tracking-wider">
                  {chartConfig?.title || 'Analytical Trend'}
                </span>
              </div>

              {/* Chart Type Selector Pills */}
              <div className="flex items-center gap-1 bg-light-hover dark:bg-dark-hover p-1 rounded-lg border border-light-border dark:border-dark-border">
                {[
                  { id: 'bar', label: 'Bar', icon: BarChart3 },
                  { id: 'line', label: 'Line', icon: LineIcon },
                  { id: 'area', label: 'Area', icon: AreaIcon },
                  { id: 'pie', label: 'Pie', icon: PieIcon },
                ].map(type => (
                  <button
                    key={type.id}
                    onClick={() => setChartType(type.id)}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium transition-all ${
                      chartType === type.id
                        ? 'bg-accent-secondary text-white font-bold shadow-sm'
                        : 'text-light-muted dark:text-dark-muted hover:text-light-text dark:hover:text-dark-text'
                    }`}
                  >
                    <type.icon size={12} />
                    <span>{type.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Metric Summary Cards */}
            {summaryStats && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 bg-light-hover/40 dark:bg-dark-hover/20 rounded-xl border border-light-border dark:border-dark-border">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-light-muted dark:text-dark-muted block">
                    Total {summaryStats.metricName}
                  </span>
                  <span className="text-base font-extrabold text-accent-primary">
                    {summaryStats.total}
                  </span>
                </div>
                <div className="p-3 bg-light-hover/40 dark:bg-dark-hover/20 rounded-xl border border-light-border dark:border-dark-border">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-light-muted dark:text-dark-muted block">
                    Average Value
                  </span>
                  <span className="text-base font-extrabold text-accent-secondary">
                    {summaryStats.average}
                  </span>
                </div>
                <div className="p-3 bg-light-hover/40 dark:bg-dark-hover/20 rounded-xl border border-light-border dark:border-dark-border">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-light-muted dark:text-dark-muted block">
                    Peak Value
                  </span>
                  <span className="text-base font-extrabold text-accent-success">
                    {summaryStats.max}
                  </span>
                </div>
                <div className="p-3 bg-light-hover/40 dark:bg-dark-hover/20 rounded-xl border border-light-border dark:border-dark-border">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-light-muted dark:text-dark-muted block">
                    Categories
                  </span>
                  <span className="text-base font-extrabold text-light-text dark:text-dark-text">
                    {summaryStats.count}
                  </span>
                </div>
              </div>
            )}

            {/* Recharts Canvas */}
            <div className="w-full h-72 sm:h-80 pt-2">
              <ResponsiveContainer width="100%" height="100%">
                {chartType === 'bar' ? (
                  <BarChart data={data} margin={{ top: 10, right: 20, left: 10, bottom: 25 }}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                    <XAxis 
                      dataKey={xKey} 
                      tick={{ fontSize: 11, fill: '#888' }} 
                      interval={0}
                      angle={data.length > 5 ? -25 : 0}
                      textAnchor={data.length > 5 ? "end" : "middle"}
                    />
                    <YAxis tick={{ fontSize: 11, fill: '#888' }} tickFormatter={formatValue} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#0f172a', 
                        borderColor: '#334155', 
                        borderRadius: '0.75rem',
                        color: '#f8fafc',
                        fontSize: '12px'
                      }} 
                    />
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                    {yKeys.map((k, idx) => (
                      <Bar 
                        key={k} 
                        dataKey={k} 
                        fill={PALETTE[idx % PALETTE.length]} 
                        radius={[6, 6, 0, 0]} 
                      />
                    ))}
                  </BarChart>
                ) : chartType === 'line' ? (
                  <LineChart data={data} margin={{ top: 10, right: 20, left: 10, bottom: 25 }}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                    <XAxis 
                      dataKey={xKey} 
                      tick={{ fontSize: 11, fill: '#888' }} 
                      interval={0}
                      angle={data.length > 5 ? -25 : 0}
                      textAnchor={data.length > 5 ? "end" : "middle"}
                    />
                    <YAxis tick={{ fontSize: 11, fill: '#888' }} tickFormatter={formatValue} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#0f172a', 
                        borderColor: '#334155', 
                        borderRadius: '0.75rem',
                        color: '#f8fafc',
                        fontSize: '12px'
                      }} 
                    />
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                    {yKeys.map((k, idx) => (
                      <Line 
                        key={k} 
                        type="monotone" 
                        dataKey={k} 
                        stroke={PALETTE[idx % PALETTE.length]} 
                        strokeWidth={3} 
                        dot={{ r: 4 }} 
                        activeDot={{ r: 6 }} 
                      />
                    ))}
                  </LineChart>
                ) : chartType === 'area' ? (
                  <AreaChart data={data} margin={{ top: 10, right: 20, left: 10, bottom: 25 }}>
                    <defs>
                      <linearGradient id="colorArea" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={PALETTE[0]} stopOpacity={0.6}/>
                        <stop offset="95%" stopColor={PALETTE[0]} stopOpacity={0.05}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                    <XAxis 
                      dataKey={xKey} 
                      tick={{ fontSize: 11, fill: '#888' }} 
                      interval={0}
                      angle={data.length > 5 ? -25 : 0}
                      textAnchor={data.length > 5 ? "end" : "middle"}
                    />
                    <YAxis tick={{ fontSize: 11, fill: '#888' }} tickFormatter={formatValue} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#0f172a', 
                        borderColor: '#334155', 
                        borderRadius: '0.75rem',
                        color: '#f8fafc',
                        fontSize: '12px'
                      }} 
                    />
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                    {yKeys.map((k, idx) => (
                      <Area 
                        key={k} 
                        type="monotone" 
                        dataKey={k} 
                        stroke={PALETTE[idx % PALETTE.length]} 
                        fillOpacity={1} 
                        fill="url(#colorArea)" 
                      />
                    ))}
                  </AreaChart>
                ) : (
                  <PieChart>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#0f172a', 
                        borderColor: '#334155', 
                        borderRadius: '0.75rem',
                        color: '#f8fafc',
                        fontSize: '12px'
                      }} 
                    />
                    <Legend wrapperStyle={{ fontSize: '11px' }} />
                    <Pie
                      data={data}
                      dataKey={yKeys[0]}
                      nameKey={xKey}
                      cx="50%"
                      cy="50%"
                      outerRadius={95}
                      innerRadius={45}
                      paddingAngle={3}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {data.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={PALETTE[index % PALETTE.length]} />
                      ))}
                    </Pie>
                  </PieChart>
                )}
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* TAB 2: DATA TABLE VIEW */}
        {activeTab === 'table' && (
          <div className="space-y-4">
            {/* Search filter & Export tools */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="relative flex-1 max-w-xs">
                <Search size={14} className="absolute left-3 top-3 text-light-muted dark:text-dark-muted" />
                <input
                  type="text"
                  placeholder="Filter table rows..."
                  value={searchQuery}
                  onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                  className="w-full pl-9 pr-3 py-1.5 bg-light-hover dark:bg-dark-hover border border-light-border dark:border-dark-border rounded-lg text-xs text-light-text dark:text-dark-text focus:outline-none focus:ring-1 focus:ring-accent-primary"
                />
              </div>

              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={handleExportCSV} className="gap-1.5 text-xs !py-1.5">
                  <Download size={13} />
                  <span>Export CSV</span>
                </Button>
                <Button variant="outline" size="sm" onClick={handleCopyJSON} className="gap-1.5 text-xs !py-1.5">
                  {copiedJson ? <Check size={13} className="text-accent-success" /> : <Copy size={13} />}
                  <span>{copiedJson ? 'Copied' : 'JSON'}</span>
                </Button>
              </div>
            </div>

            {/* Table Container */}
            <div className="overflow-x-auto border border-light-border dark:border-dark-border rounded-xl">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-light-hover/60 dark:bg-dark-hover/40 text-[10px] font-bold uppercase tracking-wider text-light-muted dark:text-dark-muted border-b border-light-border dark:border-dark-border">
                    <th className="py-2.5 px-4 w-12 text-center">#</th>
                    {columns.map((col, idx) => (
                      <th key={idx} className="py-2.5 px-4 whitespace-nowrap">
                        {col.replace(/_/g, ' ')}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-light-border dark:divide-dark-border font-sans">
                  {paginatedRows.length === 0 ? (
                    <tr>
                      <td colSpan={columns.length + 1} className="py-8 text-center text-light-muted dark:text-dark-muted">
                        No rows found matching "{searchQuery}"
                      </td>
                    </tr>
                  ) : (
                    paginatedRows.map((row, rIdx) => {
                      const absoluteIndex = (currentPage - 1) * pageSize + rIdx + 1;
                      return (
                        <tr key={rIdx} className="hover:bg-light-hover/40 dark:hover:bg-dark-hover/20 transition-colors">
                          <td className="py-2.5 px-4 text-center font-mono text-[11px] text-light-muted dark:text-dark-muted select-none">
                            {absoluteIndex}
                          </td>
                          {columns.map((col, cIdx) => {
                            const val = row[col];
                            const isNumeric = typeof val === 'number';
                            return (
                              <td key={cIdx} className={`py-2.5 px-4 whitespace-nowrap ${isNumeric ? 'font-mono text-accent-primary font-medium' : ''}`}>
                                {val !== null && val !== undefined ? String(val) : <span className="text-light-muted dark:text-dark-muted italic">NULL</span>}
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-2 pt-1 text-xs text-light-muted dark:text-dark-muted">
                <span>
                  Showing {(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, filteredData.length)} of {filteredData.length} records
                </span>
                <div className="flex items-center gap-1.5">
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(p => p - 1)}
                    className="!p-1.5"
                  >
                    <ChevronLeft size={14} />
                  </Button>
                  <span className="font-bold px-2">
                    {currentPage} / {totalPages}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(p => p + 1)}
                    className="!p-1.5"
                  >
                    <ChevronRight size={14} />
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: SQL CODE VIEWER */}
        {activeTab === 'sql' && (
          <div className="space-y-3">
            <SQLViewer sql={sql} />
            {onRerun && (
              <div className="flex justify-end pt-1">
                <Button variant="primary" size="sm" onClick={() => onRerun(sql)} className="text-xs">
                  Re-execute Query
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </Card>
  );
};

export default DataVisualizer;
