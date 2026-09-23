import {
  Canvas,
  useFrame,
  useThree,
} from "@react-three/fiber";
import { Line } from "@react-three/drei";
import * as THREE from "three";
import type { ReplayTelemetryPoint, ReplayDataset } from "../../api/replay";

interface AircraftSceneProps {
  telemetry: ReplayTelemetryPoint[];
  currentTelemetry: ReplayTelemetryPoint;
  events: ReplayDataset["events"];
}

interface AircraftModelProps {
  position: [number, number, number];
  pitch: number;
  roll: number;
}

function AircraftModel({
  position,
  pitch,
  roll,
}: AircraftModelProps) {
  const pitchRadians = THREE.MathUtils.degToRad(pitch);
  const rollRadians = THREE.MathUtils.degToRad(roll);

  return (
    <group
      position={position}
      rotation={[
        pitchRadians,
        0,
        rollRadians,
      ]}
    >
      {/* Fuselage */}
      <mesh>
        <boxGeometry args={[0.7, 0.35, 3]} />
        <meshStandardMaterial
          color="#d8d8d8"
          metalness={0.35}
          roughness={0.45}
        />
      </mesh>

      {/* Nose */}
      <mesh position={[0, 0, -1.8]}>
        <coneGeometry args={[0.35, 0.9, 16]} />
        <meshStandardMaterial
          color="#e10600"
          metalness={0.25}
          roughness={0.5}
        />
      </mesh>

      {/* Main wings */}
      <mesh>
        <boxGeometry args={[4, 0.12, 0.8]} />
        <meshStandardMaterial
          color="#d8d8d8"
          metalness={0.35}
          roughness={0.45}
        />
      </mesh>

      {/* Tail wing */}
      <mesh position={[0, 0, 1.15]}>
        <boxGeometry args={[1.6, 0.1, 0.45]} />
        <meshStandardMaterial
          color="#d8d8d8"
          metalness={0.35}
          roughness={0.45}
        />
      </mesh>

      {/* Vertical stabilizer */}
      <mesh position={[0, 0.45, 1.1]}>
        <boxGeometry args={[0.12, 0.9, 0.45]} />
        <meshStandardMaterial
          color="#d8d8d8"
          metalness={0.35}
          roughness={0.45}
        />
      </mesh>
    </group>
  );
}

function normalizeAltitude(
  altitude: number,
): number {
  return Math.max(
    0,
    Math.min(8, altitude / 1200),
  );
}

function getPathX(
  timestamp: number,
  duration: number,
): number {
  if (duration <= 0) {
    return 0;
  }

  return (
    (timestamp / duration) * 20 - 10
  );
}

function getTelemetryAtTime(
  telemetry: ReplayTelemetryPoint[],
  timestamp: number,
): ReplayTelemetryPoint | null {
  if (telemetry.length === 0) {
    return null;
  }

  return telemetry.reduce(
    (closest, point) => {
      const closestDistance = Math.abs(
        closest.timestamp_sec - timestamp,
      );

      const pointDistance = Math.abs(
        point.timestamp_sec - timestamp,
      );

      return pointDistance < closestDistance
        ? point
        : closest;
    },
    telemetry[0],
  );
}

function FollowCamera({
  position,
}: {
  position: [number, number, number];
}) {
  const { camera } = useThree();

  useFrame(() => {
    const targetPosition = new THREE.Vector3(
      position[0],
      position[1] + 2,
      position[2] + 6,
    );

    camera.position.lerp(
      targetPosition,
      0.05,
    );

    camera.lookAt(
      position[0],
      position[1],
      position[2],
    );
  });

  return null;
}

export default function AircraftScene({
  telemetry,
  currentTelemetry,
  events
}: AircraftSceneProps) {
  const lastTelemetry =
    telemetry[telemetry.length - 1];

  const duration =
    lastTelemetry.timestamp_sec;

  const flightPath = telemetry.map(
    (point) => [
      getPathX(
        point.timestamp_sec,
        duration,
      ),
      normalizeAltitude(
        point.altitude_ft,
      ),
      0,
    ] as [number, number, number],
  );

  const aircraftPosition: [
    number,
    number,
    number,
  ] = [
    getPathX(
      currentTelemetry.timestamp_sec,
      duration,
    ),
    normalizeAltitude(
      currentTelemetry.altitude_ft,
    ),
    0,
  ];

  return (
    <div
      style={{
        width: "100%",
        height: "420px",
        borderRadius: "12px",
        overflow: "hidden",
      }}
    >
      <Canvas
        camera={{
          position: [6, 4, 8],
          fov: 45,
        }}
      >

        <color attach="background" args={["#080b10"]} />

        <fog
          attach="fog"
          args={["#080b10", 12, 35]}
        />

        <ambientLight intensity={1.5} />

        <directionalLight
          position={[5, 8, 5]}
          intensity={2}
        />

        <FollowCamera
            position={aircraftPosition}
        />

        <gridHelper
          args={[40, 40]}
          position={[0, -0.01, 0]}
        />

        <mesh
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, -0.03, 0]}
        >
          <planeGeometry args={[60, 60]} />
          <meshStandardMaterial color="#080808" />
        </mesh>

        {/* Complete flight path */}
        <Line
          points={flightPath}
          lineWidth={2}
        />

        {events.map((event, index) => {
          const eventTelemetry = getTelemetryAtTime(
            telemetry,
            event.timestamp_sec,
          );

          const eventPosition: [
            number,
            number,
            number,
          ] = [
            getPathX(
              event.timestamp_sec,
              duration,
            ),
            normalizeAltitude(
              eventTelemetry?.altitude_ft ?? 0,
            ) + 0.4,
            0,
          ];

        const isActive =
            Math.abs(
            currentTelemetry.timestamp_sec -
                event.timestamp_sec,
            ) < 2;

        return (
            <mesh
            key={`${event.timestamp_sec}-${event.label}-${index}`}
            position={eventPosition}
            scale={isActive ? 1.8 : 1}
            >
            <sphereGeometry args={[0.15, 16, 16]} />
            <meshStandardMaterial
                color={isActive ? "#ff0000" : "#e10600"}
                emissive="#e10600"
                emissiveIntensity={
                isActive ? 1.5 : 0.5
                }
            />
            </mesh>
        );
        })}

        {/* Current aircraft */}
        <AircraftModel
          position={aircraftPosition}
          pitch={currentTelemetry.pitch_deg}
          roll={currentTelemetry.roll_deg}
        />
      </Canvas>
    </div>
  );
}