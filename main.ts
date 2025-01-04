import { SDL } from "SDL_ts";
import { engine } from "./engine.ts";
import { SDL_FUNCTIONS } from "./sdlConfig.ts";
import { getRenderer, getWindow } from "./window.ts";

SDL.Init(SDL.InitFlags.VIDEO, { functions: SDL_FUNCTIONS });
let done = false;

async function main() {
  engine.start({ scene: "main" });
  
  const event = new SDL.Event();
  
  while (!done) {
    const renderer = getRenderer();

    while (SDL.PollEvent(event) != 0) {      
      if (event.type === SDL.EventType.QUIT) {        
        done = true;
      } else if (event.type === SDL.EventType.WINDOWEVENT) {
        if (event.window.event === SDL.WindowEventID.SHOWN) {
          // console.info(`Window ${event.window.windowID} shown.`);
        } else if (event.window.event === SDL.WindowEventID.EXPOSED) {
          // console.info(`Window ${event.window.windowID} exposed.`);
          // engine.draw(renderer);
        } else if (event.window.event === SDL.WindowEventID.MINIMIZED) {
          // console.info(`Window ${event.window.windowID} minimized.`);
        } else if (event.window.event === SDL.WindowEventID.RESTORED) {
          // console.info(`Window ${event.window.windowID} restored.`);
        } else if (event.window.event === SDL.WindowEventID.RESIZED) {
          // console.info(
          //   `Window ${event.window.windowID} resized: ${event.window.data1} ${event.window.data2}`,
          // );
          // engine.draw(renderer);
        } else {
          // console.info("Unknown Window event: ", event.window.event);
        }
      } else if (event.type === SDL.EventType.KEYDOWN) {
        // console.info(
        //   `KeyDown: ${event.key.keysym.scancode} "${
        //     SDL.GetScancodeName(
        //       event.key.keysym.scancode,
        //     )
        //   }"`,
        // );
      } else if (event.type === SDL.EventType.KEYUP) {
        // console.info(
        //   `KeyUp: ${event.key.keysym.scancode} "${
        //     SDL.GetScancodeName(
        //       event.key.keysym.scancode,
        //     )
        //   }"`,
        // );
      } else if (event.type === SDL.EventType.MOUSEMOTION) {
        // console.info(
        //   `MouseMotion: (${event.mousemotion.x}, ${event.mousemotion.y})`,
        // );
      } else if (event.type === SDL.EventType.MOUSEBUTTONDOWN) {
        // console.info(
        //   `MouseButtonDown: ${event.mousebutton.button} (${event.mousebutton.x}, ${event.mousebutton.y})`,
        // );
      } else if (event.type === SDL.EventType.MOUSEBUTTONUP) {
        // console.info(
        //   `MouseButtonUp: ${event.mousebutton.button} (${event.mousebutton.x}, ${event.mousebutton.y})`,
        // );
      } else if (event.type === SDL.EventType.MOUSEWHEEL) {
        // console.info(
        //   `MouseWheel: ${event.mousewheel.direction} (${event.mousebutton.x}, ${event.mousebutton.y})`,
        // );
      }
    }

    const currentTime = SDL.GetTicks64();

    engine.update(Number(currentTime));  
    
    SDL.SetRenderDrawColor(renderer, 0, 0, 0, 255);
    SDL.RenderClear(renderer);

    engine.draw(renderer);
    
    // because renderer uses vsync, this will block until the next frame
    // effectively our main update loop is synced to our screen hz
    // (engine will handle fixed update loop)
    SDL.RenderPresent(renderer);
    SDL.RenderFlush(renderer);

    // allow the js microtask queue to be processed
    await Promise.resolve()
  }

  SDL.DestroyWindow(getWindow());
  SDL.Quit();

  return 0;
}

try {
  main().then((code) => Deno.exit(code));
} catch (e) {
  console.error(e);
  Deno.exit(1);
}

addEventListener('hmr', () => {
  // engine.start({ scene: "main" });
})