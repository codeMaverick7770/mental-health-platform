import { useState } from 'react';

export default function AuthPage() {
  // Tabs: login, register, verify, setPassword
  const [activeTab, setActiveTab] = useState('login');

  // Shared
  const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000';
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState({});

  // Login
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Register College
  const [collegeName, setCollegeName] = useState('');
  const [domain, setDomain] = useState('');
  const [code, setCode] = useState('');
  const [adminName, setAdminName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPhone, setAdminPhone] = useState('');
  const [verificationMethod, setVerificationMethod] = useState('email');

  // Verify College
  const [verifyDomain, setVerifyDomain] = useState('');
  const [verifyToken, setVerifyToken] = useState('');

  // Set Initial Password
  const [setPwdEmail, setSetPwdEmail] = useState('');
  const [setPwdDomain, setSetPwdDomain] = useState('');
  const [setPwdToken, setSetPwdToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const resetMessages = () => { setMessage(''); setErrors({}); };

  async function onLogin(e) {
    e.preventDefault();
    resetMessages();
    const errs = {};
    if (!email) errs.email = 'Email is required';
    if (!password) errs.password = 'Password is required';
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/admin/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Login failed');
      localStorage.setItem('adminToken', data.token);
      setMessage('Logged in successfully');
    } catch (err) {
      setMessage(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function onRegisterCollege(e) {
    e.preventDefault();
    resetMessages();
    const payload = {
      name: collegeName,
      domain,
      code,
      adminName,
      adminEmail,
      adminPhone,
      verificationMethod
    };
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/admin/auth/register-college`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Registration failed');
      setMessage('College registered. Check server logs for verification token.');
    } catch (err) {
      setMessage(err.message);
    } finally { setLoading(false); }
  }

  async function onVerifyCollege(e) {
    e.preventDefault();
    resetMessages();
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/admin/auth/verify-college`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain: verifyDomain, token: verifyToken })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Verification failed');
      setMessage('College verified. You can now set the initial admin password.');
    } catch (err) {
      setMessage(err.message);
    } finally { setLoading(false); }
  }

  async function onSetInitialPassword(e) {
    e.preventDefault();
    resetMessages();
    if (!newPassword || newPassword.length < 6) {
      setErrors({ newPassword: 'Password must be at least 6 characters' });
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/admin/auth/admin-set-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: setPwdEmail, domain: setPwdDomain, token: setPwdToken, newPassword })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to set password');
      setMessage('Password set. Please login.');
      setActiveTab('login');
    } catch (err) {
      setMessage(err.message);
    } finally { setLoading(false); }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-teal-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="bg-teal-500 p-6 text-center">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="bg-white rounded-full p-2">
              <img src="/assets/branding/UMANG.png" alt="UMANG logo" className="rounded-xl w-16 h-16 scale-150 object-contain" />
            </div>
          </div>
          <p className="text-teal-100">Unified Mental Aid for Nurturing Growth</p>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-2 gap-2 border-b border-gray-200 mb-6">
            <button className={`py-3 font-medium text-center ${activeTab === 'login' ? 'text-teal-600 border-b-2 border-teal-600' : 'text-gray-500 hover:text-gray-700'}`} onClick={() => setActiveTab('login')}>Admin Login</button>
            <button className={`py-3 font-medium text-center ${activeTab === 'register' ? 'text-teal-600 border-b-2 border-teal-600' : 'text-gray-500 hover:text-gray-700'}`} onClick={() => setActiveTab('register')}>Register College</button>
            <button className={`py-3 font-medium text-center ${activeTab === 'verify' ? 'text-teal-600 border-b-2 border-teal-600' : 'text-gray-500 hover:text-gray-700'}`} onClick={() => setActiveTab('verify')}>Verify Domain</button>
            <button className={`py-3 font-medium text-center ${activeTab === 'setPassword' ? 'text-teal-600 border-b-2 border-teal-600' : 'text-gray-500 hover:text-gray-700'}`} onClick={() => setActiveTab('setPassword')}>Set Password</button>
          </div>

          {message && (
            <div className="mb-4 p-3 rounded-lg text-sm bg-blue-50 text-blue-700 border border-blue-200">{message}</div>
          )}

          {/* LOGIN */}
          {activeTab === 'login' && (
            <form onSubmit={onLogin}>
              <div className="mb-4">
                <label htmlFor="email" className="block text-gray-700 mb-2">Email Address</label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="Enter your email"
                />
                {errors.email && <p className="mt-1 text-red-500 text-sm">{errors.email}</p>}
              </div>
              
              <div className="mb-4">
                <label htmlFor="password" className="block text-gray-700 mb-2">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 ${errors.password ? 'border-red-500' : 'border-gray-300'}`}
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    <svg className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                  </button>
                </div>
                {errors.password && <p className="mt-1 text-red-500 text-sm">{errors.password}</p>}
              </div>
              
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <input id="remember-me" type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded" />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">Remember me</label>
                </div>
                <div className="text-sm">
                  <span className="font-medium text-gray-400">Forgot password?</span>
                </div>
              </div>
              
              <button type="submit" disabled={loading} className="w-full bg-teal-600 hover:bg-teal-700 text-white font-medium py-3 px-4 rounded-lg transition duration-300 disabled:opacity-60">{loading ? 'Logging in...' : 'Login to Your Account'}</button>
            </form>
          )}

          {/* REGISTER COLLEGE */}
          {activeTab === 'register' && (
            <form onSubmit={onRegisterCollege}>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">College Name</label>
                <input className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 border-gray-300" value={collegeName} onChange={e=>setCollegeName(e.target.value)} placeholder="National Institute of Technology Kanpur" />
              </div>
              <div className="mb-4 grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-700 mb-2">Domain</label>
                  <input className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 border-gray-300" value={domain} onChange={e=>setDomain(e.target.value)} placeholder="nitk.ac.in" />
                </div>
                <div>
                  <label className="block text-gray-700 mb-2">Code</label>
                  <input className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 border-gray-300" value={code} onChange={e=>setCode(e.target.value)} placeholder="NITK" />
                </div>
              </div>
              <div className="mb-4 grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-700 mb-2">Admin Name</label>
                  <input className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 border-gray-300" value={adminName} onChange={e=>setAdminName(e.target.value)} placeholder="Dr. Arjun Mehta" />
                </div>
                <div>
                  <label className="block text-gray-700 mb-2">Admin Phone</label>
                  <input className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 border-gray-300" value={adminPhone} onChange={e=>setAdminPhone(e.target.value)} placeholder="+919876543210" />
                </div>
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Admin Email</label>
                <input className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 border-gray-300" value={adminEmail} onChange={e=>setAdminEmail(e.target.value)} placeholder="arjun.mehta@nitk.ac.in" />
              </div>
              <div className="mb-6">
                <label className="block text-gray-700 mb-2">Verification Method</label>
                <select className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 border-gray-300" value={verificationMethod} onChange={e=>setVerificationMethod(e.target.value)}>
                  <option value="email">Email</option>
                  <option value="dns">DNS</option>
                </select>
              </div>
              <button type="submit" disabled={loading} className="w-full bg-teal-600 hover:bg-teal-700 text-white font-medium py-3 px-4 rounded-lg transition duration-300 disabled:opacity-60">{loading ? 'Submitting...' : 'Register College'}</button>
            </form>
          )}

          {/* VERIFY COLLEGE */}
          {activeTab === 'verify' && (
            <form onSubmit={onVerifyCollege}>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">College Domain</label>
                <input className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 border-gray-300" value={verifyDomain} onChange={e=>setVerifyDomain(e.target.value)} placeholder="nitk.ac.in" />
              </div>
              <div className="mb-6">
                <label className="block text-gray-700 mb-2">Verification Token</label>
                <input className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 border-gray-300" value={verifyToken} onChange={e=>setVerifyToken(e.target.value)} placeholder="Paste token from server logs" autoComplete="one-time-code" />
              </div>
              <button type="submit" disabled={loading} className="w-full bg-teal-600 hover:bg-teal-700 text-white font-medium py-3 px-4 rounded-lg transition duration-300 disabled:opacity-60">{loading ? 'Verifying...' : 'Verify College'}</button>
            </form>
          )}

          {/* SET INITIAL PASSWORD */}
          {activeTab === 'setPassword' && (
            <form onSubmit={onSetInitialPassword}>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Admin Email</label>
                <input className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 border-gray-300" value={setPwdEmail} onChange={e=>setSetPwdEmail(e.target.value)} placeholder="arjun.mehta@nitk.ac.in" />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">College Domain</label>
                <input className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 border-gray-300" value={setPwdDomain} onChange={e=>setSetPwdDomain(e.target.value)} placeholder="nitk.ac.in" />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Verification Token</label>
                <input className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 border-gray-300" value={setPwdToken} onChange={e=>setSetPwdToken(e.target.value)} placeholder="Paste token from server logs" autoComplete="one-time-code" />
              </div>
              <div className="mb-6">
                <label className="block text-gray-700 mb-2">New Password</label>
                <input type={showConfirmPassword ? 'text' : 'password'} className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 ${errors.newPassword ? 'border-red-500' : 'border-gray-300'}`} value={newPassword} onChange={e=>setNewPassword(e.target.value)} placeholder="Create a strong password" autoComplete="new-password" />
                {errors.newPassword && <p className="mt-1 text-red-500 text-sm">{errors.newPassword}</p>}
                <div className="mt-2 text-sm text-gray-500">
                  <label className="inline-flex items-center gap-2">
                    <input type="checkbox" checked={showConfirmPassword} onChange={e=>setShowConfirmPassword(e.target.checked)} />
                    Show password
                  </label>
                </div>
              </div>
              <button type="submit" disabled={loading} className="w-full bg-teal-600 hover:bg-teal-700 text-white font-medium py-3 px-4 rounded-lg transition duration-300 disabled:opacity-60">{loading ? 'Saving...' : 'Set Password'}</button>
            </form>
          )}
          
          <div className="mt-6 text-center text-sm text-gray-600">
            <p>Use the tabs above to complete: Register → Verify → Set Password → Login</p>
          </div>
        </div>
        
        <div className="bg-gray-50 px-6 py-4 text-center border-t border-gray-200">
          <p className="text-xs text-gray-500">
            By continuing, you agree to UMANG's Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
      
      <div className="mt-8 text-center text-gray-600 max-w-md">
        <p className="mb-2">Need support? Contact our care team at support@umang.org</p>
        <p className="text-sm">© 2025 UMANG - Unified Mental Aid for Nurturing Growth. All rights reserved.</p>
      </div>
    </div>
  );
}