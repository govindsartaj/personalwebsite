var body = document.getElementsByTagName("body")[0];

console.log(body);
body.className=localStorage.getItem("stateMode");
function toggleDarkLight() {
  var body = document.getElementsByTagName("body")[0];
  var currentClass = body.className;
  var dark_button = document.getElementById("dark-button");

  if (currentClass === "dark-mode"){
    body.className = "light-mode";
    dark_button.innerText = "🌛";
  }
  else{
    body.className = "dark-mode";
    dark_button.innerText = "🌞";
  }

  // body.className = currentClass === "dark-mode" ? "light-mode" : "dark-mode";
  localStorage.setItem("stateMode",body.className);
}
