import { Pointer, SDL } from "SDL_ts";

import { Engine } from "game-engine-core/engine.ts";
import {
CollisionSystem,
  ConstraintSystem,
  VerletSystem
} from "game-engine-core/motion/index.ts";
import {
  GraphicsSystem
} from "./lib/engine/graphics/graphics.ts";
import { Vec2 } from "game-engine-core/math/vec2.ts";

export const game = new Engine<string, Pointer<SDL.Renderer>>({
  systems: [
    new VerletSystem(),
    new CollisionSystem(),
    new ConstraintSystem(),
    new GraphicsSystem(),
  ],
});

