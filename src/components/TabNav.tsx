import type { TabId } from '@/types/mci';
import { LayoutDashboard, UserPlus, Users, Zap, ArrowRightLeft } from 'lucide-react';

interface TabNavProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
  patientCount: number;
  hasIncident: boolean;
}

const tabs: { id: TabId; label: string; icon: typeof LayoutDashboard }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'activate', label: 'Activate', icon: Zap },
  { id: 'triage', label: 'Triage', icon: UserPlus },
  { id: 'patients', label: 'Patients', icon: Users },
  { id: 'referral', label: 'Referral', icon: ArrowRightLeft },
];

export function TabNav({ activeTab, onTabChange, patientCount, hasIncident }: TabNavProps) {
  return (
    <nav className="fixed top-[52px] left-0 right-0 z-40 bg-background border-b border-border overflow-x-auto">
      <div className="flex min-w-max">
        {tabs.map(tab => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;
          const disabled = !hasIncident && !['dashboard', 'activate'].includes(tab.id);
          return (
            <button
              key={tab.id}
              onClick={() => !disabled && onTabChange(tab.id)}
              className={`
                touch-target flex-1 flex flex-col items-center justify-center py-2 px-3 text-xs font-medium transition-colors min-w-[72px]
                ${isActive ? 'text-primary border-b-2 border-primary bg-primary/5' : 'text-muted-foreground'}
                ${disabled ? 'opacity-30 cursor-not-allowed' : 'active:bg-primary/10'}
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
