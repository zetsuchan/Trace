import { PatientProfileForm } from "@/components/patient-profile-form";

export default function OnboardingPage() {
  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center gap-8">
      <header className="text-center">
        <h1 className="text-2xl font-semibold tracking-tight">
          Welcome to TRACE
        </h1>
        <p className="mt-3 max-w-md text-text-secondary">
          Tell us about your sickle cell profile so TRACE can reason about your
          unique patterns.
        </p>
      </header>

      <PatientProfileForm />
    </div>
  );
}
