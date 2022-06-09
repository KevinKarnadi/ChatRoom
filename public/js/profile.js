var curUser;

function init() {
    let imgFile = document.getElementById("imgFile");
    var imgData;
    imgFile.addEventListener("change", function() {
        imgData = imgFile.files[0];
    });

    firebase.auth().onAuthStateChanged(function(user) {
        let inputNameBox = document.getElementById("inputName");
        firebase.database().ref("users/" + user.uid + "/name").once("value", function(snapshot) {
            inputNameBox.value = snapshot.val();
            curUser = user;
        });
    });

    let btnSave = document.getElementById("btnSave");
    btnSave.addEventListener("click", function() {
        let inputName = document.getElementById("inputName");
        let nameData = inputName.value;

        if(imgData != undefined) {
            firebase.storage().ref(curUser.uid).put(imgData).snapshot.ref.getDownloadURL().then(function(url) {
                curUser.updateProfile({
                    photoURL: url
                });
                firebase.database().ref("users/" + curUser.uid + "/img").set(url);
            })
        }
        firebase.database().ref("users/" + curUser.uid + "/name").set(nameData);
        curUser.updateProfile({
            displayName: nameData
        });
    });

    let btnReturn = document.getElementById("btnReturn");
    btnReturn.addEventListener("click", function() {
        window.location = "chat.html";
    });
}

window.onload = function() {
    init();
};