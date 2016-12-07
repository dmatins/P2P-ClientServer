function drawText(context, x, y, size, color, text){
    context.font = size + "px Consolas";
    context.fillStyle = color;
    context.fillText(text, x, y);
}
// fileInfo is an array of objects that contain {color, proportion}
function drawFileBar(context, x, y, fileInfo){
    var currentY = y;
    var width = 7;
    var barSize = 50;
    var info;
    for (var i=0; i < fileInfo.length; i++) {
        info = fileInfo[i];
        var amountToFill = info.proportion * barSize;

        context.fillStyle = info.color;
        currentY = y + info.filePosition * barSize;
        context.fillRect(x, currentY, width, amountToFill);
    }
    context.fillStyle = "grey";
    context.strokeRect(x, y, width, barSize);
}

function drawPacketUploadBar(context, x, y, color, currentPercentage){
    var height = 3;
    var barSize = 20;
    context.fillStyle = color;
    context.fillRect(x, y, barSize * currentPercentage, height);
    context.fillStyle = "grey";
    context.strokeRect(x, y, barSize, height);
}

function adjustLink(link){
    var deltaX = link.destX - link.x,
        deltaY = link.destY - link.y,
        rad = - Math.atan2(deltaX,deltaY);;

    var dir = -8;

    link.x += dir*Math.cos(rad);
    link.destX += dir*Math.cos(rad);
    link.y += dir*Math.sin(rad);
    link.destY += dir*Math.sin(rad);

    return link;
}

function MyServer(x, y, type) {
    this.type = type;
    this.width = 60;
    this.height = 60;
    this.x = x;
    this.y = y;
    this.color = "orange";
    this.link;
    this.algorithm = "Round Robin";
    this.uploadSpeed = 10;
    this.currentClient = 0;
    this.totalDataSent = 0.0;
    this.fileSize = 1.0;
    this.clients = [{type: "Client-1", dataAmount: 0.0},
     {type: "Client-2", dataAmount: 0.0},
     {type: "Client-3", dataAmount: 0.0},
     {type: "Client-4", dataAmount: 0.0},
     {type: "Client-5", dataAmount: 0.0}];
    this.currentPacketUploadAmount = 0;
    this.capturedPackets = [{color : this.color, proportion : 1.0, filePosition : 0.0}];
    this.updateLink = function(link){
        this.link = link;
    }
    this.draw = function(context) {
        var imageObj = new Image();
        imageObj.onload = function() {
        };
        imageObj.src = './images/database.png';
        context.drawImage(imageObj, this.x, this.y, this.width, this.height);

        drawFileBar(context, this.x - 10, this.y, this.capturedPackets);

        drawText(context, this.x, this.y - 4, 13, "black", this.type);

        context.fillStyle = this.color;
        context.fillRect(this.x + this.width, this.y, 10, 10);

        drawPacketUploadBar(context, this.x, this.y + this.height + 2, this.color, this.currentPacketUploadAmount / this.uploadSpeed);
    }
    this.sendPacket = function() {
        var packet = null;
        if(this.currentClient < this.clients.length && this.totalDataSent < (this.fileSize * this.clients.length)){
            this.currentPacketUploadAmount++;
            if(this.currentPacketUploadAmount >= this.uploadSpeed){
                this.currentPacketUploadAmount = 0;
                if(this.algorithm === "Round Robin"){
                    packet = new MyPacket(this.color, this.link, this.type, this.clients[this.currentClient].type, 0.0, 0.01);
                    this.clients[this.currentClient].dataAmount += packet.packetSize;
                    this.totalDataSent += packet.packetSize;
                    this.currentClient = (this.currentClient + 1) % 5;
                }else{
                    packet = new MyPacket(this.color, this.link, this.type, this.clients[this.currentClient].type, 0.0, 0.01);
                    this.clients[this.currentClient].dataAmount += packet.packetSize;
                    this.totalDataSent += packet.packetSize;
                    if(this.clients[this.currentClient].dataAmount >= this.fileSize){
                        this.currentClient++;
                    }
                }
            }
        }
        return packet;
    }
    this.reset = function(){
        this.currentClient = 0;
        this.totalDataSent = 0.0;
        this.currentPacketUploadAmount = 0;
        this.clients = [{type: "Client-1", dataAmount: 0.0}, 
        {type: "Client-2", dataAmount: 0.0}, 
        {type: "Client-3", dataAmount: 0.0},
        {type: "Client-4", dataAmount: 0.0}, 
        {type: "Client-5", dataAmount: 0.0}];
        this.algorithm = "Round Robin";
    }
}

function MyClient(color, x, y, type) {
    this.type = type;
    this.color = color;
    this.width = 40;
    this.height = 40;
    this.x = x;
    this.y = y;
    this.link;
    this.fileSize = 1.0;
    this.capturedPackets = [];
    this.draw = function(context) {
        var imageObj = new Image();
        imageObj.onload = function() {
        };
        imageObj.src = './images/Computer.png';
        context.drawImage(imageObj, this.x, this.y, this.width, this.height);

        if(this.type === "Client-4" || this.type === "Client-5")
            drawFileBar(context, this.x + this.width + 8, this.y - 8, this.capturedPackets);
        else 
            drawFileBar(context, this.x - 10, this.y - 8, this.capturedPackets);

        drawText(context, this.x, this.y - 4, 13, "black", this.type);

        context.fillStyle = this.color;
        context.fillRect(this.x + this.width/2 - 5, this.y + this.height, 10, 10);
    }
    this.updateLink = function(link){
        this.link = link;
    }
    this.detectCollision = function(obj) {
        if(obj == null || obj.from === this.type)
            return false;
        if((this.x <= obj.x && obj.x <= this.x + this.width) || (this.x >= obj.x && this.x <= obj.x + obj.width)){
            if((this.y <= obj.y && obj.y <= this.y + this.height) || (this.y >= obj.y && this.y <= obj.y + obj.height)){
                var newPacket = true;
                var info;
                for (var i=0; i < this.capturedPackets.length; i++) {
                    info = this.capturedPackets[i];
                    if(info.color === obj.color){
                        info.proportion += (obj.packetSize / this.fileSize);
                        newPacket = false;
                    }
                }
                if(newPacket){
                    info = {};
                    info.color = obj.color;
                    info.proportion = obj.packetSize / this.fileSize;
                    info.filePosition = obj.filePosition;
                    this.capturedPackets.push(info);
                }
                return true;
            }
        }
    }
}

function MyP2PServer(x, y, type, fileInfo) {
    this.type = type;
    this.width = 60;
    this.height = 60;
    this.x = x;
    this.y = y;
    this.color = "orange";
    this.link;
    this.currentClient = 0;
    this.totalSentClientData = 0.0;
    this.currentClientPacketNumber = 0;
    this.uploadSpeed = 10;
    this.currentPacketUploadAmount = 0;
    this.capturedPackets = [{color : this.color, proportion : 1.0, filePosition : 0.0}];
    this.fileInfo = fileInfo;
    this.fileSize = 1.0;
    this.clients = ["Client-1","Client-2","Client-3","Client-4","Client-5"];
    this.updateLink = function(link){
        this.link = link;
    }
    this.draw = function(context) {
        var imageObj = new Image();
        imageObj.onload = function() {
        };
        imageObj.src = './images/database.png';
        context.drawImage(imageObj, this.x, this.y, this.width, this.height);

        drawFileBar(context, this.x - 10, this.y, this.capturedPackets);

        drawText(context, this.x, this.y - 4, 13, "black", this.type);

        context.fillStyle = this.color;
        context.fillRect(this.x + this.width, this.y, 10, 10);

        drawPacketUploadBar(context, this.x, this.y + this.height + 2, this.color, this.currentPacketUploadAmount / this.uploadSpeed);
    }
    this.sendPacket = function() {
        var packet = null;
        if(this.totalSentClientData < this.fileSize){
            this.currentPacketUploadAmount++;
            if(this.currentPacketUploadAmount >= this.uploadSpeed){
                this.currentPacketUploadAmount = 0;
                var currentClientFileInfo = this.fileInfo[this.clients[this.currentClient]];
                var count = 0;
                while(!((currentClientFileInfo.filePercentage * this.fileSize) > currentClientFileInfo.fileAmountSent && this.currentClientPacketNumber < currentClientFileInfo.filePercentage*10)){
                    this.currentClient = (this.currentClient + 1) % 5;
                    this.currentClientPacketNumber = 0;
                    currentClientFileInfo = this.fileInfo[this.clients[this.currentClient]];
                    count++;
                    if(count >= 5){
                        this.currentClientPacketNumber = 0;
                        this.currentPacketUploadAmount = 0;
                        break;
                    }
                }
                if((currentClientFileInfo.filePercentage * this.fileSize) > currentClientFileInfo.fileAmountSent && this.currentClientPacketNumber < currentClientFileInfo.filePercentage*10){
                    var destination = this.clients[this.currentClient];
                    packet = new MyPacket(this.color, this.link, this.type, destination, this.fileInfo[destination].filePosition, Math.min(0.01, (currentClientFileInfo.filePercentage * this.fileSize) - currentClientFileInfo.fileAmountSent));
                    this.totalSentClientData += packet.packetSize;
                    currentClientFileInfo.fileAmountSent += packet.packetSize;
                    this.currentClientPacketNumber++;
                }else{
                    this.totalSentClientData = this.fileSize
                    this.currentClient = 0;
                    this.currentClientPacketNumber = 0;
                    this.currentPacketUploadAmount = 0;
                }
            }
        }
        return packet;
    }
    this.reset = function(){
        this.currentClient = 0;
        this.totalSentClientData = 0.0;
        this.currentClientPacketNumber = 0;
        this.currentPacketUploadAmount = 0;
    }
}

function MyP2PClient(color, x, y, type) {
    this.type = type;
    this.color = color;
    this.width = 40;
    this.height = 40;
    this.x = x;
    this.y = y;
    this.link;
    this.uploadSpeed = 10;
    this.fileSize = 1.0;
    this.currentPacketUploadAmount = 0;
    this.packetBuffer = [];
    this.capturedPackets = [];
    this.clients = ["Client-1","Client-2","Client-3","Client-4","Client-5"];
    this.draw = function(context) {
        var imageObj = new Image();
        imageObj.onload = function() {
        };
        imageObj.src = './images/Computer.png';
        context.drawImage(imageObj, this.x, this.y, this.width, this.height);

        if(this.type === "Client-4" || this.type === "Client-5")
            drawFileBar(context, this.x + this.width + 8, this.y - 8, this.capturedPackets);
        else 
            drawFileBar(context, this.x - 10, this.y - 8, this.capturedPackets);

        drawText(context, this.x, this.y - 4, 13, "black", this.type);

        context.fillStyle = this.color;
        context.fillRect(this.x + this.width/2 - 5, this.y + this.height, 10, 10);

        drawPacketUploadBar(context, this.x + 4, this.y + this.height - 6, this.color, this.currentPacketUploadAmount / this.uploadSpeed);
    }
    this.updateLink = function(link){
        this.link = link;
    }
    this.sendPacket = function() {
        var pack = this.packetBuffer[this.packetBuffer.length-1];
        if(pack == null)
            return null;
        else {
            var packet = null
            this.currentPacketUploadAmount++;
            if(this.currentPacketUploadAmount >= this.uploadSpeed){
                this.currentPacketUploadAmount = 0;
                this.packetBuffer.pop();
                packet = new MyPacket(this.color, this.link, this.type, pack.dest, pack.filePosition, pack.packetSize);
            }
            return packet;
        }
    }
    this.detectCollision = function(obj) {
        if(obj == null || obj.from === this.type)
            return false;
        if((this.x <= obj.x && obj.x <= this.x + this.width) || (this.x >= obj.x && this.x <= obj.x + obj.width)){
            if((this.y <= obj.y && obj.y <= this.y + this.height) || (this.y >= obj.y && this.y <= obj.y + obj.height)){
                var newPacket = true;
                var info;
                for (var i=0; i < this.capturedPackets.length; i++) {
                    info = this.capturedPackets[i];
                    if(info.color === obj.color){
                        info.proportion += (obj.packetSize / this.fileSize);
                        newPacket = false;
                    }
                }
                if(newPacket){
                    info = {};
                    info.color = obj.color;
                    info.proportion = (obj.packetSize / this.fileSize);
                    info.filePosition = obj.filePosition;
                    this.capturedPackets.push(info);
                }
                if(obj.originallyFrom === "Server"){
                    for (var j = 0; j < this.clients.length; j++) {
                        if(this.clients[j] !== this.type){
                            info = {};
                            info.filePosition = obj.filePosition;
                            info.packetSize = obj.packetSize;
                            info.dest = this.clients[j];
                            this.packetBuffer.push(info);
                        }
                    }
                }
                return true;
            }
        }
    }
    this.reset = function(){
        this.currentPacketUploadAmount = 0;
        this.packetBuffer = [];
        this.capturedPackets = [];
    }
}

function MyRouterNet(x, y) {
    this.type = "router";
    this.width = 60;
    this.height = 50;
    this.x = x;
    this.y = y;
    this.packetBuffer = [];
    this.links = [];
    this.updateLinks = function(links){
        for(var l in links)
            this.links[l] = adjustLink(new MyLink(links[l].x, links[l].y, links[l].destX, links[l].destY));
    }
    this.draw = function(context) {
        var imageObj = new Image();
        imageObj.onload = function() {
        };
        imageObj.src = './images/router.png';
        context.drawImage(imageObj, this.x, this.y, this.width, this.height);

        drawText(context, this.x - 5, this.y - 4, 13, "black", "Router Network");
    }
    this.route = function(obj) {
        if(obj == null || obj.from === this.type)
            return false;
        if((this.x <= obj.x && obj.x <= this.x + this.width) || (this.x >= obj.x && this.x <= obj.x + obj.width)){
            if((this.y <= obj.y && obj.y <= this.y + this.height) || (this.y >= obj.y && this.y <= obj.y + obj.height)){
                var link = this.links[obj.dest];
                var packet = new MyPacket(obj.color, link, this.type, obj.dest, obj.filePosition, obj.packetSize);
                packet.originallyFrom = obj.from;
                this.packetBuffer.push(packet);
                return true;
            }
        }
    }
}

function MyPacket(color, link, from, dest, filePosition, packetSize) {
    this.dest = dest;
    this.from = from;
    this.originallyFrom = from;
    this.packetSize = packetSize;
    this.filePosition = filePosition;
    this.color = color;
    this.width = 6;
    this.height = 6;
    this.x = link.x;
    this.y = link.y;
    this.speed = 5.0;
    this.destX = link.destX;
    this.destY = link.destY;
    this.draw = function(context) {
        context.fillStyle = this.color;
        context.fillRect(this.x, this.y, this.width, this.height);
    }
    this.updatePosition = function() {
        var deltaX = this.destX - this.x,
        deltaY = this.destY - this.y,
        rad = Math.atan2(deltaY,deltaX);;

        this.x += Math.cos(rad) * this.speed;
        this.y += Math.sin(rad) * this.speed;
    }
}

function MyLink(x, y, destX, destY) {
    this.x = x;
    this.y = y;
    this.destX = destX;
    this.destY = destY;
    this.draw = function(context) {
        context.beginPath();
        context.moveTo(this.x, this.y);
        context.lineTo(this.destX, this.destY);
        context.strokeStyle = "black";
        context.lineWidth = 1;
        context.stroke();
    }
}
