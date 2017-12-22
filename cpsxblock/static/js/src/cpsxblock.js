/* Javascript for CPSXBlock. */
function CPSXBlock(runtime, element) {

    function updateUserName(result) {
        TogetherJS.config("getUserName", function () {
          return result.s_name;
        });
        TogetherJS.config("suppressJoinConfirmation", function () {
          return true;
        });

        //alert(result.s_name+" it works");
        //TogetherJS();
    }


    function toggleButton(){
        var classNames = $("#collaborate").attr("class");
        console.log(classNames.includes("red"));

        console.log($("#collaborate").data("tooltip"));

        if(TogetherJS.running){
            $("#collaborate").attr("data-tooltip","Click here to collaborate Now").tooltip('fixTitle')
          .tooltip('show');;
            $("#collaborate").removeClass("red");
            $("#collaborate").addClass("green");

        }else{
        $("#collaborate").attr("data-tooltip","Click here to end collaboration").tooltip('fixTitle')
          .tooltip('show');
            $("#collaborate").removeClass("green");
            $("#collaborate").addClass("red");
        }

    }

    $('#collaborate').click(function(){
        $("#togetherjs-chat-button").hide();

            toggleButton();

            TogetherJS();
            console.log(TogetherJS.config.get("findRoom"))


    });

    $("#check").click(function(){
        alert(TogetherJS.running);
    });


    $(function ($) {
            TogetherJS.config("disableWebRTC", function () {
                          return true;
                        });
            TogetherJS.config("suppressInvite", function () {
              return true;
            });
            TogetherJS.config("suppressJoinConfirmation", function () {
              return true;
            });
            TogetherJSConfig_cloneClicks = "button.submit";

            TogetherJS.config("cloneClicks", function () {
              return "button.submit";
            });

            TogetherJS.config("includeHashInUrl", function () {
              return true;
            });
            TogetherJS.config("dontShowClicks",function(){
            return true;
            });
            TogetherJS.reinitialize();


        TogetherJSConfig_hubBase = "https://calm-escarpment-25279.herokuapp.com/";



        //initialize chat rooms
         $.ajax({
                type: "POST",
                url: runtime.handlerUrl(element, 'initializeRoom'),
                data: JSON.stringify({"hello": "world1"})
            });

       // update room name
        var handlerUrl = runtime.handlerUrl(element, 'returnRoom');
        $.ajax({
            type: "POST",
            url: handlerUrl,
            data: JSON.stringify({"hello": "world"}),
            success: function(result){
                TogetherJSConfig_findRoom = {prefix: result.room, max: 5};
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

        if(!TogetherJS.running){
            $("#collaborate").attr("data-tooltip","Click here to collaborate Now").tooltip('fixTitle')
          .tooltip('show');;
            $("#collaborate").removeClass("red");
            $("#collaborate").addClass("green");
        }else{
            $("#collaborate").attr("data-tooltip","Click here to end collaboration").tooltip('fixTitle')
          .tooltip('show');
            $("#collaborate").removeClass("green");
            $("#collaborate").addClass("red");
        }


        //to remove the pulse effect
        setTimeout( function(){
                $("#collaborate").removeClass("pulse");
          }  , 3000 );
    });



}
