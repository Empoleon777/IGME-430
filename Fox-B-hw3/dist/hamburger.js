// mobile menu
const burgerIcon = document.querySelector("#burger");
const navbarMenu = document.querySelector("#nav-links");

burgerIcon.addEventListener('click', ()=>{
    console.log("Hamburger Menu Clicked.");
    navbarMenu.classList.toggle('is-active');
})