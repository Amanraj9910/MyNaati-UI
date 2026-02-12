/**
 * =============================================================================
 * MyNaati Frontend — Admin User Search Page
 * =============================================================================
 * 
 * Admin-only page for searching and managing user accounts.
 * Displays search results in a paginated table.
 * Allows admins to unlock locked-out user accounts.
 * 
 * Fetches from GET /api/users/search and POST /api/users/:id/unlock.
 */

import { useState, useEffect } from 'react';
import api from '../../services/api';
import { Users, Search, Unlock, Loader, ChevronLeft, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';

function UserSearchPage() {
    const [users, setUsers] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(false);

    /** Search users with current query and page */
    const searchUsers = async (newPage = 1) => {
        setLoading(true);
        try {
            const { data } = await api.get('/users/search', {
                params: { q: searchQuery, page: newPage, limit: 20 },
            });
            setUsers(data.data.users);
            setTotalPages(data.data.totalPages);
            setTotal(data.data.total);
            setPage(newPage);
        } catch (error) {
            toast.error('Failed to search users.');
        } finally {
            setLoading(false);
        }
    };

    /** Load users on initial mount */
    useEffect(() => { searchUsers(); }, []);

    /** Handle search form submission */
    const handleSearch = (e) => {
        e.preventDefault();
        searchUsers(1);
    };

    /** Unlock a locked user account */
    const handleUnlock = async (userId) => {
        try {
            await api.post(`/users/${userId}/unlock`);
            toast.success('User account unlocked.');
            searchUsers(page); // Refresh current page
        } catch (error) {
            toast.error('Failed to unlock user.');
        }
    };

    return (
        <div className="page-container">
            <div className="page-header">
                <h1><Users size={28} /> User Management</h1>
                <span className="badge">{total} users found</span>
            </div>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="search-bar">
                <div className="search-input-wrapper">
                    <Search size={18} />
                    <input
                        type="text"
                        placeholder="Search by name, email, or username..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <button type="submit" className="btn btn-primary">Search</button>
            </form>

            {/* Results Table */}
            {loading ? (
                <div className="loading-screen"><Loader className="spinner-icon" size={40} /><p>Searching...</p></div>
            ) : (
                <div className="content-card">
                    <div className="table-wrapper">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>User ID</th>
                                    <th>Username</th>
                                    <th>Full Name</th>
                                    <th>Email</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.length === 0 ? (
                                    <tr><td colSpan="6" className="table-empty">No users found.</td></tr>
                                ) : (
                                    users.map((u) => (
                                        <tr key={u.UserId}>
                                            <td>{u.UserId}</td>
                                            <td>{u.UserName}</td>
                                            <td>{u.FullName}</td>
                                            <td>{u.Email}</td>
                                            <td>
                                                <span className={`status-badge ${u.IsLockedOut ? 'status-error' : u.Active ? 'status-ok' : 'status-warning'}`}>
                                                    {u.IsLockedOut ? 'Locked' : u.Active ? 'Active' : 'Inactive'}
                                                </span>
                                            </td>
                                            <td>
                                                {u.IsLockedOut && (
                                                    <button className="btn btn-sm btn-secondary" onClick={() => handleUnlock(u.UserId)}>
                                                        <Unlock size={14} /> Unlock
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="pagination">
                            <button className="btn btn-sm" disabled={page <= 1} onClick={() => searchUsers(page - 1)}>
                                <ChevronLeft size={16} /> Previous
                            </button>
                            <span>Page {page} of {totalPages}</span>
                            <button className="btn btn-sm" disabled={page >= totalPages} onClick={() => searchUsers(page + 1)}>
                                Next <ChevronRight size={16} />
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default UserSearchPage;
