let menuBut = document.querySelector('.mobilelogo');
let navbar = document.querySelector('.box1');

let flag= false;

function slide(){
    if(flag){
        navbar.classList.add('not-md:hidden');
        
        flag = false;
    }else{
        navbar.classList.remove('not-md:hidden');
        
        flag = true;
    }
}
menuBut.addEventListener('click',()=>{
    slide();
});