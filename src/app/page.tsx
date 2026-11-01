import { CampusExperience } from "@/components/campus/CampusExperience";

export default function HomePage() {
  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Sokin va shaffof Glassmorphism ambient mesh yorug'lik nurlari */}
      <div className="ambient-glow-mesh" aria-hidden="true">
        <div className="ambient-blob-1" />
        <div className="ambient-blob-2" />
        <div className="ambient-blob-3" />
      </div>

      {/* Haqiqiy O'quv Platformasi Interfeyasi */}
      <CampusExperience />
    </div>
  );
}
