import { Vec2 } from "game-engine-core/math/index.ts";
import {
  BodyComponent,
  BoxCollider,
  ConstraintsComponent,
  RopeConstraint,
  TransformComponent,
} from "game-engine-core/motion/index.ts";
import { game } from "../game.ts";
import { GraphicsComponent } from "lib/engine/graphics/index.ts";
import { SDL } from "SDL_ts";

function createRope(args: {
  position: Vec2;
  segments: number;
  length: number;
}) {
  const segmentDistance = args.length / args.segments - 1;

  return game
    .createEntity("rope")
    .addComponent(
      "transform",
      new TransformComponent({ position: args.position }),
    )
    .addComponent("body", new BodyComponent({ static: true }))
    .set({
      // disperse segments at most args.length from end to end
      segments: Array.from(
        { length: args.segments - 1 },
        (_, i) =>
          game.createEntity(`rope-segment-${i}`)
            .addComponent(
              "body",
              new BodyComponent({
                friction: new Vec2(0.9, 0.9),
                collider: new BoxCollider({ width: 4, height: 4 }),
              }),
            )
            .addComponent(
              "transform",
              new TransformComponent({
                position: args.position
                  .clone()
                  .add(new Vec2(0, (i + 1) * segmentDistance)),
              }),
            )
            .addComponent(
              "graphics",
              new GraphicsComponent({
                width: 4,
                height: 4,
                draw: (renderer, ctx) => {
                  // draw circle
                  SDL.SetRenderDrawColor(renderer, 255, 255, 255, 255);
                },
              }),
            ),
      ),
    })
    .self((rope) =>
      rope
        .addComponent(
          new ConstraintsComponent([
            new RopeConstraint([rope, ...rope.segments], segmentDistance),
          ]),
        )
        .onAdd((scene) => {
          for (const segment of rope.segments) {
            scene.addEntity(segment);
          }
        })
        .onDestroy(() => {
          for (const segment of rope.segments) {
            segment.destroy();
          }
        })
        .onPreFixedUpdate(({ dt }) => {
          // const mouse = love.mouse.getPosition();

          // rope.transform.position = new Vec2(mouse[0], mouse[1])
          // rope.segments[4].transform.position = new Vec2(mouse[0], mouse[1])
        })
        .onDraw(() => {
          // love.graphics.setColor(0, 1, 0);
          // love.graphics.circle("fill", args.position.x, args.position.y, 5);
          // love.graphics.setColor(1, 1, 1);
          // love.graphics.line(
          //   args.position.x,
          //   args.position.y,
          //   rope.segments[0].transform.position.x,
          //   rope.segments[0].transform.position.y,
          // );
          // for (let i = 0; i < rope.segments.length; i++) {
          //   const p1 = rope.segments[i];
          //   const p2 = rope.segments[i + 1];

          //   if (!!p1) {
          //     love.graphics.setColor(1, 0, 0);
          //     love.graphics.circle(
          //       "fill",
          //       p1.transform.position.x,
          //       p1.transform.position.y,
          //       5,
          //     );
          //   }
          //   love.graphics.setColor(1, 1, 1);

          //   if (!!p2) {
          //     love.graphics.line(
          //       p1.transform.position.x,
          //       p1.transform.position.y,
          //       p2.transform.position.x,
          //       p2.transform.position.y,
          //     );

          //     if (i === args.segments - 2) {
          //       love.graphics.setColor(1, 0, 0);
          //       love.graphics.circle(
          //         "fill",
          //         p2.transform.position.x,
          //         p2.transform.position.y,
          //         5,
          //       );
          //     }
          //     love.graphics.setColor(1, 1, 1);
          //   }
          // }
        })
    );
}

game.registerScene("rope", (scene) =>
  scene.onStart(() => {
    scene.addEntity(
      createRope({ position: new Vec2(400, 100), segments: 25, length: 100 }),
    );

    scene.addEntity(
      game
        .createEntity("mouse")
        .set({
          transform: new TransformComponent({ position: new Vec2(0, 0) }),
          body: new BodyComponent({
            static: true,
            collider: new BoxCollider({ width: 100, height: 25 }),
          }),
        })
        .self((m) =>
          m
            .onFixedUpdate((ev) => {
              // const mouse = love.mouse.getPosition();
              // m.transform.position = new Vec2(mouse[0], mouse[1]);
            })
            .onDraw(() => {
              // love.graphics.setColor(1, 1, 1);
              // love.graphics.rectangle(
              //   "fill",
              //   m.transform.position.x,
              //   m.transform.position.y,
              //   100,
              //   25,
              // );
            })
        ),
    );
  }));
