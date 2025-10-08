import { Download, Mail, TrendingUp, Users } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { WaitlistEntry, supabase } from '../lib/supabase';

const AdminDashboard: React.FC = () => {
  const { isDark } = useTheme();
  const [entries, setEntries] = useState<WaitlistEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchWaitlistEntries();
  }, []);

  const fetchWaitlistEntries = async () => {
    try {
      const { data, error } = await supabase
        .from('waitlist')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setEntries(data || []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = () => {
    const csvContent = [
      ['Email', 'Source', 'Date'],
      ...entries.map(entry => [
        entry.email,
        entry.source,
        new Date(entry.created_at).toLocaleDateString(),
      ]),
    ]
      .map(row => row.join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `waitlist-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const stats = {
    total: entries.length,
    hero: entries.filter(e => e.source === 'hero').length,
    finalCta: entries.filter(e => e.source === 'final-cta').length,
    today: entries.filter(
      e => new Date(e.created_at).toDateString() === new Date().toDateString(),
    ).length,
  };

  if (loading) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center ${
          isDark ? 'bg-black' : 'bg-white'
        }`}
      >
        <div className="animate-spin w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center ${
          isDark ? 'bg-black text-white' : 'bg-white text-gray-900'
        }`}
      >
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Access Denied</h2>
          <p className="text-gray-500">
            You need to be authenticated to view this page.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen p-6 ${
        isDark ? 'bg-black text-white' : 'bg-gray-50 text-gray-900'
      }`}
    >
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold mb-2">
              Qylon Admin Dashboard
            </h1>
            <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
              Manage your waitlist entries
            </p>
          </div>
          <button
            onClick={exportToCSV}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-purple-600 text-white rounded-lg hover:scale-105 transition-all duration-200 text-sm md:text-base"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
          <div
            className={`p-6 rounded-xl border ${
              isDark
                ? 'bg-gray-900 border-gray-800'
                : 'bg-white border-gray-200'
            }`}
          >
            <div className="flex items-center gap-2 md:gap-3 mb-2">
              <Users className="w-6 h-6 text-cyan-500" />
              <span className="font-semibold text-sm md:text-base">
                Total Signups
              </span>
            </div>
            <div className="text-2xl md:text-3xl font-bold text-cyan-500">
              {stats.total}
            </div>
          </div>

          <div
            className={`p-6 rounded-xl border ${
              isDark
                ? 'bg-gray-900 border-gray-800'
                : 'bg-white border-gray-200'
            }`}
          >
            <div className="flex items-center gap-2 md:gap-3 mb-2">
              <TrendingUp className="w-6 h-6 text-green-500" />
              <span className="font-semibold text-sm md:text-base">Today</span>
            </div>
            <div className="text-2xl md:text-3xl font-bold text-green-500">
              {stats.today}
            </div>
          </div>

          <div
            className={`p-6 rounded-xl border ${
              isDark
                ? 'bg-gray-900 border-gray-800'
                : 'bg-white border-gray-200'
            }`}
          >
            <div className="flex items-center gap-2 md:gap-3 mb-2">
              <Mail className="w-6 h-6 text-purple-500" />
              <span className="font-semibold text-sm md:text-base">
                Hero Form
              </span>
            </div>
            <div className="text-2xl md:text-3xl font-bold text-purple-500">
              {stats.hero}
            </div>
          </div>

          <div
            className={`p-6 rounded-xl border ${
              isDark
                ? 'bg-gray-900 border-gray-800'
                : 'bg-white border-gray-200'
            }`}
          >
            <div className="flex items-center gap-2 md:gap-3 mb-2">
              <Mail className="w-6 h-6 text-orange-500" />
              <span className="font-semibold text-sm md:text-base">
                Final CTA
              </span>
            </div>
            <div className="text-2xl md:text-3xl font-bold text-orange-500">
              {stats.finalCta}
            </div>
          </div>
        </div>

        {/* Entries Table */}
        <div
          className={`rounded-xl border overflow-hidden ${
            isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'
          }`}
        >
          <div className="p-4 md:p-6 border-b border-gray-800">
            <h2 className="text-lg md:text-xl font-bold">Waitlist Entries</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className={isDark ? 'bg-gray-800' : 'bg-gray-50'}>
                <tr>
                  <th className="px-4 md:px-6 py-3 md:py-4 text-left font-semibold text-sm md:text-base">
                    Email
                  </th>
                  <th className="px-4 md:px-6 py-3 md:py-4 text-left font-semibold text-sm md:text-base">
                    Source
                  </th>
                  <th className="px-4 md:px-6 py-3 md:py-4 text-left font-semibold text-sm md:text-base">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody>
                {entries.map(entry => (
                  <tr
                    key={entry.id}
                    className={`border-b ${
                      isDark ? 'border-gray-800' : 'border-gray-100'
                    }`}
                  >
                    <td className="px-4 md:px-6 py-3 md:py-4 text-sm md:text-base">
                      {entry.email}
                    </td>
                    <td className="px-4 md:px-6 py-3 md:py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          entry.source === 'hero'
                            ? 'bg-purple-500/20 text-purple-400'
                            : 'bg-orange-500/20 text-orange-400'
                        }`}
                      >
                        {entry.source}
                      </span>
                    </td>
                    <td className="px-4 md:px-6 py-3 md:py-4 text-xs md:text-sm">
                      <div>
                        {new Date(entry.created_at).toLocaleDateString()}
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(entry.created_at).toLocaleTimeString()}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {entries.length === 0 && (
              <div className="p-12 text-center">
                <div
                  className={`text-6xl mb-4 ${isDark ? 'text-gray-700' : 'text-gray-300'}`}
                >
                  📧
                </div>
                <h3 className="text-lg md:text-xl font-semibold mb-2">
                  No entries yet
                </h3>
                <p
                  className={`text-sm md:text-base ${isDark ? 'text-gray-400' : 'text-gray-600'}`}
                >
                  Waitlist entries will appear here once people start signing
                  up.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
