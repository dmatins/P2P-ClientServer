var cs_travellingPackets = [];
var cs_server;
var cs_router;
var cs_links = {};
var cs_clients = [];
var cs_timerTick = 0;
var cs_currentClient = 0;
var cs_currentClientData = 0.0;
var cs_algorithm = "Round Robin";
var cs_hasntStartedYet = true;

function CS_start() {
    cs_clients.push(new MyClient("red", 35, 120, "Client-1"));
    cs_clients.push(new MyClient("green", 100, 290, "Client-2"));
    cs_clients.push(new MyClient("yellow", 235, 350, "Client-3"));
    cs_clients.push(new MyClient("blue", 370, 290, "Client-4"));
    cs_clients.push(new MyClient("grey", 435, 120, "Client-5"));
    cs_server = new MyServer(235, 35, "Server");
    cs_router = new MyRouterNet(235, 175);

    for(var c=0; c < cs_clients.length; c++){
        cs_links[cs_clients[c].type] = new MyLink(cs_router.x + 30, cs_router.y + 25, cs_clients[c].x + cs_clients[c].width/2, cs_clients[c].y + cs_clients[c].height/2);
        var link = new MyLink(cs_clients[c].x + cs_clients[c].width/2, cs_clients[c].y + cs_clients[c].height/2, cs_router.x + 30, cs_router.y + 25);
        link = adjustLink(link);
        cs_clients[c].updateLink(link);
    }
    cs_links[cs_server.type] = new MyLink(cs_router.x + 30, cs_router.y + 25, cs_server.x + cs_server.width/2, cs_server.y + cs_server.height/2);
    var link = new MyLink(cs_server.x + cs_server.width/2, cs_server.y + cs_server.height/2, cs_router.x + 30, cs_router.y + 25);
    link = adjustLink(link);
    cs_server.updateLink(link);

    cs_router.updateLinks(cs_links);

    cs_animationCanvas = document.getElementById("CS_Canvas");
    setInterval(cs_updateAnimation, 20);
}

function cs_updateAnimation() {
    cs_animationCanvas.getContext("2d").clearRect(0, 0, cs_animationCanvas.width, cs_animationCanvas.height);

    if(isRunning){
        cs_timerTick++;
        cs_hasntStartedYet = false;

        if(cs_timerTick % 10 === 0){
            if(cs_algorithm === "Round Robin"){
                if(cs_currentClientData < (1.0 * cs_clients.length)){
                    var packet = cs_server.sendPacket(cs_clients[cs_currentClient].type);
                    cs_travellingPackets.push(packet);
                    cs_currentClientData += packet.packetSize;
                    cs_currentClient = (cs_currentClient + 1) % 5;
                }
            }
            else{
                if(cs_currentClient < cs_clients.length){
                    var packet = cs_server.sendPacket(cs_clients[cs_currentClient].type);
                    cs_travellingPackets.push(packet);
                    cs_currentClientData += packet.packetSize;
                    if(cs_currentClientData >= 1.0){
                        cs_currentClientData = 0.0;
                        cs_currentClient++;
                    }
                }
            }
        }

        if(cs_currentClient === cs_clients.length && cs_travellingPackets.length === 0){
            isRunning = false;
        }

        for (var i = 0; i < cs_travellingPackets.length; i++) {
            for (var j = 0; j < cs_clients.length; j++) {
                if(cs_clients[j].detectCollision(cs_travellingPackets[i])) {
                    cs_travellingPackets.splice(i,1);
                }
            }
            if(cs_router.route(cs_travellingPackets[i])) {
                cs_travellingPackets.splice(i,1);
            }
        }

        for (var l = 0; l < cs_router.packetBuffer.length; l++)
            cs_travellingPackets.push(cs_router.packetBuffer[l]);
        
        cs_router.packetBuffer = [];

        for (var i = 0; i < cs_travellingPackets.length; i++)
            cs_travellingPackets[i].updatePosition();
    }

    for(var lk in cs_links)
        cs_links[lk].draw(cs_animationCanvas.getContext("2d"));

    for (var i = 0; i < cs_travellingPackets.length; i++)
        cs_travellingPackets[i].draw(cs_animationCanvas.getContext("2d"));

    cs_router.draw(cs_animationCanvas.getContext("2d"));
    cs_server.draw(cs_animationCanvas.getContext("2d"));

    for (var j = 0; j < cs_clients.length; j++)
        cs_clients[j].draw(cs_animationCanvas.getContext("2d"));
}

function CS_reset(){
    cs_travellingPackets = [];
    cs_router.packetBuffer = [];
    cs_timerTick = 0;
    cs_currentClient = 0;
    cs_currentClientData = 0.0;
    cs_algorithm = "Round Robin";
    cs_hasntStartedYet = true;

    for (var j = 0; j < cs_clients.length; j++) {
        cs_clients[j].capturedPackets = [];
    }
}

function aglorithmSelectFunction(){
    if(cs_hasntStartedYet){
        var algoSelect = document.getElementById("cs_algorithm");
        cs_algorithm = algoSelect.options[algoSelect.selectedIndex].value;
    }
}