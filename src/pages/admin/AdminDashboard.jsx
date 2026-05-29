import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import PageWrapper from '../../components/layout/PageWrapper';
import StatCard from '../../components/common/StatCard';
import { getAllUsers } from '../../services/userService';
import { getAllAttendance } from '../../services/attendanceService';
import { getAllTutorials } from '../../services/tutorialService';
import { getAllCertificates } from '../../services/certificateService';
import { todayKey, formatDate } from '../../utils/dateUtils';
import DataTable from '../../components/common/DataTable';
import Button from '../../components/common/Button';
import { ROLES } from '../../constants/roles';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const COLORS = ['#2D7DD2', '#1E3A5F', '#1A7340', '#B45309'];

export default function AdminDashboard() {
  const [internCount, setInternCount] = useState(0);
  const [presentToday, setPresentToday] = useState(0);
  const [tutorialCount, setTutorialCount] = useState(0);
  const [certPending, setCertPending] = useState(0);
  const [categoryData, setCategoryData] = useState([]);
  const [interns, setInterns] = useState([]);
  const [teamLeads, setTeamLeads] = useState([]);

  useEffect(() => {
    (async () => {
      const [users, leads, attendance, tutorials, certs] = await Promise.all([
        getAllUsers(ROLES.INTERN),
        getAllUsers(ROLES.TEAM_LEAD),
        getAllAttendance(todayKey()),
        getAllTutorials(),
        getAllCertificates(),
      ]);
      const active = users.filter((u) => u.isActive !== false);
      setInterns(active);
      setTeamLeads(leads);
      setInternCount(active.length);
      setPresentToday(attendance.length);
      setTutorialCount(tutorials.filter((t) => t.isPublished).length);
      setCertPending(certs.filter((c) => c.status === 'pending').length);
      const byCat = {};
      tutorials.forEach((t) => {
        byCat[t.category] = (byCat[t.category] || 0) + 1;
      });
      setCategoryData(Object.entries(byCat).map(([name, value]) => ({ name, value })));
    })();
  }, []);

  return (
    <PageWrapper title="Admin Dashboard">
      <div className="grid gap-4 md:grid-cols-4">
        <StatCard icon="👥" label="Active interns" value={internCount} />
        <StatCard icon="✅" label="Present today" value={presentToday} />
        <StatCard icon="📚" label="Tutorials" value={tutorialCount} />
        <StatCard icon="📜" label="Certs pending" value={certPending} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="card">
          <h3 className="font-semibold text-primary">Tutorials by category</h3>
          <div className="mt-4 h-48">
            {categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={categoryData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70}>
                    {categoryData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-slate-500">No tutorials yet</p>
            )}
          </div>
        </div>

        <div className="card">
          <h3 className="font-semibold text-primary">Quick links</h3>
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            {[
              ['/admin/interns', 'Manage Interns'],
              ['/admin/tutorials', 'Upload Tutorial'],
              ['/admin/certificates', 'Certificates'],
              ['/admin/announcements', 'Post Announcement'],
            ].map(([to, label]) => (
              <Link key={to} to={to} className="rounded-btn border border-border px-4 py-3 text-sm hover:bg-slate-50">
                {label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className="card mt-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="font-semibold text-primary">Interns</h3>
          <Link to="/admin/interns">
            <Button variant="secondary">Add / manage interns</Button>
          </Link>
        </div>
        {interns.length > 0 ? (
          <div className="mt-4">
            <DataTable
              rowKey="uid"
              columns={[
                { key: 'name', label: 'Name' },
                { key: 'email', label: 'Email' },
                { key: 'department', label: 'Department' },
                {
                  key: 'teamLead',
                  label: 'Team lead',
                  render: (r) => teamLeads.find((l) => l.uid === r.teamLeadId)?.name || '—',
                },
                {
                  key: 'duration',
                  label: 'Duration',
                  render: (r) => `${formatDate(r.startDate)} – ${formatDate(r.endDate)}`,
                },
                {
                  key: 'status',
                  label: 'Status',
                  render: (r) => (r.isActive === false ? 'Inactive' : 'Active'),
                },
              ]}
              rows={interns}
              emptyMessage="No active interns."
            />
          </div>
        ) : (
          <p className="mt-4 text-sm text-slate-500">No interns yet. Add one from Manage Interns.</p>
        )}
      </div>
    </PageWrapper>
  );
}
