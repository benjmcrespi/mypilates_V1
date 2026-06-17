import { driver } from 'driver.js';
import 'driver.js/dist/driver.css';

// Each step's `tab` is the dashboard tab that must be active for its
// target element to exist in the DOM.
const TOUR_STEPS = [
  {
    tab: 'schedule',
    element: '[data-tour="settings-tab"]',
    popover: {
      title: 'Your Profile',
      description: 'This is where you manage your photo, bio, and certifications. It is the professional profile students see.',
    },
  },
  {
    tab: 'settings',
    element: '[data-tour="add-studio"]',
    popover: {
      title: 'Add Your Studios',
      description: 'Add each studio you teach at once, including the name, platform, booking type, URL, and ICS feed.',
    },
  },
  {
    tab: 'settings',
    element: '[data-tour="add-drafts-tab"]',
    popover: {
      title: 'Add & Drafts',
      description: 'Pull your schedule here. All classes from all studios populate in one tap.',
    },
  },
  {
    tab: 'add',
    element: () =>
      document.querySelector('[data-tour="publish-all-btn"]') ||
      document.querySelector('[data-tour="publish-all-panel"]'),
    popover: {
      title: 'Publish All',
      description: 'One tap to publish all reviewed drafts to your live schedule.',
    },
  },
  {
    tab: 'schedule',
    element: '[data-tour="analytics-cards"]',
    popover: {
      title: 'Your Analytics',
      description: 'Track followers and Book Spot clicks here. Your data is instrumented from day one so it is never lost.',
    },
  },
  {
    tab: 'settings',
    element: '[data-tour="your-page-link"]',
    popover: {
      title: 'Your Link',
      description: 'This is your link. Copy it and put it in your Instagram bio.',
    },
  },
];

// Brand-styled overlay/popover colours (espresso bg, linen text, clay accents)
// are applied via the .instruktor-tour-popover overrides in globals.css.

export function startProductTour({ setActiveTab, onFinish }) {
  let currentTab = TOUR_STEPS[0].tab;

  const goToTab = (tab, done) => {
    if (tab === currentTab) {
      done();
      return;
    }
    currentTab = tab;
    setActiveTab(tab);
    // Wait for the tab content to render before driver looks for the element
    setTimeout(done, 150);
  };

  const driverObj = driver({
    showProgress: true,
    allowClose: true,
    overlayColor: '#1A0E07',
    overlayOpacity: 0.7,
    popoverClass: 'instruktor-tour-popover',
    scrollIntoViewOptions: { block: 'nearest', inline: 'nearest' },
    onDestroyed: () => {
      onFinish?.();
    },
    steps: TOUR_STEPS.map((step, i) => ({
      element: step.element,
      popover: {
        ...step.popover,
        onNextClick: (element, st, opts) => {
          const next = TOUR_STEPS[i + 1];
          if (!next) {
            opts.driver.moveNext();
            return;
          }
          goToTab(next.tab, () => opts.driver.moveNext());
        },
        onPrevClick: (element, st, opts) => {
          const prev = TOUR_STEPS[i - 1];
          if (!prev) {
            opts.driver.movePrevious();
            return;
          }
          goToTab(prev.tab, () => opts.driver.movePrevious());
        },
      },
    })),
  });

  setActiveTab(TOUR_STEPS[0].tab);
  setTimeout(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    driverObj.drive();
  }, 150);

  return driverObj;
}
