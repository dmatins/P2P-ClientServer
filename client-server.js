var cs_travellingPackets = [];
var cs_server;
var cs_router;
var cs_links = {};
var cs_clients = [];
var cs_timerTick = 0;
var cs_hasntStartedYet = true;
var cs_tooltip = {display : false, x : 0, y: 0, source : "", dest : ""};


function CS_start() {
    cs_clients.push(new MyClient("red", 35, 120, "Client-1"));
    cs_clients.push(new MyClient("green", 100, 290, "Client-2"));
    cs_clients.push(new MyClient("purple", 235, 350, "Client-3"));
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
    cs_animationCanvas.addEventListener('mousemove', function(e) {
        cs_tooltip.display = false;
        var rect = cs_animationCanvas.getBoundingClientRect();
        var x = e.clientX - rect.left;
        var y = e.clientY - rect.top;

        for (var i = 0; i < cs_travellingPackets.length; i++) {
            var pak = cs_travellingPackets[i];
            if(pak.x < x && pak.x + pak.width > x  &&  pak.y < y && pak.y + pak.height > y){
                cs_tooltip.x = x;
                cs_tooltip.y = y;
                cs_tooltip.source = "Source: " + pak.originallyFrom;
                cs_tooltip.dest = "Destination: " + pak.dest;
                cs_tooltip.display = true;
                return;
            }
        }
    }, 0);
    setInterval(cs_updateAnimation, 10);
}

function cs_updateAnimation() {
    cs_animationCanvas.getContext("2d").clearRect(0, 0, cs_animationCanvas.width, cs_animationCanvas.height);

    if(isRunning){
        cs_timerTick++;
        if(cs_hasntStartedYet){
            var algoSelect = document.getElementById("cs_algorithm");
            cs_server.algorithm = algoSelect.options[algoSelect.selectedIndex].value;

            var dropdown = document.getElementById("cs_serverUploadSpeed");
            var serverUpload = parseInt(dropdown.options[dropdown.selectedIndex].value);
            cs_server.uploadSpeed = (1/serverUpload) * 30;

            dropdown = document.getElementById("cs_fileSize");
            var fileSize = parseInt(dropdown.options[dropdown.selectedIndex].value);
            cs_server.fileSize = fileSize;

            for (var j = 0; j < cs_clients.length; j++) {
                cs_clients[j].fileSize = fileSize;
            }
        }
        cs_hasntStartedYet = false;

        var packet = cs_server.sendPacket();
        if(packet !== null)
            cs_travellingPackets.push(packet);

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

    if(cs_tooltip.display){
        var cs_context = cs_animationCanvas.getContext("2d");
        cs_context.fillStyle = '#ddd';
        cs_context.fillRect(cs_tooltip.x + 10, cs_tooltip.y + 10, 120, 45);
        cs_context.fillStyle = '#000';
        cs_context.strokeRect(cs_tooltip.x + 10, cs_tooltip.y + 10, 120, 45);
        cs_context.font = "bold 10px Consolas";
        cs_context.fillText("Packet", cs_tooltip.x + 20, cs_tooltip.y + 25, 100);
        cs_context.fillText(cs_tooltip.source, cs_tooltip.x + 20, cs_tooltip.y + 35, 100);
        cs_context.fillText(cs_tooltip.dest, cs_tooltip.x + 20, cs_tooltip.y + 45, 100);
    }
}

function CS_reset(){
    cs_travellingPackets = [];
    cs_router.packetBuffer = [];
    cs_timerTick = 0;
    cs_server.reset();
    cs_hasntStartedYet = true;
    cs_tooltip = {display : false, x : 0, y: 0, source : "", dest : ""};

    for (var j = 0; j < cs_clients.length; j++) {
        cs_clients[j].capturedPackets = [];
    }
}