import React, { useRef, useEffect } from 'react';
import ErrorBoundary from './ErrorBoundary';
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
import FarmJourney from './subviews/FarmJourney';
import RescheduleTaskModal from './subviews/RescheduleTaskModal';

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
  showRescheduleModal,
  setShowRescheduleModal,
  rescheduledTasks,
  setRescheduledTasks,
  isListening,
  startSpeechRecognition,
  allSchemes
}) {
  const scrollContainerRef = useRef(null);

  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo(0, 0); // instantly scroll to top
    }
  }, [activeDashboardTab]);

  return (
    <div className="flex-grow w-full flex bg-background text-on-surface relative h-screen overflow-hidden font-sans">
      
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
      <div ref={scrollContainerRef} className="flex-grow flex flex-col min-w-0 h-full overflow-y-auto overflow-x-hidden relative transition-all duration-300">
        
        {/* Top command bar */}
        <Header 
          activeDashboardTab={activeDashboardTab}
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
        <main className="p-4 md:p-6 pb-48 md:pb-32 max-w-7xl mx-auto w-full flex-grow space-y-6">
          <ErrorBoundary>

          {activeDashboardTab === 'dashboard' && (
            (farms.length > 0) ? (
              <FarmingDashboard 
                farms={farms}
                selectedFarmIndex={selectedFarmIndex}
                setSelectedFarmIndex={setSelectedFarmIndex}
                getFarmDashboardData={getFarmDashboardData}
                completedTasks={completedTasks}
                setCompletedTasks={setCompletedTasks}
                activeDialogTask={activeDialogTask}
                setActiveDialogTask={setActiveDialogTask}
                setShowRescheduleModal={setShowRescheduleModal}
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
                weatherData={weatherData}
                weatherLoading={weatherLoading}
                seasonPlanConfirmed={seasonPlanConfirmed}
                setSeasonPlanConfirmed={setSeasonPlanConfirmed}
                translating={translating}
                language={language}
                profile={profile}
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
              seasonPlanConfirmed={seasonPlanConfirmed}
              setSeasonPlanConfirmed={setSeasonPlanConfirmed}
            />
          )}

          {activeDashboardTab === 'tasks' && (
            <TodayTasks
              dashboardData={getFarmDashboardData(farms[selectedFarmIndex])}
              completedTasks={completedTasks}
              setCompletedTasks={setCompletedTasks}
              activeDialogTask={activeDialogTask}
              setActiveDialogTask={setActiveDialogTask}
              setShowRescheduleModal={setShowRescheduleModal}
              language={language}
              farms={farms}
              selectedFarmIndex={selectedFarmIndex}
              setFarms={setFarms}
              weatherData={weatherData}
            />
          )}

          {activeDashboardTab === 'journey' && (
            <FarmJourney
              farms={farms}
              selectedFarmIndex={selectedFarmIndex}
              setSelectedFarmIndex={setSelectedFarmIndex}
              getFarmDashboardData={getFarmDashboardData}
              completedTasks={completedTasks}
              weatherData={weatherData}
              language={language}
            />
            )}
          </ErrorBoundary>
        </main>
      </div>

      {showRescheduleModal && activeDialogTask && (
        <RescheduleTaskModal
          task={activeDialogTask}
          onClose={() => {
            setShowRescheduleModal(false);
            setActiveDialogTask(null);
          }}
          onSave={(taskId, newDate, newTime) => {
            setRescheduledTasks({
              ...rescheduledTasks,
              [taskId]: { date: newDate, time: newTime }
            });
            setShowRescheduleModal(false);
            setActiveDialogTask(null);
          }}
        />
      )}

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



      {/* Floating Quick Action menu FAB */}
      <QuickActionFAB 
        setActiveDashboardTab={setActiveDashboardTab}
        setVoiceAssistantOpen={setVoiceAssistantOpen}
      />

    </div>
  );
}
