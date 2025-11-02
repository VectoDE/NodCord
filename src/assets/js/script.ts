declare global {
  interface Window {
    addFriend?: (username: string, hashname: string) => void;
  }
}

function toggleNavigation(): void {
  const burger = document.querySelector<HTMLElement>('.burger');
  const closeBtn = document.querySelector<HTMLElement>('.close-btn');
  const nav = document.querySelector<HTMLElement>('nav');

  if (!nav) return;

  burger?.addEventListener('click', () => {
    nav.classList.toggle('active');
  });

  closeBtn?.addEventListener('click', () => {
    nav.classList.remove('active');
  });
}

function registerDocumentationNav(): void {
  const sections = Array.from(document.querySelectorAll<HTMLElement>('main section'));
  const navLinks = Array.from(document.querySelectorAll<HTMLAnchorElement>('.sidebar a'));
  if (sections.length === 0 || navLinks.length === 0) return;

  const onScroll = (): void => {
    let currentSection: HTMLElement | null = sections[0] ?? null;

    sections.forEach((section) => {
      const sectionTop = section.offsetTop;
      if (window.scrollY >= sectionTop - 60) {
        currentSection = section;
      }
    });

    navLinks.forEach((link) => {
      link.classList.remove('active');
      const href = link.getAttribute('href');
      if (!href || !currentSection) return;
      const targetId = currentSection.getAttribute('id');
      if (href.substring(1) === targetId) {
        link.classList.add('active');
      }
    });
  };

  window.addEventListener('scroll', onScroll);
}

function addFriend(username: string, hashname: string): void {
  const addFriendUrl = 'https://discord.com/users/@me';
  window.open(addFriendUrl, '_blank', 'noopener');
  window.alert(`Send a friend request to: ${username} (${hashname}) on Discord.`);
}

window.addFriend = addFriend;

document.addEventListener('DOMContentLoaded', () => {
  toggleNavigation();
  registerDocumentationNav();
});
