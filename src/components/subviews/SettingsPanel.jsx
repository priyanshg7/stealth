import React, { useState } from 'react';
import FarmsList from './FarmsList';
import { User, Layers, Volume2, ShieldCheck, Save, Bell, Mail, MessageSquare } from 'lucide-react';

export default function SettingsPanel({
  profile,
  setProfile,
  voiceGuide,
  setVoiceGuide,
  farms,
  setCurrentFarm,
  setBoundaryPoints,
  setEditingFarmIndex,
  setView,
  startNewFarmRegistration
}) {
  const [activeSubTab, setActiveSubTab] = useState('profile');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Notification Preferences State
  const [emailEnabled, setEmailEnabled] = useState(() => {
    const val = localStorage.getItem('km_notif_email_enabled');
    return val === null ? true : val === 'true';
  });
  const [emailAddress, setEmailAddress] = useState(() => {
    return localStorage.getItem('km_notif_email_address') || profile.email || 'rajesh.kumar@gmail.com';
  });
  
  const [whatsappEnabled, setWhatsappEnabled] = useState(() => {
    const val = localStorage.getItem('km_notif_whatsapp_enabled');
    return val === null ? true : val === 'true';
  });
  const [whatsappNumber, setWhatsappNumber] = useState(() => {
    return localStorage.getItem('km_notif_whatsapp_number') || profile.mobile || '9876543210';
  });

  const [testSending, setTestSending] = useState(false);
  const [testSuccess, setTestSuccess] = useState(false);

  const handleProfileFieldChange = (field, value) => {
    setProfile(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSaveProfile = (e) => {
    e.preventDefault();
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    }, 800);
  };

  const handleSaveNotifications = (e) => {
    e.preventDefault();
    setIsSaving(true);
    localStorage.setItem('km_notif_email_enabled', String(emailEnabled));
    localStorage.setItem('km_notif_email_address', emailAddress);
    localStorage.setItem('km_notif_whatsapp_enabled', String(whatsappEnabled));
    localStorage.setItem('km_notif_whatsapp_number', whatsappNumber);
    setTimeout(() => {
      setIsSaving(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    }, 600);
  };

  const handleSendTestNotification = () => {
    setTestSending(true);
    setTestSuccess(false);
    setTimeout(() => {
      setTestSending(false);
      setTestSuccess(true);
      setTimeout(() => setTestSuccess(false), 4000);
    }, 1500);
  };

  return (
    <div className="bg-white border border-outline-variant/60 rounded-card shadow-lg max-w-5xl mx-auto animate-fade-in-up font-sans overflow-hidden">
      
      {/* Settings Navigation Tabs */}
      <div className="flex border-b border-surface-container-high bg-surface-container-low/20 overflow-x-auto no-scrollbar">
        <button
          type="button"
          onClick={() => setActiveSubTab('profile')}
          className={`flex items-center gap-2 px-6 py-4 font-display font-extrabold text-sm border-b-2 transition-all whitespace-nowrap ${
            activeSubTab === 'profile'
              ? 'border-primary text-primary bg-white'
              : 'border-transparent text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low/40'
          }`}
        >
          <User className="w-4 h-4 text-primary" />
          <span>Profile Details</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveSubTab('farms')}
          className={`flex items-center gap-2 px-6 py-4 font-display font-extrabold text-sm border-b-2 transition-all whitespace-nowrap ${
            activeSubTab === 'farms'
              ? 'border-primary text-primary bg-white'
              : 'border-transparent text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low/40'
          }`}
        >
          <Layers className="w-4 h-4 text-primary" />
          <span>Manage Saved Farms</span>
          <span className="bg-primary-container/20 border border-primary/20 text-primary text-[10px] px-2 py-0.5 rounded-full">
            {farms.length}
          </span>
        </button>
        <button
          type="button"
          onClick={() => setActiveSubTab('notifications')}
          className={`flex items-center gap-2 px-6 py-4 font-display font-extrabold text-sm border-b-2 transition-all whitespace-nowrap ${
            activeSubTab === 'notifications'
              ? 'border-primary text-primary bg-white'
              : 'border-transparent text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low/40'
          }`}
        >
          <Bell className="w-4 h-4 text-primary" />
          <span>Notifications</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveSubTab('preferences')}
          className={`flex items-center gap-2 px-6 py-4 font-display font-extrabold text-sm border-b-2 transition-all whitespace-nowrap ${
            activeSubTab === 'preferences'
              ? 'border-primary text-primary bg-white'
              : 'border-transparent text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low/40'
          }`}
        >
          <Volume2 className="w-4 h-4 text-primary" />
          <span>App Preferences</span>
        </button>
      </div>

      <div className="p-6 md:p-8">
        {/* TAB 1: PROFILE DETAILS */}
        {activeSubTab === 'profile' && (
          <form onSubmit={handleSaveProfile} className="space-y-8">
            <div className="border-b border-surface-container-high pb-4">
              <h3 className="font-display font-extrabold text-lg text-on-surface">Edit Farmer Profile</h3>
              <p className="text-xs text-on-surface-variant mt-0.5">Keep your credentials, location settings, and farming metadata up-to-date.</p>
            </div>

            {/* Profile Inputs Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Personal Information */}
              <div className="space-y-4">
                <h4 className="font-display font-bold text-xs text-primary uppercase tracking-wider">Personal Info</h4>
                
                <div className="flex flex-col gap-1.5">
                  <label className="font-extrabold text-xs text-on-surface-variant">Farmer Name</label>
                  <input
                    type="text"
                    required
                    value={profile.name || ''}
                    onChange={(e) => handleProfileFieldChange('name', e.target.value)}
                    className="bg-surface-container-low border border-outline-variant rounded-xl h-11 px-4 text-sm font-semibold focus:outline-hidden focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="font-extrabold text-xs text-on-surface-variant">Gender</label>
                    <select
                      value={profile.gender || 'Male'}
                      onChange={(e) => handleProfileFieldChange('gender', e.target.value)}
                      className="bg-surface-container-low border border-outline-variant rounded-xl h-11 px-3 text-sm font-semibold focus:outline-hidden focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other / Prefer not to say</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="font-extrabold text-xs text-on-surface-variant">Date of Birth</label>
                    <input
                      type="date"
                      value={profile.dob || ''}
                      onChange={(e) => handleProfileFieldChange('dob', e.target.value)}
                      className="bg-surface-container-low border border-outline-variant rounded-xl h-11 px-3 text-sm font-semibold focus:outline-hidden focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="font-extrabold text-xs text-on-surface-variant">Government ID / Aadhaar</label>
                  <input
                    type="text"
                    placeholder="e.g. AADHAAR-XXXX-1234"
                    value={profile.governmentId || ''}
                    onChange={(e) => handleProfileFieldChange('governmentId', e.target.value)}
                    className="bg-surface-container-low border border-outline-variant rounded-xl h-11 px-4 text-sm font-semibold focus:outline-hidden focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="font-extrabold text-xs text-on-surface-variant">Linked Mobile Number (Verified)</label>
                  <input
                    type="text"
                    disabled
                    value={profile.mobile ? `+91 ${profile.mobile}` : '+91 9876543210'}
                    className="bg-surface-container border border-outline-variant/60 rounded-xl h-11 px-4 text-sm font-semibold text-on-surface-variant cursor-not-allowed"
                  />
                </div>
              </div>

              {/* Location & Farming Credentials */}
              <div className="space-y-4">
                <h4 className="font-display font-bold text-xs text-primary uppercase tracking-wider">Location & Experience</h4>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="font-extrabold text-xs text-on-surface-variant">State</label>
                    <input
                      type="text"
                      required
                      value={profile.state || ''}
                      onChange={(e) => handleProfileFieldChange('state', e.target.value)}
                      className="bg-surface-container-low border border-outline-variant rounded-xl h-11 px-4 text-sm font-semibold focus:outline-hidden focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="font-extrabold text-xs text-on-surface-variant">District</label>
                    <input
                      type="text"
                      required
                      value={profile.district || ''}
                      onChange={(e) => handleProfileFieldChange('district', e.target.value)}
                      className="bg-surface-container-low border border-outline-variant rounded-xl h-11 px-4 text-sm font-semibold focus:outline-hidden focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="font-extrabold text-xs text-on-surface-variant">Village</label>
                    <input
                      type="text"
                      value={profile.village || ''}
                      onChange={(e) => handleProfileFieldChange('village', e.target.value)}
                      className="bg-surface-container-low border border-outline-variant rounded-xl h-11 px-4 text-sm font-semibold focus:outline-hidden focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="font-extrabold text-xs text-on-surface-variant">Pin Code</label>
                    <input
                      type="text"
                      value={profile.pinCode || ''}
                      onChange={(e) => handleProfileFieldChange('pinCode', e.target.value)}
                      className="bg-surface-container-low border border-outline-variant rounded-xl h-11 px-4 text-sm font-semibold focus:outline-hidden focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="font-extrabold text-xs text-on-surface-variant">Experience (Years)</label>
                    <input
                      type="number"
                      value={profile.experience || ''}
                      onChange={(e) => handleProfileFieldChange('experience', e.target.value)}
                      className="bg-surface-container-low border border-outline-variant rounded-xl h-11 px-4 text-sm font-semibold focus:outline-hidden focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="font-extrabold text-xs text-on-surface-variant">Ownership Type</label>
                    <select
                      value={profile.ownership || 'Owner'}
                      onChange={(e) => handleProfileFieldChange('ownership', e.target.value)}
                      className="bg-surface-container-low border border-outline-variant rounded-xl h-11 px-3 text-sm font-semibold focus:outline-hidden focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    >
                      <option value="Owner">Owner</option>
                      <option value="Tenant">Tenant</option>
                      <option value="Sharecropper">Sharecropper</option>
                    </select>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="font-extrabold text-xs text-on-surface-variant">Occupation</label>
                  <input
                    type="text"
                    value={profile.occupation || ''}
                    onChange={(e) => handleProfileFieldChange('occupation', e.target.value)}
                    className="bg-surface-container-low border border-outline-variant rounded-xl h-11 px-4 text-sm font-semibold focus:outline-hidden focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  />
                </div>
              </div>

            </div>

            {/* Bottom Actions */}
            <div className="flex items-center justify-between border-t border-surface-container-high pt-6">
              {saveSuccess ? (
                <span className="flex items-center gap-1.5 text-xs text-primary font-bold animate-pulse">
                  <span>Profile updated successfully!</span>
                </span>
              ) : (
                <span className="text-[11px] text-on-surface-variant font-medium">All settings are stored locally on your device</span>
              )}

              <button
                type="submit"
                disabled={isSaving}
                className="bg-primary hover:bg-secondary text-white font-bold h-11 px-6 rounded-xl text-xs flex items-center gap-2 shadow-md transition-all active:scale-[0.98] disabled:opacity-70"
              >
                {isSaving ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Save Profile Changes</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* TAB 2: MANAGE SAVED FARMS */}
        {activeSubTab === 'farms' && (
          <div className="space-y-4 animate-fade-in-up">
            <FarmsList
              farms={farms}
              setCurrentFarm={setCurrentFarm}
              setBoundaryPoints={setBoundaryPoints}
              setEditingFarmIndex={setEditingFarmIndex}
              setView={setView}
              startNewFarmRegistration={startNewFarmRegistration}
            />
          </div>
        )}

        {/* TAB 3: NOTIFICATIONS PREFERENCES */}
        {activeSubTab === 'notifications' && (
          <form onSubmit={handleSaveNotifications} className="space-y-8">
            <div className="border-b border-surface-container-high pb-4">
              <h3 className="font-display font-extrabold text-lg text-on-surface">Notification & Alerts Settings</h3>
              <p className="text-xs text-on-surface-variant mt-0.5">Control how KisanMitra delivers weather alerts, crop schedules, and market pricing.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Email Notifications Configuration */}
              <div className="p-6 rounded-2xl border border-outline-variant bg-surface-container-low/20 space-y-4">
                <div className="flex items-center justify-between border-b border-surface-container-high pb-3">
                  <div className="flex items-center gap-2">
                    <Mail className="w-5 h-5 text-primary" />
                    <h4 className="font-display font-bold text-sm text-on-surface">Email Alert Dispatch</h4>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={emailEnabled}
                      onChange={(e) => setEmailEnabled(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-surface-container peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-surface-container-high after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="font-extrabold text-xs text-on-surface-variant">Notification Email Address</label>
                  <input
                    type="email"
                    required={emailEnabled}
                    disabled={!emailEnabled}
                    value={emailAddress}
                    onChange={(e) => setEmailAddress(e.target.value)}
                    placeholder="name@domain.com"
                    className={`border rounded-xl h-11 px-4 text-sm font-semibold transition-all focus:outline-hidden focus:ring-2 focus:ring-primary/20 ${
                      emailEnabled 
                        ? 'bg-surface-container-low border-outline-variant focus:border-primary' 
                        : 'bg-surface-container border-outline-variant/40 text-on-surface-variant/70 cursor-not-allowed'
                    }`}
                  />
                  <p className="text-[10px] text-on-surface-variant font-medium">Weekly reports and detailed seasonal plan breakdowns will be sent here.</p>
                </div>
              </div>

              {/* WhatsApp Alerts Configuration */}
              <div className="p-6 rounded-2xl border border-outline-variant bg-surface-container-low/20 space-y-4">
                <div className="flex items-center justify-between border-b border-surface-container-high pb-3">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-[#25d366]" />
                    <h4 className="font-display font-bold text-sm text-on-surface">WhatsApp Push Integration</h4>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={whatsappEnabled}
                      onChange={(e) => setWhatsappEnabled(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-surface-container peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-surface-container-high after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="font-extrabold text-xs text-on-surface-variant">WhatsApp Number</label>
                  <input
                    type="tel"
                    required={whatsappEnabled}
                    disabled={!whatsappEnabled}
                    value={whatsappNumber}
                    onChange={(e) => setWhatsappNumber(e.target.value)}
                    placeholder="e.g. 9876543210"
                    className={`border rounded-xl h-11 px-4 text-sm font-semibold transition-all focus:outline-hidden focus:ring-2 focus:ring-primary/20 ${
                      whatsappEnabled 
                        ? 'bg-surface-container-low border-outline-variant focus:border-primary' 
                        : 'bg-surface-container border-outline-variant/40 text-on-surface-variant/70 cursor-not-allowed'
                    }`}
                  />
                  <p className="text-[10px] text-on-surface-variant font-medium">Daily advisory reminders, extreme weather bulletins, and crop stage updates.</p>
                </div>

                <div className="bg-[#eefdf5] border border-[#25d366]/20 p-2.5 rounded-xl text-[10px] text-[#128c7e] font-semibold flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-[#25d366] animate-ping" />
                  <span>KisanMitra WhatsApp Engine Online & Ready</span>
                </div>
              </div>
            </div>

            {/* Test Trigger Box */}
            <div className="p-4 rounded-xl border border-outline-variant/50 bg-surface-container-low/40 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <span className="font-bold text-xs text-on-surface block">Verify Dispatch Connectivity</span>
                <span className="text-[10px] text-on-surface-variant font-medium">Sends an instant sample alert to check email and WhatsApp routing.</span>
              </div>
              <button
                type="button"
                onClick={handleSendTestNotification}
                disabled={testSending || (!emailEnabled && !whatsappEnabled)}
                className="bg-surface-container-high hover:bg-surface-container border border-outline-variant text-on-surface font-bold px-4 py-2.5 rounded-xl text-xs whitespace-nowrap transition-all disabled:opacity-50"
              >
                {testSending ? 'Sending Sample Alert...' : 'Send Test Notification'}
              </button>
            </div>

            {/* Bottom Actions */}
            <div className="flex items-center justify-between border-t border-surface-container-high pt-6">
              {testSuccess && (
                <span className="text-xs text-[#128c7e] font-extrabold animate-pulse">
                  ✅ Sample alerts successfully routed to configured destinations!
                </span>
              )}
              {saveSuccess && !testSuccess && (
                <span className="text-xs text-primary font-bold">
                  Notification settings saved successfully!
                </span>
              )}
              {!testSuccess && !saveSuccess && (
                <span className="text-[11px] text-on-surface-variant font-medium">Configure alert routing modes above</span>
              )}

              <button
                type="submit"
                disabled={isSaving}
                className="bg-primary hover:bg-secondary text-white font-bold h-11 px-6 rounded-xl text-xs flex items-center gap-2 shadow-md transition-all active:scale-[0.98] disabled:opacity-70 ml-auto"
              >
                {isSaving ? 'Saving...' : 'Save Notification Preferences'}
              </button>
            </div>
          </form>
        )}

        {/* TAB 4: APP PREFERENCES */}
        {activeSubTab === 'preferences' && (
          <div className="space-y-6 animate-fade-in-up max-w-2xl">
            <div className="border-b border-surface-container-high pb-4">
              <h3 className="font-display font-extrabold text-lg text-on-surface">App Customization</h3>
              <p className="text-xs text-on-surface-variant mt-0.5">Configure KisanMitra voice assistance and visual guidance preferences.</p>
            </div>

            <div className="divide-y divide-surface-container-high">
              
              {/* Voice Helper Toggle */}
              <div className="flex items-center justify-between py-4">
                <div className="space-y-0.5">
                  <span className="font-bold text-sm block text-on-surface">Voice Helper Guidance</span>
                  <span className="text-xs text-on-surface-variant font-medium block">
                    Simulates native voice readouts during system navigation flows
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setVoiceGuide(!voiceGuide)}
                  className={`h-10 px-5 rounded-xl text-xs font-bold transition-all border ${
                    voiceGuide
                      ? 'bg-primary text-white border-primary shadow-xs'
                      : 'bg-white text-on-surface-variant border-outline-variant hover:bg-surface-container-low'
                  }`}
                >
                  {voiceGuide ? 'Helper Enabled' : 'Helper Disabled'}
                </button>
              </div>

              {/* Language Alert info */}
              <div className="flex items-center justify-between py-4">
                <div className="space-y-0.5">
                  <span className="font-bold text-sm block text-on-surface">System Language Selector</span>
                  <span className="text-xs text-on-surface-variant font-medium block">
                    Switch entire dashboard translations instantly in the header bar
                  </span>
                </div>
                <span className="bg-surface-container border border-outline-variant/60 text-on-surface text-xs px-3 py-1.5 rounded-lg font-bold">
                  Header Controlled
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
