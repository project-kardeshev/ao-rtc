import { ArweaveID, ArweavePublicKey } from './common.js';
export type UserSettings = {
    micOn: boolean;
    videoOn: boolean;
    allowOutsideMessages: boolean;
    allowLobbyInvites: boolean;
    notifications: {
        mentions: boolean;
        lobbies: boolean;
        invites: boolean;
    };
};
export type User = {
    processId: ArweaveID;
    arns: string[];
    name: string;
    avatar: ArweaveID;
    friends: ArweaveID[];
    blockList: ArweaveID[];
    preferences: UserSettings;
};
export type AoRTCContractState = {
    users: Record<ArweavePublicKey, User>;
    connections: Record<ArweaveID, EncryptedAoRTCContractConnectionState>;
    SetOffer: (params: {
        offer: string;
        connectionId: string;
    }) => void;
    SetAnswer: (params: {
        answer: string;
        connectionId: string;
    }) => void;
    SetIceCandidates: (params: {
        candidates: string;
        connectionId: string;
    }) => void;
    SetConnectionState: (params: {
        state: string;
        connectionId: string;
    }) => void;
    GetUsers: () => Promise<Record<ArweavePublicKey, User>>;
    GetConnections: () => Promise<Record<ArweaveID, EncryptedAoRTCContractConnectionState>>;
    Register: (params: {
        Name: string;
        Avatar: ArweaveID;
    }) => Promise<string>;
    CreateConnection(params: {
        Guest: ArweavePublicKey;
        Offer: string;
    }): Promise<string>;
    AcceptConnection(params: {
        Answer: string;
    }): Promise<string>;
    AddIceCandidate(params: {
        Candidate: string;
    }): Promise<string>;
    RenegotiateConnection(params: {
        Offer: string;
    }): Promise<string>;
    UpdateSignalingState: (params: {
        State: RTCSignalingState;
    }) => Promise<string>;
    ClearConnections: () => Promise<string>;
};
export type EncryptedAoRTCContractConnectionState = {
    Host: {
        id: ArweaveID;
        IceCandidates: string;
    };
    Guest: {
        id: ArweaveID;
        IceCandidates: string;
    };
    ConnectionConfig: {
        Offer: string;
        Answer: string;
    };
};
export type DecryptedAoRTCContractConnectionState = {
    Host: {
        id: ArweaveID;
        IceCandidates: RTCIceCandidate[];
    };
    Guest: {
        id: ArweaveID;
        IceCandidates: RTCIceCandidate[];
    };
    ConnectionConfig: {
        Offer: RTCSessionDescription;
        Answer: RTCSessionDescription;
    };
};
