var p2p_travellingPackets = [];
var p2p_server;
var p2p_router;
var p2p_links = {};
var p2p_clients = [];
var p2p_timerTick = 0;
var p2p_hasntStartedYet = true;
var p2p_tooltip = {display : false, x : 0, y: 0, source : "", dest : ""};

function P2P_start() {
    p2p_clients.push(new MyP2PClient("red", 35, 120, "Client-1"));
    p2p_clients.push(new MyP2PClient("green", 100, 290, "Client-2"));
    p2p_clients.push(new MyP2PClient("purple", 235, 350, "Client-3"));
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

    p2p_router.updateLinks(p2p_links);

    p2p_animationCanvas = document.getElementById("P2P_Canvas");
    p2p_animationCanvas.addEventListener('mousemove', function(e) {
        p2p_tooltip.display = false;
        var x = e.pageX - p2p_animationCanvas.offsetLeft;
        var y = e.pageY - p2p_animationCanvas.offsetTop;

        for (var i = 0; i < p2p_travellingPackets.length; i++) {
            var pak = p2p_travellingPackets[i];
            if(pak.x < x && pak.x + pak.width > x  &&  pak.y < y && pak.y + pak.height > y){
                p2p_tooltip.x = x;
                p2p_tooltip.y = y;
                p2p_tooltip.source = "Source: " + pak.originallyFrom;
                p2p_tooltip.dest = "Destination: " + pak.dest;
                p2p_tooltip.display = true;
                return;
            }
        }
    }, 0);

    setInterval(p2p_updateAnimation, 20);
}

function p2p_updateAnimation() {
    p2p_animationCanvas.getContext("2d").clearRect(0, 0, p2p_animationCanvas.width, p2p_animationCanvas.height);

    if(isRunning){
        p2p_timerTick += 1;

        if(p2p_hasntStartedYet){
            var fileInfo = {"Client-1" : {fileAmountSent : 0.0, filePercentage : 0.0, filePosition : 0.0, retransmit: true}, 
            "Client-2" : {fileAmountSent : 0.0, filePercentage : 0.0, filePosition : 0.0, retransmit: true},
            "Client-3" : {fileAmountSent : 0.0, filePercentage : 0.0, filePosition : 0.0, retransmit: true},
            "Client-4" : {fileAmountSent : 0.0, filePercentage : 0.0, filePosition : 0.0, retransmit: true},
            "Client-5" : {fileAmountSent : 0.0, filePercentage : 0.0, filePosition : 0.0, retransmit: true},
            "Server" : { isTheServerHandlingExtra : false,
                clients : {"Client-1" : {fileAmountSent : 0.0, filePercentage : 0.0, filePosition : 0.0, retransmit: false}, 
                "Client-2" : {fileAmountSent : 0.0, filePercentage : 0.0, filePosition : 0.0, retransmit: false},
                "Client-3" : {fileAmountSent : 0.0, filePercentage : 0.0, filePosition : 0.0, retransmit: false},
                "Client-4" : {fileAmountSent : 0.0, filePercentage : 0.0, filePosition : 0.0, retransmit: false},
                "Client-5" : {fileAmountSent : 0.0, filePercentage : 0.0, filePosition : 0.0, retransmit: false}}}};

            var dropdown = document.getElementById("p2p_fileSize");
            var fileSize = parseInt(dropdown.options[dropdown.selectedIndex].value);
            p2p_server.fileSize = fileSize;

            dropdown = document.getElementById("p2p_serverUploadSpeed");
            var serverUpload = parseInt(dropdown.options[dropdown.selectedIndex].value);
            p2p_server.uploadSpeed = (1/serverUpload) * 15;

            var totalClientUploads = 0;
            for (var j = 0; j < p2p_clients.length; j++) {
                dropdown = document.getElementById("p2p_client-"+ (j + 1) +"speed");
                totalClientUploads += parseInt(dropdown.options[dropdown.selectedIndex].value);
            }

            if(serverUpload > (totalClientUploads + serverUpload)/ (p2p_clients.length + 1)){
                fileInfo["Server"].isTheServerHandlingExtra = true;
                var serverFilePercentage = (serverUpload - ((totalClientUploads + serverUpload)/p2p_clients.length)) / p2p_clients.length;

                var currentFilePosition = 0.0;
                for (var j = 0; j < p2p_clients.length; j++) {
                    dropdown = document.getElementById("p2p_client-"+ (j + 1) +"speed");
                    var clientUpload = parseInt(dropdown.options[dropdown.selectedIndex].value);

                    p2p_clients[j].uploadSpeed = (1/clientUpload) * 15;
                    p2p_clients[j].fileSize = fileSize;
                    fileInfo["Client-"+ (j+1)].filePercentage = (clientUpload/(totalClientUploads)) * (1.0 - serverFilePercentage);
                    fileInfo["Client-"+ (j+1)].filePosition = currentFilePosition;
                    currentFilePosition += (clientUpload/(totalClientUploads)) * (1.0 - serverFilePercentage);
                }
                for (var j = 0; j < p2p_clients.length; j++) {
                    p2p_server.fileExtra += serverFilePercentage;
                    fileInfo["Server"].clients["Client-"+ (j+1)].filePercentage = serverFilePercentage;
                    fileInfo["Server"].clients["Client-"+ (j+1)].filePosition = currentFilePosition;
                }
            } else{
                var currentFilePosition = 0.0;
                for (var j = 0; j < p2p_clients.length; j++) {
                    dropdown = document.getElementById("p2p_client-"+ (j + 1) +"speed");
                    var clientUpload = parseInt(dropdown.options[dropdown.selectedIndex].value);

                    p2p_clients[j].uploadSpeed = (1/clientUpload) * 15;
                    p2p_clients[j].fileSize = fileSize;
                    fileInfo["Client-"+ (j+1)].filePercentage = clientUpload/totalClientUploads;
                    fileInfo["Client-"+ (j+1)].filePosition = currentFilePosition;
                    currentFilePosition += clientUpload/totalClientUploads;
                }
            }

            p2p_server.fileInfo = fileInfo;
        }
        p2p_hasntStartedYet = false;

        var packet = p2p_server.sendPacket();
        if(packet !== null)
            p2p_travellingPackets.push(packet);

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

    if(p2p_tooltip.display){
        var p2p_context = p2p_animationCanvas.getContext("2d");
        p2p_context.fillStyle = '#ddd';
        p2p_context.fillRect(p2p_tooltip.x + 10, p2p_tooltip.y + 10, 120, 45);
        p2p_context.fillStyle = '#000';
        p2p_context.strokeRect(p2p_tooltip.x + 10, p2p_tooltip.y + 10, 120, 45);
        p2p_context.font = "bold 10px Consolas";
        p2p_context.fillText("Packet", p2p_tooltip.x + 20, p2p_tooltip.y + 25, 100);
        p2p_context.fillText(p2p_tooltip.source, p2p_tooltip.x + 20, p2p_tooltip.y + 35, 100);
        p2p_context.fillText(p2p_tooltip.dest, p2p_tooltip.x + 20, p2p_tooltip.y + 45, 100);
    }
}

function P2P_reset(){
    p2p_travellingPackets = [];
    p2p_router.packetBuffer = [];
    p2p_timerTick = 0;
    p2p_server.reset();
    p2p_hasntStartedYet = true;
    p2p_tooltip = {display : false, x : 0, y: 0, source : "", dest : ""};

    for (var j = 0; j < p2p_clients.length; j++) {
        (p2p_clients[j]).reset();
    }
}