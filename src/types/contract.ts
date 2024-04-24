import { ArweaveID, ArweavePublicKey } from './common.js';

export type UserSettings = {
  micOn: boolean; // default status of mic when joining chats
  videoOn: boolean; // default status of video when joining chats
  allowOutsideMessages: boolean; // allows other people to directly message the person
  allowLobbyInvites: boolean; // allows people to invite you to lobbies.
  notifications: {
    mentions: boolean;
    lobbies: boolean;
    invites: boolean;
  };
};

export type User = {
  processId: ArweaveID; // personal process id of the user for things like notification, mail, etc.
  arns: string[];
  name: string;
  avatar: ArweaveID;
  friends: ArweaveID[];
  blockList: ArweaveID[]; // disallows connection to specified users and prevent them from messaging/inviting the user to lobbies.
  preferences: UserSettings;
};

export type AoRTCContractState = {
  users: Record<ArweavePublicKey, User>;
  connections: Record<ArweaveID, EncryptedAoRTCContractConnectionState>;

  SetOffer: (params: { offer: string; connectionId: string }) => void;
  SetAnswer: (params: { answer: string; connectionId: string }) => void;
  SetIceCandidates: (params: {
    candidates: string;
    connectionId: string;
  }) => void;
  SetConnectionState: (params: { state: string; connectionId: string }) => void;

  // read
  GetUsers: () => Promise<Record<ArweavePublicKey, User>>;
  GetConnections: () => Promise<
    Record<ArweaveID, EncryptedAoRTCContractConnectionState>
  >;
  // write
  Register: (params: { Name: string; Avatar: ArweaveID }) => Promise<string>;
  CreateConnection(params: {
    Guest: ArweavePublicKey;
    Offer: string;
  }): Promise<string>;
  AcceptConnection(params: { Answer: string }): Promise<string>;
  AddIceCandidate(params: { Candidate: string }): Promise<string>;
  RenegotiateConnection(params: { Offer: string }): Promise<string>;
  UpdateSignalingState: (params: {
    State: RTCSignalingState;
  }) => Promise<string>;
  ClearConnections: () => Promise<string>;
};

export type EncryptedAoRTCContractConnectionState = {
  Host: { id: ArweaveID; IceCandidates: string }; // encrypted with guest pubKey RTCIceCandidate[] and encoded to b64
  Guest: { id: ArweaveID; IceCandidates: string }; // encrypted with host pubKey RTCIceCandidate[] and encoded to b64
  ConnectionConfig: {
    Offer: string; // encrypted with guest pubKey RTCSessionDescription and encoded to b64
    Answer: string; // encrypted with host pubKey RTCSessionDescription and encoded to b64
  };
};

export type DecryptedAoRTCContractConnectionState = {
  Host: { id: ArweaveID; IceCandidates: RTCIceCandidate[] }; // decrypted with guest pubKey RTCIceCandidate[] and encoded to b64
  Guest: { id: ArweaveID; IceCandidates: RTCIceCandidate[] }; // decrypted with host pubKey RTCIceCandidate[] and encoded to b64
  ConnectionConfig: {
    Offer: RTCSessionDescription; // decrypted with guest pubKey RTCSessionDescription and encoded to b64
    Answer: RTCSessionDescription; // decrypted with host pubKey RTCSessionDescription and encoded to b64
  };
};
