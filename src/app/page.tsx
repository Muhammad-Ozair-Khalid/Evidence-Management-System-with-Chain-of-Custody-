import { LandingPage } from "@/components/marketing/landing-page";
import { AuthSessionProvider } from "@/components/providers/session-provider";

export default function HomePage() {
  return (
    <AuthSessionProvider>
      <LandingPage />
    </AuthSessionProvider>
  );
}
