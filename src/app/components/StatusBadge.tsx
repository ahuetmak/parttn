import React from 'react';

interface StatusBadgeProps {
  status: 'escrow' | 'hold' | 'approved' | 'disputed' | 'rejected' | 'proof-required' | 'sla';
  children?: React.ReactNode;
}

const badgeStyles = {
  escrow: 'bg-[#3B82F6]/10 text-[#3B82F6] border-[#3B82F6]/30',
  hold: 'bg-[#00D4FF]/10 text-[#00D4FF] border-[#00D4FF]/30',
  approved: 'bg-[#10B981]/10 text-[#10B981] border-[#10B981]/30',
  disputed: 'bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/30',
  rejected: 'bg-[#EF4444]/10 text-[#EF4444] border-[#EF4444]/30',
  'proof-required': 'bg-[#8B5CF6]/10 text-[#8B5CF6] border-[#8B5CF6]/30',
  sla: 'bg-[#94A3B8]/10 text-[#94A3B8] border-[#94A3B8]/30',
};

const badgeLabels: Record<string, string> = {
  escrow: 'Escrow',
  hold: 'Hold',
  approved: 'Approved',
  disputed: 'Disputed',
  rejected: 'Rejected',
  'proof-required': 'Proof Required',
  sla: 'SLA',
};

export function StatusBadge({ status, children }: StatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-lg border text-xs ${badgeStyles[status]}`}
    >
      {children || badgeLabels[status] || status}
    </span>
  );
}