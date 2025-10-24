// Navigation Responsive Menu Script
document.addEventListener('DOMContentLoaded', function () {
  const burger = document.querySelector('.burger');
  const closeBtn = document.querySelector('.close-btn');
  const nav = document.querySelector('nav');

  burger.addEventListener('click', () => {
    nav.classList.toggle('active');
  });

  closeBtn.addEventListener('click', () => {
    nav.classList.remove('active');
  });
});

// Add Discord Friend Function
function addFriend(username, hashname) {
  const addFriendUrl = `https://discord.com/users/@me`;
  window.open(addFriendUrl, '_blank');
  alert(`Send a friend request to: ${username} (${hashname}) on Discord.`);
}

// Documentation Navigation Slider
document.addEventListener("DOMContentLoaded", function () {
  const sections = document.querySelectorAll("main section");
  const navLinks = document.querySelectorAll(".sidebar a");

  function onScroll() {
    let currentSection = sections[0];

    sections.forEach(section => {
      const sectionTop = section.offsetTop;
      if (window.scrollY >= sectionTop - 60) {
        currentSection = section;
      }
    });

    navLinks.forEach(link => {
      link.classList.remove("active");
      if (link.getAttribute("href").substring(1) === currentSection.getAttribute("id")) {
        link.classList.add("active");
      }
    });
  }

  window.addEventListener("scroll", onScroll);
});
