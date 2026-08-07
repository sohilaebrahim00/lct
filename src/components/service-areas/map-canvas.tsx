import { useEffect } from "react";
import { useThree } from "@react-three/fiber";
import { SceneCanvas } from "@/lib/three/SceneCanvas";
import { ServiceAreasMapScene, type ServiceAreasMapSceneProps } from "./map-scene";

function AimCamera() {
  const { camera } = useThree();
  useEffect(() => {
    camera.lookAt(0, 0, 0);
  }, [camera]);
  return null;
}

/** Default export required for `React.lazy()`. */
export default function ServiceAreasMapCanvas(props: ServiceAreasMapSceneProps) {
  return (
    <SceneCanvas camera={{ position: [0, 1.9, 2.6], fov: 42 }} frameloop="demand">
      <AimCamera />
      <ServiceAreasMapScene {...props} />
    </SceneCanvas>
  );
}
