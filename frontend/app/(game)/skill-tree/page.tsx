'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { GitFork, Sparkles, Zap, Shield, AlertCircle } from 'lucide-react';
import { useSkillTree } from '@/features/skill-tree/use-skill-tree';
import { SkillBranchSelector } from '@/components/skill-tree/skill-branch-selector';
import { SkillNodeCard } from '@/components/skill-tree/skill-node-card';
import { SkillUnlockModal } from '@/components/skill-tree/skill-unlock-modal';
import { EvolutionModal } from '@/components/character/evolution-modal';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { PageContainer } from '@/components/layout/PageContainer';
import type { AttributeKey } from '@/../src/shared/types/attribute';
import type { SkillNodeWithState } from '@/../src/shared/types/skill';

export default function SkillTreePage() {
  const { treeData, loading, unlocking, error, unlockSkill } = useSkillTree();
  const [selectedBranch, setSelectedBranch] = React.useState<AttributeKey | 'ALL'>('ALL');
  const [selectedNode, setSelectedNode] = React.useState<SkillNodeWithState | null>(null);

  // Evolution celebration modal state
  const [evolutionCelebration, setEvolutionCelebration] = React.useState<{
    isOpen: boolean;
    tier: number;
    title: string;
    tierName: string;
  }>({
    isOpen: false,
    tier: 1,
    title: '',
    tierName: '',
  });

  const handleConfirmUnlock = async (skillId: string) => {
    const res = await unlockSkill(skillId);
    if (res.success && res.result) {
      setSelectedNode(null);
      if (res.result.newEvolutionUnlocked) {
        setEvolutionCelebration({
          isOpen: true,
          tier: res.result.evolutionTier,
          title: res.result.evolutionTitle,
          tierName:
            res.result.evolutionTier === 4
              ? 'Paragon'
              : res.result.evolutionTier === 3
              ? 'Master'
              : 'Adept',
        });
      }
    }
  };

  const branchesToRender = React.useMemo(() => {
    if (!treeData) return [];
    if (selectedBranch === 'ALL') return treeData.branches;
    return treeData.branches.filter((b) => b.attributeKey === selectedBranch);
  }, [treeData, selectedBranch]);

  return (
    <PageContainer>
      <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/80 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              <GitFork className="h-5 w-5" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Skill Tree</h1>
            <Badge variant="neutral" size="sm" className="font-mono text-xs">
              Mastery System
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Attune capability perks across 6 attribute branches to unlock permanent gameplay multipliers.
          </p>
        </div>

        {/* Skill Points Display */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-amber-300 dark:border-amber-800 bg-amber-50/60 dark:bg-amber-950/40 shadow-sm">
            <Zap className="h-4 w-4 text-amber-500 animate-pulse" />
            <div className="text-left">
              <div className="text-[10px] uppercase font-mono tracking-wider text-muted-foreground">
                Available SP
              </div>
              <div className="text-lg font-extrabold text-foreground leading-none">
                {treeData?.availableSkillPoints ?? 0}
              </div>
            </div>
          </div>

          <div className="hidden sm:flex flex-col text-right text-xs text-muted-foreground border-l border-border pl-3">
            <span>Spent: {treeData?.spentSkillPoints ?? 0} SP</span>
            <span>Total: {treeData?.totalSkillPoints ?? 0} SP</span>
          </div>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="p-4 rounded-xl border border-rose-200 dark:border-rose-900 bg-rose-50/50 dark:bg-rose-950/30 text-rose-800 dark:text-rose-200 text-xs flex items-center gap-2">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Branch Selector */}
      <SkillBranchSelector
        selectedBranch={selectedBranch}
        onSelectBranch={setSelectedBranch}
      />

      {/* Skill Tree Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} variant="muted" className="h-64 animate-pulse">
              <CardContent />
            </Card>
          ))}
        </div>
      ) : (
        <div className="space-y-8">
          {branchesToRender.map((branch) => (
            <div key={branch.attributeKey} className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-base text-foreground tracking-tight flex items-center gap-2">
                  <span>{branch.label} Branch</span>
                  <Badge variant="neutral" size="sm" className="font-mono text-[10px]">
                    {branch.attributeKey}
                  </Badge>
                </h3>
              </div>

              {/* 3 Tier Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {branch.skills.map((skill) => (
                  <SkillNodeCard
                    key={skill.id}
                    skill={skill}
                    onSelectUnlock={(node) => setSelectedNode(node)}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Skill Unlock Confirmation Dialog */}
      <SkillUnlockModal
        skill={selectedNode}
        isOpen={Boolean(selectedNode)}
        onClose={() => setSelectedNode(null)}
        onConfirmUnlock={handleConfirmUnlock}
        unlocking={unlocking}
      />

      {/* Character Ascension Celebration Modal */}
      <EvolutionModal
        isOpen={evolutionCelebration.isOpen}
        onClose={() =>
          setEvolutionCelebration((prev) => ({ ...prev, isOpen: false }))
        }
        tier={evolutionCelebration.tier}
        title={evolutionCelebration.title}
        tierName={evolutionCelebration.tierName}
      />
      </div>
    </PageContainer>
  );
}
