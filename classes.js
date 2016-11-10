function drawText(context, x, y, size, color, text){
    context.font = size + "px Consolas";
    context.fillStyle = color;
    context.fillText(text, x, y);
}

function drawFileBar(context, x, y, packets){
    var currentY = y;
    var width;
    for (i=0; i < packets.length; i++) {
        context.fillStyle = packets[i].color;
        context.fillRect(x, currentY, packets[i].width, packets[i].height);
        currentY += packets[i].height;
        width = packets[i].width;
    }
    context.fillStyle = "grey";
    context.strokeRect(x, y, width, currentY - y);
}

function MyServer(x, y, type) {
    this.type = type;
    this.width = 60;
    this.height = 60;
    this.x = x;
    this.y = y;
    this.color = "orange";
    this.capturedPackets = [];
    this.draw = function(context) {
        //context.fillStyle = this.color;
        //context.fillRect(this.x, this.y, this.width, this.height);
        var imageObj = new Image();
        imageObj.onload = function() {
        };
        imageObj.src = './images/database.png';
        context.drawImage(imageObj, this.x, this.y, this.width, this.height);

        drawFileBar(context, this.x - 8, this.y - 8, this.capturedPackets);

        drawText(context, this.x, this.y - 4, 13, "black", this.type);
    }
    this.sendPacket = function(destX, destY) {
        return new MyPacket(this.color, this.x, this.y, destX, destY, this.type);
    }
    this.detectCollision = function(obj) {
        if(obj.type === this.type)
            return false;
        if((this.x <= obj.x && obj.x <= this.x + this.width) || (this.x >= obj.x && this.x <= obj.x + obj.width)){
            if((this.y <= obj.y && obj.y <= this.y + this.height) || (this.y >= obj.y && this.y <= obj.y + obj.height)){
                this.capturedPackets.push(obj);
                return true;
            }
        }
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
        //context.fillStyle = this.color;
        //context.fillRect(this.x, this.y, this.width, this.height);

        var imageObj = new Image();
        imageObj.onload = function() {
        };
        imageObj.src = './images/Computer.png';
        context.drawImage(imageObj, this.x, this.y, this.width, this.height);

        drawFileBar(context, this.x - 8, this.y - 8, this.capturedPackets);

        drawText(context, this.x, this.y - 4, 13, "black", this.type);
    }
    this.sendPacket = function(destX, destY) {
        return new MyPacket(this.color, this.x, this.y, destX, destY, this.type);
    }
    this.detectCollision = function(obj) {
        if(obj.type === this.type)
            return false;
        if((this.x <= obj.x && obj.x <= this.x + this.width) || (this.x >= obj.x && this.x <= obj.x + obj.width)){
            if((this.y <= obj.y && obj.y <= this.y + this.height) || (this.y >= obj.y && this.y <= obj.y + obj.height)){
                this.capturedPackets.push(obj);
                return true;
            }
        }
    }
}

function MyPacket(color, x, y, destX, destY, type) {
    this.type = type;
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
    this.detectCollision = function(obj) {
        return false;
    }
}
