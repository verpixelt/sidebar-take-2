import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Sidebar } from './Sidebar';
import type { SidebarFunctionItem, SidebarProps } from './Sidebar.types';

const Icon = () => <svg data-testid="icon" />;

const makeItems = (): SidebarFunctionItem[][] => [
  [
    { id: 'settings', label: 'Einstellungen verwalten', icon: <Icon />, onClick: vi.fn() },
    { id: 'favorites', label: 'Favoriten & Interessen', icon: <Icon />, onClick: vi.fn() },
  ],
  [{ id: 'explainer', label: 'Kurz erklärt', icon: <Icon />, onClick: vi.fn(), hasNewInfo: true }],
];

const helpItem = (): SidebarFunctionItem => ({
  id: 'help',
  label: 'Portalhilfe - Bereich 1',
  icon: <Icon />,
  onClick: vi.fn(),
});

function renderSidebar(props: Partial<SidebarProps> = {}) {
  const functionGroups = props.functionGroups ?? makeItems();
  const help = 'helpItem' in props ? props.helpItem : helpItem();
  const utils = render(
    <Sidebar areaTitle="Bereich 1" functionGroups={functionGroups} helpItem={help} {...props}>
      <ul>
        <li>
          <a href="#one">Listenpunkt 1.1</a>
        </li>
      </ul>
    </Sidebar>,
  );
  return { ...utils, functionGroups, help };
}

/** The sidebar's own nav, as opposed to the mobile popover. */
const sidebarNav = () => within(screen.getByRole('complementary'));

describe('structure and landmarks', () => {
  it('exposes the sidebar as a labelled complementary landmark', () => {
    renderSidebar();
    expect(screen.getByRole('complementary', { name: 'Seitennavigation' })).toBeInTheDocument();
  });

  it('renders the area title and the injected secondary nav', () => {
    renderSidebar();
    expect(screen.getByRole('heading', { name: 'Bereich 1', level: 2 })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Listenpunkt 1.1' })).toBeInTheDocument();
  });

  it('renders every function item as a button inside the functions nav', () => {
    renderSidebar();
    const nav = within(screen.getByRole('navigation', { name: 'Funktionen' }));
    expect(nav.getByRole('button', { name: /Einstellungen verwalten/ })).toBeInTheDocument();
    expect(nav.getByRole('button', { name: /Favoriten & Interessen/ })).toBeInTheDocument();
    expect(nav.getByRole('button', { name: /Kurz erklärt/ })).toBeInTheDocument();
    expect(nav.getByRole('button', { name: /Portalhilfe/ })).toBeInTheDocument();
  });

  it('hides decorative icons and the group divider from assistive tech', () => {
    const { container } = renderSidebar();
    container.querySelectorAll('[data-testid="icon"]').forEach((icon) => {
      expect(icon.closest('[aria-hidden="true"]')).not.toBeNull();
    });
    expect(container.querySelector('hr')).toHaveAttribute('aria-hidden', 'true');
  });

  it('omits the help item when none is given', () => {
    renderSidebar({ helpItem: undefined });
    expect(sidebarNav().queryByRole('button', { name: /Portalhilfe/ })).not.toBeInTheDocument();
  });

  it('gives each instance unique ids so aria-controls cannot cross-wire', () => {
    const { container } = render(
      <>
        <Sidebar functionGroups={makeItems()} variant="icon" />
        <Sidebar functionGroups={makeItems()} variant="icon" />
      </>,
    );
    const ids = [...container.querySelectorAll('aside')].map((el) => el.id);
    expect(ids).toHaveLength(2);
    expect(ids[0]).not.toEqual(ids[1]);
    expect(ids.every(Boolean)).toBe(true);
  });
});

describe('activating function items', () => {
  it('calls onClick when a row is clicked', async () => {
    const user = userEvent.setup();
    const { functionGroups } = renderSidebar();
    await user.click(sidebarNav().getByRole('button', { name: /Einstellungen verwalten/ }));
    expect(functionGroups[0][0].onClick).toHaveBeenCalledTimes(1);
  });

  it('activates a row with Enter', async () => {
    const user = userEvent.setup();
    const { functionGroups } = renderSidebar();
    sidebarNav().getByRole('button', { name: /Einstellungen verwalten/ }).focus();
    await user.keyboard('{Enter}');
    expect(functionGroups[0][0].onClick).toHaveBeenCalledTimes(1);
  });

  it('activates a row with Space', async () => {
    const user = userEvent.setup();
    const { functionGroups } = renderSidebar();
    sidebarNav().getByRole('button', { name: /Einstellungen verwalten/ }).focus();
    await user.keyboard(' ');
    expect(functionGroups[0][0].onClick).toHaveBeenCalledTimes(1);
  });

  it('does not throw when an item has no onClick', async () => {
    const user = userEvent.setup();
    renderSidebar({ functionGroups: [[{ id: 'a', label: 'Ohne Handler', icon: <Icon /> }]] });
    await user.click(sidebarNav().getByRole('button', { name: 'Ohne Handler' }));
  });

  it('reaches every row by tabbing, in document order', async () => {
    const user = userEvent.setup();
    renderSidebar();
    const order = [
      'Listenpunkt 1.1',
      'Einstellungen verwalten',
      'Favoriten & Interessen',
      'Kurz erklärt',
      'Portalhilfe - Bereich 1',
    ];
    for (const name of order) {
      await user.tab();
      expect(document.activeElement).toHaveAccessibleName(new RegExp(name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
    }
  });
});

describe('"new information" indicator', () => {
  it('adds the state to the row\'s accessible name rather than showing colour alone', () => {
    renderSidebar();
    expect(
      sidebarNav().getByRole('button', { name: 'Kurz erklärt, neue Informationen' }),
    ).toBeInTheDocument();
  });

  it('keeps the state in the name when the row is collapsed to an icon', () => {
    renderSidebar({ variant: 'icon' });
    expect(
      sidebarNav().getByRole('button', { name: 'Kurz erklärt, neue Informationen' }),
    ).toBeInTheDocument();
  });

  it('surfaces it on the mobile disclosure button too', () => {
    renderSidebar();
    expect(
      screen.getByRole('button', { name: 'Funktionen öffnen, neue Informationen' }),
    ).toBeInTheDocument();
  });

  it('leaves the name clean when no item has new information', () => {
    renderSidebar({
      functionGroups: [[{ id: 'a', label: 'Nur ein Eintrag', icon: <Icon /> }]],
      helpItem: undefined,
    });
    expect(screen.getByRole('button', { name: 'Funktionen öffnen' })).toBeInTheDocument();
    expect(sidebarNav().getByRole('button', { name: 'Nur ein Eintrag' })).toBeInTheDocument();
  });
});

describe('variant="full"', () => {
  it('renders the chevron as decoration, not as a control', () => {
    renderSidebar();
    // Only the mobile disclosure button exists outside the rows.
    const buttons = sidebarNav().getAllByRole('button');
    expect(buttons).toHaveLength(4);
    expect(
      screen.queryByRole('button', { name: /Navigation (aus|ein)klappen/ }),
    ).not.toBeInTheDocument();
  });

  it('does not label rows with aria-label, so the visible text is the name', () => {
    renderSidebar();
    const row = sidebarNav().getByRole('button', { name: /Einstellungen verwalten/ });
    expect(row).not.toHaveAttribute('aria-label');
    expect(row).not.toHaveAttribute('title');
  });
});

describe('variant="icon"', () => {
  it('renders one chevron toggle per function row, collapsed by default', () => {
    renderSidebar({ variant: 'icon' });
    const toggles = screen.getAllByRole('button', { name: 'Navigation ausklappen' });
    expect(toggles).toHaveLength(3);
    toggles.forEach((toggle) => expect(toggle).toHaveAttribute('aria-expanded', 'false'));
  });

  it('points each toggle at the region it controls', () => {
    renderSidebar({ variant: 'icon' });
    const aside = screen.getByRole('complementary');
    screen.getAllByRole('button', { name: 'Navigation ausklappen' }).forEach((toggle) => {
      expect(toggle).toHaveAttribute('aria-controls', aside.id);
    });
  });

  it('names collapsed rows via aria-label and title, since no text is visible', () => {
    renderSidebar({ variant: 'icon' });
    const row = sidebarNav().getByRole('button', { name: 'Einstellungen verwalten' });
    expect(row).toHaveAttribute('aria-label', 'Einstellungen verwalten');
    expect(row).toHaveAttribute('title', 'Einstellungen verwalten');
  });

  it('expands when a chevron is clicked, and reports it on every toggle', async () => {
    const user = userEvent.setup();
    renderSidebar({ variant: 'icon' });
    await user.click(screen.getAllByRole('button', { name: 'Navigation ausklappen' })[0]);

    const toggles = screen.getAllByRole('button', { name: 'Navigation einklappen' });
    expect(toggles).toHaveLength(3);
    toggles.forEach((toggle) => expect(toggle).toHaveAttribute('aria-expanded', 'true'));
  });

  it('drops the redundant aria-label once the label is visible', async () => {
    const user = userEvent.setup();
    renderSidebar({ variant: 'icon' });
    await user.click(screen.getAllByRole('button', { name: 'Navigation ausklappen' })[0]);
    const row = sidebarNav().getByRole('button', { name: /Einstellungen verwalten/ });
    expect(row).not.toHaveAttribute('aria-label');
    expect(row).not.toHaveAttribute('title');
  });

  it('collapses again on a second click', async () => {
    const user = userEvent.setup();
    renderSidebar({ variant: 'icon' });
    await user.click(screen.getAllByRole('button', { name: 'Navigation ausklappen' })[0]);
    await user.click(screen.getAllByRole('button', { name: 'Navigation einklappen' })[0]);
    expect(screen.getAllByRole('button', { name: 'Navigation ausklappen' })).toHaveLength(3);
  });

  it('expands with the keyboard', async () => {
    const user = userEvent.setup();
    renderSidebar({ variant: 'icon' });
    screen.getAllByRole('button', { name: 'Navigation ausklappen' })[0].focus();
    await user.keyboard('{Enter}');
    expect(screen.getAllByRole('button', { name: 'Navigation einklappen' })).toHaveLength(3);
  });

  it('expanding does not activate the row it sits next to', async () => {
    const user = userEvent.setup();
    const { functionGroups } = renderSidebar({ variant: 'icon' });
    await user.click(screen.getAllByRole('button', { name: 'Navigation ausklappen' })[0]);
    expect(functionGroups[0][0].onClick).not.toHaveBeenCalled();
  });

  it('keeps the icon itself navigable while collapsed', async () => {
    const user = userEvent.setup();
    const { functionGroups } = renderSidebar({ variant: 'icon' });
    await user.click(sidebarNav().getByRole('button', { name: 'Einstellungen verwalten' }));
    expect(functionGroups[0][0].onClick).toHaveBeenCalledTimes(1);
  });

  it('honours defaultExpanded', () => {
    renderSidebar({ variant: 'icon', defaultExpanded: true });
    expect(screen.getAllByRole('button', { name: 'Navigation einklappen' })).toHaveLength(3);
  });

  it('gives the pinned help item no chevron', () => {
    renderSidebar({ variant: 'icon' });
    const help = sidebarNav().getByRole('button', { name: /Portalhilfe/ });
    expect(within(help.closest('li')!).getAllByRole('button')).toHaveLength(1);
  });

  it('never nests a button inside another button', () => {
    const { container } = renderSidebar({ variant: 'icon' });
    expect(container.querySelector('button button')).toBeNull();
  });
});

describe('mobile disclosure popover', () => {
  const openPopover = async (user: ReturnType<typeof userEvent.setup>) => {
    await user.click(screen.getByRole('button', { name: /Funktionen öffnen/ }));
  };

  it('starts closed and reports it', () => {
    renderSidebar();
    expect(screen.getByRole('button', { name: /Funktionen öffnen/ })).toHaveAttribute(
      'aria-expanded',
      'false',
    );
  });

  it('does not reference a popover that is not rendered yet', () => {
    renderSidebar();
    const trigger = screen.getByRole('button', { name: /Funktionen öffnen/ });
    expect(document.getElementById(trigger.getAttribute('aria-controls')!)).toBeNull();
  });

  it('opens on click and resolves aria-controls to the real popover', async () => {
    const user = userEvent.setup();
    renderSidebar();
    await openPopover(user);

    const trigger = screen.getByRole('button', { name: 'Funktionen schließen' });
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    expect(document.getElementById(trigger.getAttribute('aria-controls')!)).not.toBeNull();
  });

  it('lists every function item, including the help item', async () => {
    const user = userEvent.setup();
    renderSidebar();
    await openPopover(user);

    const popover = document.getElementById(
      screen.getByRole('button', { name: 'Funktionen schließen' }).getAttribute('aria-controls')!,
    )!;
    expect(within(popover).getAllByRole('button')).toHaveLength(4);
    expect(within(popover).getByRole('button', { name: /Portalhilfe/ })).toBeInTheDocument();
  });

  it('keeps labels as accessible names even though they are hidden visually', async () => {
    const user = userEvent.setup();
    renderSidebar();
    await openPopover(user);

    const popover = document.getElementById(
      screen.getByRole('button', { name: 'Funktionen schließen' }).getAttribute('aria-controls')!,
    )!;
    // Not aria-label: the name comes from real text kept in the accessibility tree.
    const row = within(popover).getByRole('button', { name: /Einstellungen verwalten/ });
    expect(row).not.toHaveAttribute('aria-label');
    expect(row).toHaveTextContent('Einstellungen verwalten');
  });

  it('moves focus into the popover when it opens', async () => {
    const user = userEvent.setup();
    renderSidebar();
    await openPopover(user);
    expect(document.activeElement).toHaveAccessibleName(/Einstellungen verwalten/);
  });

  it('renders the popover after the trigger so tab order flows forwards', async () => {
    const user = userEvent.setup();
    renderSidebar();
    await openPopover(user);

    const trigger = screen.getByRole('button', { name: 'Funktionen schließen' });
    const popover = document.getElementById(trigger.getAttribute('aria-controls')!)!;
    expect(trigger.compareDocumentPosition(popover) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it('closes on Escape and returns focus to the trigger', async () => {
    const user = userEvent.setup();
    renderSidebar();
    await openPopover(user);
    await user.keyboard('{Escape}');

    const trigger = screen.getByRole('button', { name: /Funktionen öffnen/ });
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(document.activeElement).toBe(trigger);
  });

  it('closes and returns focus when an item is chosen', async () => {
    const user = userEvent.setup();
    const { functionGroups } = renderSidebar();
    await openPopover(user);

    const popover = document.getElementById(
      screen.getByRole('button', { name: 'Funktionen schließen' }).getAttribute('aria-controls')!,
    )!;
    await user.click(within(popover).getByRole('button', { name: /Favoriten/ }));

    expect(functionGroups[0][1].onClick).toHaveBeenCalledTimes(1);
    const trigger = screen.getByRole('button', { name: /Funktionen öffnen/ });
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(document.activeElement).toBe(trigger);
  });

  it('closes on a click outside without stealing focus back', async () => {
    const user = userEvent.setup();
    render(
      <>
        <button type="button">Ausserhalb</button>
        <Sidebar functionGroups={makeItems()} />
      </>,
    );
    await user.click(screen.getByRole('button', { name: /Funktionen öffnen/ }));
    await user.click(screen.getByRole('button', { name: 'Ausserhalb' }));

    const trigger = screen.getByRole('button', { name: /Funktionen öffnen/ });
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(document.activeElement).not.toBe(trigger);
  });

  it('toggles shut when the trigger is pressed again', async () => {
    const user = userEvent.setup();
    renderSidebar();
    await openPopover(user);
    await user.click(screen.getByRole('button', { name: 'Funktionen schließen' }));
    expect(screen.getByRole('button', { name: /Funktionen öffnen/ })).toHaveAttribute(
      'aria-expanded',
      'false',
    );
  });

  it('is announced as a disclosure, not as a dialog it cannot honour', async () => {
    const user = userEvent.setup();
    renderSidebar();
    await openPopover(user);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('closes when focus leaves the disclosure entirely', async () => {
    const user = userEvent.setup();
    render(
      <>
        <Sidebar functionGroups={makeItems()} helpItem={helpItem()} />
        <button type="button">Danach</button>
      </>,
    );
    await user.click(screen.getByRole('button', { name: /Funktionen öffnen/ }));
    // Focus starts on the first entry; walk off the end of the popover.
    for (let i = 0; i < 4; i += 1) await user.tab();

    expect(document.activeElement).toHaveAccessibleName('Danach');
    expect(screen.getByRole('button', { name: /Funktionen öffnen/ })).toHaveAttribute(
      'aria-expanded',
      'false',
    );
  });
});
