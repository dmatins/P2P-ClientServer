function drawText(context, x, y, size, color, text){
    context.font = size + "px Consolas";
    context.fillStyle = color;
    context.fillText(text, x, y);
}
// fileInfo is an array of objects that contain {color, proportion}
function drawFileBar(context, x, y, fileInfo){
    var currentY = y;
    var width = 5;
    var barSize = 50;
    var info;
    for (var i=0; i < fileInfo.length; i++) {
        info = fileInfo[i];
        var amountToFill = info.proportion * barSize;

        context.fillStyle = info.color;
        context.fillRect(x, currentY, width, amountToFill);
        currentY += amountToFill;
    }
    context.fillStyle = "grey";
    context.strokeRect(x, y, width, barSize);
}

function MyServer(x, y, type) {
    this.type = type;
    this.width = 60;
    this.height = 60;
    this.x = x;
    this.y = y;
    this.color = "orange";
    this.capturedPackets = [{color : this.color, proportion : 1.0}];
    this.draw = function(context) {
        var imageObj = new Image();
        imageObj.onload = function() {
        };
        imageObj.src = './images/database.png';
        context.drawImage(imageObj, this.x, this.y, this.width, this.height);

        drawFileBar(context, this.x - 8, this.y - 8, this.capturedPackets);

        drawText(context, this.x, this.y - 4, 13, "black", this.type);
    }
    this.sendPacket = function(destX, destY, dest) {
        return new MyPacket(this.color, this.x, this.y, destX, destY, this.type, dest);
    }
}

function MyClient(color, x, y, type) {
    this.type = type;
    this.color = color;
    this.width = 40;
    this.height = 40;
    this.x = x;
    this.y = y;
    this.capturedPackets = [];
    this.draw = function(context) {
        var imageObj = new Image();
        imageObj.onload = function() {
        };
        imageObj.src = './images/Computer.png';
        context.drawImage(imageObj, this.x, this.y, this.width, this.height);

        drawFileBar(context, this.x - 8, this.y - 8, this.capturedPackets);

        drawText(context, this.x, this.y - 4, 13, "black", this.type);
    }
    this.sendPacket = function(destX, destY, dest) {
        return new MyPacket(this.color, this.x, this.y, destX, destY, this.type, dest);
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
                        info.proportion += 0.01;
                        newPacket = false;
                    }
                }
                if(newPacket){
                    info = {};
                    info.color = obj.color;
                    info.proportion = 0.01;
                    this.capturedPackets.push(info);
                }
                return true;
            }
        }
    }
}

function MyRouterNet(x, y, links) {
    this.type = "router";
    this.width = 60;
    this.height = 50;
    this.x = x;
    this.y = y;
    this.packetBuffer = [];
    this.links = links;
    this.draw = function(context) {
        for (var l in this.links) {
            var link = links[l];
            context.beginPath();
            context.moveTo(link[0].x, link[0].y);
            context.lineTo(link[1].x, link[1].y);
            context.strokeStyle = "black";
            context.lineWidth = 1;
            context.stroke();
        }

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
                // this should be links instead of x,y
                var link = this.links[obj.dest];
                this.packetBuffer.push(new MyPacket(obj.color, link[0].x, link[0].y, link[1].x, link[1].y, this.type, obj.dest));
                return true;
            }
        }
    }
}

function MyPacket(color, x, y, destX, destY, from, dest) {
    this.dest = dest;
    this.from = from;
    this.color = color;
    this.width = 5;
    this.height = 5;
    this.x = x;
    this.y = y;
    this.destX = destX;
    this.desty = destY;
    this.draw = function(context) {
        context.fillStyle = this.color;
        context.fillRect(this.x, this.y, this.width, this.height);
    }
    this.updatePosition = function() {
        if(this.x != destX){
            if(this.x < destX)
                this.x = this.x + 1;
            else
                this.x = this.x - 1;
        } if(this.y != destY){
            if(this.y < destY)
                this.y = this.y + 1;
            else
                this.y = this.y - 1;
        }
    }
}
