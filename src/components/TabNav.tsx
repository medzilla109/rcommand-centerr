import type { TabId } from '@/types/mci';
import { LayoutDashboard, UserPlus, Users, Package } from 'lucide-react';

interface TabNavProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
  patientCount: number;
  hasIncident: boolean;
}

const tabs: { id: TabId; label: string; icon: typeof LayoutDashboard }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'triage', label: 'Triage', icon: UserPlus },
  { id: 'patients', label: 'Patients', icon: Users },
  { id: 'resources', label: 'Resources', icon: Package },
];

export function TabNav({ activeTab, onTabChange, patientCount, hasIncident }: TabNavProps) {
  return (
    <nav className="fixed top-[52px] left-0 right-0 z-40 bg-background border-b border-border">
      <div className="flex">
        {tabs.map(tab => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              disabled={!hasIncident && tab.id !== 'dashboard'}
              className={`
                touch-target flex-1 flex flex-col items-center justify-center py-2 px-1 text-xs font-medium transition-colors
                ${isActive ? 'text-primary border-b-2 border-primary bg-primary/5' : 'text-muted-foreground hover:text-foreground'}
                ${!hasIncident && tab.id !== 'dashboard' ? 'opacity-30 cursor-not-allowed' : ''}
              `}
            >
              <Icon className="w-4 h-4 mb-0.5" />
              <span>{tab.label}</span>
              {tab.id === 'patients' && patientCount > 0 && (
                <span className="font-mono text-[10px] text-primary">{patientCount}</span>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
