import {
  GoogleOAuthProvider,
  TokenResponse,
  useGoogleLogin,
} from '@react-oauth/google';
import React, { useState } from 'react';

// Define the required scope for managing the user's calendar
const CALENDAR_SCOPE: string = 'https://www.googleapis.com/auth/calendar';

// --- Component Props ---

interface GoogleCalendarConnectProps {
  /** Your Google Cloud Project OAuth Client ID. */
  clientId: string;
  /** Callback function called upon successful connection, receives the access token. */
  onConnectSuccess: (accessToken: string) => void;
  /** Callback function called upon connection failure, receives the error object. */
  onConnectFailure: (error: unknown) => void;
}

// --- 1. Inner Component (Uses the Hook) ---
// This component MUST be a child of GoogleOAuthProvider.

type ConnectButtonLogicProps = Omit<GoogleCalendarConnectProps, 'clientId'>;

const ConnectButtonLogic: React.FC<ConnectButtonLogicProps> = ({
  onConnectSuccess,
  onConnectFailure,
}) => {
  const [isConnected, setIsConnected] = useState<boolean>(false);

  // Success handler receives the TokenResponse object
  const handleLoginSuccess = (
    tokenResponse: Omit<
      TokenResponse,
      'error' | 'error_description' | 'error_uri'
    >
  ) => {
    const accessToken = tokenResponse.access_token;
    console.log('Login Success! Access Token obtained.');

    setIsConnected(true);
    onConnectSuccess(accessToken); // Pass the token up to the parent
  };

  // Failure handler receives a generic 'any' error object
  const handleLoginFailure = (error: unknown) => {
    console.error('Login Failed:', error);
    onConnectFailure(error);
  };

  // The useGoogleLogin hook initiates the OAuth flow and MUST be here.
  const login = useGoogleLogin({
    onSuccess: handleLoginSuccess,
    onError: handleLoginFailure,
    scope: CALENDAR_SCOPE,
  });

  if (isConnected) {
    return (
      <div
        style={{
          padding: '10px',
          border: '1px solid #4CAF50',
          backgroundColor: '#E8F5E9',
          borderRadius: '4px',
        }}
      >
        <p style={{ margin: '0', color: '#1B5E20', fontWeight: 'bold' }}>
          ✅ Google Calendar Connected!
        </p>
      </div>
    );
  }

  return (
    <button
      onClick={() => login()}
      style={{
        backgroundColor: '#4285F4',
        color: 'white',
        border: 'none',
        padding: '10px 15px',
        borderRadius: '5px',
        cursor: 'pointer',
        fontWeight: 'bold',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
      }}
    >
      <img
        src="https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg"
        alt="Google Logo"
        style={{ width: '18px', height: '18px' }}
      />
      Connect Your Google Calendar
    </button>
  );
};

// --- 2. Outer Component (The Exported Wrapper) ---
// This component manages the Provider and renders the inner component.

/**
 * The single exported component that handles the entire Google OAuth flow.
 * It is internally structured with a Provider and its consumer to satisfy the context requirements.
 */
export const GoogleCalendarConnect: React.FC<GoogleCalendarConnectProps> = ({
  clientId,
  onConnectSuccess,
  onConnectFailure,
}) => {
  return (
    // The Provider must wrap the component that uses the hook.
    <GoogleOAuthProvider clientId={clientId}>
      <ConnectButtonLogic
        onConnectSuccess={onConnectSuccess}
        onConnectFailure={onConnectFailure}
      />
    </GoogleOAuthProvider>
  );
};
