/* Javascript for CPSXBlock. */
function CPSXBlock(runtime, element,data) {

    var handle;

    function updateUserName(result) {
        console.log("inside the updateUserName fucntion with the username value:"+result.s_name+","+result.username+","+result.user_id);
        console.log(result.s_id+","+result.user_id+","+result.emails)
        console.log(result.is_auth+","+result.is_staff+","+result.emails)
        TogetherJS.config("getUserName", function () {
            if(result.s_name== ""){
                    return result.username;
            }
        else{
                    return result.s_name;
             }
        });
        TogetherJS.config("suppressJoinConfirmation", function () {
          return true;
        });

        TogetherJS.reinitialize();

    }

    //function to update last online activity
    function updateLastActivity(){
        var handlerUrl = runtime.handlerUrl(element, 'updateLastOnline');
        $.ajax({
                type: "POST",
                url: handlerUrl,
                data: JSON.stringify({"hello": "world"}),
                success: function(result){
                    console.log("updating last online activity",result);
                },
                error: function (request, status, error) {
                    console.log(error);
                    console.log(status);
                    console.log(request.responseText);
                }
            });
    }

    function toggleButton(callback){
        // togetherjs is not running anymore
        if(TogetherJS.running){
            $("#btn-content").text("Collaborate with a partner")
            $("#collaborate").removeClass("button-error");
            $("#collaborate").removeClass("button-warning");
            $("#collaborate").addClass("button-success");


            console.log("disconnected");
            var handlerUrl = runtime.handlerUrl(element, 'removeFromUserPool');
            $.ajax({
                type: "POST",
                url: handlerUrl,
                data: JSON.stringify({"hello": "world"}),
                success: function(result){
                    console.log("remove from user PoolL",result);
                },
                error: function (request, status, error) {
                    console.log(error);
                    console.log(status);
                    console.log(request.responseText);
                }
            });
            clearInterval(handle);
            if(typeof getUserHandle !== 'undefined'){
                clearInterval(getUserHandle);
            }
            if(handle == 0){
                console.log("handle cleared");
            }else{
                console.log(handle);
            }
            callback(1);
        }
        else{ //together js has started running
            $("#btn-content").text("End collaboration")
            $("#collaborate").removeClass("button-success");
            $("#collaborate").removeClass("button-warning");
            $("#collaborate").addClass("button-error");
            callback(1);
        }

    }

    function enter_online_pool(){
        //add user to the online pool;
        console.log("connected");
        var handlerUrl = runtime.handlerUrl(element, 'addToUserPool');
        $.ajax({
            type: "POST",
            url: handlerUrl,
            data: JSON.stringify({"hello": "world"}),
            success: function(result){
                console.log("add to user PoolL",result);
            },
            error: function (request, status, error) {
                console.log(error);
                console.log(status);
                console.log(request.responseText);
            }
        });

        var handle = setInterval(updateLastActivity, 240000);
    }

    function pairMatch(user){
        console.log("inside pairmatch");
        var handlerUrl = runtime.handlerUrl(element, 'pair');
        $.ajax({
            type: "POST",
            url: handlerUrl,
            data: JSON.stringify({"partner": String(user)}),
            success: function(result){
                if(result){
                    console.log("here alo mi");
                    if(window.localStorage) {
                            var t_id = String(result.s_id+"."+result.s_session);
                            window.localStorage.setItem("togetherjs.room",{prefix:String(result.room),max:result.Group_size});
                            window.localStorage.setItem("togetherjs.identityId",t_id);
                            console.log("togetherjsID:"+window.localStorage.getItem("togetherjs.identityId"));
                            console.log(window.localStorage);
                    }
                    TogetherJS.config("findRoom",{prefix:String(result.room),max:result.Group_size});
                }
                else{
                    console.log("matching failed");
                }
            }
        });
    }

    function getAvailableUsers() {
        console.log("inside getAvailable");
        var handlerUrl = runtime.handlerUrl(element, 'getPartners');
        $.ajax({
            type: "POST",
            url: handlerUrl,
            data: JSON.stringify({"hello": "world"}),
            success: function(result){
                if(result){
                    console.log("partners:");
                    console.log(result[0]);
                    if(typeof getUserHandle !== 'undefined'){
                        clearInterval(getUserHandle);
                    }
                    pairMatch(result[0]);
                }
                else{
                    console.log("No room/partner available");
                }
            }
        });
    }

    function getRoom(callback){
        console.log("inside getRoom");
        var handlerUrl = runtime.handlerUrl(element, 'getRoom');
        $.ajax({
            type: "POST",
            url: handlerUrl,
            data: JSON.stringify({"hello": "world"}),
            success: function(result){
                if(result){
                    console.log("here alo mi");
                    if(window.localStorage) {
                            var t_id = String(result.s_id+"."+result.s_session);
                            window.localStorage.setItem("togetherjs.room",String(result.room));
                            window.localStorage.setItem("togetherjs.identityId",t_id);
                            console.log("togetherjsID:"+window.localStorage.getItem("togetherjs.identityId"));
                            console.log(window.localStorage);
                    }
                    TogetherJS.config("findRoom",{prefix:String(result.room),max:result.Group_size});
                    callback(true);
                }
                else{
                    console.log("matching failed");
                    callback(false);
                }
            }
        });
    }

    $('#collaborate').click(function(){
            toggleButton(function (res) {
                TogetherJS();
            });
            console.log("roooom:"+TogetherJS.config.get("findRoom"));
    });

    $("#enter_online_pool").click(function () {
        enter_online_pool();
    });

    $("#set_room_name").click(function () {
        console.log("here i am set room:");
        if(!TogetherJS.running){
            getRoom(function (res) {

                console.log("here i am _:"+res);
                if(!res){
                    getUserHandle = setInterval(getAvailableUsers,5000);
                }

            });
        }

    });

    function checkTogetherJsStatus(){

            if(TogetherJS.running){
                TogetherJSConfig_cloneClicks = false;
                TogetherJS.config("cloneClicks", function () {
                  return false;
                });
                TogetherJS.reinitialize();
                snackbar("Connected to a partner");
                $("#btn-content").text("End collaboration")
                $("#collaborate").removeClass("button-success");
                $("#collaborate").removeClass("button-warning");
                $("#collaborate").addClass("button-error");
            }else{
                snackbar("Not connected to anyone yet!");
                $("#btn-content").text("Collaborate with a partner")
                $("#collaborate").removeClass("button-error");
                $("#collaborate").removeClass("button-warning");
                $("#collaborate").addClass("button-success");
            }
    }

    function snackbar(message){
        $("#snackbar").addClass("show");
        $("#snackbar").text(message)
        setTimeout(function(){ $("#snackbar").removeClass("show"); }, 3000);
    }

    // function printCourseid(){
    //     var handlerUrl = runtime.handlerUrl(element, 'returnCourseId');
    //     $.ajax({
    //             type: "POST",
    //             url: handlerUrl,
    //             data: JSON.stringify({"hello": "world"}),
    //             success: function(result){
    //                 console.log("course_id:",result);
    //             },
    //             error: function (request, status, error) {
    //                 console.log(error);
    //                 console.log(status);
    //                 console.log(request.responseText);
    //             }
    //         });
    // }

    $(function ($) {
            //getAvailableUsers();
            setTimeout(checkTogetherJsStatus, 3000);
            // printCourseid();

            console.log(window.localStorage);

            console.log("collab_type:"+data.collab_type);
            if(data.collab_type !== "audio"){
                    TogetherJS.config("disableWebRTC", function () {
                          return true;
                        });
            }

            TogetherJS.config("suppressInvite", function () {
              return true;
            });
            TogetherJS.config("suppressJoinConfirmation", function () {
              return true;
            });
            TogetherJSConfig_cloneClicks = false;


            TogetherJS.config("cloneClicks", function () {
              return false;
            });

            TogetherJS.config("includeHashInUrl", function () {
              return true;
            });
            TogetherJS.config("dontShowClicks",function(){
            return true;
            });


            TogetherJSConfig_hubBase = "https://calm-escarpment-25279.herokuapp.com/";

            getRoom(function (res) {
                console.log("here i am _:"+res);
                            console.log("froom1:"+TogetherJS.config.get("findRoom"));

            });


            var handlerStudentUrl = runtime.handlerUrl(element, 'returnUserName');
            $.ajax({
                type: "POST",
                url: handlerStudentUrl,
                data: JSON.stringify({"hello": "world1"}),
                success: updateUserName,
                error: function (request, status, error) {
                    console.log(error);
                    console.log(status);
                    console.log(request.responseText);
                }
            });




    });



}
