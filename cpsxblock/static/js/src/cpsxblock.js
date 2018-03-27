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
            $("#btn-content").text("Collaborate with a partner");
            $("#find_partner").text("CPSX - Find partner");
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
            updateToDefaultCohort();
            callback(1);
        }
        else{ //together js has started running
            TogetherJS.config("findRoom",window.localStorage.getItem("togetherjs.room"));
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
                    snackbar("connected to "+user);
                    if(window.localStorage) {
                            var t_id = String(result.s_id+"."+result.s_session);
                            window.localStorage.setItem("togetherjs.room",String(result.room));
                            window.localStorage.setItem("togetherjs.identityId",t_id);
                            console.log("togetherjsID:"+window.localStorage.getItem("togetherjs.identityId"));
                            console.log(window.localStorage);
                    }
                    TogetherJSConfig_findRoom = String(result.room);
                }
                else{
                    console.log("matching failed");
                }
            }
        });
    }

    function updateToDefaultCohort(){
        var handlerStudentUrl = runtime.handlerUrl(element, 'updateToDefaultCohort');
        $.ajax({
            type: "POST",
            url: handlerStudentUrl,
            data: JSON.stringify({"hello": "world1"}),
            success: function (result) {
                if(result == "success"){
                    setTimeout(function(){ location.reload(); }, 3000);
                }else{
                    snackbar("could not assign to default cohort");
                }
            },
            error: function (request, status, error) {
                console.log(error);
                console.log(status);
                console.log(request.responseText);
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
            success: function(result,genders){
                if(result){
                    console.log("partners:");
                    console.log(result[0]);
                    $("#onlinePoolDetails").val(result.toString()+"/"+genders.toString());
                    snackbar("partner found with id:"+result[0]+", connecting...");
                    if(typeof getUserHandle !== 'undefined'){
                        clearInterval(getUserHandle);
                        snackbar("changing cohort group");
                        setTimeout(function(){ location.reload(); }, 3000);
                    }
                    pairMatch(result[0]);
                }
                else{
                    getRoom(function (res) {
                        if(res == true){
                            console.log("partner found");
                            clearInterval(getUserHandle);
                            snackbar("changing cohort group");
                            setTimeout(function(){ location.reload(); }, 3000);
                        }else{
                            console.log("No partner available to connect");
                        }
                    });
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
                    if(result.room !== "NaN"){
                        if(typeof getUserHandle !== 'undefined'){
                            clearInterval(getUserHandle);
                        }
                        $("#find_partner").text("partner found, to proceed click collaborate");
                        snackbar("room found with id:"+result.room);
                        if(window.localStorage) {
                                var t_id = String(result.s_id+"."+result.s_session);
                                window.localStorage.setItem("togetherjs.room",String(result.room));
                                window.localStorage.setItem("togetherjs.identityId",t_id);
                                console.log("togetherjsID:"+window.localStorage.getItem("togetherjs.identityId"));
                                console.log(window.localStorage);
                        }
                        TogetherJSConfig_findRoom = String(result.room);
                        callback(true);
                    }else{
                        callback(false);
                    }
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
                    TogetherJS(this);
            });
            console.log("roooom:"+TogetherJS.config.get("findRoom"));
    });

    $("#find_partner").click(function () {
        enter_online_pool();
        if(!TogetherJS.running){
            $("#find_partner").text("searching for partners....");
            getRoom(function (res) {
                if(!res){
                    getUserHandle = setInterval(getAvailableUsers,5000);
                }else{
                    $("#find_partner").text("partner found, to proceed click collaborate");
                }
            });
        }else{
            snackbar("stop togetherjs before finding another partner!");
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
