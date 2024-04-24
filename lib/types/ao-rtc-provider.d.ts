import { ArconnectSigner, ArweaveSigner } from 'arbundles';
import Arweave from 'arweave';
import { AoProvider } from './ao-provider.js';
import { ArweaveAddress, ArweaveID, ArweavePublicKey } from './types/common.js';
import { EncryptedAoRTCContractConnectionState, User } from './types/contract.js';
export type RtcSigner = ArweaveSigner | ArconnectSigner;
export interface AoRtc {
    signer: RtcSigner;
    connections: Record<ArweaveAddress, RTCPeerConnection>;
    streams: Record<ArweaveAddress, MediaStream>;
    arweave: Arweave;
    connect(params: {
        id: ArweaveID;
    }): Promise<this>;
    disconnect(params: {
        id: ArweaveID;
    }): void;
    getContractConnections(params: {
        userId: ArweaveID;
    }): Promise<Record<ArweaveID, EncryptedAoRTCContractConnectionState>>;
    getMediaStream(params: {
        id: ArweaveID;
    }): Promise<MediaStream>;
    getUsers(): Promise<Record<ArweaveID, User>>;
    register(params: Partial<User>): Promise<this>;
}
export declare class AoRtcProvider extends AoProvider implements AoRtc {
    signer: RtcSigner;
    connections: Record<ArweavePublicKey, RTCPeerConnection>;
    streams: Record<ArweavePublicKey, MediaStream>;
    arweave: Arweave;
    heartbeat: any;
    constructor({ arweave, ...params }: {
        signer: RtcSigner;
        processId: string;
        arweave: Arweave;
        scheduler?: string;
        connectConfig?: any;
    });
    createPeerConnection(): RTCPeerConnection;
    /**
     * @description - Starts the AoRtcProvider, sets up the heartbeat to update connection states
     * @returns AoRtcProvider - the instance of the AoRtcProvider
     *
     */
    start(): this;
    /**
     * @description - Stops the AoRtcProvider, clears the heartbeat
     * @returns AoRtcProvider - the instance of the AoRtcProvider
     */
    stop(): this;
    /**
     * @description - Updates the connections for all peers associated with the current user, both Host and Guest connections, answers offers
     * and sends offers to new connections, checks for renegotiation and sends new offers if needed
     */
    updateConnectionStates(): Promise<void>;
    register(params: Partial<User>): Promise<this>;
    /**
     *
     * @param id - public key of the peer to connect to
     *
     * @returns AoRtcProvider - the instance of the AoRtcProvider
     *
     * @example
     * const mediaStream = await aoRtc.connect({id: 'publicKey'}).getMediaStream({id: 'publicKey'})
     */
    connect({ id }: {
        id: ArweavePublicKey;
    }): Promise<this>;
    setupConnection({ remoteId, connectionId, }: {
        remoteId: ArweaveID;
        connectionId: ArweaveID;
    }): void;
    disconnect({ id }: {
        id: ArweaveID;
    }): Promise<this>;
    getContractConnections({ userId, }?: {
        userId?: ArweaveID;
    }): Promise<Record<ArweaveID, EncryptedAoRTCContractConnectionState>>;
    /**
     * @description - Gets all users in the contract
     * @returns Record<ArweaveID, User> - a record of all users in the contract
     */
    getUsers(): Promise<Record<ArweaveID, User>>;
    getMediaStream({ id }: {
        id: ArweaveID;
    }): Promise<MediaStream>;
    onRecieveOffer({ connectionId, hostPublicKey, encryptedOffer }: {
        connectionId: any;
        hostPublicKey: any;
        encryptedOffer: any;
    }): Promise<void>;
    onRecieveAnswer({ guestPublicKey, encryptedAnswer }: {
        guestPublicKey: any;
        encryptedAnswer: any;
    }): Promise<void>;
}
