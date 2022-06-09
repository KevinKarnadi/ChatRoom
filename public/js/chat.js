var curRoomKey = "";
var prevRoomKey = "";

function init() {
    // Load User Image & Name
    let profileImg = document.getElementById("profileImg");
    let profileName = document.getElementById("profileName");
    firebase.auth().onAuthStateChanged(function(user) {
        firebase.database().ref("users/" + user.uid + "/img").on("value", function(snapshot) {
            profileImg.src = snapshot.val();
        });
        firebase.database().ref("users/" + user.uid + "/name").on("value", function(snapshot) {
            profileName.innerHTML = snapshot.val();
        });
    });

    // Create Chat Room
    let btnAddChat = document.getElementById("btnAddChat");
    btnAddChat.addEventListener("click", function() {
        let user = firebase.auth().currentUser;
        let nameStr = user.displayName;
        if(nameStr == null)
            nameStr = user.email;
        let roomName = window.prompt("Room name:",  nameStr + "'s Room");
        if(roomName != null) {
            if(roomName.trim() == 0)
                roomName = "&nbsp";
            let time = -Date.now();
            let roomData = {
                name: roomName,
                members: [user.email],
                lastUpdated: time
            };
            firebase.database().ref("rooms/").push(roomData);
            loadRooms();
            if(curRoomKey != "") {
                let roomBtn = document.getElementById(curRoomKey);
                roomBtn.style.background = "rgb(33, 138, 255)";
                roomBtn.style.color = "rgb(255, 255, 255)";
            }
        }
    });
    
    // Load Chat Rooms
    function loadRooms() {
        let roomList = document.getElementById("roomList");
        roomList.innerHTML = "";
        firebase.database().ref("rooms").orderByChild("lastUpdated").off();
        firebase.database().ref("rooms").orderByChild("lastUpdated").on("child_added", function(snapshot) {
            let user = firebase.auth().currentUser;
            if(snapshot.val().members.includes(user.email)) {
                let onClickData = function() {
                    openChatRoom(snapshot.key);
                };
                let newRoom = document.createElement("button");
                newRoom.className = "btnChatRoom";
                newRoom.id = snapshot.key;
                newRoom.onclick = onClickData;
                newRoom.innerHTML = snapshot.val().name;
                roomList.appendChild(newRoom);
            }
            if(curRoomKey != "") {
                let roomBtn = document.getElementById(curRoomKey);
                roomBtn.style.background = "rgb(33, 138, 255)";
                roomBtn.style.color = "rgb(255, 255, 255)";
            }
        });
    }
    loadRooms();  // Initial call

    firebase.database().ref("rooms").on("child_changed", function(snapshot) {
        loadRooms();
    });

    // Sign Out
    let btnSignOut = document.getElementById("btnSignOut");
    btnSignOut.addEventListener("click", function() {
        firebase.auth().signOut().then(function() {
            window.location = "index.html";
        });
    });

    // Open Chat Room
    function openChatRoom(key) {
        document.getElementById("chatAreaId").innerHTML = "";

        // Change button colors
        if(prevRoomKey != "") {
            let prevRoomBtn = document.getElementById(prevRoomKey);
            prevRoomBtn.style.background = "rgb(245, 245, 245)";
            prevRoomBtn.style.color = "rgb(0, 0, 0)";
            firebase.database().ref("rooms/" + prevRoomKey + "/messages").off();
        }
        let roomBtn = document.getElementById(key);
        roomBtn.style.background = "rgb(33, 138, 255)";
        roomBtn.style.color = "rgb(255, 255, 255)";
        
        curRoomKey = key;
        prevRoomKey = curRoomKey;

        let roomName = document.getElementById("roomName");
        firebase.database().ref("rooms/" + curRoomKey + "/name").on("value", function(snapshot) {
            roomName.innerHTML = snapshot.val();
        });

        firebase.database().ref("rooms/" + curRoomKey + "/messages").orderByChild("timeSent").on("child_added", function(snapshot) {
            let user = firebase.auth().currentUser;
            let chatArea = document.getElementById("chatAreaId");
            let nameObj = document.createElement("li");
            let msgObj = document.createElement("li");
            msgObj.innerHTML = snapshot.val().msg;
            let senderEmail = snapshot.val().email;
            let senderUid = snapshot.val().uid;

            firebase.database().ref("users/" + senderUid + "/name").once("value").then(function(data) {
                if(senderUid == user.uid)
                    nameObj.innerHTML = "You";
                else
                    nameObj.innerHTML = data.val();
            });

            if(senderUid == user.uid) {
                nameObj.className = "rightName";
                msgObj.className = "rightMsg";
                chatArea.append(nameObj);
                chatArea.append(msgObj);
            }
            else {
                nameObj.className = "leftName";
                msgObj.className = "leftMsg";
                chatArea.append(nameObj);
                chatArea.append(msgObj);
            }
        });
    }

    // Add member to chat room
    let btnAddMember = document.getElementById("btnAddMember");
    btnAddMember.addEventListener("click", function() {
        let emailInput = window.prompt("Enter member email:");
        if(emailInput != null) {
            if(curRoomKey != null) {
                let arr;
                firebase.database().ref("rooms/" + curRoomKey).on("value", function(snapshot) {
                    arr = snapshot.val().members;
                });
                arr.push(emailInput);
                firebase.database().ref("rooms/" + curRoomKey + "/members").set(arr);
            }
        }
    });

    // Send Message
    let btnSend = document.getElementById("btnSend");
    btnSend.addEventListener("click", function() {
        if(curRoomKey != "") {
            let user = firebase.auth().currentUser;
            let inputText = document.getElementById("inputText");
            let msgTxt = inputText.value;
            msgTxt = msgTxt.replace(/[&]/g, "&amp").replace(/[<]/g, "&lt").replace(/[>]/g, "&gt");
            if(msgTxt != "") {
                if(msgTxt.trim() == 0)
                    msgTxt = "&nbsp";
                let time = Date.now();
                let msgData = {
                    msg: msgTxt,
                    email: user.email,
                    uid: user.uid,
                    timeSent: time
                };
                firebase.database().ref("rooms/" + curRoomKey + "/lastUpdated/").set(-time);
                firebase.database().ref("rooms/" + curRoomKey + "/messages/").push(msgData);
                inputText.value = "";
            }
        }
    });
    let textBox = document.getElementById("inputText");
    textBox.addEventListener("keypress", function(e) {
        let keycode = e.keyCode ? e.keyCode : e.which;
        if(keycode == 13) {
            if(curRoomKey != "") {
                let user = firebase.auth().currentUser;
                let inputText = document.getElementById("inputText");
                let msgTxt = inputText.value;
                if(msgTxt != "") {
                    if(msgTxt.trim() == 0)
                        msgTxt = "&nbsp";
                    let time = Date.now();
                    let msgData = {
                        msg: msgTxt,
                        email: user.email,
                        uid: user.uid,
                        timeSent: time
                    };
                    firebase.database().ref("rooms/" + curRoomKey + "/lastUpdated/").set(-time);
                    firebase.database().ref("rooms/" + curRoomKey + "/messages/").push(msgData);
                    inputText.value = "";
                }
            }
        }
    });
}

function showNotif() {
    const notif = new Notification("New Message!", {
        body: "You received a new message."
    });
}

window.onload = function() {
    init();
};