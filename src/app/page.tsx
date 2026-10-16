import { MatrixStreamCanvas } from "@/components/anime/MatrixStreamCanvas";
import { LandingExperience } from "@/components/anime/LandingExperience";

export default function HomePage() {
  return (
    <div className="relative min-h-screen">
      <MatrixStreamCanvas />
      <LandingExperience />
    </div>
  );
}
