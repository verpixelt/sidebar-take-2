import React, { useCallback, useEffect, useId, useRef, useState } from 'react';
import styles from './Sidebar.module.scss';
import type {
  ChevronMode,
  FunctionRowOptions,
  SidebarFunctionItem,
  SidebarProps,
} from './Sidebar.types';

// Re-exported so consumers can keep importing the public types from './Sidebar'.
export type { SidebarFunctionItem, SidebarProps } from './Sidebar.types';

/**
 * Appended to a row's accessible name when it carries the "new information" dot. The dot
 * itself lives inside an aria-hidden icon wrapper, so without this the state would be
 * conveyed by colour alone - visible to sighted users and to nobody else (WCAG 1.4.1).
 */
const NEW_INFO_LABEL = 'neue Informationen';

/**
 * Sidebar navigation ("Sidebar mit Sekundärnavigation") per the Zoll Designsystem spec.
 *
 * - Desktop (> M breakpoint): renders the injected secondary nav plus a labelled functions list.
 * - Mobile (<= M breakpoint): the secondary nav is expected to move into the app's burger menu
 *   (built elsewhere, not by this component), and the functions list collapses into a floating
 *   disclosure button + popover, per the spec's "Responsivität" section.
 *
 * The page header ("FA-Kennung" bar) is out of scope - render it separately above this component.
 *
 * See the `variant` prop for the icon-only rail.
 */
export const Sidebar: React.FC<SidebarProps> = ({
  areaTitle,
  children,
  functionGroups,
  helpItem,
  className,
  variant = 'full',
  defaultExpanded = false,
}) => {
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const disclosureRef = useRef<HTMLDivElement>(null);
  const disclosureButtonRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  // Ids have to be per-instance: two sidebars on one page would otherwise both claim
  // "sidebar-functions-popover" and aria-controls would resolve to the wrong element.
  const instanceId = useId();
  const popoverId = `${instanceId}-functions-popover`;
  const sidebarId = `${instanceId}-sidebar`;

  const isIconVariant = variant === 'icon';
  const isCollapsed = isIconVariant && !isExpanded;

  // See ChevronMode in Sidebar.types.ts for what each mode renders. Both variants hide the
  // sidebar outright below the M breakpoint, so neither needs a mobile-specific mode.
  const rowChevron: ChevronMode = isIconVariant ? 'toggle' : 'decorative';

  /**
   * Closing by Escape or by choosing an item has to hand focus back to the trigger, otherwise
   * focus falls to <body> and keyboard users lose their place (WCAG 2.4.3). Dismissing by
   * clicking elsewhere deliberately does not, since the pointer has already moved on.
   */
  const closePanel = useCallback((restoreFocus: boolean) => {
    setIsPanelOpen(false);
    if (restoreFocus) disclosureButtonRef.current?.focus();
  }, []);

  // Close the popover on outside click or Escape, as expected for a disclosure/popover pattern.
  useEffect(() => {
    if (!isPanelOpen) return;

    const handlePointerDown = (event: PointerEvent) => {
      if (disclosureRef.current && !disclosureRef.current.contains(event.target as Node)) {
        closePanel(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closePanel(true);
    };

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isPanelOpen, closePanel]);

  // Opening moves focus to the first entry so the popover is reachable by keyboard at all -
  // it renders after the trigger in the DOM, so without this a keyboard user would have to
  // tab forwards past it to get in.
  useEffect(() => {
    if (isPanelOpen) popoverRef.current?.querySelector('button')?.focus();
  }, [isPanelOpen]);

  const allFunctionItems = helpItem ? [...functionGroups.flat(), helpItem] : functionGroups.flat();
  const hasNewInfo = allFunctionItems.some((item) => item.hasNewInfo);

  const renderFunctionRow = (
    item: SidebarFunctionItem,
    { chevron = 'none', collapsed = false, inPopover = false }: FunctionRowOptions = {},
  ) => (
    <li key={item.id} className={styles.functionItem}>
      <button
        type="button"
        className={styles.functionButton}
        // Collapsed to an icon, the row has no visible text to name it, so carry the label as
        // the accessible name and as a hover tooltip. aria-label replaces the whole subtree,
        // so the "new information" note has to be folded in here rather than left to the
        // visually hidden span below.
        title={collapsed ? item.label : undefined}
        aria-label={
          collapsed
            ? item.hasNewInfo
              ? `${item.label}, ${NEW_INFO_LABEL}`
              : item.label
            : undefined
        }
        onClick={() => {
          item.onClick?.();
          if (inPopover) closePanel(true);
        }}
      >
        <span className={styles.functionIcon} aria-hidden="true">
          {item.icon}
          {item.hasNewInfo && <span className={styles.newInfoBadge} />}
        </span>
        <span className={styles.functionLabel}>{item.label}</span>
        {!collapsed && item.hasNewInfo && (
          <span className={styles.srOnly}>, {NEW_INFO_LABEL}</span>
        )}
        {chevron === 'decorative' && (
          <span className={styles.chevron} aria-hidden="true">
            ›
          </span>
        )}
      </button>

      {chevron === 'toggle' && (
        <button
          type="button"
          className={styles.chevronButton}
          aria-expanded={isExpanded}
          aria-controls={sidebarId}
          aria-label={isExpanded ? 'Navigation einklappen' : 'Navigation ausklappen'}
          onClick={() => setIsExpanded((expanded) => !expanded)}
        >
          <span
            className={`${styles.chevron} ${isExpanded ? styles.chevronExpanded : ''}`}
            aria-hidden="true"
          >
            ›
          </span>
        </button>
      )}
    </li>
  );

  return (
    <>
      <aside
        id={sidebarId}
        className={[
          styles.sidebar,
          isIconVariant && styles.iconVariant,
          isCollapsed && styles.collapsed,
          className,
        ]
          .filter(Boolean)
          .join(' ')}
        aria-label="Seitennavigation"
      >
        {areaTitle && <h2 className={styles.areaTitle}>{areaTitle}</h2>}

        {children && <div className={styles.areaNav}>{children}</div>}

        <nav className={styles.functionsNav} aria-label="Funktionen">
          {functionGroups.map((group, groupIndex) => (
            <React.Fragment key={groupIndex}>
              {/* Purely decorative: the groups are already separate lists. */}
              {groupIndex > 0 && <hr className={styles.divider} aria-hidden="true" />}
              <ul className={styles.functionList}>
                {group.map((item) =>
                  renderFunctionRow(item, { chevron: rowChevron, collapsed: isCollapsed }),
                )}
              </ul>
            </React.Fragment>
          ))}

          {/* The pinned help item never takes a chevron, matching the full variant's anatomy. */}
          {helpItem && (
            <ul className={`${styles.functionList} ${styles.helpList}`}>
              {renderFunctionRow(helpItem, { collapsed: isCollapsed })}
            </ul>
          )}
        </nav>
      </aside>

      {/* Mobile only, both variants: functions collapse into a floating disclosure button
          + popover. */}
      <div
        ref={disclosureRef}
        className={styles.mobileDisclosure}
        // Tabbing past the last entry dismisses the popover, so keyboard users are not left
        // with an open panel they have already walked out of.
        onBlur={(event) => {
          if (isPanelOpen && !event.currentTarget.contains(event.relatedTarget)) {
            closePanel(false);
          }
        }}
      >
        {/* This is a disclosure, not a dialog: it does not trap focus or make the rest of the
            page inert, so announcing it as a dialog would promise more than it delivers. The
            button owns the state via aria-expanded/aria-controls. */}
        <button
          ref={disclosureButtonRef}
          type="button"
          className={styles.disclosureButton}
          aria-expanded={isPanelOpen}
          aria-controls={popoverId}
          aria-label={
            isPanelOpen
              ? 'Funktionen schließen'
              : hasNewInfo
                ? `Funktionen öffnen, ${NEW_INFO_LABEL}`
                : 'Funktionen öffnen'
          }
          onClick={() => (isPanelOpen ? closePanel(false) : setIsPanelOpen(true))}
        >
          <span className={styles.disclosureIcon} aria-hidden="true">
            {isPanelOpen ? '✕' : '⋮'}
          </span>
          {!isPanelOpen && hasNewInfo && <span className={styles.newInfoBadge} />}
        </button>

        {/* Rendered after the trigger so tab order runs button -> entries, even though the
            popover sits above the button visually. */}
        {isPanelOpen && (
          <div ref={popoverRef} id={popoverId} className={styles.popover}>
            <ul className={styles.functionList}>
              {functionGroups.flat().map((item) => renderFunctionRow(item, { inPopover: true }))}
              {helpItem && renderFunctionRow(helpItem, { inPopover: true })}
            </ul>
          </div>
        )}
      </div>
    </>
  );
};

export default Sidebar;
