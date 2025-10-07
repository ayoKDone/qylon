// src/components/auth/SocialLogin.tsx
import { GoogleOAuthProvider } from '@react-oauth/google';
import { GoogleButton } from './GoogleButton';

export function SocialLogin() {
  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <div className="xui-d-grid xui-grid-col-2 xui-grid-gap-1">
        <GoogleButton />

        <button
          type="button"
          className="py-2.5 flex items-center justify-center gap-2 border rounded-md"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="25"
            height="25"
            viewBox="0 0 48 48"
          >
            <path fill="#ff5722" d="M6 6H22V22H6z"></path>
            <path fill="#4caf50" d="M26 6H42V22H26z"></path>
            <path fill="#ffc107" d="M26 26H42V42H26z"></path>
            <path fill="#03a9f4" d="M6 26H22V42H6z"></path>
          </svg>
          <span className="xui-font-sz-[14px]">Log in with Microsoft</span>
        </button>
      </div>
    </GoogleOAuthProvider>
  );
}
