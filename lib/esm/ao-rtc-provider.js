import { createDataItemSigner } from '@permaweb/aoconnect';
import Arweave from 'arweave';
import { AoProvider } from './ao-provider.js';
import { decryptJSONWithArconnect, encryptJSONWithPublicKey, } from './utils/encryption.js';
// Class AoRtcProvider extends from AoProvider and implements the AoRtc interface
export class AoRtcProvider extends AoProvider {
    signer;
    // it is possible to have multiple connections to the same user, so we store them in a nested object
    connections;
    streams;
    arweave;
    heartbeat;
    constructor({ arweave = Arweave.init({
        host: 'arweave.net',
        protocol: 'https',
        port: 443,
    }), ...params }) {
        super({
            processId: params.processId,
            scheduler: params.scheduler,
            connectConfig: params.connectConfig,
        });
        this.signer = params.signer;
        this.arweave = arweave;
    }
    createPeerConnection() {
        return new RTCPeerConnection({
            // TODO: add ar-io gateway stun servers from WayFinder
            iceServers: [
                { urls: 'stun:stun.l.google.com:19302' },
                { urls: 'stun:stun1.l.google.com:19302' },
                { urls: 'stun:stun2.l.google.com:19302' },
                { urls: 'stun:stun3.l.google.com:19302' },
                { urls: 'stun:stun4.l.google.com:19302' },
            ],
        });
    }
    /**
     * @description - Starts the AoRtcProvider, sets up the heartbeat to update connection states
     * @returns AoRtcProvider - the instance of the AoRtcProvider
     *
     */
    start() {
        if (this.heartbeat) {
            throw new Error('Already started');
        }
        const heartbeat = setInterval(() => this.updateConnectionStates(), 3000);
        this.heartbeat = heartbeat;
        // disconnect all connections when the window is closed
        window.onbeforeunload = () => {
            Object.keys(this.connections).forEach((id) => this.disconnect({ id }));
        };
        return this;
    }
    /**
     * @description - Stops the AoRtcProvider, clears the heartbeat
     * @returns AoRtcProvider - the instance of the AoRtcProvider
     */
    stop() {
        if (!this.heartbeat) {
            throw new Error('Not started');
        }
        clearInterval(this.heartbeat);
        this.heartbeat = undefined;
        return this;
    }
    /**
     * @description - Updates the connections for all peers associated with the current user, both Host and Guest connections, answers offers
     * and sends offers to new connections, checks for renegotiation and sends new offers if needed
     */
    async updateConnectionStates() {
        const publicKey = await window.arweaveWallet.getActivePublicKey();
        const encryptedConnections = await this.getContractConnections({
            userId: publicKey,
        });
        for (const [connectionId, contractConnection] of Object.entries(encryptedConnections)) {
            const host = contractConnection.Host.id;
            const guest = contractConnection.Guest.id;
            if (host === publicKey) {
                // update remote ICE servers as host
                await decryptJSONWithArconnect(contractConnection.Guest.IceCandidates, window.arweaveWallet)
                    .then((obj) => Array.isArray(obj)
                    ? obj.map((candidate) => new RTCIceCandidate(candidate))
                    : [])
                    .then((candidates) => candidates.forEach((candidate) => this.connections[guest].addIceCandidate(candidate)));
                const decryptedAnswer = contractConnection.ConnectionConfig.Answer
                    .length
                    ? new RTCSessionDescription((await decryptJSONWithArconnect(contractConnection.ConnectionConfig.Answer, window.arweaveWallet)))
                    : undefined;
                // if the decrypted answer is not the same as the remote description, set it
                if (decryptedAnswer &&
                    decryptedAnswer !== this.connections[guest].remoteDescription) {
                    await this.onRecieveAnswer({
                        guestPublicKey: guest,
                        encryptedAnswer: contractConnection.ConnectionConfig.Answer,
                    });
                }
            }
            else if (guest === publicKey) {
                // update remote ICE servers as guest
                await decryptJSONWithArconnect(contractConnection.Host.IceCandidates, window.arweaveWallet)
                    .then((obj) => Array.isArray(obj)
                    ? obj.map((candidate) => new RTCIceCandidate(candidate))
                    : [])
                    .then((candidates) => candidates.forEach((candidate) => this.connections[host].addIceCandidate(candidate)));
                const decryptedOffer = contractConnection.ConnectionConfig.Offer.length
                    ? new RTCSessionDescription((await decryptJSONWithArconnect(contractConnection.ConnectionConfig.Offer, window.arweaveWallet)))
                    : undefined;
                // if the decrypted offer is not the same as the remote description, set it
                if (decryptedOffer &&
                    decryptedOffer !== this.connections[host].remoteDescription) {
                    await this.onRecieveOffer({
                        connectionId,
                        hostPublicKey: host,
                        encryptedOffer: contractConnection.ConnectionConfig.Offer,
                    });
                }
            }
            else {
                throw new Error('Invalid connection state');
            }
        }
    }
    async register(params) {
        const registrationId = await this.ao.message({
            process: this.processId,
            data: JSON.stringify({
                PublicKey: await window.arweaveWallet.getActivePublicKey(),
                MetaData: { ...params },
            }),
            tags: [{ name: 'Action', value: 'Register' }],
            signer: createDataItemSigner(window.arweaveWallet),
        });
        console.debug(`User registered with id ${registrationId}`);
        return this;
    }
    /**
     *
     * @param id - public key of the peer to connect to
     *
     * @returns AoRtcProvider - the instance of the AoRtcProvider
     *
     * @example
     * const mediaStream = await aoRtc.connect({id: 'publicKey'}).getMediaStream({id: 'publicKey'})
     */
    async connect({ id }) {
        // check we are not already connected locally
        if (id in Object.keys(this.connections)) {
            throw new Error(`Connection to user ${id} already exists`);
        }
        const address = await window.arweaveWallet.getActiveAddress();
        if (id === address) {
            throw new Error('Cannot connect to thyself');
        }
        const encryptedContractConnections = await this.getContractConnections({
            userId: address,
        });
        const connectedAsHost = Object.entries(encryptedContractConnections).find(([connectionId, value]) => {
            if (value.Host.id === address && value.Guest.id === id)
                return connectionId;
        });
        // peer is attempting to connect as host to me
        const connectedAsGuest = Object.entries(encryptedContractConnections).find(([connectionId, value]) => {
            if (value.Host.id === id && value.Guest.id === address)
                return connectionId;
        });
        // could be connected on another device using the same wallet, if thats the case then we should just create a new connection
        if (connectedAsHost || connectedAsGuest) {
            throw new Error(`Connection to user ${id} already exists`);
        }
        const connection = this.createPeerConnection();
        this.connections[id] = connection;
        const offer = await this.connections[id].createOffer();
        await this.connections[id].setLocalDescription(offer);
        // set video and audio tracks
        const stream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: true,
        });
        stream
            .getTracks()
            .forEach((track) => this.connections[id].addTrack(track, stream));
        const connectionId = await this.ao.message({
            process: this.processId,
            tags: [
                { name: 'Action', value: 'CreateConnection' },
                { name: 'Guest', value: id },
                { name: 'Offer', value: await encryptJSONWithPublicKey(offer, id) },
            ],
            signer: createDataItemSigner(window.arweaveWallet),
        });
        this.setupConnection({ remoteId: id, connectionId });
        console.debug(`Connection to user ${id} created with id ${connectionId}`);
        return this.start();
    }
    setupConnection({ remoteId, connectionId, }) {
        // Check if the connection exists in the connections map
        const connection = this.connections[remoteId];
        if (!connection) {
            throw new Error(`Connection to user ${remoteId} does not exist`);
        }
        // Handle ICE candidates
        connection.onicecandidate = async (event) => {
            if (event.candidate) {
                // Send the ICE candidate to a signaling server or store it to send later
                const messageId = await this.ao.message({
                    process: this.processId,
                    tags: [
                        { name: 'Action', value: 'AddIceCandidate' },
                        // TODO: may need to pull all canidates, decrypt, add, encrypt, and send back
                        {
                            name: 'Candidate',
                            value: await encryptJSONWithPublicKey([event.candidate], remoteId),
                        },
                        { name: 'ConnectionId', value: connectionId },
                    ],
                    signer: createDataItemSigner(window.arweaveWallet),
                });
                console.debug(`ICE candidate sent to user ${remoteId} with message id ${messageId}`);
            }
            else {
                // This null candidate event indicates the end of candidate gathering
                console.debug('All ICE candidates have been gathered for peer ID:', remoteId);
            }
        };
        // Handle incoming media streams
        connection.ontrack = (event) => {
            if (!this.streams[remoteId]) {
                this.streams[remoteId] = new MediaStream();
            }
            // Add each track from the event to the stored stream
            event.streams[0].getTracks().forEach((track) => {
                this.streams[remoteId].addTrack(track);
            });
            // Optionally, do something with the stream like attaching it to an HTML media element
        };
        // Additional event handlers you might consider adding:
        // ICE connection state change handler
        connection.oniceconnectionstatechange = () => {
            console.debug(`ICE connection state changed to: ${connection.iceConnectionState}`);
            if (connection.iceConnectionState === 'failed' ||
                connection.iceConnectionState === 'disconnected' ||
                connection.iceConnectionState === 'closed') {
                // Handle disconnection or failed connection scenarios
            }
        };
        // Signaling state change handler
        connection.onsignalingstatechange = () => {
            console.debug(`Signaling state change: ${connection.signalingState}`);
        };
        // Negotiation needed handler
        connection.onnegotiationneeded = async () => {
            try {
                // Handle renegotiation (create and send a new offer)
                const offer = await connection.createOffer();
                await connection.setLocalDescription(offer);
                // Send the offer to the remote peer via your signaling mechanism
                this.ao.message({
                    process: this.processId,
                    tags: [
                        { name: 'Action', value: 'RenegotiateConnection' },
                        {
                            name: 'Offer',
                            value: await encryptJSONWithPublicKey(offer, remoteId),
                        },
                        { name: 'ConnectionId', value: connectionId },
                    ],
                    signer: createDataItemSigner(window.arweaveWallet),
                });
            }
            catch (err) {
                console.error('Failed to renegotiate connection, disconnecting:', err);
                this.disconnect({ id: remoteId });
            }
        };
    }
    async disconnect({ id }) {
        if (!(id in this.connections)) {
            throw new Error(`Connection to user ${id} does not exist`);
        }
        this.connections[id].close();
        this.streams[id].getTracks().forEach((track) => track.stop());
        delete this.connections[id];
        delete this.streams[id];
        if (Object.keys(this.connections).length === 0) {
            this.stop();
        }
        return this;
    }
    async getContractConnections({ userId, } = {}) {
        const { Messages } = await this.ao.dryrun({
            process: this.processId,
            tags: [{ name: 'Action', value: 'GetConnections' }],
        });
        const encryptedConnections = JSON.parse(Messages[0].Data);
        // return all connections if no userId or signer is provided
        if (!userId)
            return encryptedConnections;
        // return all connections for a specific user if userId is provided
        return Object.fromEntries(Object.entries(encryptedConnections).filter(([, value]) => value.Host.id === userId || value.Guest.id === userId));
    }
    /**
     * @description - Gets all users in the contract
     * @returns Record<ArweaveID, User> - a record of all users in the contract
     */
    async getUsers() {
        const { Messages } = await this.ao.dryrun({
            process: this.processId,
            tags: [{ name: 'Action', value: 'GetUsers' }],
        });
        return JSON.parse(Messages[0].Data);
    }
    async getMediaStream({ id }) {
        if (!(id in Object.keys(this.streams))) {
            throw new Error(`Connection to user ${id} does not exist`);
        }
        return this.streams[id];
    }
    // Assume this function is triggered when an offer is received from the signaling channel
    async onRecieveOffer({ connectionId, hostPublicKey, encryptedOffer }) {
        try {
            const decryptedOffer = await decryptJSONWithArconnect(encryptedOffer, window.arweaveWallet);
            if (!this.connections[hostPublicKey]) {
                this.connections[hostPublicKey] = this.createPeerConnection();
                this.setupConnection({ remoteId: hostPublicKey, connectionId });
            }
            const connection = this.connections[hostPublicKey];
            await connection.setRemoteDescription(new RTCSessionDescription(decryptedOffer));
            const answer = await connection.createAnswer();
            await connection.setLocalDescription(answer);
            // setup media stream
            const stream = await navigator.mediaDevices.getUserMedia({
                video: true,
                audio: true,
            });
            stream.getTracks().forEach((track) => connection.addTrack(track, stream));
            this.streams[hostPublicKey] = stream;
            // Send the answer back to the original sender (host)
            this.ao.message({
                process: this.processId,
                tags: [
                    { name: 'Action', value: 'AcceptConnection' },
                    {
                        name: 'Answer',
                        value: await encryptJSONWithPublicKey(answer, hostPublicKey),
                    },
                    { name: 'ConnectionId', value: connectionId },
                ],
                signer: createDataItemSigner(window.arweaveWallet),
            });
        }
        catch (error) {
            console.error('Error handling received offer:', error);
        }
    }
    async onRecieveAnswer({ guestPublicKey, encryptedAnswer }) {
        try {
            const decryptedAnswer = await decryptJSONWithArconnect(encryptedAnswer, window.arweaveWallet);
            const connection = this.connections[guestPublicKey];
            await connection.setRemoteDescription(new RTCSessionDescription(decryptedAnswer));
        }
        catch (error) {
            console.error('Error handling received answer:', error);
        }
    }
}
