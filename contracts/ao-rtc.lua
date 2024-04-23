local ao = require("ao")
local json = require("json")
local utils = require(".utils")

local Users = Users or {
    test = {
        ProcessId = "id",
        Name = "test",
        Avatar = "#0x123456789abcdef", -- hex pixel art seed
        Friends = {
            "test2",
        },
        BlockList = {},
        Preferences = {
            MicOn = true,
            VideoOn = true,
            AllowOutsideMessages = true,
            AllowLobbyInvites = true,
            Notifications = {
                Mentions = true,
                Lobbies = true,
                Invites = true,
            }
        }
    }
}
local testConnection = {
    test = {
        Host = { id = "test", IceCandidates = "" },
        Guest = { id = "test2", IceCandidates = ""},
        ConnectionConfig = {
            Offer = "",
            Answer = "",
        }
    }
}
-- webRTC connections
local Connections = Connections or testConnection

Handlers.add(
    "Register",
    Handlers.utils.hasMatchingTag("Action", "Register"),
    function(msg)
        local user = json.decode(msg.Data)
        Users[user.PublicKey] = user.MetaData
        Users[user.PublicKey].Address = msg.From

        ao.send({Target = msg.From, Status = "OK", Data = json.encode(Users)})

    end
)

Handlers.add(
    "GetUsers",
    Handlers.utils.hasMatchingTag("Action", "GetUsers"),
    function(msg)
        ao.send({Target = msg.From, Status = "OK", Data = json.encode(Users)})
    end
)



Handlers.add(
    "CreateConnection",
    Handlers.utils.hasMatchingTag("Action", "CreateConnection"),
    function(msg)

        local userPKs = utils.keys(Users)
        local hostPublicKey = utils.find(
            function (val) return Users[val].Address == msg.From end,
            userPKs
        )

        local host = hostPublicKey
        local guest = msg.Guest
        local offer = msg.Offer

        assert(hostPublicKey, "User not found. Please register first.")
        assert(Users[guest], "Guest not found. Please check the guest's public key.")
        assert(offer, "Offer not found. Please provide an offer encypted with the targets public key.")

        local connection = {
            Host = { id = host, IceCandidates = ""},
            Guest = { id = guest, IceCandidates = ""},
            ConnectionConfig = {
                Offer = msg.Offer,
                Answer = "",
            }
        }
        Connections[msg.Id] = connection

    end
)

Handlers.add(
    "AcceptConnection",
    Handlers.utils.hasMatchingTag("Action", "AcceptConnection"),
    function(msg)
        assert(Connections[msg.ConnectionId], "Connection ID not provided. Please check the connection id.")
        local connection = Connections[msg.ConnectionId]
        local guestPublicKey = utils.find(
            function (val) return Users[val].Address == msg.From end,
            utils.keys(Users)
        )
        local jsonData = json.decode(msg.Data)

        assert(connection, "Connection not found. Please check the connection id.")
        assert(guestPublicKey, "User not found. Please register first.")
        assert(connection.Guest.id == guestPublicKey, "You are not the guest of this connection.")

        connection.ConnectionConfig.Answer = jsonData.Answer
        Connections[msg.ConnectionId] = connection

    end
)

Handlers.add(
    "GetConnections",
    Handlers.utils.hasMatchingTag("Action", "GetConnections"),
    function(msg)
        ao.send({Target = msg.From, Status = "OK", Data = json.encode(Connections)})
    end
)

Handlers.add(
    "RenegotiateConnection",
    Handlers.utils.hasMatchingTag("Action", "RenegotiateConnection"),
    function(msg)
        local connectionId = msg.ConnectionId
        local connection = Connections[connectionId]
        local offer = json.decode(msg.Data).Offer
        local host = utils.find(
            function (val) return Users[val].Address == msg.From end,
            utils.keys(Users)
        )
        
        assert(host == connection.Host.id, "You are not the host of this connection and cannot update the Offer.")
        assert(offer, "Offer not found. Please provide an offer encypted with the targets public key.")

        connection.ConnectionConfig.Offer = offer
        Connections[connectionId] = connection

    end
)

Handlers.add(
    "AddIceCandidate",
    Handlers.utils.hasMatchingTag("Action", "AddIceCandidate"),
    function(msg)
        local connectionId = msg.ConnectionId
        local connection = Connections[connectionId]
        local candidate = json.decode(msg.Data).Candidate
        local callerPublicKey = utils.find(
            function (val) return Users[val].Address == msg.From end,
            utils.keys(Users)
        )

        assert(connection, "Connection not found. Please check the connection id.")
        assert(candidate, "Candidate not found. Please provide an ICE candidate.")
        assert(callerPublicKey, "User not found. Please register first.")

        local isHost = connection.Host.id == callerPublicKey
        local isGuest = connection.Guest.id == callerPublicKey

        assert(isHost or isGuest, "You are not part of this connection and cannot add ICE candidates.")
        
        if isHost then
            connection.Host.IceCandidates = candidate
        end
        if isGuest then
            connection.Guest.IceCandidates = candidate
        end

        Connections[connectionId] = connection

    end
)

Handlers.add(
    "UpdateSignalingState",
    Handlers.utils.hasMatchingTag("Action", "UpdateSignalingState"),
    -- consumes message owner and updates their signalling state for the specified connection
    function(msg)
        local connectionId = msg.ConnectionId
        connection = Connections[connectionId]
        local signalingState = msg.SignalingState
        local publicKey = utils.find(
            function (val) return Users[val].Address == msg.From end,
            utils.keys(Users)
        )
        local peerName = ""
       if Connections[connectionId].Host.id == publicKey then peerName = "Host" else peerName = "Guest" end
       assert(publicKey, "User not found. Please register first.")
         assert(signalingState, "Signaling state not found. Please provide a signaling state.")
         assert(Connections[connectionId][peerName], "You are not part of this connection and cannot update the signaling state.")
        connection[peerName].SignallingState = signalingState
        Connections[connectionId] = connection
    end
)


Handlers.add(
    "ClearConnections",
    Handlers.utils.hasMatchingTag("Action", "ClearConnections"),
    function(msg)
        Connections = {}
    end
)



