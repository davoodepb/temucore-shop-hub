import React from 'react';
import { useSiteSettings } from '@/hooks/useSiteSettings';

export const SiteBackground: React.FC = () => {
  const { settings, loading } = useSiteSettings();
  const { background } = settings;

  if (loading || background.type === 'none' || !background.url) {
    return null;
  }

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      {background.type === 'image' && (
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ 
            backgroundImage: `url(${background.url})`,
            opacity: background.opacity 
          }}
        />
      )}
      
      {background.type === 'video' && (
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
          style={{ opacity: background.opacity }}
        >
          <source src={background.url} type="video/mp4" />
        </video>
      )}
      
      {/* Overlay to ensure readability */}
      <div 
        className="absolute inset-0 bg-background"
        style={{ opacity: 1 - background.opacity }}
      />
    </div>
  );
};
