function init() {
    firebase.auth().onAuthStateChanged(function(user) {
        if (user)
            window.location = "chat.html";
        else
            window.location = "signin.html";
    });
}

window.onload = function() {
    init();
};