import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from "../Header&Footer/Header";
import Footer from "../Header&Footer/Footer";
import { getUserDetails, updateUserDetails, getCitiesByStateId } from '../../Services/api';
import UserProfile from '../../assets/Website logos/UserProfile.jpg';


const ProfilePage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [cityOptions, setCityOptions] = useState([]);
  const [success, setSuccess] = useState(null);
  // Dummy data for dropdowns (replace with API calls later)
  const [stateOptions, setStateOptions] = useState([
    { value: '67ea880c34693d5cc5891593', label: 'Andhra Pradesh' },
    { value: '67ea880c34693d5cc58915aa', label: 'Telangana' }
  ].sort((a, b) => (a.label || '').localeCompare(b.label || '')));

  const toYYYYMMDD = (d) => {
    if (!d || typeof d !== 'string') return '';
    // If already YYYY-MM-DD
    if (/^\d{4}-\d{2}-\d{2}$/.test(d)) return d;
    // If DD-MM-YYYY
    const m = d.match(/^(\d{2})-(\d{2})-(\d{4})$/);
    if (m) {
      const [, dd, mm, yyyy] = m;
      return `${yyyy}-${mm}-${dd}`;
    }
    return d; // fallback
  };

  useEffect(() => {
    const fetchDetails = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = sessionStorage.getItem('token');
        if (!token) {
          setError('Please log in to view your profile.');
          setLoading(false);
          return;
        }
        const resp = await getUserDetails(token);
        const ok = resp && resp.status >= 200 && resp.status < 300;
        if (ok) {
          const u = resp?.data?.data || resp?.data;
          setUser(u);
          setForm({
            firstName: u?.firstName || '',
            lastName: u?.lastName || '',
            mobileNumber: u?.mobileNumber || '',
            dateOfBirth: toYYYYMMDD(u?.dateOfBirth || ''),
            pincode: u?.pincode || '',
            cityId: u?.city?._id || '',
            stateId: u?.state?._id || '',
          });
          // Fetch cities for the user's state
          const stateId = u?.state?._id;
          try {
            if (stateId) {
              const citiesResp = await getCitiesByStateId(stateId);
              const okCities = citiesResp && citiesResp.status >= 200 && citiesResp.status < 300;
              const cities = okCities ? (citiesResp?.data?.data || []) : [];
              const options = cities
                .map(c => ({ value: c._id || c.id, label: c.name }))
                .sort((a, b) => (a.label || '').localeCompare(b.label || ''));
              setCityOptions(options);
            } else {
              setCityOptions([]);
            }
          } catch (_) {
            setCityOptions([]);
          }
        } else {
          const data = resp?.response?.data ?? resp?.data;
          const message = data?.message || data?.error || 'Failed to load profile.';
          setError(message);
        }
      } catch (e) {
        const message = e?.response?.data?.message || e?.message || 'Failed to load profile.';
        setError(message);
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, []);

  // When stateId changes in edit mode, refetch cities
  useEffect(() => {
    const fetchCities = async () => {
      const stateId = form?.stateId;
      if (!stateId) { setCityOptions([]); return; }
      try {
        const resp = await getCitiesByStateId(stateId);
        const ok = resp && resp.status >= 200 && resp.status < 300;
        const cities = ok ? (resp?.data?.data || []) : [];
        const options = cities
          .map(c => ({ value: c._id || c.id, label: c.name }))
          .sort((a, b) => (a.label || '').localeCompare(b.label || ''));
        setCityOptions(options);
        // if current cityId not in options, clear it
        if (form.cityId && !options.some(o => o.value === form.cityId)) {
          setForm(prev => ({ ...prev, cityId: '' }));
        }
      } catch (_) {
        setCityOptions([]);
      }
    };
    if (isEditing) fetchCities();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.stateId]);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      setSuccess(null);
      const token = sessionStorage.getItem('token');
      const payload = {
        firstName: form.firstName,
        lastName: form.lastName,
        mobileNumber: form.mobileNumber,
        dateOfBirth: form.dateOfBirth, // expected YYYY-MM-DD
        pincode: form.pincode,
        stateId: form.stateId || undefined,
        cityId: form.cityId || undefined,
      };
      const resp = await updateUserDetails(payload, token);
      const ok = resp && resp.status >= 200 && resp.status < 300;
      if (ok) {
        setIsEditing(false);
        setSuccess('Profile updated successfully.');
        // reload details
        const refreshed = await getUserDetails(token);
        const u = refreshed?.data?.data || refreshed?.data;
        setUser(u);
      } else {
        const data = resp?.response?.data ?? resp?.data;
        let message = data?.message || data?.error || 'Failed to update profile.';
        if (resp?.response?.status === 422 && data?.errors && typeof data.errors === 'object') {
          const firstKey = Object.keys(data.errors)[0];
          const firstMsg = Array.isArray(data.errors[firstKey]) ? data.errors[firstKey][0] : undefined;
          if (firstMsg) message = firstMsg;
          try { console.error('update-details 422 errors:', data.errors); } catch (_) {}
        }
        setError(message);
      }
    } catch (e) {
      const status = e?.response?.status;
      const data = e?.response?.data;
      let message = data?.message || e?.message || 'Failed to update profile.';
      if (status === 422 && data?.errors && typeof data.errors === 'object') {
        const firstKey = Object.keys(data.errors)[0];
        const firstMsg = Array.isArray(data.errors[firstKey]) ? data.errors[firstKey][0] : undefined;
        if (firstMsg) message = firstMsg;
        try { console.error('update-details 422 errors (caught):', data.errors); } catch (_) {}
      }
      setError(message);
    } finally {
      setSaving(false);
    }
  };

  const renderRow = (label, value) => (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 py-2 border-b border-gray-200">
      <span className="text-gray-500 text-sm sm:text-base">{label}</span>
      <span className="text-black font-medium text-sm sm:text-base break-words max-w-full sm:max-w-[60%]">
        {value ?? '-'}
      </span>
    </div>
  );

  return (
    <div className="min-h-screen">
        <Header />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold text-black">My Profile</h1>
          {success ? (
                <div className="col-span-12">
                  <div className="mb-2 rounded-md bg-green-50 border border-green-200 text-green-700 px-4 py-2 text-xs">
                    {success}
                  </div>
                </div>
              ) : null}
          <div className="flex items-center gap-2">
            {!isEditing ? (
              <button
                className="text-sm bg-orange-500 text-white px-4 py-2 rounded-full hover:bg-orange-600"
                onClick={() => { setIsEditing(true); setError(null); setSuccess(null); }}
              >
                Edit
              </button>
            ) : (
              <>
                <button
                  className="text-sm bg-gray-200 text-black px-4 py-2 rounded-full hover:bg-gray-300"
                  onClick={() => { setIsEditing(false); setError(null); setSuccess(null); }}
                  disabled={saving}
                >
                  Cancel
                </button>
                <button
                  className={`text-sm px-4 py-2 rounded-full text-white ${saving ? 'bg-orange-300 cursor-not-allowed' : 'bg-orange-500 hover:bg-orange-600'}`}
                  onClick={handleSave}
                  disabled={saving}
                >
                  {saving ? 'Saving…' : 'Save'}
                </button>
              </>
            )}
            <button
              className="text-sm bg-white border px-4 py-2 rounded-full hover:bg-gray-50"
              onClick={() => navigate('/homepage')}
            >
              Home
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow p-5 sm:p-8">
          {loading ? (
            <div className="text-gray-600">Loading . . .</div>
          ) : error ? (
            <div className="text-red-500">{error}</div>
          ) : !user ? (
            <div className="text-gray-600">No user data.</div>
          ) : (
            <div className="grid grid-cols-12 gap-6">
              
              {/* Left summary */}
              <div className="col-span-12 md:col-span-4 flex flex-col items-center text-center">
                <div className="w-28 h-28 rounded-full bg-gray-100 border overflow-hidden mb-3">
                  {user.profilePicture ? (
                    <img src={user.profilePicture} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <img src={UserProfile} alt="Profile" className="w-full h-full object-cover" />
                  )}
                </div>
                <div className="text-black font-semibold text-lg">
                  {[user.firstName, user.lastName].filter(Boolean).join(' ') || 'User'}
                </div>
                <div className="text-gray-500 text-sm mt-1">
                  {user.role?.name || 'User'}
                </div>
              </div>

              {/* Right details */}
              <div className="col-span-12 md:col-span-8">
                {!isEditing ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-gray-50 rounded-xl p-4">
                      {renderRow('First Name', user.firstName)}
                      {renderRow('Last Name', user.lastName)}
                      {renderRow('Email', user.email)}
                      {renderRow('Mobile', user.mobileNumber)}
                      {renderRow('Date of Birth', user.dateOfBirth)}
                    </div>
                    <div className="bg-gray-50 rounded-xl p-4">
                      {renderRow('Country', user.country?.name)}
                      {renderRow('State', user.state?.name)}
                      {renderRow('City', user.city?.name)}
                      {renderRow('Pincode', user.pincode)}
                      {renderRow('Status', user.isActive ? 'Active' : 'Inactive')}
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-gray-50 rounded-xl p-4 flex flex-col gap-3">
                      <label className="text-sm text-gray-600">First Name
                        <input name="firstName" value={form.firstName} onChange={onChange} className="mt-1 w-full border rounded px-3 py-2 text-sm" />
                      </label>
                      <label className="text-sm text-gray-600">Last Name
                        <input name="lastName" value={form.lastName} onChange={onChange} className="mt-1 w-full border rounded px-3 py-2 text-sm" />
                      </label>
                      <label className="text-sm text-gray-600">Date of Birth
                        <input type="date" name="dateOfBirth" value={form.dateOfBirth} onChange={onChange} className="mt-1 w-full border rounded px-3 py-2 text-sm" />
                      </label>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-4 flex flex-col gap-3">
                      <label className="text-sm text-gray-600">Pincode
                        <input name="pincode" value={form.pincode} onChange={onChange} className="mt-1 w-full border rounded px-3 py-2 text-sm" />
                      </label>
                      <label className="text-sm text-gray-600">State
                        <select
                          name="stateId"
                          value={form.stateId || ''}
                          onChange={e => setForm(prev => ({ ...prev, stateId: e.target.value }))}
                          className="mt-1 w-full border rounded px-3 py-2 text-sm bg-white"
                        >
                          <option value="">Select State</option>
                          {stateOptions.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                          ))}
                        </select>
                      </label>
                      <label className="text-sm text-gray-600">City
                        <select
                          name="cityId"
                          value={form.cityId || ''}
                          onChange={onChange}
                          className="mt-1 w-full border rounded px-3 py-2 text-sm bg-white"
                        >
                          <option value="">Select City</option>
                          {cityOptions.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                          ))}
                        </select>
                      </label>
                    </div>
                  </div>
                )}

                {/* Addresses */}
                <div className="mt-6">
                  <h2 className="text-lg font-semibold text-black mb-3">Addresses</h2>
                  {Array.isArray(user.addresses) && user.addresses.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {user.addresses.map(addr => (
                        <div key={addr._id} className="border rounded-xl p-4 bg-white">
                          <div className="font-semibold text-black mb-1">
                            {addr.addressType}{addr.customAddressType ? ` - ${addr.customAddressType}` : ''}
                          </div>
                          <div className="text-sm text-gray-700 whitespace-pre-line">
                            {addr.description}
                          </div>
                          <div className="text-sm text-gray-600 mt-2">
                            {[addr.city, addr.state, addr.country].filter(Boolean).join(', ')}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-gray-600">No addresses added.</div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ProfilePage;
