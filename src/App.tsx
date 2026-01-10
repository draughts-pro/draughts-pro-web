import RippleGrid from "@/components/RippleGrid";
import { useDocumentMeta } from "@/i18n";
import Game from "@/pages/game";
import MainMenu from "@/pages/main-menu";
import MultiplayerGame from "@/pages/multiplayer-game";
import MultiplayerLobby from "@/pages/multiplayer-lobby";
import Settings from "@/pages/settings";
import React from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

export const AppRoute = {
  mainMenu: "/",
  settings: "/settings",
  game: "/game",
  multiplayerLobby: "/multiplayer",
  multiplayerGame: "/multiplayer-game/:roomId",
  joinRoom: "/join/:roomId",
};

const App: React.FC = () => {
  useDocumentMeta();

  return (
    <BrowserRouter>
      <div className="relative w-screen h-screen">
        <div className="absolute inset-0 w-full h-full z-0">
          <RippleGrid
            enableRainbow={false}
            gridColor="#804040"
            rippleIntensity={0.05}
            gridSize={10}
            gridThickness={15}
            fadeDistance={1.5}
            vignetteStrength={2}
            glowIntensity={0.1}
            opacity={1}
            gridRotation={0}
          />
        </div>
        <div className="relative z-10 w-full h-full font-display text-text-light">
          <Routes>
            <Route path={AppRoute.mainMenu} element={<MainMenu />} />
            <Route path={AppRoute.settings} element={<Settings />} />
            <Route path={AppRoute.game} element={<Game />} />
            <Route path={AppRoute.multiplayerLobby} element={<MultiplayerLobby />} />
            <Route path={AppRoute.joinRoom} element={<MultiplayerLobby />} />
            <Route path={AppRoute.multiplayerGame} element={<MultiplayerGame />} />
            <Route
              path="*"
              element={<Navigate to={AppRoute.mainMenu} replace />}
            />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
};

export default App;
