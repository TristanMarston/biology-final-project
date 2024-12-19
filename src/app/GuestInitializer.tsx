'use client';

import { useEffect } from 'react';
import { createGuestProfile } from '../utils/indexedDB';

export default function GuestInitializer() {
  useEffect(() => {
    const initializeGuestProfile = async () => {
      const profile = await createGuestProfile();
      console.log('Guest profile initialized:', profile);
    };

    initializeGuestProfile();
  }, []);

  return null;
}