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
      description: 'This is where you manage your photo, bio, and certifications — the professional profile students see.',
    },
  },
  {
    tab: 'settings',
    element: '[data-tour="add-studio"]',
    popover: {
      title: 'Add Your Studios',
      description: 'Add each studio you teach at — name, platform, booking type, URL, and ICS feed — once.',
    },
  },
  {
    tab: 'settings',
    element: '[data-tour="add-drafts-tab"]',
    popover: {
      title: 'Add & Drafts',
      description: 'Pull your schedule here — all classes from all studios populate in one tap.',
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
    tab: 'add',
    element: '[data-tour="analytics-cards"]',
    popover: {
      title: 'Your Analytics',
      description: 'Track followers and Book Spot clicks here — instrumented from day one so your data is never lost.',
    },
  },
  {
    tab: 'schedule',
    element: '[data-tour="view-live-site"]',
    popover: {
      title: 'Share Your Page',
      description: 'Share instruktor.ca/[username] in your Instagram bio so students can find every class you teach.',
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
  setTimeout(() => driverObj.drive(), 150);

  return driverObj;
}
