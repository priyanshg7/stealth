import React from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import VoiceAssistant from './VoiceAssistant';
import QuickActionFAB from './QuickActionFAB';
import OnboardingWorkspace from './dashboard/OnboardingWorkspace';
import FarmingDashboard from './dashboard/FarmingDashboard';
import FarmsList from './subviews/FarmsList';
import DiseaseDiagnosis from './subviews/DiseaseDiagnosis';
import MarketDetails from './subviews/MarketDetails';
import GovernmentSchemes from './subviews/GovernmentSchemes';
import CommunityDiscussions from './subviews/CommunityDiscussions';
import SettingsPanel from './subviews/SettingsPanel';
import SeasonPlanner from './subviews/SeasonPlanner';
import WeatherIntelligence from './subviews/WeatherIntelligence';
import AnnualPlanner from './subviews/AnnualPlanner';
import TodayTasks from './subviews/TodayTasks';


export default function DashboardShell({
  weatherData,
  weatherLoading,
  fetchWeather,
  profile,
  setProfile,
  language,
  setLanguage,
  languages,
  seasonPlanConfirmed,
  farms,
  selectedFarmIndex,
  setSelectedFarmIndex,
  getFarmDashboardData,
  activeDashboardTab,
  setActiveDashboardTab,
  sidebarOpen,
  setSidebarOpen,
  sidebarCollapsed,
  setSidebarCollapsed,
  jwtToken,
  setShowJwtInspector,
  handleSignOut,
  completedTasks,
  setCompletedTasks,
  voiceAssistantOpen,
  setVoiceAssistantOpen,
  voiceReplies,
  setVoiceReplies,
  soilHealthCardUploaded,
  soilCardReminderDismissed,
  setSoilCardReminderDismissed,
  handleSoilHealthCardUpload,
  showAnnualPlanWizard,
  setShowAnnualPlanWizard,
  onboardingCarouselIndex,
  setOnboardingCarouselIndex,
  onboardingSlides,
  wizardSelectedCrop,
  setWizardSelectedCrop,
  activeDialogTask,
  setActiveDialogTask,
  selectedRescheduleDate,
  setSelectedRescheduleDate,
  selectedScheme,
  setSelectedScheme,
  selectedMandiDetails,
  setSelectedMandiDetails,
  selectedCommunityPost,
  setSelectedCommunityPost,
  showAllTasksModal,
  setShowAllTasksModal,
  startNewFarmRegistration,
  setView,
  setFarms,
  setMobileNumber,
  setJwtToken,
  setDecodedToken,
  setSeasonPlanConfirmed,
  handleVoiceCommand,
  crops,
  setCurrentFarm,
  setBoundaryPoints,
  setEditingFarmIndex,
  voiceGuide,
  setVoiceGuide,
  translating,
  isListening,
  startSpeechRecognition,
  allSchemes
}) {
  return (
    <div className="flex-grow w-full flex bg-background text-on-surface relative overflow-hidden min-h-[calc(100vh-68px)] font-sans">
      
      {/* Sidebar navigation drawer */}
      <Sidebar 
        language={language}
        profile={profile}
        seasonPlanConfirmed={seasonPlanConfirmed}
        farms={farms}
        selectedFarmIndex={selectedFarmIndex}
        getFarmDashboardData={getFarmDashboardData}
        activeDashboardTab={activeDashboardTab}
        setActiveDashboardTab={setActiveDashboardTab}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        sidebarCollapsed={sidebarCollapsed}
        setSidebarCollapsed={setSidebarCollapsed}
        completedTasks={completedTasks}
        setView={setView}
        setFarms={setFarms}
        setMobileNumber={setMobileNumber}
        setJwtToken={setJwtToken}
        setDecodedToken={setDecodedToken}
        setSeasonPlanConfirmed={setSeasonPlanConfirmed}
        jwtToken={jwtToken}
        setShowJwtInspector={setShowJwtInspector}
        handleSignOut={handleSignOut}
      />

      {/* Main content body container */}
      <div className={`flex-grow flex flex-col min-w-0 overflow-y-auto pb-16 relative transition-all duration-300`}>
        
        {/* Top command bar */}
        <Header 
          profile={profile}
          language={language}
          setLanguage={setLanguage}
          languages={languages}
          setActiveDashboardTab={setActiveDashboardTab}
          setSidebarOpen={setSidebarOpen}
          sidebarCollapsed={sidebarCollapsed}
          setSidebarCollapsed={setSidebarCollapsed}
          setVoiceAssistantOpen={setVoiceAssistantOpen}
          isListening={isListening}
          startSpeechRecognition={startSpeechRecognition}
          handleVoiceCommand={handleVoiceCommand}
        />

        {/* Dynamic content subviews routing based on active tab state */}
        <main className="p-4 md:p-6 max-w-7xl mx-auto w-full flex-grow space-y-6">
          
          {activeDashboardTab === 'dashboard' && (
            profile.isOnboarded ? (
              <FarmingDashboard 
                farms={farms}
                selectedFarmIndex={selectedFarmIndex}
                setSelectedFarmIndex={setSelectedFarmIndex}
                getFarmDashboardData={getFarmDashboardData}
                completedTasks={completedTasks}
                setCompletedTasks={setCompletedTasks}
                activeDialogTask={activeDialogTask}
                setActiveDialogTask={setActiveDialogTask}
                selectedRescheduleDate={selectedRescheduleDate}
                setSelectedRescheduleDate={setSelectedRescheduleDate}
                selectedScheme={selectedScheme}
                setSelectedScheme={setSelectedScheme}
                selectedMandiDetails={selectedMandiDetails}
                setSelectedMandiDetails={setSelectedMandiDetails}
                selectedCommunityPost={selectedCommunityPost}
                setSelectedCommunityPost={setSelectedCommunityPost}
                showAllTasksModal={showAllTasksModal}
                setShowAllTasksModal={setShowAllTasksModal}
                startNewFarmRegistration={startNewFarmRegistration}
                setActiveDashboardTab={setActiveDashboardTab}
                setVoiceAssistantOpen={setVoiceAssistantOpen}
                setVoiceReplies={setVoiceReplies}
                translating={translating}
                language={language}
                weatherData={weatherData}
                weatherLoading={weatherLoading}
              />
            ) : (
              <OnboardingWorkspace 
                profile={profile}
                farms={farms}
                currentFarm={farms[selectedFarmIndex]}
                soilHealthCardUploaded={soilHealthCardUploaded}
                soilCardReminderDismissed={soilCardReminderDismissed}
                setSoilCardReminderDismissed={setSoilCardReminderDismissed}
                handleSoilHealthCardUpload={handleSoilHealthCardUpload}
                showAnnualPlanWizard={showAnnualPlanWizard}
                setShowAnnualPlanWizard={setShowAnnualPlanWizard}
                onboardingCarouselIndex={onboardingCarouselIndex}
                setOnboardingCarouselIndex={setOnboardingCarouselIndex}
                onboardingSlides={onboardingSlides}
                wizardSelectedCrop={wizardSelectedCrop}
                setWizardSelectedCrop={setWizardSelectedCrop}
                setFarms={setFarms}
                setSeasonPlanConfirmed={setSeasonPlanConfirmed}
                crops={crops}
              />
            )
          )}

           {activeDashboardTab === 'diagnosis' && (
            <DiseaseDiagnosis 
              weatherData={weatherData}
              activeFarm={farms[selectedFarmIndex]}
            />
          )}
 
          {activeDashboardTab === 'market' && (
            <MarketDetails 
              farms={farms}
              selectedFarmIndex={selectedFarmIndex}
              getFarmDashboardData={getFarmDashboardData}
              weatherData={weatherData}
              mandiData={null}
              fetchMandiData={null}
            />
          )}
 
          {activeDashboardTab === 'schemes' && (
            <GovernmentSchemes 
              setSelectedScheme={setSelectedScheme}
              profile={profile}
              setProfile={setProfile}
              language={language}
              farms={farms}
              selectedFarmIndex={selectedFarmIndex}
              setSelectedFarmIndex={setSelectedFarmIndex}
              setActiveDashboardTab={setActiveDashboardTab}
              allSchemes={allSchemes}
            />
          )}
 
          {activeDashboardTab === 'settings' && (
            <SettingsPanel 
              profile={profile}
              setProfile={setProfile}
              voiceGuide={voiceGuide}
              setVoiceGuide={setVoiceGuide}
              farms={farms}
              setCurrentFarm={setCurrentFarm}
              setBoundaryPoints={setBoundaryPoints}
              setEditingFarmIndex={setEditingFarmIndex}
              setView={setView}
              startNewFarmRegistration={startNewFarmRegistration}
            />
          )}

          {activeDashboardTab === 'weather' && (
            <WeatherIntelligence 
              profile={profile}
              farms={farms}
              selectedFarmIndex={selectedFarmIndex}
              weatherData={weatherData}
              weatherLoading={weatherLoading}
              fetchWeather={fetchWeather}
              setActiveDashboardTab={setActiveDashboardTab}
              language={language}
            />
          )}

          {activeDashboardTab === 'season_planner' && (
            <SeasonPlanner 
              profile={profile}
              farms={farms}
              selectedFarmIndex={selectedFarmIndex}
              setSelectedFarmIndex={setSelectedFarmIndex}
              setFarms={setFarms}
              seasonPlanConfirmed={seasonPlanConfirmed}
              setSeasonPlanConfirmed={setSeasonPlanConfirmed}
              language={language}
              setActiveDashboardTab={setActiveDashboardTab}
              weatherData={weatherData}
            />
          )}

          {activeDashboardTab === 'planner' && (
            <AnnualPlanner
              profile={profile}
              farms={farms}
              selectedFarmIndex={selectedFarmIndex}
              setSelectedFarmIndex={setSelectedFarmIndex}
              weatherData={weatherData}
              language={language}
              setActiveDashboardTab={setActiveDashboardTab}
              setFarms={setFarms}
            />
          )}

          {activeDashboardTab === 'tasks' && (
            <TodayTasks
              farms={farms}
              selectedFarmIndex={selectedFarmIndex}
              getFarmDashboardData={getFarmDashboardData}
              completedTasks={completedTasks}
              setCompletedTasks={setCompletedTasks}
              weatherData={weatherData}
              language={language}
            />
          )}

          {/* Simple Fallbacks for other tabs to keep navigation responsive */}
          {['journey'].includes(activeDashboardTab) && (
            <div className="bg-white border rounded-card p-6 shadow-sm text-center py-10 space-y-3">
              <span className="material-symbols-outlined text-primary text-4xl font-bold">construction</span>
              <h3 className="font-display font-extrabold text-lg text-on-surface">Module Subview Under Development</h3>
              <p className="text-xs text-on-surface-variant max-w-sm mx-auto">
                The {activeDashboardTab.replace('_', ' ')} layout is being actively structured by KisanMitra engineers. Direct alerts and command parameters remain available on the home Dashboard tab.
              </p>
              <button 
                onClick={() => setActiveDashboardTab('dashboard')}
                className="bg-primary hover:bg-secondary text-white font-bold px-4 py-2 rounded-xl text-xs"
              >
                Back to Dashboard
              </button>
            </div>
          )}

        </main>
      </div>

      {/* Floating Voice Assistant drawer */}
      <VoiceAssistant 
        voiceAssistantOpen={voiceAssistantOpen}
        setVoiceAssistantOpen={setVoiceAssistantOpen}
        voiceReplies={voiceReplies}
        language={language}
        handleVoiceCommand={handleVoiceCommand}
        isListening={isListening}
        startSpeechRecognition={startSpeechRecognition}
      />

      {/* Floating Voice Assistant MIC button overlay for mobile devices */}
      <button
        onClick={() => setVoiceAssistantOpen(true)}
        className="fixed bottom-20 left-4 z-40 bg-primary hover:bg-secondary text-white h-14 w-14 rounded-full flex items-center justify-center shadow-2xl animate-pulse-ring border-2 border-white lg:hidden"
        title="Voice Assistant"
      >
        <span className="material-symbols-outlined text-2xl font-bold">mic</span>
      </button>

      {/* Floating Quick Action menu FAB */}
      <QuickActionFAB 
        setActiveDashboardTab={setActiveDashboardTab}
        setVoiceAssistantOpen={setVoiceAssistantOpen}
      />

    </div>
  );
}
