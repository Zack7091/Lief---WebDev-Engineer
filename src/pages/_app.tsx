// src/pages/_app.tsx
import type { AppProps } from "next/app";
import { UserProvider } from "@auth0/nextjs-auth0/client";
import "antd/dist/reset.css"; // Ant Design styles (if you're using Ant Design)
import "../styles/globals.css"; // Your global styles

export default function App({ Component, pageProps }: AppProps) {
  return (
    <UserProvider>
      <Component {...pageProps} />
    </UserProvider>
  );
}
