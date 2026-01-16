import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Json } from '@/integrations/supabase/types';

export interface BackgroundSettings {
  type: 'none' | 'image' | 'video';
  url: string;
  opacity: number;
}

export interface SiteSettings {
  background: BackgroundSettings;
}

const defaultSettings: SiteSettings = {
  background: {
    type: 'none',
    url: '',
    opacity: 0.3
  }
};

export function useSiteSettings() {
  const [settings, setSettings] = useState<SiteSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('setting_key, setting_value')
        .in('setting_key', ['background']);

      if (error) throw error;

      const newSettings = { ...defaultSettings };
      
      data?.forEach((row) => {
        if (row.setting_key === 'background' && row.setting_value) {
          const value = row.setting_value as unknown as BackgroundSettings;
          if (value.type && value.url !== undefined && value.opacity !== undefined) {
            newSettings.background = value;
          }
        }
      });

      setSettings(newSettings);
    } catch (error) {
      console.error('Error fetching site settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateBackground = async (background: BackgroundSettings) => {
    try {
      // First check if the setting exists
      const { data: existing } = await supabase
        .from('site_settings')
        .select('id')
        .eq('setting_key', 'background')
        .single();

      let error;
      
      if (existing) {
        // Update existing
        const result = await supabase
          .from('site_settings')
          .update({ setting_value: background as unknown as Json })
          .eq('setting_key', 'background');
        error = result.error;
      } else {
        // Insert new
        const result = await supabase
          .from('site_settings')
          .insert({ 
            setting_key: 'background', 
            setting_value: background as unknown as Json 
          });
        error = result.error;
      }

      if (error) throw error;

      setSettings(prev => ({ ...prev, background }));
      return { success: true };
    } catch (error) {
      console.error('Error updating background:', error);
      return { success: false, error };
    }
  };

  return {
    settings,
    loading,
    updateBackground,
    refetch: fetchSettings
  };
}
