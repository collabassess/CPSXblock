/* Javascript for CPSXBlock. */
function CPSXBlock(runtime, element,data) {

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


    function toggleButton(){

        if(TogetherJS.running){
            $("#btn-content").text("Collaborate with a partner")
            $("#collaborate").removeClass("button-error");
            $("#collaborate").removeClass("button-warning");
            $("#collaborate").addClass("button-success");

        }else{
            $("#btn-content").text("End collaboration")
            $("#collaborate").removeClass("button-success");
            $("#collaborate").removeClass("button-warning");
            $("#collaborate").addClass("button-error");
        }

    }

    $('#collaborate').click(function(){
            toggleButton();
            TogetherJS();
            console.log(TogetherJS.config.get("findRoom"))
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

    $(function ($) {
            setTimeout(checkTogetherJsStatus, 3000);


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


       // update room name
        var handlerUrl = runtime.handlerUrl(element, 'returnRoom');
        $.ajax({
            type: "POST",
            url: handlerUrl,
            data: JSON.stringify({"hello": "world"}),
            success: function(result){
                if(result){
                    TogetherJSConfig_findRoom = {prefix: result.room, max: result.size};
                    TogetherJS.config("findRoom", function () {
                        return {prefix: result.room, max: result.size};
                    };
                    TogetherJS.reinitialize();
                    console.log(result.s_id);
                    if(window.localStorage) {
                            var t_id = String(result.s_id+"."+result.s_session);
                            window.localStorage.setItem("togetherjs.identityId",t_id);
                            console.log("togetherjsID:"+window.localStorage.getItem("togetherjs.identityId"));
                            console.log(window.localStorage);
                    }
                }else{
                    console.log("No room/partner available")
                }
            }
        });

        console.log(TogetherJS.config.get("findRoom"))

        var handlerStudentUrl = runtime.handlerUrl(element, 'returnUserName');
        $.ajax({
            type: "POST",
            url: handlerStudentUrl,
            data: JSON.stringify({"hello": "world1"}),
            success: updateUserName,
            error: function (request, status, error) {
                alert(error);
                alert(status);
                alert(request.responseText);
            }
        });




    });



}
