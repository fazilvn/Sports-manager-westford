import { useEffect, useState } from "react";
import { 
  Search, 
  Download, 
  Filter, 
  Trophy, 
  Mail, 
  Phone, 
  User,
  ChevronLeft,
  ChevronRight
} from "lucide-react";

interface Participant {
  id: number;
  full_name: string;
  phone: string;
  email: string;
  campaign_name: string;
  is_winner: number;
  created_at: string;
}

export default function Participants() {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetch("/api/participants")
      .then(res => res.json())
      .then(data => {
        setParticipants(data);
        setIsLoading(false);
      })
      .catch(err => {
        console.error("Participants fetch error:", err);
        setIsLoading(false);
      });
  }, []);

  const filteredParticipants = participants.filter(p => 
    p.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.campaign_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const exportToCSV = () => {
    const headers = ["Full Name", "Phone", "Email", "Campaign", "Winner", "Date"];
    const rows = filteredParticipants.map(p => [
      p.full_name,
      p.phone,
      p.email,
      p.campaign_name,
      p.is_winner ? "Yes" : "No",
      new Date(p.created_at).toLocaleDateString()
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `participants_export_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Participants & Leads</h1>
          <p className="text-slate-500">Track and manage leads from all your campaigns.</p>
        </div>
        <button 
          onClick={exportToCSV}
          className="flex items-center justify-center gap-2 bg-white border border-slate-200 text-slate-700 px-6 py-3 rounded-xl font-semibold hover:bg-slate-50 transition-all active:scale-95"
        >
          <Download size={20} />
          Export CSV
        </button>
      </header>

      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Search by name, email, or campaign..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
            />
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            <button className="flex items-center gap-2 px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-600 text-sm hover:bg-slate-100">
              <Filter size={18} />
              Filters
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Participant</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Contact Info</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Campaign</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                [1, 2, 3, 4, 5].map(i => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={5} className="px-6 py-4"><div className="h-12 bg-slate-100 rounded-lg"></div></td>
                  </tr>
                ))
              ) : filteredParticipants.length > 0 ? (
                filteredParticipants.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                          {p.full_name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900">{p.full_name}</p>
                          <p className="text-xs text-slate-400">ID: #{p.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <Mail size={14} className="text-slate-400" />
                          {p.email}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <Phone size={14} className="text-slate-400" />
                          {p.phone}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-medium">
                        {p.campaign_name}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {p.is_winner ? (
                        <div className="flex items-center gap-1.5 text-amber-600 font-bold text-xs uppercase tracking-tight">
                          <Trophy size={14} />
                          Winner
                        </div>
                      ) : (
                        <span className="text-slate-400 text-xs font-medium uppercase tracking-tight">Participant</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right text-sm text-slate-500">
                      {new Date(p.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center">
                    <p className="text-slate-500">No participants found matching your criteria.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="p-6 border-t border-slate-100 flex items-center justify-between">
          <p className="text-sm text-slate-500">
            Showing <span className="font-medium text-slate-900">{filteredParticipants.length}</span> participants
          </p>
          <div className="flex gap-2">
            <button className="p-2 border border-slate-200 rounded-lg text-slate-400 hover:text-slate-600 disabled:opacity-50" disabled>
              <ChevronLeft size={20} />
            </button>
            <button className="p-2 border border-slate-200 rounded-lg text-slate-400 hover:text-slate-600 disabled:opacity-50" disabled>
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
