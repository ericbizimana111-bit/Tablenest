import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Eye, Reply, Filter } from 'lucide-react';
import { supportAPI } from '../../../shared/services/api';
import { StatCard, Spinner, StatusBadge, Modal, Pagination } from '../../../shared/components/ui/index';
import toast from 'react-hot-toast';

interface SupportTicket {
    _id: string;
    ticketId: string;
    type: string;
    priority: string;
    status: string;
    subject: string;
    customer: string;
    createdAt: string;
    responses: string[];
}

interface SupportStats {
    open: number;
    resolved: number;
    pending: number;
}

const TYPE_COLORS: Record<string, string> = {
    technical: '#DBEAFE', order: '#FEF9C3', booking: '#E0E7FF', payment: '#FEE2E2', other: '#F3F4F6',
};
const TYPE_TEXT: Record<string, string> = {
    technical: '#1D4ED8', order: '#D97706', booking: '#7C3AED', payment: '#DC2626', other: '#6B7280',
};

export default function AdminComplaints() {
    const qc = useQueryClient();
    const [page, setPage] = useState(1);
    const [tab, setTab] = useState('all');
    const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
    const [reply, setReply] = useState('');

    const { data, isLoading } = useQuery({
        queryKey: ['support-tickets', page, tab],
        queryFn: () => supportAPI.getAll({ page, limit: 10, priority: tab === 'priority' ? 'high' : undefined }).then(r => r.data),
    });

    const { data: stats } = useQuery<SupportStats>({
        queryKey: ['support-stats'],
        queryFn: () => supportAPI.getStats().then(r => r.data),
    });

    const updateStatusMut = useMutation({
        mutationFn: ({ id, status }: { id: string; status: string }) => supportAPI.updateStatus(id, status),
        onSuccess: () => { qc.invalidateQueries({ queryKey: ['support-tickets'] }); toast.success('Status updated'); },
    });

    const respondMut = useMutation({
        mutationFn: ({ id, message }: { id: string; message: string }) => supportAPI.addResponse(id, message),
        onSuccess: () => { qc.invalidateQueries({ queryKey: ['support-tickets'] }); toast.success('Response sent'); setReply(''); },
    });

    const tickets: SupportTicket[] = (data as { tickets?: SupportTicket[] } | undefined)?.tickets || DEMO_TICKETS;

    return (
        <div className="fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
                <div>
                    <h1 style={{ fontSize: 24, fontWeight: 700 }}>Complaints & Support</h1>
                    <p style={{ fontSize: 14, color: '#6B7280', marginTop: 2 }}>Manage customer inquiries and operational tickets.</p>
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                    <button style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', border: '1.5px solid #E5E7EB', borderRadius: 8, background: 'white', fontSize: 13, cursor: 'pointer', fontFamily: 'Poppins' }}>
                        <Filter size={14} /> Filter
                    </button>
                    <button onClick={() => setShowNewModal(true)} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', background: '#B91C1C', color: 'white', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'Poppins' }}>
                        <Plus size={14} /> New Ticket
                    </button>
                </div>
            </div>

            {/* KPIs */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 24 }}>
                <StatCard label="Total Active" value={stats?.total || 128} icon={<Eye size={20} />} sub="+12 today" />
                <StatCard label="Open Tickets" value={stats?.open || 42} icon={<Plus size={20} />} sub="High Priority" color="#DC2626" />
                <StatCard label="Avg. Response" value="1.4h" icon={<Reply size={20} />} trend="-15% YoY" trendUp />
                <StatCard label="Resolution Rate" value={`${stats?.resolutionRate || 94}%`} icon={<Eye size={20} />} color="#16A34A" />
            </div>

            {/* Tickets Table */}
            <div style={{ background: 'white', borderRadius: 12, border: '1px solid #E5E7EB', overflow: 'hidden' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderBottom: '1px solid #E5E7EB' }}>
                    <div style={{ fontWeight: 600, fontSize: 16 }}>Active Inquiries</div>
                    <div style={{ display: 'flex', gap: 0, border: '1px solid #E5E7EB', borderRadius: 8, overflow: 'hidden' }}>
                        {['all', 'priority', 'internal'].map(t => (
                            <button key={t} onClick={() => setTab(t)}
                                style={{ padding: '6px 16px', border: 'none', background: tab === t ? '#B91C1C' : 'white', color: tab === t ? 'white' : '#374151', fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: 'Poppins', textTransform: 'capitalize' }}>
                                {t}
                            </button>
                        ))}
                    </div>
                </div>

                {isLoading ? <Spinner /> : (
                    <table className="data-table">
                        <thead>
                            <tr>
                                {['Ticket ID', 'User / Owner', 'Subject', 'Type', 'Status', 'Date', 'Actions'].map(h => (
                                    <th key={h}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>\n                            {tickets.map((t) => (
                            <tr key={t._id || t.ticketId}>
                                <td style={{ color: '#B91C1C', fontWeight: 600, fontSize: 13 }}>{t.ticketId || `#TK-${t._id?.slice(-5).toUpperCase()}`}</td>
                                <td>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                        <div style={{ width: 32, height: 32, borderRadius: '50%', background: `hsl(${(t.userName || t.userId || '').charCodeAt(0) * 7},60%,70%)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: 'white', flexShrink: 0 }}>
                                            {(t.userName || 'U')[0]}
                                        </div>
                                        <span style={{ fontSize: 13 }}>{t.userName || 'Unknown User'}</span>
                                    </div>
                                </td>
                                <td>
                                    <div style={{ fontWeight: 500, fontSize: 13 }}>{t.subject}</div>
                                    <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 2 }}>{t.description?.slice(0, 40)}...</div>
                                </td>
                                <td>
                                    <span style={{ background: TYPE_COLORS[t.type] || '#F3F4F6', color: TYPE_TEXT[t.type] || '#6B7280', padding: '3px 10px', borderRadius: 9999, fontSize: 12, fontWeight: 500, textTransform: 'capitalize' }}>
                                        {t.type}
                                    </span>
                                </td>
                                <td><StatusBadge status={t.status} /></td>
                                <td style={{ fontSize: 12, color: '#6B7280' }}>{new Date(t.createdAt || t.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</td>
                                <td>
                                    <div style={{ display: 'flex', gap: 8 }}>
                                        <button onClick={() => setSelectedTicket(t)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6B7280', padding: 4 }} title="View"><Eye size={15} /></button>
                                        <button onClick={() => setSelectedTicket(t)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6B7280', padding: 4 }} title="Reply"><Reply size={15} /></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                )}

                <div style={{ padding: '12px 20px', borderTop: '1px solid #E5E7EB', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 13, color: '#6B7280' }}>Showing {tickets.length} of {data?.total || 128} results</span>
                    <Pagination page={page} pages={data?.pages || 13} onPage={setPage} />
                </div>
            </div>

            {/* Ticket Detail Modal */}
            <Modal isOpen={!!selectedTicket} onClose={() => setSelectedTicket(null)} title={`Ticket ${selectedTicket?.ticketId || ''}`} width={580}>
                {selectedTicket && (
                    <div>
                        <div style={{ marginBottom: 16 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                                <div style={{ fontWeight: 600, fontSize: 15 }}>{selectedTicket.subject}</div>
                                <StatusBadge status={selectedTicket.status} />
                            </div>
                            <p style={{ fontSize: 13, color: '#6B7280', lineHeight: 1.6 }}>{selectedTicket.description}</p>
                        </div>

                        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
                            {['open', 'in_progress', 'resolved', 'closed'].map(s => (
                                <button key={s} onClick={() => updateStatusMut.mutate({ id: selectedTicket._id, status: s })}
                                    style={{ padding: '5px 12px', border: '1.5px solid #E5E7EB', borderRadius: 6, background: selectedTicket.status === s ? '#B91C1C' : 'white', color: selectedTicket.status === s ? 'white' : '#374151', fontSize: 12, cursor: 'pointer', fontFamily: 'Poppins', textTransform: 'capitalize' }}>
                                    {s.replace('_', ' ')}
                                </button>
                            ))}
                        </div>

                        {selectedTicket.responses?.map((r: any, i: number) => (
                            <div key={i} style={{ background: '#F9FAFB', borderRadius: 8, padding: 12, marginBottom: 8, fontSize: 13 }}>
                                <div style={{ fontWeight: 500, marginBottom: 4, color: '#374151' }}>Response</div>
                                <p style={{ color: '#6B7280' }}>{r.message}</p>
                            </div>
                        ))}

                        <div style={{ marginTop: 16 }}>
                            <textarea value={reply} onChange={e => setReply(e.target.value)}
                                placeholder="Type your response..."
                                style={{ width: '100%', padding: 12, border: '1.5px solid #E5E7EB', borderRadius: 8, fontSize: 13, fontFamily: 'Poppins', resize: 'vertical', minHeight: 80, outline: 'none' }} />
                            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8, gap: 8 }}>
                                <button onClick={() => setSelectedTicket(null)} style={{ padding: '8px 16px', border: '1px solid #E5E7EB', borderRadius: 8, background: 'white', fontSize: 13, cursor: 'pointer', fontFamily: 'Poppins' }}>Close</button>
                                <button onClick={() => respondMut.mutate({ id: selectedTicket._id, message: reply })}
                                    style={{ padding: '8px 16px', background: '#B91C1C', color: 'white', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'Poppins' }}>
                                    Send Response
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
}

const DEMO_TICKETS = [
    { _id: '1', ticketId: '#TK-89421', userName: 'Julian Schmidt', subject: 'Payment gateway timeout', description: 'Integration error during checkout process when using Visa card', type: 'technical', status: 'open', createdAt: '2024-10-24', date: 'Oct 24, 14:30' },
    { _id: '2', ticketId: '#TK-89418', userName: 'Elena Watson', subject: 'Missing item in Order #8821', description: 'Truffle pasta was not delivered with my order', type: 'order', status: 'in_progress', createdAt: '2024-10-24', date: 'Oct 24, 12:15' },
    { _id: '3', ticketId: '#TK-89399', userName: 'Marco Lucca', subject: 'Reservation rescheduling', description: 'Need to move from 7pm to 8:30pm same day', type: 'booking', status: 'resolved', createdAt: '2024-10-23', date: 'Oct 23, 18:05' },
    { _id: '4', ticketId: '#TK-89382', userName: 'Sarah Connor', subject: 'Refund for cold delivery', description: 'The soup was stone cold on arrival at my address', type: 'order', status: 'open', createdAt: '2024-10-23', date: 'Oct 23, 09:40' },
];