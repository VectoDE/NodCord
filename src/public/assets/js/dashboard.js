document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('form').forEach(form => {
    form.addEventListener('submit', (event) => {
      const formId = event.target.id;
      document.getElementById(`${formId}-loading`).style.display = 'inline-block';
    });
  });
});
