document.addEventListener("DOMContentLoaded",function(){let t=document.querySelector(".burger"),o=document.querySelector(".close-btn"),n=document.querySelector("nav");t.addEventListener("click",()=>{n.classList.toggle("active")}),o.addEventListener("click",()=>{n.classList.remove("active")})});document.addEventListener("DOMContentLoaded",function(){let t=document.querySelectorAll("main section"),o=document.querySelectorAll(".sidebar a");function n(){let c=t[0];t.forEach(e=>{let r=e.offsetTop;window.scrollY>=r-60&&(c=e)}),o.forEach(e=>{e.classList.remove("active"),e.getAttribute("href").substring(1)===c.getAttribute("id")&&e.classList.add("active")})}window.addEventListener("scroll",n)});
//# sourceMappingURL=script.js.map
