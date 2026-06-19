import { driver } from 'driver.js';
import 'driver.js/dist/driver.css';

// Each step declares which dashboard tab must be active for its element to exist in the DOM.
const TOUR_STEPS = [
  {
    tab: 'settings',
    element: '[data-tour="your-profile"]',
    popover: {
      title: 'Your Profile',
      description: 'This is where you upload your photo, add your bio and certifications. This is what your students will see.',
    },
  },
  {
    tab: 'settings',
    element: '[data-tour="saved-studios"]',
    popover: {
      title: 'My Studios',
      description: 'Add each studio you teach at. Once added, include the booking link and calendar link to sync all your classes.',
    },
  },
  {
    tab: 'settings',
    element: '[data-tour="add-drafts-tab"]',
    popover: {
      title: 'My Classes',
      description: 'Manage your class schedule here.',
    },
  },
  {
    tab: 'add',
    element: '[data-tour="add-class-form"]',
    popover: {
      title: 'Add a New Class',
      description: 'Create classes one at a time.',
    },
  },
  {
    tab: 'add',
    element: '[data-tour="publish-all-panel"]',
    popover: {
      title: 'Sync Classes',
      description: 'Add classes from your calendar link. Press Pull Latest Schedule to auto-populate your classes from all your studios.',
    },
  },
  {
    tab: 'schedule',
    element: '[data-tour="analytics-cards"]',
    popover: {
      title: 'Your Analytics',
      description: 'Track your followers and clicks on your classes. Your data is tracked from day one so nothing is ever lost.',
    },
  },
  {
    tab: 'settings',
    element: '[data-tour="your-page-link"]',
    popover: {
      title: 'Your Page',
      description: 'This is the link to your Instruktor schedule. Copy it and share it across all platforms.',
    },
  },
];

// Brand-styled overlay/popover colours (espresso bg, linen text, clay accents)
// are applied via the .instruktor-tour-popover overrides in globals.css.

export function startProductTour({ setActiveTab, onFinish }) {
  let currentTab = TOUR_STEPS[0].tab;
  let isSwitching = false;
  let driverObj;

  // Switches to the required tab and re-drives to stepIndex after the DOM settles.
  // Returns true when a switch was initiated (caller should not also call moveNext/Prev).
  const switchTab = (tab, stepIndex, afterSwitch) => {
    if (tab === currentTab) {
      afterSwitch?.();
      return false;
    }
    isSwitching = true;
    currentTab = tab;
    setActiveTab(tab);
    setTimeout(() => {
      isSwitching = false;
      afterSwitch ? afterSwitch() : driverObj.moveTo(stepIndex);
    }, 200);
    return true;
  };

  const steps = TOUR_STEPS.map((step, i) => ({
    element: step.element,

    // onHighlightStarted fires before Driver.js tries to locate and highlight the element.
    // If the wrong tab is active the element won't be in the DOM, so we switch tabs and
    // re-drive to this step index once the DOM has updated.
    onHighlightStarted: () => {
      if (isSwitching) return; // mid-switch — the follow-up moveTo will handle it
      switchTab(step.tab, i);
    },

    popover: {
      ...step.popover,
      onNextClick: (el, st, opts) => {
        const next = TOUR_STEPS[i + 1];
        if (!next) {
          opts.driver.moveNext();
          return;
        }
        switchTab(next.tab, i + 1, () => opts.driver.moveNext());
      },
      onPrevClick: (el, st, opts) => {
        const prev = TOUR_STEPS[i - 1];
        if (!prev) {
          opts.driver.movePrevious();
          return;
        }
        switchTab(prev.tab, i - 1, () => opts.driver.movePrevious());
      },
    },
  }));

  driverObj = driver({
    showProgress: true,
    allowClose: true,
    overlayColor: '#1A0E07',
    overlayOpacity: 0.7,
    popoverClass: 'instruktor-tour-popover',
    scrollIntoViewOptions: { block: 'center', inline: 'nearest' },
    onDestroyed: () => onFinish?.(),
    steps,
  });

  // Navigate to the first step's tab, scroll to top, then start.
  currentTab = TOUR_STEPS[0].tab;
  setActiveTab(TOUR_STEPS[0].tab);
  setTimeout(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    driverObj.drive();
  }, 150);

  return driverObj;
}
