import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  Calendar, 
  Tag, 
  Trophy, 
  Users, 
  ArrowLeft, 
  QrCode, 
  Copy, 
  Check,
  ExternalLink,
  Loader2,
  Download,
  Edit2,
  Save,
  X,
  Settings
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { motion } from "motion/react";

interface Campaign {
  id: number;
  name: string;
  type: string;
  status: string;
  start_date: string;
  end_date: string;
  description: string;
}

interface Participant {
  id: number;
  full_name: string;
  phone: string;
  email: string;
  is_winner: number;
  created_at: string;
}

export default function CampaignDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPickingWinner, setIsPickingWinner] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<Partial<Campaign>>({});

  const publicUrl = `${window.location.origin}/view/${id}`;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [campaignRes, participantsRes] = await Promise.all([
          fetch(`/api/campaigns/${id}`),
          fetch(`/api/campaigns/${id}/participants`)
        ]);
        
        if (campaignRes.ok) {
          const campaignData = await campaignRes.json();
          setCampaign(campaignData);
          setEditForm(campaignData);
        }
        
        if (participantsRes.ok) {
          const participantsData = await participantsRes.json();
          setParticipants(participantsData);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handlePickWinner = async () => {
    setIsPickingWinner(true);
    try {
      const res = await fetch(`/api/campaigns/${id}/pick-winner`, { method: "POST" });
      if (res.ok) {
        const winner = await res.json();
        // Refresh participants to show the new winner
        const participantsRes = await fetch(`/api/campaigns/${id}/participants`);
        if (participantsRes.ok) {
          const participantsData = await participantsRes.json();
          setParticipants(participantsData);
        }
        alert(`Congratulations to the winner: ${winner.full_name}!`);
      } else {
        const data = await res.json();
        alert(data.message || "Failed to pick a winner");
      }
    } catch (error) {
      alert("Error picking winner");
    } finally {
      setIsPickingWinner(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleUpdateCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/campaigns/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });
      if (res.ok) {
        setCampaign({ ...campaign, ...editForm } as Campaign);
        setIsEditing(false);
      } else {
        alert("Failed to update campaign");
      }
    } catch (error) {
      alert("Error updating campaign");
    }
  };

  const downloadParticipantsCSV = () => {
    if (participants.length === 0) return;
    
    const headers = ["ID", "Full Name", "Email", "Phone", "Winner", "Created At"];
    const csvContent = [
      headers.join(","),
      ...participants.map(p => [
        p.id,
        `"${p.full_name}"`,
        `"${p.email}"`,
        `"${p.phone}"`,
        p.is_winner ? "Yes" : "No",
        p.created_at
      ].join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `participants_${campaign?.name.replace(/\s+/g, '_')}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="animate-spin text-emerald-600" size={48} />
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold text-slate-900">Campaign not found</h2>
        <button onClick={() => navigate("/campaigns")} className="mt-4 text-emerald-600 font-medium">
          Back to Campaigns
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <button 
        onClick={() => navigate("/campaigns")}
        className="flex items-center gap-2 text-slate-500 hover:text-slate-700 transition-colors"
      >
        <ArrowLeft size={20} />
        Back to Campaigns
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
            {isEditing ? (
              <form onSubmit={handleUpdateCampaign} className="space-y-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-bold text-slate-900">Edit Campaign</h2>
                  <div className="flex gap-2">
                    <button 
                      type="button"
                      onClick={() => {
                        setIsEditing(false);
                        setEditForm(campaign);
                      }}
                      className="p-2 text-slate-400 hover:text-slate-600"
                    >
                      <X size={24} />
                    </button>
                    <button 
                      type="submit"
                      className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-xl font-semibold hover:bg-emerald-700 transition-all"
                    >
                      <Save size={20} />
                      Save Changes
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Campaign Name</label>
                    <input 
                      type="text"
                      className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none"
                      value={editForm.name || ""}
                      onChange={e => setEditForm({...editForm, name: e.target.value})}
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Type</label>
                      <input 
                        type="text"
                        className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none"
                        value={editForm.type || ""}
                        onChange={e => setEditForm({...editForm, type: e.target.value})}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                      <select 
                        className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none"
                        value={editForm.status || ""}
                        onChange={e => setEditForm({...editForm, status: e.target.value})}
                      >
                        <option value="active">Active</option>
                        <option value="upcoming">Upcoming</option>
                        <option value="completed">Completed</option>
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Number of Winners</label>
                      <input 
                        type="number"
                        min="1"
                        className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none"
                        value={editForm.num_winners || 1}
                        onChange={e => setEditForm({...editForm, num_winners: parseInt(e.target.value)})}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Selection Type</label>
                      <select 
                        className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none"
                        value={editForm.selection_type || "automatic"}
                        onChange={e => setEditForm({...editForm, selection_type: e.target.value})}
                      >
                        <option value="automatic">Automatic</option>
                        <option value="spin_and_win">Spin and Win</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                    <textarea 
                      className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none h-32"
                      value={editForm.description || ""}
                      onChange={e => setEditForm({...editForm, description: e.target.value})}
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Start Date</label>
                      <input 
                        type="date"
                        className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none"
                        value={editForm.start_date || ""}
                        onChange={e => setEditForm({...editForm, start_date: e.target.value})}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">End Date</label>
                      <input 
                        type="date"
                        className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none"
                        value={editForm.end_date || ""}
                        onChange={e => setEditForm({...editForm, end_date: e.target.value})}
                        required
                      />
                    </div>
                  </div>
                </div>
              </form>
            ) : (
              <>
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h1 className="text-3xl font-bold text-slate-900">{campaign.name}</h1>
                      <button 
                        onClick={() => setIsEditing(true)}
                        className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                        title="Edit Campaign"
                      >
                        <Edit2 size={20} />
                      </button>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                        campaign.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 
                        campaign.status === 'upcoming' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {campaign.status}
                      </span>
                      <div className="flex items-center gap-2 text-slate-500 text-sm">
                        <Tag size={16} />
                        {campaign.type}
                      </div>
                    </div>
                  </div>
                  <button 
                    onClick={handlePickWinner}
                    disabled={isPickingWinner || participants.length === 0}
                    className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white px-6 py-3 rounded-xl font-semibold shadow-lg shadow-amber-200 transition-all active:scale-95"
                  >
                    {isPickingWinner ? <Loader2 className="animate-spin" size={20} /> : <Trophy size={20} />}
                    Pick Random Winner
                  </button>
                </div>

                <p className="text-slate-600 leading-relaxed mb-8">{campaign.description}</p>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 p-6 bg-slate-50 rounded-2xl">
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Start Date</p>
                    <div className="flex items-center gap-2 text-slate-700 font-medium">
                      <Calendar size={18} className="text-slate-400" />
                      {campaign.start_date}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">End Date</p>
                    <div className="flex items-center gap-2 text-slate-700 font-medium">
                      <Calendar size={18} className="text-slate-400" />
                      {campaign.end_date}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Winners</p>
                    <div className="flex items-center gap-2 text-slate-700 font-medium">
                      <Trophy size={18} className="text-amber-500" />
                      {campaign.num_winners}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Selection</p>
                    <div className="flex items-center gap-2 text-slate-700 font-medium capitalize">
                      <Settings size={18} className="text-slate-400" />
                      {campaign.selection_type?.replace(/_/g, ' ')}
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Participants List */}
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <Users size={24} className="text-emerald-600" />
                Participants
                <span className="ml-2 px-2 py-0.5 bg-slate-100 text-slate-500 text-xs rounded-full">
                  {participants.length}
                </span>
              </h2>
              <button 
                onClick={downloadParticipantsCSV}
                disabled={participants.length === 0}
                className="flex items-center gap-2 text-slate-600 hover:text-emerald-600 text-sm font-medium disabled:opacity-50"
              >
                <Download size={18} />
                Download CSV
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50">
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Contact</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {participants.length > 0 ? (
                    participants.map((p) => (
                      <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4 font-medium text-slate-900">{p.full_name}</td>
                        <td className="px-6 py-4 text-sm text-slate-500">
                          {p.email}<br/>{p.phone}
                        </td>
                        <td className="px-6 py-4">
                          {p.is_winner ? (
                            <span className="flex items-center gap-1 text-amber-600 font-bold text-xs uppercase">
                              <Trophy size={14} /> Winner
                            </span>
                          ) : (
                            <span className="text-slate-400 text-xs uppercase">Participant</span>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={3} className="px-6 py-12 text-center text-slate-500">
                        No participants yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Sidebar: QR & Sharing */}
        <div className="space-y-8">
          <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm text-center">
            <div className="flex items-center justify-center gap-2 text-slate-900 font-bold mb-6">
              <QrCode size={24} className="text-emerald-600" />
              Campaign QR Code
            </div>
            
            <div className="bg-slate-50 p-6 rounded-2xl inline-block mb-6 border border-slate-100">
              <QRCodeSVG 
                value={publicUrl} 
                size={180}
                level="H"
                includeMargin={true}
              />
            </div>

            <div className="space-y-4">
              <div className="relative">
                <input 
                  type="text" 
                  readOnly 
                  value={publicUrl}
                  className="w-full pl-4 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-500 focus:outline-none"
                />
                <button 
                  onClick={copyToClipboard}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-slate-400 hover:text-emerald-600 transition-colors"
                >
                  {copied ? <Check size={18} className="text-emerald-600" /> : <Copy size={18} />}
                </button>
              </div>
              
              <a 
                href={publicUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-3 bg-slate-900 text-white rounded-xl font-medium hover:bg-slate-800 transition-colors"
              >
                <ExternalLink size={18} />
                View Public Page
              </a>
            </div>
          </div>

          <div className="bg-emerald-600 p-8 rounded-3xl text-white shadow-lg shadow-emerald-100">
            <h3 className="text-xl font-bold mb-2">Campaign Tips</h3>
            <p className="text-emerald-50 text-sm leading-relaxed">
              Share the QR code at your physical sports outlets to encourage participation. 
              The random winner selection is transparent and can be initiated once the campaign ends.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
