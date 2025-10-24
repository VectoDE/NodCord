document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('form').forEach(form => {
    form.addEventListener('submit', (event) => {
      const formId = event.target.id;
      document.getElementById(`${formId}-loading`).style.display = 'inline-block';
    });
  });

  // Handler für Start API Button
  document.getElementById('start-api-form')?.addEventListener('submit', (event) => {
    document.getElementById('start-api-loading').classList.remove('hidden');
  });

  // Handler für Stop API Button
  document.getElementById('stop-api-form')?.addEventListener('submit', (event) => {
    document.getElementById('stop-api-loading').classList.remove('hidden');
  });

  // Handler für Restart API Button
  document.getElementById('restart-api-form')?.addEventListener('submit', (event) => {
    document.getElementById('restart-api-loading').classList.remove('hidden');
  });

  // Handler für Maintenance API Button
  document.getElementById('maintenance-api-form')?.addEventListener('submit', (event) => {
    document.getElementById('maintenance-api-loading').classList.remove('hidden');
  });

  // Handler für Remove Maintenance API Button
  document.getElementById('remove-maintenance-api-form')?.addEventListener('submit', (event) => {
    document.getElementById('remove-maintenance-api-loading').classList.remove('hidden');
  });

  // Handler für Start Bot Button
  document.getElementById('start-form')?.addEventListener('submit', (event) => {
    document.getElementById('start-loading').classList.remove('hidden');
  });

  // Handler für Stop Bot Button
  document.getElementById('stop-form')?.addEventListener('submit', (event) => {
    document.getElementById('stop-loading').classList.remove('hidden');
  });

  // Handler für Restart Bot Button
  document.getElementById('restart-form')?.addEventListener('submit', (event) => {
    document.getElementById('restart-loading').classList.remove('hidden');
  });

  // Handler für Maintenance Bot Button
  document.getElementById('maintenance-form')?.addEventListener('submit', (event) => {
    document.getElementById('maintenance-loading').classList.remove('hidden');
  });

  // Handler für Remove Maintenance Bot Button
  document.getElementById('remove-maintenance-form')?.addEventListener('submit', (event) => {
    document.getElementById('remove-maintenance-loading').classList.remove('hidden');
  });
});
