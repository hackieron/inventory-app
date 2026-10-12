import { Redirect, Stack } from 'expo-router';
import { useEffect, useState } from 'react';

import { getToken } from '@/utils/auth';

export default function AuthLayout() {
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    async function checkAuth() {
      try {
        const token = await getToken();

        setAuthenticated(!!token);
      } finally {
        setLoading(false);
      }
    }

    checkAuth();
  }, []);

  if (loading) {
    return null;
  }

  if (authenticated) {
    return <Redirect href="/app/tabs/home" />;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}