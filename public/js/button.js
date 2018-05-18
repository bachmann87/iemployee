// DOM-Const
const btn = document.querySelector('#myBtn');


function scrollFunction() {
  if (document.body.scrollTop > 200 || document.documentElement.scrollTop > 200) {
    document.getElementById("myBtn").style.display = "block";
    // document.querySelector('#topNav').style.top = "0px";
    // document.querySelector('#secondNav').style.top = "20px";
    // document.querySelector('#mainNav').style.top = "22px";

  } else {
    document.getElementById("myBtn").style.display = "none";
    // document.querySelector('#topNav').style.top = "-20px";
    // document.querySelector('#secondNav').style.top = "-22px";
    // document.querySelector('#mainNav').style.top = "0px";
  }
}

function topFunction() {
  document.body.scrollTop = 0; // For Safari
  document.documentElement.scrollTop = 0; // For Chrome, Firefox, IE and Opera
}

// Events
btn.addEventListener('click', function() {
  topFunction();
});


// Scroll
window.onscroll = function() {
  scrollFunction();
}
