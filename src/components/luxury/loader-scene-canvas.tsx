import { SceneCanvas } from "@/lib/three/SceneCanvas";
import { LoaderScene, type LoaderSceneProps } from "./loader-scene";

/** Default export required for `React.lazy()`. */
export default function LoaderSceneCanvas(props: LoaderSceneProps) {
  return (
    <SceneCanvas camera={{ position: [0, 1.3, 3.4], fov: 38 }} frameloop="demand">
      <LoaderScene {...props} />
    </SceneCanvas>
  );
}
