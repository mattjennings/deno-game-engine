import { game } from "../game.ts";
import { GraphicsComponent } from "lib/engine/graphics/graphics.ts";
import { TransformComponent } from "game-engine-core/motion/transform.ts";
import { SDL } from "SDL_ts";

game.registerScene("main", (scene) => {
  scene.onStart(() => {
    scene.addEntity(
      game.createEntity("test")
        .addComponent(
          "transform",
          new TransformComponent({ position: { x: 100, y: 0 } }),
        )
        .addComponent(
          "graphics",
          new GraphicsComponent({
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
        )
        .self((entity) =>
          entity.onFixedUpdate(() => {
            entity.transform.position.x += 4;
          })
        ),
    );
  });

  return scene;
});
