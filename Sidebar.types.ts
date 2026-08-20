import type { ReactNode } from 'react';

/**
 * Type definitions for the Sidebar component. Kept apart from Sidebar.tsx so the public
 * contract can be read - and imported - without pulling in the implementation.
 */

/**
 * How a function row renders its chevron.
 *
 * - 'decorative' (full variant): a plain span inside the row button.
 * - 'toggle' (icon variant): its own button next to the icon, which expands/collapses the nav.
 *   It has to be a sibling of the row button rather than sit inside it, because a button
 *   cannot be nested in another button.
 * - 'none': no chevron at all (the pinned help item, and rows in the mobile popover).
 */
export type ChevronMode = 'none' | 'decorative' | 'toggle';

/** Per-row rendering options, internal to the component. */
export interface FunctionRowOptions {
  chevron?: ChevronMode;
  /** Icon-only presentation: the label is not rendered visibly, so it moves to aria-label. */
  collapsed?: boolean;
  /** Rows inside the mobile popover return focus to the disclosure button when activated. */
  inPopover?: boolean;
}

export interface SidebarFunctionItem {
  /** Unique id, also used to build aria attributes */
  id: string;
  /** Visible label, e.g. "Einstellungen verwalten" */
  label: string;
  /** Icon shown to the left of the label. Swap in your own icon set. */
  icon: ReactNode;
  /** Called when the row is activated (click or Enter/Space) */
  onClick?: () => void;
  /** Shows the "new information" indicator dot on the icon (e.g. new tutorial content) */
  hasNewInfo?: boolean;
}

export interface SidebarProps {
  /**
   * Title of the current Bereich, rendered above the injected navigation list.
   * Omit if the area title is already rendered elsewhere.
   */
  areaTitle?: string;
  /**
   * The Bereich-specific secondary navigation (Listenpunkt 1.1, 1.2, ...).
   * This is intentionally just a slot - build the actual list in a separate component
   * and pass it in here, e.g. <Sidebar areaTitle="Bereich 1"><SecondaryNav /></Sidebar>.
   */
  children?: ReactNode;
  /**
   * Groups of function rows (e.g. [Einstellungen, Favoriten], [Kurz erklärt]).
   * A divider is rendered between groups, matching the design spec.
   */
  functionGroups: SidebarFunctionItem[][];
  /** Pinned item at the bottom of the functions area (e.g. "Portalhilfe - Bereich 1") */
  helpItem?: SidebarFunctionItem;
  className?: string;
  /**
   * 'full' (default) - the original layout: icon + label rows.
   *
   * 'icon' - a narrow rail showing each function as an icon with a chevron next to it. The
   * chevron expands the rail into the full icon + label layout (area title and injected nav
   * included) and collapses it again.
   *
   * The variants differ above the M breakpoint only. At or below it both hide the sidebar and
   * fall back to the same floating disclosure button + popover.
   */
  variant?: 'full' | 'icon';
  /** variant="icon" only: start expanded instead of collapsed. */
  defaultExpanded?: boolean;
}
