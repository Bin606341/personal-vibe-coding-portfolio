# 3D Basketball Dunk Gameplay Architecture

## Class Diagram

```text
DunkInputMapper
  - pressedCodes: Set<DunkKeyCode>
  - directionStack: DunkDirectionKey[]
  + handleKeyDown(event): DunkIntent | null
  + handleKeyUp(event): void
  + snapshot(): DunkInputSnapshot

DunkSpatialContext
  - config: DunkSpatialConfig
  + evaluate(sample): DunkSpatialDecision

DunkStateMachine
  - state: DunkState
  - intent: DunkIntent | null
  - actionConfig: DunkActionConfig | null
  + request(intent): boolean
  + update(deltaMs): void
  + snapshot(): DunkStateSnapshot

CustomTargetMatcher
  - phases: MotionWarpPhase[]
  + sample(elapsedMs): MotionWarpSample

DunkCombatResolver
  + resolve({ defenderIntersects, defenderBlockPower, action }): DunkResult

BabylonDunkSystem
  - inputMapper: DunkInputMapper
  - stateMachine: DunkStateMachine
  - spatialContext: DunkSpatialContext
  - matcher: CustomTargetMatcher | null
  + handleKeyDown(event): void
  + handleKeyUp(event): void
  + tryStartDunk(intent): boolean
  + update(frame): BabylonDunkFrameResult
```

## State Flow

```text
Locomotion
  - Accepts movement, sprint, shooting, and dunk requests.
  - Shift + D generates a DunkIntent.
  - Shift + D without a direction defaults to ArrowUp / SafeTwoHand.

Gather
  - Locks keyboard locomotion.
  - CustomTargetMatcher moves the root from current position to takeoff point.

Airborne
  - Keeps input locked.
  - Ball attachment binds the ball to the preferred hand.
  - CustomTargetMatcher moves the root from takeoff point to rim hang target.

Impact
  - Resolves the dunk.
  - Babylon runtime can use BoneIKController to pull the hand toward rimTarget.
  - DunkCombatResolver returns Success or Blocked.

Recovery
  - Restores control and returns to Locomotion.
```

## Combo Mapping

```ts
export const directionToDunkAction = {
  ArrowUp: DunkActionType.SafeTwoHand,
  ArrowRight: DunkActionType.RightHandPower,
  ArrowLeft: DunkActionType.LeftHandPower,
  ArrowDown: DunkActionType.ReverseFlashy,
} satisfies Record<DunkDirectionKey, DunkActionType>;
```

Input behavior:

- `D` alone keeps the original charged shot.
- `Shift + D` attempts a dunk.
- `Shift + D + ArrowUp` maps to safe two-hand dunk.
- `Shift + D + ArrowRight` maps to right-hand power dunk.
- `Shift + D + ArrowLeft` maps to left-hand power dunk.
- `Shift + D + ArrowDown` maps to reverse flashy dunk.
- `Space` is not a dunk action key.

## Babylon Runtime Notes

`src/gameplay/dunk/babylonDunkSystem.ts` contains the Babylon-ready runtime layer:

- `AnimationGroup.setWeightForAllAnimatables()` for animation blending.
- `Scalar.Lerp` for root target matching.
- `ballMesh.attachToBone(handBone, characterMesh)` for ball attachment.
- `BoneIKController` for hand-to-rim correction.

The current homepage still renders with Three.js, but it consumes the same gameplay core and now uses Shift+D for dunk attempts.
