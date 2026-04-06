import { useState } from 'react';
import type { TabId } from '@/types/mci';
import { useMCIState } from '@/hooks/useMCIState';
import { TopBar } from '@/components/TopBar';
import { TabNav } from '@/components/TabNav';
import { DashboardView } from '@/components/DashboardView';
import { ActivateView } from '@/components/ActivateView';
import { TriageForm } from '@/components/TriageForm';
import { PatientsView } from '@/components/PatientsView';
import { ReferralView } from '@/components/ReferralView';

const Index = () => {
  const [activeTab, setActiveTab] = useState<TabId>('dashboard');
  const mci = useMCIState();

  const handleTabChange = (tab: TabId) => {
    setActiveTab(tab);
  };

  return (
    <div className="min-h-screen bg-background">
      <TopBar incident={mci.incident} />
      <TabNav
        activeTab={activeTab}
        onTabChange={handleTabChange}
        patientCount={mci.triageCounts.total}
        hasIncident={!!mci.incident?.isActive}
      />

      {/* Main content area — offset by topbar (52px) + tabnav (~48px) */}
      <main className="pt-[100px]">
        {activeTab === 'dashboard' && (
          <DashboardView
            incident={mci.incident}
            triageCounts={mci.triageCounts}
            timeline={mci.timeline}
          />
        )}
        {activeTab === 'activate' && (
          <ActivateView
            incident={mci.incident}
            onActivate={mci.activateIncident}
            onDeactivate={mci.deactivateIncident}
          />
        )}
        {activeTab === 'triage' && mci.incident?.isActive && (
          <TriageForm
            patients={mci.patients}
            onSubmit={mci.addPatient}
          />
        )}
        {activeTab === 'patients' && mci.incident?.isActive && (
          <PatientsView
            patients={mci.patients}
            onUpdateStatus={mci.updatePatientStatus}
            onRetriage={mci.retriagePatient}
          />
        )}
        {activeTab === 'referral' && mci.incident?.isActive && (
          <ReferralView />
        )}
      </main>
    </div>
  );
};

export default Index;
