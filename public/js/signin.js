function init() {
    let txtEmail = document.getElementById("inputEmail");
    let txtPassword = document.getElementById("inputPassword");
    let btnSignIn = document.getElementById("btnSignIn");
    let btnGoogle = document.getElementById("btnGoogle");

    btnSignIn.addEventListener("click", function() {
        let email = txtEmail.value;
        let password = txtPassword.value;
        firebase.auth().signInWithEmailAndPassword(email, password)
            .then((userCredential) => {
                let user = userCredential.user;
                firebase.auth().onAuthStateChanged(function(user) {
                    if(user)
                        window.location = 'index.html';
                });
            })
            .catch((error) => {
                var errorCode = error.code;
                var errorMessage = error.message;
                alert(errorMessage);
                txtEmail.value = "";
                txtPassword.value = "";
            });
    });

    btnGoogle.addEventListener("click", function() {
        let provider = new firebase.auth.GoogleAuthProvider();
        firebase.auth().signInWithPopup(provider)
            .then(function(result) {
                let token = result.credential.accessToken;
                let user = result.user;
                firebase.auth().onAuthStateChanged(function(user) {
                    let userData = {
                        email: user.email,
                        name: user.displayName,
                        img: user.photoURL
                    };
                    firebase.database().ref("users/" + user.uid).set(userData).then(function() {
                        window.location = "chat.html";
                    });
                });
            })
            .catch(function(error) {
                let errorCode = error.code;
                let errorMessage = error.message;
                alert(errorMessage);
                let email = error.email;
                let credential = error.credential;
            });
    });
}

window.onload = function() {
    init();
};