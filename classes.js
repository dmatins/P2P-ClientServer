function drawText(context, x, y, size, color, text){
    context.font = size + "px Consolas";
    context.fillStyle = color;
    context.fillText(text, x, y);
}

function MyServer(x, y) {
    this.type = "server";
    this.width = 40;
    this.height = 40;
    this.x = x;
    this.y = y;
    this.color = "orange";
    this.draw = function(context) {
        context.fillStyle = this.color;
        context.fillRect(this.x, this.y, this.width, this.height);

        drawText(context, this.x, this.y, 10, "black", "Server");
    }
    this.sendPacket = function(destX, destY) {
        return new MyPacket(this.color, this.x, this.y, destX, destY);
    }
    this.detectCollision = function(obj) {
        return false;
    }
}

function MyClient(color, x, y) {
    this.type = "client";
    this.color = color;
    this.width = 20;
    this.height = 20;
    this.x = x;
    this.y = y;
    this.draw = function(context) {      
        context.fillStyle = this.color;
        context.fillRect(this.x, this.y, this.width, this.height);

        drawText(context, this.x, this.y, 10, "black", "Client");
    }
    this.sendPacket = function(destX, destY) {
        return new MyPacket(this.color, this.x, this.y, destX, destY);
    }
    this.detectCollision = function(obj) {
        return false;
    }
}

function MyPacket(color, x, y, destX, destY) {
    this.type = "packet";
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