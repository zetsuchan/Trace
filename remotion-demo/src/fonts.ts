import { loadFont as loadSpaceGrotesk } from "@remotion/google-fonts/SpaceGrotesk";
import { loadFont as loadInter } from "@remotion/google-fonts/Inter";

const { fontFamily: spaceGrotesk } = loadSpaceGrotesk("normal", {
  weights: ["300", "400", "500", "600", "700"],
  subsets: ["latin"],
});

const { fontFamily: inter } = loadInter("normal", {
  weights: ["300", "400", "500", "600", "700"],
  subsets: ["latin"],
});

export { spaceGrotesk, inter };
