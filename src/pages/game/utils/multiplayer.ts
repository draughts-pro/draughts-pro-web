import type { variants } from '@/pages/settings/utils/variants';
import { io, Socket } from 'socket.io-client';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';

export type PieceColor = 'dark' | 'light';
export type GameVariant = keyof typeof variants;
export type GameStatus = 'waiting' | 'playing' | 'finished';

export interface Position {
  row: number;
  col: number;
}

export interface Piece {
  color: PieceColor;
  isKing: boolean;
}

export interface MoveData {
  from: Position;
  from_pos?: Position;
  to: Position;
  captures?: Position[];
}

export interface Player {
  id: string;
  name: string;
  color: PieceColor;
  isReady: boolean;
  isConnected: boolean;
  disconnectedAt?: string;
}

export interface GameRoom {
  id: string;
  players: Player[];
  board: (Piece | null)[][] | null;
  currentTurn: PieceColor;
  status: GameStatus;
  variant: GameVariant;
  createdAt: string;
  winner: PieceColor | null;
}

class MultiplayerService {
  private socket: Socket | null = null;
  private connected: boolean = false;

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.connected && this.socket) {
        resolve();
        return;
      }

      this.socket = io(BACKEND_URL, {
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      });

      this.socket.on('connect', () => {
        this.connected = true;
        resolve();
      });

      this.socket.on('connect_error', (error) => {
        reject(error);
      });

      this.socket.on('disconnect', () => {
        this.connected = false;
      });
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.connected = false;
    }
  }

  isConnected(): boolean {
    return this.connected;
  }

  async createRoom(
    playerId: string,
    playerName: string,
    variant: GameVariant
  ): Promise<{ success: boolean; roomId?: string; room?: GameRoom; error?: string }> {
    return this.emitWithAck('createRoom', { playerId, playerName, variant });
  }

  async joinRoom(
    roomId: string,
    playerId: string,
    playerName: string
  ): Promise<{ success: boolean; room?: GameRoom; error?: string }> {
    return this.emitWithAck('joinRoom', { roomId, playerId, playerName });
  }

  async setPlayerReady(
    roomId: string,
    playerId: string,
    ready: boolean
  ): Promise<{ success: boolean; error?: string }> {
    return this.emitWithAck('playerReady', { roomId, playerId, ready });
  }

  async makeMove(
    roomId: string,
    playerId: string,
    move: MoveData,
    newBoard: (Piece | null)[][],
    nextTurn: PieceColor
  ): Promise<{ success: boolean; error?: string }> {
    const result = await this.emitWithAck('makeMove', {
      roomId,
      playerId,
      move,
      newBoard,
      nextTurn,
    });
    return result;
  }

  async endGame(
    roomId: string,
    winner: PieceColor | null,
    reason: string
  ): Promise<{ success: boolean; error?: string }> {
    return this.emitWithAck('gameOver', { roomId, winner, reason });
  }

  async leaveRoom(
    roomId: string,
    playerId: string
  ): Promise<{ success: boolean; error?: string }> {
    return this.emitWithAck('leaveRoom', { roomId, playerId });
  }

  onPlayerJoined(callback: (data: { room: GameRoom }) => void) {
    this.socket?.on('playerJoined', callback);
  }

  onPlayerReadyUpdate(callback: (data: { room: GameRoom }) => void) {
    this.socket?.on('playerReadyUpdate', callback);
  }

  onGameStart(callback: (data: { room: GameRoom }) => void) {
    this.socket?.on('gameStart', callback);
  }

  onMoveMade(
    callback: (data: {
      move: MoveData;
      board: (Piece | null)[][];
      currentTurn: PieceColor;
      playerId: string;
    }) => void
  ) {
    this.socket?.on('moveMade', callback);
  }

  onGameEnded(callback: (data: { winner: PieceColor | null; reason: string }) => void) {
    this.socket?.on('gameEnded', callback);
  }

  onPlayerLeft(callback: (data: { room: GameRoom; playerId: string }) => void) {
    this.socket?.on('playerLeft', callback);
  }

  onPlayerDisconnected(callback: (data: { playerId: string }) => void) {
    this.socket?.on('playerDisconnected', callback);
  }

  onPlayerReconnected(callback: (data: { room: GameRoom; player: Player }) => void) {
    this.socket?.on('playerReconnected', callback);
  }

  offPlayerJoined() {
    this.socket?.off('playerJoined');
  }

  offPlayerReadyUpdate() {
    this.socket?.off('playerReadyUpdate');
  }

  offGameStart() {
    this.socket?.off('gameStart');
  }

  offMoveMade() {
    this.socket?.off('moveMade');
  }

  offGameEnded() {
    this.socket?.off('gameEnded');
  }

  offPlayerLeft() {
    this.socket?.off('playerLeft');
  }

  offPlayerDisconnected() {
    this.socket?.off('playerDisconnected');
  }

  offPlayerReconnected() {
    this.socket?.off('playerReconnected');
  }

  private emitWithAck(event: string, data: any): Promise<any> {
    return new Promise((resolve, reject) => {
      if (!this.socket || !this.socket.connected) {
        reject(new Error('Socket not connected'));
        return;
      }

      this.socket.emit(event, data, (response: any) => {
        resolve(response);
      });

      setTimeout(() => {
        reject(new Error('Request timeout'));
      }, 10000);
    });
  }
}

export const multiplayerService = new MultiplayerService();
