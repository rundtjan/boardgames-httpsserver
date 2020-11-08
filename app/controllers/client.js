$(document).ready(function(){

    var relX
    var relY
    var toBeMoved;
    var highestZ = 0
    var pieces = ["red", "blue", "white", "green", "black", "orangered", "yellow", "violet"]
    var game = window.location.href.substring(window.location.href.lastIndexOf('/') + 1)
    var json = {"antal": 4, "red": "80px,25px", "blue": "120px,100px", "green": "100px,130px", "white": "60px,55px", "black": "30px,80px", "orangered": "60px,140px", "yellow": "70px,90px", "violet": "125px,20px"};
    var upToDate = false;
    $("#blackpiece, #blackpieceoverlay, #orangeredpiece, #orangeredpieceoverlay, #yellowpiece, #yellowpieceoverlay, #violetpiece, #violetpieceoverlay").css("display", "none")
    var socket = io();
    socket.emit("join", game);
    socket.on("dice", function (arr) {
        //console.log("recieved arr", arr)
        animateDice(JSON.parse(arr))
      });
    socket.on("move", function (updateJson) {
        if (!upToDate) upToDate = true
        //console.log("recieved json", updateJson)
        update(JSON.parse(updateJson))
      });
    socket.on("help", function (id) {
        socket.emit("helping", id, JSON.stringify(json));
    });
    socket.on('mera', more)
    socket.on('mindre', less)

    pieces.forEach(function(elem){
        $("#" + elem +"piece, #" + elem + "pieceoverlay").animate({left: json[elem].split(",")[0], top: json[elem].split(",")[1]})
    })

    $("#mera").click(function(){
        more()
        socket.emit("mera", game)
    })

    function more(){
        var antal = parseInt($("#antal").html())
        if (antal < 8) antal++
        $("#antal").html(antal)
        json.antal = antal
        $("#" + pieces[antal-1] + "piece, #" + pieces[antal-1] + "pieceoverlay").css("display", "block")
    }

    $("#mindre").click(function(){
        less()
        socket.emit("mindre", game)
    })

    function less(){
        var antal = parseInt($("#antal").html())
        if (antal > 1) antal--
        $("#antal").html(antal)
        json.antal = antal
        $("#" + pieces[antal] + "piece, #" + pieces[antal] + "pieceoverlay").css("display", "none")
    }
    
     
    function checkTouchDevice() {
       return 'ontouchstart' in document.documentElement;
    }
    
    var isTouchScreen = checkTouchDevice()
    
    if (!isTouchScreen){
    $("#board").mousemove(function(event){ 
                event.preventDefault()
                relX = Math.round(event.pageX - $(this).offset().left);
                relY = Math.round(event.pageY - $(this).offset().top);
                var offset = 16
                $("#"+toBeMoved).css("top", relY-offset +"px")
                $("#"+toBeMoved).css("left", relX-offset +"px")
                $("#"+toBeMoved + "overlay").css("top", relY-offset +"px")
                $("#"+toBeMoved + "overlay").css("left", relX-offset +"px")
    
            });
    } else {
        $("#board").on('touchmove', function(event){ 
                if (toBeMoved){
                event.preventDefault()
                }
                //alert("anything")
                relX = Math.round(event.pageX - $(this).offset().left);
                relY = Math.round(event.pageY - $(this).offset().top);
                //console.log(relX, relY)
                var bcr = document.getElementById("board").getBoundingClientRect();
                console.log(event.target.id)
                var x = event.targetTouches[0].clientX - bcr.x;
                var y = event.targetTouches[0].clientY - bcr.y;
                console.log("x, y", x, y)
                console.log(/*bcr.x,bcr.y, */event.targetTouches[0].clientX, event.targetTouches[0].clientY)
                console.log("should be static", bcr.x, bcr.y)
                $("#"+toBeMoved).css("top", y-7 +"px")
                $("#"+toBeMoved).css("left", x-7 +"px")
                $("#"+toBeMoved + "overlay").css("top", y-7 +"px")
                $("#"+toBeMoved + "overlay").css("left", x-7 +"px")
    
            });
    }
    
    if (!isTouchScreen){
        $(".pieceoverlay").on("mousedown", function(e){
            move(e.target.id.split("overl")[0])
        })
        $(".pieceoverlay").on("mouseup", function(e){
            move(e.target.id.split("overl")[0])
        })
    } else {
        $(".pieceoverlay").on("touchstart", function(e){
            move(e.target.id.split("overl")[0])
        })
        $(".pieceoverlay").on("touchend", function(e){
            move(e.target.id.split("overl")[0])
        })
    }

    $(".room").click(function(e){
        console.log(e.target.id)
        switch(e.target.id){
            case "room1":
                window.location.href = "/1loekq1";
                break;
            case "room2":
                window.location.href = "/3kuduwk";
                break;              
            case "room3":
                window.location.href = "/883kauej";
                break;
            case "room4":
                window.location.href = "/fsdaiw23"; 
                break;   
            }
    })
            
    function move(id){
                //console.log(id)
                if (id.length < 3){return}
                if (toBeMoved === undefined){
                     toBeMoved = id
                     highestZ++
                     $("#" + id).css("z-index", highestZ)
                     $("#" + id + "overlay").css("z-index", highestZ)
                } else {
                    var posString = $("#" + id).css("left")+","+$("#" + id).css("top")
                    json[id.split("pie")[0]] = posString
                    //console.log(json)
                    socket.emit("move", game, JSON.stringify(json));
                    toBeMoved = undefined
                }
    }

    $("#kasta").click(kasta)
    
    function kasta(){
        var values = [1,2,3,4,5,6]
        var value
        var valueArr = []
        for (var i = 0; i < 20; i++){
        value = values[Math.floor(Math.random()*6)]
        valueArr.push(value)   
        }
        animateDice(valueArr)
        socket.emit("dice", game, JSON.stringify(valueArr));
    }

    function animateDice(arr){
        for (var i = 0; i < arr.length; i++){
        setTimeout(function(){$("#thedice").attr("src", "/public/img/dice" + arr[0] + ".jpg"); arr.shift()}, i*80)
        }
    }

    function update(updateJson){
        pieces.forEach(function(elem){
            if (json[elem] != updateJson[elem]){
                //  console.log("gotta move " + elem)
                $("#" + elem +"piece, #" + elem + "pieceoverlay").animate({left: updateJson[elem].split(",")[0], top: updateJson[elem].split(",")[1]})
            }
        })
        if (json.antal != updateJson.antal){
            while (json.antal > updateJson.antal){
                less()
            }
            while (json.antal < updateJson.antal){
                more()
            }
        }
        json = updateJson
    }
            
    });

   