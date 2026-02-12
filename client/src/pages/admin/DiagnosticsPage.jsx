/**
 * =============================================================================
 * MyNaati Frontend — System Diagnostics Page (Admin Only)
 * =============================================================================
 * 
 * Displays system health information for administrators.
 * Shows database status, server uptime, memory usage, and system values.
 * Fetches from GET /api/home/diagnostics and GET /api/home/system-values.
 */

import { useEffect, useState } from 'react';
import * as homeService from '../../services/home.service';
import { Activity, Database, Server, HardDrive, RefreshCw, Loader } from 'lucide-react';
import toast from 'react-hot-toast';

function DiagnosticsPage() {
    const [diagnostics, setDiagnostics] = useState(null);
    const [systemValues, setSystemValues] = useState([]);
    const [loading, setLoading] = useState(true);

    /** Fetch diagnostics and system values */
    const fetchData = async () => {
        setLoading(true);
        try {
            const [diagResponse, sysResponse] = await Promise.all([
                homeService.getDiagnostics(),
                homeService.getSystemValues(),
            ]);
            setDiagnostics(diagResponse.data);
            setSystemValues(sysResponse.data || []);
        } catch (error) {
            toast.error('Failed to load diagnostics.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    if (loading) {
        return <div className="page-container"><div className="loading-screen"><Loader className="spinner-icon" size={40} /><p>Loading diagnostics...</p></div></div>;
    }

    return (
        <div className="page-container">
            <div className="page-header">
                <h1><Activity size={28} /> System Diagnostics</h1>
                <button className="btn btn-secondary" onClick={fetchData}>
                    <RefreshCw size={16} /> Refresh
                </button>
            </div>

            {/* Status Cards */}
            <div className="diagnostics-grid">
                {/* Server Status */}
                <div className="diag-card">
                    <div className="diag-card-header">
                        <Server size={20} />
                        <h3>Server</h3>
                    </div>
                    <div className="diag-card-body">
                        <div className="diag-row"><span>Status</span><span className="status-badge status-ok">{diagnostics?.server?.status}</span></div>
                        <div className="diag-row"><span>Uptime</span><span>{diagnostics?.server?.uptimeFormatted}</span></div>
                        <div className="diag-row"><span>Node.js</span><span>{diagnostics?.server?.nodeVersion}</span></div>
                        <div className="diag-row"><span>Environment</span><span>{diagnostics?.server?.environment}</span></div>
                    </div>
                </div>

                {/* Database Status */}
                <div className="diag-card">
                    <div className="diag-card-header">
                        <Database size={20} />
                        <h3>Database</h3>
                    </div>
                    <div className="diag-card-body">
                        <div className="diag-row"><span>Status</span><span className={`status-badge ${diagnostics?.database?.status === 'Connected' ? 'status-ok' : 'status-error'}`}>{diagnostics?.database?.status}</span></div>
                        <div className="diag-row"><span>Response</span><span>{diagnostics?.database?.responseTimeMs}ms</span></div>
                        <div className="diag-row"><span>Server</span><span className="diag-truncate">{diagnostics?.database?.server}</span></div>
                        <div className="diag-row"><span>Database</span><span>{diagnostics?.database?.database}</span></div>
                    </div>
                </div>

                {/* Memory Usage */}
                <div className="diag-card">
                    <div className="diag-card-header">
                        <HardDrive size={20} />
                        <h3>Memory</h3>
                    </div>
                    <div className="diag-card-body">
                        <div className="diag-row"><span>Heap Used</span><span>{diagnostics?.memory?.heapUsedMB} MB</span></div>
                        <div className="diag-row"><span>Heap Total</span><span>{diagnostics?.memory?.heapTotalMB} MB</span></div>
                        <div className="diag-row"><span>RSS</span><span>{diagnostics?.memory?.rssMB} MB</span></div>
                    </div>
                </div>
            </div>

            {/* System Values Table */}
            {systemValues.length > 0 && (
                <div className="content-card" style={{ marginTop: '2rem' }}>
                    <h2>System Configuration Values</h2>
                    <div className="table-wrapper">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Name</th>
                                    <th>Value</th>
                                </tr>
                            </thead>
                            <tbody>
                                {systemValues.map((sv, index) => (
                                    <tr key={sv.SystemValueId || index}>
                                        <td>{sv.SystemValueId}</td>
                                        <td>{sv.Name}</td>
                                        <td>{sv.Value}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}

export default DiagnosticsPage;
