var p2p_travellingPackets = [];
var p2p_fileInfo = {};
var p2p_server;
var p2p_router;
var p2p_links = {};
var p2p_clients = [];
var p2p_timerTick = 0;
var p2p_hasntStartedYet = true;
var p2p_currentClient = 0;
var p2p_totalSentClientData = 0.0;
var p2p_currentClientPacketNumber = 0;

function P2P_start() {
    p2p_clients.push(new MyP2PClient("red", 35, 120, "Client-1"));
    p2p_clients.push(new MyP2PClient("green", 100, 290, "Client-2"));
    p2p_clients.push(new MyP2PClient("yellow", 235, 350, "Client-3"));
    p2p_clients.push(new MyP2PClient("blue", 370, 290, "Client-4"));
    p2p_clients.push(new MyP2PClient("grey", 435, 120, "Client-5"));
    p2p_server = new MyP2PServer(235, 35, "Server");
    p2p_router = new MyRouterNet(235, 175);

    for(var c=0; c < p2p_clients.length; c++){
        p2p_links[p2p_clients[c].type] = new MyLink(p2p_router.x + 30, p2p_router.y + 25, p2p_clients[c].x + p2p_clients[c].width/2, p2p_clients[c].y + p2p_clients[c].height/2);
        var link = new MyLink(p2p_clients[c].x + p2p_clients[c].width/2, p2p_clients[c].y + p2p_clients[c].height/2, p2p_router.x + 30, p2p_router.y + 25);
        link = adjustLink(link);
        p2p_clients[c].updateLink(link);
    }
    p2p_links[p2p_server.type] = new MyLink(p2p_router.x + 30, p2p_router.y + 25, p2p_server.x + p2p_server.width/2, p2p_server.y + p2p_server.height/2);
    var link = new MyLink(p2p_server.x + p2p_server.width/2, p2p_server.y + p2p_server.height/2, p2p_router.x + 30, p2p_router.y + 25);
    link = adjustLink(link);
    p2p_server.updateLink(link);

    //TODO: should get this data from parameters
    fileInfo = {"Client-1" : {fileAmountSent : 0.0, filePercentage : 0.2, filePosition : 0.0}, 
"Client-2" : {fileAmountSent : 0.0, filePercentage : 0.4, filePosition : 0.2},
"Client-3" : {fileAmountSent : 0.0, filePercentage : 0.1, filePosition : 0.6},
"Client-4" : {fileAmountSent : 0.0, filePercentage : 0.1, filePosition : 0.7},
"Client-5" : {fileAmountSent : 0.0, filePercentage : 0.2, filePosition : 0.8}};
    p2p_server.fileInfo = fileInfo;

    p2p_router.updateLinks(p2p_links);

    p2p_animationCanvas = document.getElementById("P2P_Canvas");
    setInterval(p2p_updateAnimation, 20);
}

function p2p_updateAnimation() {
    p2p_animationCanvas.getContext("2d").clearRect(0, 0, p2p_animationCanvas.width, p2p_animationCanvas.height);

    if(isRunning){
        p2p_timerTick += 1;

        if(p2p_hasntStartedYet){
            p2p_server.uploadSpeed = 5;
            for (var j = 0; j < p2p_clients.length; j++){
                var c = p2p_clients[j];
                c.uploadSpeed = fileInfo[c.type].filePercentage * 10;
            }
        }
        p2p_hasntStartedYet = false;

        if(p2p_timerTick % 10 === 0 && p2p_totalSentClientData < 1.0){
            var currentClientFileInfo = fileInfo[p2p_clients[p2p_currentClient].type];

            if(p2p_currentClientPacketNumber === currentClientFileInfo.filePercentage*10){
                p2p_currentClient = (p2p_currentClient + 1) % 5;
                p2p_currentClientPacketNumber = 0;
            }

            var packet = p2p_server.sendPacket(p2p_clients[p2p_currentClient].type);
            p2p_travellingPackets.push(packet);
            p2p_totalSentClientData += packet.packetSize;
            currentClientFileInfo.fileAmountSent += packet.packetSize;
            p2p_currentClientPacketNumber++;
        }

        for (var i = 0; i < p2p_travellingPackets.length; i++) {
            for (var j = 0; j < p2p_clients.length; j++) {
                if(p2p_clients[j].detectCollision(p2p_travellingPackets[i])) {
                    p2p_travellingPackets.splice(i,1);
                }
            }
            if(p2p_router.route(p2p_travellingPackets[i])) {
                p2p_travellingPackets.splice(i,1);
            }
        }

        for (var l = 0; l < p2p_router.packetBuffer.length; l++)
            p2p_travellingPackets.push(p2p_router.packetBuffer[l]);
        
        p2p_router.packetBuffer = [];

        for (var j = 0; j < p2p_clients.length; j++) {
            var client = p2p_clients[j];
            var pack = client.sendPacket();
            if(pack !== null)
                p2p_travellingPackets.push(pack);
        }

        for (var i = 0; i < p2p_travellingPackets.length; i++)
            p2p_travellingPackets[i].updatePosition();
    }

    for(var lk in p2p_links)
        p2p_links[lk].draw(p2p_animationCanvas.getContext("2d"));

    for (var i = 0; i < p2p_travellingPackets.length; i++)
        p2p_travellingPackets[i].draw(p2p_animationCanvas.getContext("2d"));

    p2p_router.draw(p2p_animationCanvas.getContext("2d"));
    p2p_server.draw(p2p_animationCanvas.getContext("2d"));

    for (var j = 0; j < p2p_clients.length; j++)
        p2p_clients[j].draw(p2p_animationCanvas.getContext("2d"));
}

function P2P_reset(){
    p2p_travellingPackets = [];
    p2p_router.packetBuffer = [];
    p2p_timerTick = 0;
    p2p_currentClient = 0;
    p2p_totalSentClientData = 0.0;
    p2p_currentClientPacketNumber = 0;
    p2p_hasntStartedYet = true;

    for (var j = 0; j < p2p_clients.length; j++) {
        p2p_clients[j].capturedPackets = [];
        p2p_clients[j].packetBuffer = [];
    }
}