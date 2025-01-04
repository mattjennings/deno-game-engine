import { SDL } from "SDL_ts";

import {
  TransformComponent,
  VerletSystem,
} from "lib/core/features/motion/index.ts";
import { Engine } from "./lib/core/engine.ts";
import {
  GraphicsComponent,
  GraphicsSystem,
} from "./lib/sdl/graphics/graphics.ts";

export const engine = new Engine<string>({
  systems: [
    new VerletSystem(),
    new GraphicsSystem(),
  ],
});

engine.registerScene("main", (scene) => {
  scene.onStart(() => {
    scene.addEntity(
      engine.createEntity("test")
        .set({
          transform: new TransformComponent({ position: { x: 100, y: 0 } }),
          graphics: new GraphicsComponent({
            width: 100,
            height: 100,
            draw: (renderer) => {
              // draw rectangle
              SDL.SetRenderDrawColor(renderer, 255, 255, 0, 255);
              SDL.RenderFillRect(
                renderer,
                new SDL.Rect({
                  x: 0,
                  y: 0,
                  w: 100,
                  h: 100,
                }),
              );
            },
          }),
        })
        .self((entity) =>
          entity.onFixedUpdate(() => {       
            entity.transform.position.x += 4;
          })
        ),
    );
  });

  return scene;
});
