import { useState, useEffect } from 'react';
import { useToast } from '../../components/Toast';
import api from '../../services/api';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import '../Dashboard.css';

const MONTHS = [
    { value: 1, label: 'January' }, { value: 2, label: 'February' },
    { value: 3, label: 'March' }, { value: 4, label: 'April' },
    { value: 5, label: 'May' }, { value: 6, label: 'June' },
    { value: 7, label: 'July' }, { value: 8, label: 'August' },
    { value: 9, label: 'September' }, { value: 10, label: 'October' },
    { value: 11, label: 'November' }, { value: 12, label: 'December' }
];

const AdminReports = () => {
    const currentDate = new Date();
    const [report, setReport] = useState(null);
    const [period, setPeriod] = useState('monthly');
    const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth() + 1);
    const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());
    const [loading, setLoading] = useState(true);
    const toast = useToast();

    // Generate year options (current year and 4 years back)
    const yearOptions = [];
    for (let y = currentDate.getFullYear(); y >= currentDate.getFullYear() - 4; y--) {
        yearOptions.push(y);
    }

    useEffect(() => { loadReports(); }, [period, selectedMonth, selectedYear]);

    const loadReports = async () => {
        setLoading(true);
        try {
            let url = '/admin/reports?';
            if (period === 'monthly') {
                url += `period=monthly&month=${selectedMonth}&year=${selectedYear}`;
            } else if (period === 'yearly') {
                url += `period=yearly&year=${selectedYear}`;
            } else {
                url += `period=${period}`;
            }
            const res = await api.get(url);
            setReport(res.data || {});
        } catch (err) {
            toast.error(err.message || 'Failed to load reports');
            setReport({});
        }
        setLoading(false);
    };

    const getPeriodLabel = () => {
        if (period === 'monthly') {
            const monthName = MONTHS.find(m => m.value === selectedMonth)?.label || '';
            return `${monthName} ${selectedYear}`;
        }
        if (period === 'yearly') return `Year ${selectedYear}`;
        if (period === 'daily') return 'Today';
        if (period === 'weekly') return 'This Week';
        return period;
    };

    const getFormattedDate = () => {
        return new Date().toLocaleDateString('en-IN', {
            year: 'numeric', month: 'long', day: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    };

    // ===================== PDF EXPORT =====================
    const downloadPDF = () => {
        if (!report) { toast.error('No data to export'); return; }

        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.getWidth();

        // Header
        doc.setFillColor(37, 99, 235);
        doc.rect(0, 0, pageWidth, 40, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(22);
        doc.setFont('helvetica', 'bold');
        doc.text('DocBook - Reports & Analytics', 14, 20);
        doc.setFontSize(11);
        doc.setFont('helvetica', 'normal');
        doc.text(`Period: ${getPeriodLabel()} | Generated: ${getFormattedDate()}`, 14, 32);

        // Summary Stats
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('Summary Statistics', 14, 55);

        autoTable(doc, {
            startY: 60,
            head: [['Metric', 'Count']],
            body: [
                ['Total Appointments', String(report.totalAppointments || 0)],
                ['Completed Appointments', String(report.completedAppointments || 0)],
                ['Cancelled Appointments', String(report.cancelledAppointments || 0)],
                ['New Doctors', String(report.newDoctors || 0)],
                ['New Patients', String(report.newPatients || 0)]
            ],
            theme: 'grid',
            headStyles: { fillColor: [37, 99, 235], textColor: 255, fontSize: 11, fontStyle: 'bold' },
            bodyStyles: { fontSize: 10 },
            alternateRowStyles: { fillColor: [245, 247, 250] },
            margin: { left: 14, right: 14 }
        });

        let currentY = doc.lastAutoTable.finalY + 15;

        // Top Specializations
        if (report.specializations && report.specializations.length > 0) {
            doc.setFontSize(14);
            doc.setFont('helvetica', 'bold');
            doc.text('Top Specializations', 14, currentY);
            autoTable(doc, {
                startY: currentY + 5,
                head: [['Specialization', 'Appointments']],
                body: report.specializations.map(s => [s.specialization, String(s.appointment_count)]),
                theme: 'grid',
                headStyles: { fillColor: [16, 185, 129], textColor: 255, fontSize: 11, fontStyle: 'bold' },
                bodyStyles: { fontSize: 10 },
                alternateRowStyles: { fillColor: [240, 253, 244] },
                margin: { left: 14, right: 14 }
            });
            currentY = doc.lastAutoTable.finalY + 15;
        }

        // Monthly Revenue
        if (report.monthlyRevenue && report.monthlyRevenue.length > 0) {
            if (currentY > 230) { doc.addPage(); currentY = 20; }
            doc.setFontSize(14);
            doc.setFont('helvetica', 'bold');
            doc.text('Revenue Breakdown', 14, currentY);
            autoTable(doc, {
                startY: currentY + 5,
                head: [['Month', 'Appointments', 'Revenue']],
                body: report.monthlyRevenue.map(m => [m.month, String(m.appointments), `Rs.${Number(m.revenue).toLocaleString('en-IN')}`]),
                theme: 'grid',
                headStyles: { fillColor: [245, 158, 11], textColor: 255, fontSize: 11, fontStyle: 'bold' },
                bodyStyles: { fontSize: 10 },
                alternateRowStyles: { fillColor: [255, 251, 235] },
                margin: { left: 14, right: 14 }
            });
            currentY = doc.lastAutoTable.finalY + 15;
        }

        // Trends
        if (report.trends && report.trends.length > 0) {
            if (currentY > 230) { doc.addPage(); currentY = 20; }
            doc.setFontSize(14);
            doc.setFont('helvetica', 'bold');
            doc.text('Appointment Trends', 14, currentY);
            autoTable(doc, {
                startY: currentY + 5,
                head: [['Date', 'Status', 'Count']],
                body: report.trends.map(t => [
                    new Date(t.date).toLocaleDateString('en-IN'),
                    t.status.charAt(0).toUpperCase() + t.status.slice(1),
                    String(t.count)
                ]),
                theme: 'grid',
                headStyles: { fillColor: [139, 92, 246], textColor: 255, fontSize: 11, fontStyle: 'bold' },
                bodyStyles: { fontSize: 10 },
                alternateRowStyles: { fillColor: [245, 243, 255] },
                margin: { left: 14, right: 14 }
            });
        }

        // Footer
        const pageCount = doc.internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setFontSize(8);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(150, 150, 150);
            doc.text(`DocBook Reports - Page ${i} of ${pageCount}`, pageWidth / 2, doc.internal.pageSize.getHeight() - 10, { align: 'center' });
        }

        doc.save(`DocBook_Report_${getPeriodLabel().replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`);
        toast.success('PDF downloaded successfully!');
    };

    // ===================== EXCEL EXPORT =====================
    const downloadExcel = () => {
        if (!report) { toast.error('No data to export'); return; }
        const wb = XLSX.utils.book_new();

        // Sheet 1: Summary
        const summaryData = [
            ['DocBook - Reports & Analytics'],
            [`Period: ${getPeriodLabel()}`],
            [`Generated: ${getFormattedDate()}`],
            [],
            ['Metric', 'Count'],
            ['Total Appointments', report.totalAppointments || 0],
            ['Completed Appointments', report.completedAppointments || 0],
            ['Cancelled Appointments', report.cancelledAppointments || 0],
            ['New Doctors', report.newDoctors || 0],
            ['New Patients', report.newPatients || 0]
        ];
        const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
        summarySheet['!cols'] = [{ wch: 25 }, { wch: 15 }];
        XLSX.utils.book_append_sheet(wb, summarySheet, 'Summary');

        // Sheet 2: Specializations
        if (report.specializations && report.specializations.length > 0) {
            const specData = [['Specialization', 'Appointment Count'], ...report.specializations.map(s => [s.specialization, s.appointment_count])];
            const specSheet = XLSX.utils.aoa_to_sheet(specData);
            specSheet['!cols'] = [{ wch: 25 }, { wch: 20 }];
            XLSX.utils.book_append_sheet(wb, specSheet, 'Specializations');
        }

        // Sheet 3: Revenue
        if (report.monthlyRevenue && report.monthlyRevenue.length > 0) {
            const revenueData = [['Month', 'Appointments', 'Revenue'], ...report.monthlyRevenue.map(m => [m.month, m.appointments, Number(m.revenue)])];
            const revenueSheet = XLSX.utils.aoa_to_sheet(revenueData);
            revenueSheet['!cols'] = [{ wch: 15 }, { wch: 15 }, { wch: 15 }];
            XLSX.utils.book_append_sheet(wb, revenueSheet, 'Revenue');
        }

        // Sheet 4: Trends
        if (report.trends && report.trends.length > 0) {
            const trendsData = [['Date', 'Status', 'Count'], ...report.trends.map(t => [new Date(t.date).toLocaleDateString('en-IN'), t.status.charAt(0).toUpperCase() + t.status.slice(1), t.count])];
            const trendsSheet = XLSX.utils.aoa_to_sheet(trendsData);
            trendsSheet['!cols'] = [{ wch: 15 }, { wch: 15 }, { wch: 10 }];
            XLSX.utils.book_append_sheet(wb, trendsSheet, 'Appointment Trends');
        }

        XLSX.writeFile(wb, `DocBook_Report_${getPeriodLabel().replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.xlsx`);
        toast.success('Excel downloaded successfully!');
    };

    return (
        <div className="dashboard-page">
            <div className="container">
                {/* Page Header with Period Buttons */}
                <div className="page-header animate-fadeIn">
                    <h1>Reports & Analytics 📊</h1>
                    <div className="filter-bar" style={{ marginBottom: 0, gap: '8px' }}>
                        {['daily', 'weekly', 'monthly', 'yearly'].map(p => (
                            <button key={p} className={`btn btn-sm ${period === p ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setPeriod(p)}>
                                {p.charAt(0).toUpperCase() + p.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Month & Year Selectors */}
                {(period === 'monthly' || period === 'yearly') && (
                    <div className="animate-fadeIn" style={{
                        display: 'flex', gap: '12px', marginBottom: '24px',
                        alignItems: 'center', flexWrap: 'wrap',
                        background: 'var(--bg-card)', padding: '16px 20px',
                        borderRadius: '12px', border: '1px solid var(--border-color)',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.06)'
                    }}>
                        <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-secondary)', marginRight: '4px' }}>
                            🗓️ Select {period === 'monthly' ? 'Month & Year' : 'Year'}:
                        </span>

                        {period === 'monthly' && (
                            <select
                                value={selectedMonth}
                                onChange={e => setSelectedMonth(Number(e.target.value))}
                                className="form-select"
                                style={{
                                    padding: '8px 36px 8px 14px', borderRadius: '8px',
                                    border: '2px solid var(--border-color)', fontSize: '14px',
                                    fontWeight: 500, background: 'var(--bg-primary)',
                                    color: 'var(--text-primary)', cursor: 'pointer',
                                    minWidth: '150px', outline: 'none',
                                    transition: 'border-color 0.2s ease'
                                }}
                            >
                                {MONTHS.map(m => (
                                    <option key={m.value} value={m.value}>{m.label}</option>
                                ))}
                            </select>
                        )}

                        <select
                            value={selectedYear}
                            onChange={e => setSelectedYear(Number(e.target.value))}
                            className="form-select"
                            style={{
                                padding: '8px 36px 8px 14px', borderRadius: '8px',
                                border: '2px solid var(--border-color)', fontSize: '14px',
                                fontWeight: 500, background: 'var(--bg-primary)',
                                color: 'var(--text-primary)', cursor: 'pointer',
                                minWidth: '110px', outline: 'none',
                                transition: 'border-color 0.2s ease'
                            }}
                        >
                            {yearOptions.map(y => (
                                <option key={y} value={y}>{y}</option>
                            ))}
                        </select>

                        <span style={{
                            marginLeft: 'auto', fontSize: '13px',
                            color: 'var(--text-tertiary)', fontStyle: 'italic'
                        }}>
                            Showing: {getPeriodLabel()}
                        </span>
                    </div>
                )}

                {loading ? <div className="loading-container"><div className="spinner"></div></div> : report ? (
                    <>
                        {/* Stats Cards */}
                        <div className="stats-grid animate-fadeIn">
                            <div className="stat-card"><div className="stat-icon blue">📅</div><div className="stat-content"><h3>{report.totalAppointments || 0}</h3><p>Appointments</p></div></div>
                            <div className="stat-card"><div className="stat-icon green">✅</div><div className="stat-content"><h3>{report.completedAppointments || 0}</h3><p>Completed</p></div></div>
                            <div className="stat-card"><div className="stat-icon red">❌</div><div className="stat-content"><h3>{report.cancelledAppointments || 0}</h3><p>Cancelled</p></div></div>
                            <div className="stat-card"><div className="stat-icon teal">👨‍⚕️</div><div className="stat-content"><h3>{report.newDoctors || 0}</h3><p>New Doctors</p></div></div>
                            <div className="stat-card"><div className="stat-icon orange">🧑‍💼</div><div className="stat-content"><h3>{report.newPatients || 0}</h3><p>New Patients</p></div></div>
                        </div>

                        {/* Export Buttons */}
                        <div style={{ display: 'flex', gap: '12px', marginBottom: '28px', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                            <button className="btn btn-sm" onClick={downloadPDF}
                                style={{
                                    background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                                    color: '#fff', border: 'none', padding: '10px 22px',
                                    borderRadius: '10px', fontWeight: 600, fontSize: '14px',
                                    display: 'flex', alignItems: 'center', gap: '8px',
                                    boxShadow: '0 2px 8px rgba(239,68,68,0.25)',
                                    cursor: 'pointer', transition: 'all 0.2s ease'
                                }}
                                onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                                onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                            >📄 Download PDF</button>
                            <button className="btn btn-sm" onClick={downloadExcel}
                                style={{
                                    background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                                    color: '#fff', border: 'none', padding: '10px 22px',
                                    borderRadius: '10px', fontWeight: 600, fontSize: '14px',
                                    display: 'flex', alignItems: 'center', gap: '8px',
                                    boxShadow: '0 2px 8px rgba(34,197,94,0.25)',
                                    cursor: 'pointer', transition: 'all 0.2s ease'
                                }}
                                onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                                onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                            >📊 Download Excel</button>
                        </div>

                        {/* Top Specializations */}
                        {report.specializations && report.specializations.length > 0 && (
                            <div className="section-card animate-fadeIn" style={{ marginBottom: '24px' }}>
                                <div className="section-card-header"><h2>🏥 Top Specializations</h2></div>
                                <div className="section-card-body">
                                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                        <thead>
                                            <tr style={{ borderBottom: '2px solid var(--border-color)' }}>
                                                <th style={{ textAlign: 'left', padding: '12px 16px', fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Specialization</th>
                                                <th style={{ textAlign: 'right', padding: '12px 16px', fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Appointments</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {report.specializations.map((s, i) => (
                                                <tr key={i} style={{ borderBottom: '1px solid var(--border-color)', transition: 'background 0.15s ease' }}
                                                    onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-secondary)'}
                                                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                                                    <td style={{ padding: '12px 16px', fontSize: '14px', fontWeight: 500 }}>
                                                        <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', marginRight: '10px', background: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899', '#f97316', '#14b8a6', '#6366f1'][i % 10] }}></span>
                                                        {s.specialization}
                                                    </td>
                                                    <td style={{ textAlign: 'right', padding: '12px 16px', fontSize: '14px', fontWeight: 600, color: 'var(--primary-600)' }}>{s.appointment_count}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {/* Revenue */}
                        {report.monthlyRevenue && report.monthlyRevenue.length > 0 && (
                            <div className="section-card animate-fadeIn" style={{ marginBottom: '24px' }}>
                                <div className="section-card-header"><h2>💰 Revenue Breakdown</h2></div>
                                <div className="section-card-body">
                                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                        <thead>
                                            <tr style={{ borderBottom: '2px solid var(--border-color)' }}>
                                                <th style={{ textAlign: 'left', padding: '12px 16px', fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Month</th>
                                                <th style={{ textAlign: 'center', padding: '12px 16px', fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Appointments</th>
                                                <th style={{ textAlign: 'right', padding: '12px 16px', fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Revenue</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {report.monthlyRevenue.map((m, i) => (
                                                <tr key={i} style={{ borderBottom: '1px solid var(--border-color)', transition: 'background 0.15s ease' }}
                                                    onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-secondary)'}
                                                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                                                    <td style={{ padding: '12px 16px', fontSize: '14px', fontWeight: 500 }}>{m.month}</td>
                                                    <td style={{ textAlign: 'center', padding: '12px 16px', fontSize: '14px' }}>{m.appointments}</td>
                                                    <td style={{ textAlign: 'right', padding: '12px 16px', fontSize: '14px', fontWeight: 600, color: '#16a34a' }}>₹{Number(m.revenue).toLocaleString('en-IN')}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {/* Appointment Trends */}
                        {report.trends && report.trends.length > 0 && (
                            <div className="section-card animate-fadeIn" style={{ marginBottom: '24px' }}>
                                <div className="section-card-header"><h2>📈 Appointment Trends</h2></div>
                                <div className="section-card-body">
                                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                        <thead>
                                            <tr style={{ borderBottom: '2px solid var(--border-color)' }}>
                                                <th style={{ textAlign: 'left', padding: '12px 16px', fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Date</th>
                                                <th style={{ textAlign: 'center', padding: '12px 16px', fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Status</th>
                                                <th style={{ textAlign: 'right', padding: '12px 16px', fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Count</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {report.trends.map((t, i) => {
                                                const statusColors = {
                                                    pending: '#f59e0b', confirmed: '#3b82f6',
                                                    completed: '#22c55e', cancelled: '#ef4444',
                                                    rescheduled: '#8b5cf6', rejected: '#dc2626'
                                                };
                                                return (
                                                    <tr key={i} style={{ borderBottom: '1px solid var(--border-color)', transition: 'background 0.15s ease' }}
                                                        onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-secondary)'}
                                                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                                                        <td style={{ padding: '12px 16px', fontSize: '14px' }}>{new Date(t.date).toLocaleDateString('en-IN')}</td>
                                                        <td style={{ textAlign: 'center', padding: '12px 16px' }}>
                                                            <span style={{
                                                                display: 'inline-block', padding: '4px 12px', borderRadius: '20px',
                                                                fontSize: '12px', fontWeight: 600,
                                                                background: `${statusColors[t.status] || '#6b7280'}20`,
                                                                color: statusColors[t.status] || '#6b7280'
                                                            }}>
                                                                {t.status.charAt(0).toUpperCase() + t.status.slice(1)}
                                                            </span>
                                                        </td>
                                                        <td style={{ textAlign: 'right', padding: '12px 16px', fontSize: '14px', fontWeight: 600 }}>{t.count}</td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {/* Empty state when no detailed data */}
                        {(!report.specializations || report.specializations.length === 0) &&
                            (!report.monthlyRevenue || report.monthlyRevenue.length === 0) &&
                            (!report.trends || report.trends.length === 0) && (
                                <div className="empty-state animate-fadeIn" style={{ marginTop: '20px' }}>
                                    <div className="empty-state-icon">📋</div>
                                    <h3>No Detailed Data Available</h3>
                                    <p style={{ color: 'var(--text-secondary)', marginTop: '8px' }}>Detailed reports will appear here once there are appointments in the system for this period.</p>
                                </div>
                            )}
                    </>
                ) : (
                    <div className="empty-state"><div className="empty-state-icon">📊</div><h3>No Data</h3></div>
                )}
            </div>
        </div>
    );
};

export default AdminReports;
