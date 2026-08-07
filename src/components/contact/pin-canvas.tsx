import { SceneCanvas } from "@/lib/three/SceneCanvas";
import { ContactPinScene } from "./pin-scene";

/** Default export required for `React.lazy()`. Entire Three.js dependency graph lives behind this dynamic import. */
export default function ContactPinCanvas() {
  return (
    <SceneCanvas camera={{ position: [0, 0.35, 3.3], fov: 32 }} frameloop="demand">
      <ContactPinScene />
    </SceneCanvas>
  );
}
