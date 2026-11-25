import { useDocumentMeta } from "@/i18n";
import Game from "@/pages/game";
import MainMenu from "@/pages/main-menu";
import MultiplayerGame from "@/pages/multiplayer-game";
import MultiplayerLobby from "@/pages/multiplayer-lobby";
import Settings from "@/pages/settings";
import React from "react";
import { BrowserRouter, HashRouter, Navigate, Route, Routes } from "react-router-dom";

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

  const isOffline = import.meta.env.VITE_OFFLINE_MODE === "true";
  const Router = isOffline ? HashRouter : BrowserRouter;

  return (
    <Router>
      <div className="relative w-full h-dvh overflow-hidden">
        <div className="room-pattern" aria-hidden />
        <div className="relative z-10 w-full h-full">
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
    </Router>
  );
};

export default App;
