/* Javascript for CPSXBlock. */
function CPSXBlock(runtime, element,data) {

    var handle;
    var value;
    var selector,selector_str;

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
            remove_theme();
            callback(1);
        }
        else{ //together js has started running
            TogetherJS.config("findRoom",window.localStorage.getItem("togetherjs.room"));
            $("#btn-content").text("End collaboration")
            $("#collaborate").removeClass("button-success");
            $("#collaborate").removeClass("button-warning");
            $("#collaborate").addClass("button-error");
            assign_theme();
            callback(1);
        }

    }

    function assign_theme() {
        var share_str = data.shared_blocks;
        share_str_arr = share_str.split(",");
        share_str_arr.forEach(function (item,index) {
            $('.vert-'+item).addClass("shared-content");
        });

        var unique_str = data.unique_blocks;
        unique_str_arr = unique_str.split(",");
        unique_str_arr.forEach(function (item,index) {
            $('.vert-'+item).addClass("unique-content");
        });
    }

    function remove_theme() {
        var share_str = data.shared_blocks;
        share_str_arr = share_str.split(",");
        share_str_arr.forEach(function (item,index) {
            $('.vert-'+item).removeClass("shared-content");
        });

        var unique_str = data.unique_blocks;
        unique_str_arr = unique_str.split(",");
        unique_str_arr.forEach(function (item,index) {
            $('.vert-'+item).removeClass("unique-content");
        });

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
                        snackbar("room found with id:"+result.room+", to proceed click collaborate");
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


    function compareString(str1, str2){
        var lendiff = str2.length - str1.length;

        return str2.substr(str1.length,lendiff);

    }

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
                $("#collaborate").show();
                $("#find_partner").hide();
                assign_theme();

            }else{
                getRoom(function (res) { //if no room is ready to connect yet
                    if(!res){
                        snackbar("Not connected to anyone yet!");
                        $("#collaborate").hide();
                        $("#find_partner").show();
                    }else{
                        $("#collaborate").show();
                        $("#find_partner").hide();
                        $("#btn-content").text("Collaborate with a partner")
                        $("#collaborate").removeClass("button-error");
                        $("#collaborate").removeClass("button-warning");
                        $("#collaborate").addClass("button-success");
                    }
                });
                remove_theme();
            }
    }

    // $("#send").click(function () {
    //     selector.append("<div>hi world</div>");
    // });


    function snackbar(message){
        $("#snackbar").addClass("show");
        $("#snackbar").text(message)
        setTimeout(function(){ $("#snackbar").removeClass("show"); }, 3000);
    }


    $(function ($) {
            var title = document.title.split("|");

            if(data.shareable_hints !== ''){
                selector = "#problem_"+data.shareable_hints+" .message";
                if($(selector).length){
                    value = $(selector).text().trim();
                    console.log(value);
                }

                console.log(selector);
                $("#problem_"+data.shareable_hints+" .submit").click(function () {
                    setTimeout(function () {
                        console.log(selector);
                        var text = $(selector).text().trim();
                        console.log(text);
                        if(text !== ""){
                            text = "Question "+title[1]+": Your Partner chose:"+text;
                            if(TogetherJS.running && text !== value){
                                var msg = {type: "chat", text: text, messageId: "NA"};
                                var session = TogetherJS.require("session");
                                session.send(msg);
                                var submit_event_msg = {
                                        type: "form_submit_event",
                                        question: title[1],
                                        course: title[2]
                                    };
                                TogetherJS.send(submit_event_msg);
                            }
                        }

                    },3000);
                });
            }


            $(".button-next").mousedown(function () {
                if(TogetherJS.running){
                    var submit_event_msg = {
                                type: "navigate_next",
                                from_question: title[1],
                                course: title[2]
                            };
                    TogetherJS.send(submit_event_msg);
                }

            });

            $(".button-previous").mousedown(function () {
                if(TogetherJS.running){
                    var submit_event_msg = {
                                type: "navigate_prev",
                                from_question: title[1],
                                course: title[2]
                            };
                    TogetherJS.send(submit_event_msg);
                }

            });
            snackbar("loading...");
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

            TogetherJS.on("close", function () {
                console.log("closing togetherjs");
                TogetherJS.require("storage").tab.clear("status");
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
            });



    });



}
