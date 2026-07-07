import React from 'react';
import { Link } from 'react-router-dom';

const Navigation: React.FC = () => {
  return (
    <>
      {/* TopAppBar */}
      <header className="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-margin-mobile md:px-margin-desktop h-touch-target-min bg-surface shadow-sm">
        <div className="flex items-center gap-4">
          <span className="font-headline-md text-headline-md-mobile font-bold text-primary md:hidden">KisanMitra</span>
        </div>
        <div className="flex items-center gap-2">
          <button aria-label="notifications" className="w-touch-target-min h-touch-target-min flex items-center justify-center rounded-full text-on-surface-variant hover:bg-surface-container-high transition-all duration-200 active:scale-95">
            <span className="material-symbols-outlined" data-icon="notifications">notifications</span>
          </button>
          <button aria-label="help" className="w-touch-target-min h-touch-target-min flex items-center justify-center rounded-full text-on-surface-variant hover:bg-surface-container-high transition-all duration-200 active:scale-95">
            <span className="material-symbols-outlined" data-icon="help">help</span>
          </button>
          <div className="w-8 h-8 rounded-full bg-surface-variant overflow-hidden ml-2 flex items-center justify-center">
            <span className="material-symbols-outlined text-on-surface-variant" data-icon="person">person</span>
          </div>
        </div>
      </header>

      {/* SideNavBar (Desktop) */}
      <nav className="hidden md:flex flex-col h-full py-base w-64 fixed left-0 top-0 bg-surface-container-low shadow-md z-40 pt-[56px]">
        <div className="px-6 pb-6 pt-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary-container flex items-center justify-center">
              <span className="material-symbols-outlined text-on-primary-container" data-icon="agriculture" style={{fontVariationSettings: "'FILL' 1"}}>agriculture</span>
            </div>
            <div>
              <h1 className="font-headline-md text-headline-md text-primary">KisanMitra</h1>
              <p className="font-label-lg text-label-lg text-on-surface-variant">Empowering Farmers</p>
            </div>
          </div>
          <button className="mt-4 w-full h-[40px] rounded-lg border border-outline-variant text-primary font-button text-button flex items-center justify-center hover:bg-surface-container-highest transition-colors duration-200">
            Switch Farm
          </button>
        </div>
        <div className="flex-1 overflow-y-auto flex flex-col gap-1">
          <Link to="/" className="flex items-center gap-3 px-4 py-3 text-on-surface-variant mx-2 my-1 hover:bg-surface-container-highest rounded-lg transition-colors duration-200">
            <span className="material-symbols-outlined" data-icon="dashboard">dashboard</span>
            <span className="font-label-lg text-label-lg">Dashboard</span>
          </Link>
          <Link to="/" className="flex items-center gap-3 px-4 py-3 text-on-surface-variant mx-2 my-1 hover:bg-surface-container-highest rounded-lg transition-colors duration-200">
            <span className="material-symbols-outlined" data-icon="potted_plant">potted_plant</span>
            <span className="font-label-lg text-label-lg">Crops</span>
          </Link>
          <Link to="/" className="flex items-center gap-3 px-4 py-3 bg-primary-container text-on-primary-container rounded-lg mx-2 my-1 transition-colors duration-200">
            <span className="material-symbols-outlined" data-icon="healing" style={{fontVariationSettings: "'FILL' 1"}}>healing</span>
            <span className="font-label-lg text-label-lg">Disease Diagnosis</span>
          </Link>
        </div>
      </nav>

      {/* BottomNavBar (Mobile) */}
      <nav className="fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-gutter py-2 md:hidden bg-surface shadow-[0_-4px_12px_rgba(0,0,0,0.04)] rounded-t-xl">
        <Link to="/" className="flex flex-col items-center justify-center text-on-surface-variant px-4 py-2 hover:bg-surface-container-highest active:scale-90 transition-transform duration-150 rounded-lg">
          <span className="material-symbols-outlined mb-1" data-icon="home">home</span>
          <span className="font-label-lg text-[10px]">Home</span>
        </Link>
        <Link to="/" className="flex flex-col items-center justify-center bg-secondary-container text-on-secondary-container rounded-full px-5 py-1 active:scale-90 transition-transform duration-150">
          <span className="material-symbols-outlined mb-1" data-icon="medical_services" style={{fontVariationSettings: "'FILL' 1"}}>medical_services</span>
          <span className="font-label-lg text-[10px]">Diagnosis</span>
        </Link>
      </nav>
    </>
  );
};

export default Navigation;
