import React from 'react';

const PhotoGuidelines: React.FC = () => {
  return (
    <div className="lg:col-span-1">
      <h3 className="font-headline-md text-headline-md-mobile text-on-surface mb-4">Photo Guidelines</h3>
      <div className="bg-surface rounded-xl p-5 shadow-sm border border-outline-variant/50">
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3 text-primary-container">
            <span className="material-symbols-outlined" data-icon="check_circle" style={{fontVariationSettings: "'FILL' 1"}}>check_circle</span>
            <span className="font-label-lg text-label-lg">Good Example</span>
          </div>
          <div className="rounded-lg overflow-hidden h-32 relative bg-surface-variant">
            <div className="bg-cover bg-center w-full h-full" style={{backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuAa8qpVoLKxDezGPLjFG2CInEHWGSwH83aDHFMqODBMJ70qM_i7JObHkKi-Z2NevyM5m8e4isobHiP1dYSvYnCDPEzu72xMuBZtLPYglcMwDziXcMBpqmnAn6YOTODwon5o-9mzPpyqMr1PdY6cBVO5ov5Yax4gOetalirYR1mLIdBcPtnby3CVyBeJ8mFQtvXN14_FZCB1dBCYBXZYWKg34PlLh0ozh7ytHbMNvIxIU0jUZ6PBD8pFfyplD6fna04l7AsOra8fxgZm')"}}></div>
          </div>
          <p className="text-sm text-on-surface-variant mt-2 font-body-md">Clear focus, good lighting, single leaf.</p>
        </div>
        <div className="w-full h-[1px] bg-outline-variant/30 mb-6"></div>
        <div>
          <div className="flex items-center gap-2 mb-3 text-error">
            <span className="material-symbols-outlined" data-icon="cancel" style={{fontVariationSettings: "'FILL' 1"}}>cancel</span>
            <span className="font-label-lg text-label-lg">Bad Example</span>
          </div>
          <div className="rounded-lg overflow-hidden h-32 relative bg-surface-variant">
            <div className="bg-cover bg-center w-full h-full" style={{backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuD79gkCmS0OEvhxKaRmW8bS0dxYvetU-T271GjF9qkrSI3iOs5lT-lD_3cYjl7D3E2yX5GNdkZJvFwBGH3nWLNqIA2nRUZ0YFp0jyEK1cenOF88eFKDSbfufZPQYBoqB7fcRebam_OQjaJ_lYmjf2WAcvKUYsa2VJ59PgLYiHW3BuFrLnIQNqDPnTTtuXSQYQVJwEBluAeLVRtYPARiRwAmAlLSmCtEj9Ez--bNoPSYbXb_Z49X5cFw8sUgo5_JvDAOG7k4NOpco80n')"}}></div>
          </div>
          <p className="text-sm text-on-surface-variant mt-2 font-body-md">Blurry, too far away, poor lighting.</p>
        </div>
      </div>
    </div>
  );
};

export default PhotoGuidelines;
