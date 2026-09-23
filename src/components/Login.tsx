import { useState } from 'react';
import { LogIn, User, Lock } from 'lucide-react';

interface LoginProps {
  onLogin: (username: string, village: string) => void;
}

// For now, simple login - later we'll add proper authentication
const USERS = [
  { username: 'rampur_sec', password: 'vec123', village: 'Rampur', role: 'secretary' },
  { username: 'sundarpur_sec', password: 'vec123', village: 'Sundarpur', role: 'secretary' },
  { username: 'kishangarh_sec', password: 'vec123', village: 'Kishangarh', role: 'secretary' },
  { username: 'devgarh_sec', password: 'vec123', village: 'Devgarh', role: 'secretary' },
  { username: 'chandpur_sec', password: 'vec123', village: 'Chandpur', role: 'secretary' },
  { username: 'admin', password: 'admin123', village: 'all', role: 'computer_assistant' },
];

export default function Login({ onLogin }: LoginProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const user = USERS.find(u => u.username === username && u.password === password);
    
    if (user) {
      onLogin(user.username, user.village);
    } else {
      setError('Invalid username or password');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <span className="text-white text-2xl font-bold">M</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">MGNREGA</h1>
          <p className="text-sm text-gray-500 mt-1">Village Employment Committee Portal</p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">Username</label>
            <div className="flex items-center gap-2 border border-gray-200 rounded-xl px-4 py-3 focus-within:border-indigo-400 focus-within:ring-2 focus-within:ring-indigo-100">
              <User className="w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username"
                className="flex-1 outline-none text-sm"
                required
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">Password</label>
            <div className="flex items-center gap-2 border border-gray-200 rounded-xl px-4 py-3 focus-within:border-indigo-400 focus-within:ring-2 focus-within:ring-indigo-100">
              <Lock className="w-5 h-5 text-gray-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="flex-1 outline-none text-sm"
                required
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-indigo-600 text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2 min-h-[48px] active:scale-[0.98] transition-transform shadow-lg shadow-indigo-200"
          >
            <LogIn className="w-5 h-5" />
            Login
          </button>
        </form>

        {/* Demo Credentials */}
        <div className="mt-6 p-4 bg-gray-50 rounded-xl">
          <p className="text-xs font-semibold text-gray-700 mb-2">Demo Credentials:</p>
          <div className="space-y-1 text-xs text-gray-600">
            <p><strong>VEC Secretary:</strong> rampur_sec / vec123</p>
            <p><strong>Computer Assistant:</strong> admin / admin123</p>
          </div>
        </div>
      </div>
    </div>
  );
}
