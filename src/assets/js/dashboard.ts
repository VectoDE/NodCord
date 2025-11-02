type IndicatorMode = 'inline' | 'class';

function showIndicator(indicator: HTMLElement, mode: IndicatorMode): void {
  if (mode === 'inline') {
    indicator.style.display = 'inline-block';
    return;
  }
  indicator.classList.remove('hidden');
}

function wireLoadingIndicator(formId: string, indicatorId: string, mode: IndicatorMode): void {
  const form = document.getElementById(formId) as HTMLFormElement | null;
  const indicator = document.getElementById(indicatorId);
  if (!form || !indicator) return;

  form.addEventListener('submit', () => showIndicator(indicator, mode));
}

document.addEventListener('DOMContentLoaded', () => {
  const forms = Array.from(document.querySelectorAll<HTMLFormElement>('form'));
  forms.forEach((form) => {
    form.addEventListener('submit', (event) => {
      const current = event.currentTarget as HTMLFormElement | null;
      const formId = current?.id;
      if (!formId) return;
      const indicator = document.getElementById(`${formId}-loading`);
      if (indicator) showIndicator(indicator, 'inline');
    });
  });

  wireLoadingIndicator('start-api-form', 'start-api-loading', 'class');
  wireLoadingIndicator('stop-api-form', 'stop-api-loading', 'class');
  wireLoadingIndicator('restart-api-form', 'restart-api-loading', 'class');
  wireLoadingIndicator('maintenance-api-form', 'maintenance-api-loading', 'class');
  wireLoadingIndicator('remove-maintenance-api-form', 'remove-maintenance-api-loading', 'class');

  wireLoadingIndicator('start-form', 'start-loading', 'class');
  wireLoadingIndicator('stop-form', 'stop-loading', 'class');
  wireLoadingIndicator('restart-form', 'restart-loading', 'class');
  wireLoadingIndicator('maintenance-form', 'maintenance-loading', 'class');
  wireLoadingIndicator('remove-maintenance-form', 'remove-maintenance-loading', 'class');
});
