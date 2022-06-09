function init() {
    let txtEmail = document.getElementById("inputEmail2");
    let txtPassword = document.getElementById("inputPassword2");
    let txtConfirmPassword = document.getElementById("inputConfirmPassword2");
    let btnSignUp = document.getElementById("btnSignUp");

    btnSignUp.addEventListener("click", function() {
        let email = txtEmail.value;
        let password = txtPassword.value;
        let password2 = txtConfirmPassword.value;
        if(password == password2) {
            firebase.auth().createUserWithEmailAndPassword(email, password)
                .then((userCredential) => {
                    let user = userCredential.user;
                    let nameData, imgData;
                    if(user.displayName)
                        nameData = user.displayName;
                    else
                        nameData = user.email;
                    if(user.photoURL)
                        imgData = user.photoURL;
                    else
                        imgData = "img/default_dp.jpg";
                    let userData = {
                        email: user.email,
                        name: nameData,
                        img: imgData
                    };
                    firebase.database().ref("users/" + user.uid).set(userData);
                    alert("Account successfully created!");
                })
                .catch((error) => {
                    let errorCode = error.code;
                    let errorMessage = error.message;
                    alert(errorMessage);
                });
        }
        else
            alert("Password must be the same!");
        txtEmail.value = "";
        txtPassword.value = "";
        txtConfirmPassword.value = "";
    });
}

window.onload = function() {
    init();
};