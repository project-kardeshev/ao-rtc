/**
 * Interface for managing WebRTC connections
 */
export interface WebRTCManager {
    sendOffer: (offer: RTCSessionDescriptionInit) => void;
    sendAnswer: (answer: RTCSessionDescriptionInit) => void;
    sendIceCandidate: (candidate: RTCIceCandidate) => void;
    onOffer: (callback: (offer: RTCSessionDescriptionInit) => void) => void;
    onAnswer: (callback: (answer: RTCSessionDescriptionInit) => void) => void;
    onIceCandidate: (callback: (candidate: RTCIceCandidate) => void) => void;
}
/**
 * Interface for connecting to peer, implements a network topology
 */
export interface RTCServer {
    start: () => void;
    stop: () => void;
    login: (username: string, password: string) => void;
    logout: () => void;
    onLogin: (callback: (username: string) => void) => void;
    onLogout: (callback: () => void) => void;
}
export interface AoRTCSignalingContract {
    register: (username: string, publicKey: string) => void;
}
