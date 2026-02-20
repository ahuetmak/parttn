import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, CheckCircle, Circle, ArrowRight, Sparkles, Zap, Shield, Diamond } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../../lib/supabase';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: any;
  completed: boolean;
  action?: {
    label: string;
    path: string;
  };
}

export function OnboardingChecklist() {
  const { user, userProfile } = useAuth();
  const [isVisible, setIsVisible] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);
  const [steps, setSteps] = useState<OnboardingStep[]>([]);

  useEffect(() => {
    if (!user) return;
    loadOnboardingProgress();
  }, [user]);

  const loadOnboardingProgress = async () => {
    if (!user) return;

    const progress = user?.user_metadata?.onboardingProgress || {
      profileCompleted: false,
      firstSearch: false,
      firstApplication: false,
      firstRecharge: false,
      tutorialWatched: false,
    };

    const userType = userProfile?.userType || user?.user_metadata?.userType;

    const stepsConfig: OnboardingStep[] = userType === 'marca' ? [
      {
        id: 'profile',
        title: 'Completa tu perfil',
        description: 'Agrega descripción, categoría y logo de tu marca',
        icon: Shield,
        completed: progress.profileCompleted,
        action: {
          label: 'Ir a Perfil',
          path: '/app/settings',
        },
      },
      {
        id: 'tutorial',
        title: 'Ve el tutorial de 2 minutos',
        description: 'Aprende cómo funcionan las Salas Digitales',
        icon: Sparkles,
        completed: progress.tutorialWatched,
        action: {
          label: 'Ver Tutorial',
          path: '/como-funciona',
        },
      },
      {
        id: 'recharge',
        title: 'Recarga tu primer balance',
        description: 'Agrega $100+ para crear tu primera sala',
        icon: Diamond,
        completed: progress.firstRecharge,
        action: {
          label: 'Recargar',
          path: '/app/wallet',
        },
      },
      {
        id: 'offer',
        title: 'Publica tu primera oferta',
        description: 'Encuentra al socio perfecto en el marketplace',
        icon: Zap,
        completed: progress.firstOffer,
        action: {
          label: 'Crear Oferta',
          path: '/app/crear-oferta',
        },
      },
    ] : [
      {
        id: 'profile',
        title: 'Completa tu perfil',
        description: 'Agrega skills, portfolio y experiencia',
        icon: Shield,
        completed: progress.profileCompleted,
        action: {
          label: 'Ir a Perfil',
          path: '/app/settings',
        },
      },
      {
        id: 'tutorial',
        title: 'Ve el tutorial de 2 minutos',
        description: 'Aprende cómo funcionan las Salas Digitales',
        icon: Sparkles,
        completed: progress.tutorialWatched,
        action: {
          label: 'Ver Tutorial',
          path: '/como-funciona',
        },
      },
      {
        id: 'search',
        title: 'Explora el marketplace',
        description: 'Encuentra ofertas que coincidan con tus skills',
        icon: Zap,
        completed: progress.firstSearch,
        action: {
          label: 'Ver Ofertas',
          path: '/app/marketplace',
        },
      },
      {
        id: 'application',
        title: 'Aplica a tu primera oferta',
        description: 'Envía una propuesta profesional',
        icon: Diamond,
        completed: progress.firstApplication,
        action: {
          label: 'Aplicar Ahora',
          path: '/app/marketplace',
        },
      },
    ];

    setSteps(stepsConfig);

    // Mostrar checklist solo si hay pasos pendientes
    const hasPending = stepsConfig.some(s => !s.completed);
    setIsVisible(hasPending);
  };

  const markStepCompleted = async (stepId: string) => {
    if (!user) return;

    const updatedProgress = {
      ...(user?.user_metadata?.onboardingProgress || {}),
      [stepId + 'Completed']: true,
    };

    await supabase.auth.updateUser({
      data: { onboardingProgress: updatedProgress }
    });

    // Actualizar UI
    setSteps(steps.map(s => 
      s.id === stepId ? { ...s, completed: true } : s
    ));

    // Si todos completados, ocultar después de 3 segundos
    const allCompleted = steps.every(s => s.id === stepId || s.completed);
    if (allCompleted) {
      setTimeout(() => setIsVisible(false), 3000);
    }
  };

  const completedCount = steps.filter(s => s.completed).length;
  const totalSteps = steps.length;
  const progress = totalSteps > 0 ? (completedCount / totalSteps) * 100 : 0;

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 50, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="fixed bottom-6 right-6 z-50 w-96"
      >
        <div className="bg-gradient-to-br from-[#0A0E1A] to-black border-2 border-[#00F2A6]/30 rounded-2xl shadow-[0_0_40px_rgba(0,242,166,0.2)] overflow-hidden">
          {/* Header */}
          <div className="p-6 border-b border-[#00F2A6]/20">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[#00F2A6]/20 rounded-lg">
                  <Sparkles className="w-5 h-5 text-[#00F2A6]" />
                </div>
                <div>
                  <h3 className="text-white font-bold text-lg">Primeros Pasos</h3>
                  <p className="text-[#64748B] text-sm">
                    {completedCount} de {totalSteps} completados
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-2 hover:bg-[#00F2A6]/10 rounded-lg transition-colors"
              >
                {isExpanded ? (
                  <X className="w-5 h-5 text-[#64748B]" />
                ) : (
                  <Circle className="w-5 h-5 text-[#64748B]" />
                )}
              </button>
            </div>

            {/* Progress Bar */}
            <div className="relative h-2 bg-black/40 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className="absolute inset-y-0 left-0 bg-gradient-to-r from-[#00F2A6] to-[#0EA5E9] rounded-full"
              />
            </div>
          </div>

          {/* Steps */}
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: 'auto' }}
                exit={{ height: 0 }}
                className="overflow-hidden"
              >
                <div className="p-6 space-y-4">
                  {steps.map((step, index) => (
                    <motion.div
                      key={step.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={`
                        relative p-4 rounded-xl border transition-all
                        ${step.completed
                          ? 'bg-[#00F2A6]/5 border-[#00F2A6]/30'
                          : 'bg-black/20 border-[#64748B]/20 hover:border-[#00F2A6]/40'
                        }
                      `}
                    >
                      <div className="flex items-start gap-3">
                        {/* Icon */}
                        <div className={`
                          p-2 rounded-lg
                          ${step.completed
                            ? 'bg-[#00F2A6]/20'
                            : 'bg-black/40'
                          }
                        `}>
                          {step.completed ? (
                            <CheckCircle className="w-5 h-5 text-[#00F2A6]" />
                          ) : (
                            <step.icon className="w-5 h-5 text-[#64748B]" />
                          )}
                        </div>

                        {/* Content */}
                        <div className="flex-1">
                          <h4 className={`
                            font-semibold mb-1
                            ${step.completed ? 'text-[#00F2A6]' : 'text-white'}
                          `}>
                            {step.title}
                          </h4>
                          <p className="text-[#94A3B8] text-sm mb-3">
                            {step.description}
                          </p>

                          {/* Action Button */}
                          {!step.completed && step.action && (
                            <a
                              href={step.action.path}
                              onClick={() => markStepCompleted(step.id)}
                              className="inline-flex items-center gap-2 px-4 py-2 bg-[#00F2A6]/10 hover:bg-[#00F2A6]/20 border border-[#00F2A6]/30 rounded-lg text-[#00F2A6] text-sm font-semibold transition-all group"
                            >
                              {step.action.label}
                              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </a>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Completion Message */}
                {completedCount === totalSteps && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-6 bg-gradient-to-r from-[#00F2A6]/10 to-[#0EA5E9]/10 border-t border-[#00F2A6]/20"
                  >
                    <p className="text-center text-white font-semibold mb-2">
                      🎉 ¡Felicidades! Has completado el onboarding
                    </p>
                    <p className="text-center text-[#94A3B8] text-sm">
                      Ahora estás listo para usar PARTH al máximo
                    </p>
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}