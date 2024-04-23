export interface WebRTCManager {
    sendOffer: (offer: RTCSessionDescriptionInit) => void;
    sendAnswer: (answer: RTCSessionDescriptionInit) => void;
    sendIceCandidate: (candidate: RTCIceCandidate) => void;
    onOffer: (callback: (offer: RTCSessionDescriptionInit) => void) => void;
    onAnswer: (callback: (answer: RTCSessionDescriptionInit) => void) => void;
    onIceCandidate: (callback: (candidate: RTCIceCandidate) => void) => void;
}