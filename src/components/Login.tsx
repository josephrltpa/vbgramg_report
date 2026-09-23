import { useState } from 'react';
import { LogIn, User, Lock } from 'lucide-react';

interface LoginProps {
  onLogin: (username: string, village: string) => void;
}

// Village credentials - simple username/password for each village
const USERS = [
  // Admin (Computer Assistant) - can see all villages
  { username: 'admin', password: 'admin123', village: 'all', role: 'computer_assistant' },
  
  // Thingsulthliah Block (Aizawl District) - 10 villages
  { username: 'darlawng', password: 'vec123', village: 'Darlawng', role: 'secretary' },
  { username: 'phulmawi', password: 'vec123', village: 'Phulmawi', role: 'secretary' },
  { username: 'seling', password: 'vec123', village: 'Seling', role: 'secretary' },
  { username: 'sesawng1', password: 'vec123', village: 'Sesawng I', role: 'secretary' },
  { username: 'sesawng2', password: 'vec123', village: 'Sesawng II', role: 'secretary' },
  { username: 'sesawng3', password: 'vec123', village: 'Sesawng III', role: 'secretary' },
  { username: 'thingsulthliah1', password: 'vec123', village: 'Thingsulthliah - I', role: 'secretary' },
  { username: 'thingsulthliah2', password: 'vec123', village: 'Thingsulthliah II', role: 'secretary' },
  { username: 'tlangnuam', password: 'vec123', village: 'Tlangnuam', role: 'secretary' },
  { username: 'tlungvel', password: 'vec123', village: 'Tlungvel', role: 'secretary' },
  
  // Phullen Block (Saitual District) - 19 villages
  { username: 'buhban', password: 'vec123', village: 'Buhban', role: 'secretary' },
  { username: 'dilkhan', password: 'vec123', village: 'Dilkhan', role: 'secretary' },
  { username: 'keifangleitan', password: 'vec123', village: 'Keifang Leitan', role: 'secretary' },
  { username: 'keifangvenghlun', password: 'vec123', village: 'Keifang Venghlun', role: 'secretary' },
  { username: 'keifangvenglai', password: 'vec123', village: 'Keifang Venglai', role: 'secretary' },
  { username: 'khanpui', password: 'vec123', village: 'Khanpui', role: 'secretary' },
  { username: 'lailak', password: 'vec123', village: 'Lailak', role: 'secretary' },
  { username: 'lenchim', password: 'vec123', village: 'Lenchim', role: 'secretary' },
  { username: 'lungpher', password: 'vec123', village: 'Lungpher', role: 'secretary' },
  { username: 'maite', password: 'vec123', village: 'Maite', role: 'secretary' },
  { username: 'mualpheng', password: 'vec123', village: 'Mualpheng', role: 'secretary' },
  { username: 'ruallung', password: 'vec123', village: 'Ruallung', role: 'secretary' },
  { username: 'rulchawm', password: 'vec123', village: 'Rulchawm', role: 'secretary' },
  { username: 'saitualvenglai', password: 'vec123', village: 'Saitual Venglai', role: 'secretary' },
  { username: 'saitual1', password: 'vec123', village: 'Saitual-I', role: 'secretary' },
  { username: 'saitual3', password: 'vec123', village: 'Saitual-III', role: 'secretary' },
  { username: 'sihfa', password: 'vec123', village: 'Sihfa', role: 'secretary' },
  { username: 'tawizo', password: 'vec123', village: 'Tawizo', role: 'secretary' },
  { username: 'tualbung', password: 'vec123', village: 'Tualbung', role: 'secretary' },
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
          <p className="text-xs font-semibold text-gray-700 mb-2">Login Credentials:</p>
          <div className="space-y-1 text-xs text-gray-600">
            <p><strong>Computer Assistant:</strong> admin / admin123</p>
            <p className="mt-2 font-semibold">VEC Secretaries (password: vec123):</p>
            <p className="font-mono text-[10px]">buhban, darlawng, phulmawi, seling...</p>
            <p className="text-[10px] text-gray-500">(username = village name in lowercase)</p>
          </div>
        </div>
      </div>
    </div>
  );
}
