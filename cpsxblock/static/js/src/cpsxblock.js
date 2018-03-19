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

    function toggleButton(){
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
            clearInterval(getUserHandle);
            if(handle == 0){
                console.log("handle cleared");
            }else{
                console.log(handle);
            }
        }
        else{ //together js has started running
            $("#btn-content").text("End collaboration")
            $("#collaborate").removeClass("button-success");
            $("#collaborate").removeClass("button-warning");
            $("#collaborate").addClass("button-error");

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

            handle = setInterval(updateLastActivity, 240000);
            getUserHandle = setInterval(getAvailableUsers,5000);
        }

    }

    function pairMatch(user){
        var handlerUrl = runtime.handlerUrl(element, 'pair_users');
        $.ajax({
            type: "POST",
            url: handlerUrl,
            data: JSON.stringify({partner: user}),
            success: function(result){
                if(result){
                    console.log("here alo mi");
                    TogetherJSConfig_findRoom = {prefix: result.room, max: result.size};
                    console.log("f_room:"+result.room);
                    if(window.localStorage) {
                            var t_id = String(result.s_id+"."+result.s_session);
                            window.localStorage.setItem("togetherjs.identityId",t_id);
                            console.log("togetherjsID:"+window.localStorage.getItem("togetherjs.identityId"));
                            console.log(window.localStorage);
                    }
                }
                else{
                    console.log("matching failed");
                }
            }
        });
    }

    function getAvailableUsers() {
        var handlerUrl = runtime.handlerUrl(element, 'getPartners');
        $.ajax({
            type: "POST",
            url: handlerUrl,
            data: JSON.stringify({"hello": "world"}),
            success: function(result){
                if(result){
                    console.log("partners:");
                    console.log(result[0]);
                    clearInterval(getUserHandle);
                    pairMatch(result[0]);
                }
                else{
                    console.log("No room/partner available");
                }
            }
        });
    }

    $('#collaborate').click(function(){
            toggleButton();
            TogetherJS();
            console.log(TogetherJS.config.get("findRoom"));
    });

    function checkTogetherJsStatus(){

            if(TogetherJS.running){
                TogetherJSConfig_cloneClicks = false;

                TogetherJS.config("cloneClicks", function () {
                  return false;
                })
                TogetherJS.reinitialize;
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


           // // update room name
           //  var handlerUrl = runtime.handlerUrl(element, 'returnRoom');
           //  $.ajax({
           //      type: "POST",
           //      url: handlerUrl,
           //      data: JSON.stringify({"hello": "world"}),
           //      success: function(result){
           //          if(result){
           //              var final_room = result.room.replace('_','');
           //              final_room = final_room.replace('_','');
           //              TogetherJSConfig_findRoom = {prefix: final_room, max: result.size};
           //              console.log("froom:"+final_room);
           //              if(window.localStorage) {
           //                      var t_id = String(result.s_id+"."+result.s_session);
           //                      window.localStorage.setItem("togetherjs.identityId",t_id);
           //                      console.log("togetherjsID:"+window.localStorage.getItem("togetherjs.identityId"));
           //                      console.log(window.localStorage);
           //              }
           //          }else{
           //              console.log("No room/partner available")
           //          }
           //      }
           //  });

            console.log("froom1:"+TogetherJS.config.get("findRoom"));

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
