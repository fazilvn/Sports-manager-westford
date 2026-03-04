import { useEffect, useState } from "react";
import { UserPlus, Shield, Mail, Key, MoreHorizontal, Trash2, Edit2 } from "lucide-react";

interface User {
  id: number;
  username: string;
  role: string;
  full_name: string;
}

export default function Users() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch("/api/users")
      .then(res => res.json())
      .then(data => {
        setUsers(data);
        setIsLoading(false);
      })
      .catch(err => {
        console.error("Users fetch error:", err);
        setIsLoading(false);
      });
  }, []);

  return (
    <div className="space-y-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">User Management</h1>
          <p className="text-slate-500">Manage administrative access to the Westford Sports portal.</p>
        </div>
        <button className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg shadow-emerald-200 transition-all active:scale-95">
          <UserPlus size={20} />
          Add User
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          [1, 2].map(i => <div key={i} className="h-48 bg-slate-100 animate-pulse rounded-3xl"></div>)
        ) : (
          users.map((user) => (
            <div key={user.id} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm relative group">
              <div className="absolute top-6 right-6">
                <button className="text-slate-400 hover:text-slate-600">
                  <MoreHorizontal size={20} />
                </button>
              </div>

              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-600">
                  <Shield size={28} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">{user.full_name}</h3>
                  <p className="text-sm text-slate-500 capitalize">{user.role}</p>
                </div>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Mail size={16} className="text-slate-400" />
                  <span>{user.username}@westfordsports.com</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Key size={16} className="text-slate-400" />
                  <span>Password set</span>
                </div>
              </div>

              <div className="flex gap-2 pt-4 border-t border-slate-50">
                <button className="flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 rounded-lg transition-colors">
                  <Edit2 size={16} />
                  Edit
                </button>
                <button className="flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                  <Trash2 size={16} />
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
