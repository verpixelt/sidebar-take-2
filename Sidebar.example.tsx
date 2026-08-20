import React from 'react';
import { Sidebar } from './Sidebar';
import type { SidebarFunctionItem, SidebarProps } from './Sidebar.types';

// Placeholder icons - swap these for your actual icon set.
const GearIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </svg>
);

const StarIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
  </svg>
);

const ExplainerIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);

const QuestionMarkIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
    <circle cx="12" cy="12" r="10" />
    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);

const functionGroups: SidebarFunctionItem[][] = [
  [
    { id: 'settings', label: 'Einstellungen verwalten', icon: <GearIcon />, onClick: () => {} },
    { id: 'favorites', label: 'Favoriten & Interessen', icon: <StarIcon />, onClick: () => {} },
  ],
  [
    {
      id: 'explainer',
      label: 'Kurz erklärt',
      icon: <ExplainerIcon />,
      onClick: () => {},
      hasNewInfo: true,
    },
  ],
];

const helpItem: SidebarFunctionItem = {
  id: 'help',
  label: 'Portalhilfe - Bereich 1',
  icon: <QuestionMarkIcon />,
  onClick: () => {},
};

export const SidebarExample: React.FC<Pick<SidebarProps, 'variant' | 'defaultExpanded'>> = (props) => (
  <Sidebar areaTitle="Bereich 1" functionGroups={functionGroups} helpItem={helpItem} {...props}>
    {/* Replace with the actual secondary navigation component, e.g. <SecondaryNav /> */}
    <ul>
      <li>Listenpunkt 1.1</li>
      <li>Listenpunkt 1.2</li>
      <li>Listenpunkt 1.3</li>
    </ul>
  </Sidebar>
);

export default SidebarExample;
