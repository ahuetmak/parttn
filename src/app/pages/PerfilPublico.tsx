import { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import { Star, Shield, TrendingUp, Award, CheckCircle, XCircle } from 'lucide-react';
import { projectId, publicAnonKey } from '/utils/supabase/info';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  userType: 'marca' | 'socio';
  reputation: number;
  completedDeals: number;
  createdAt: string;
  bio?: string;
  avatar?: string;
  skills?: string[];
  verified?: boolean;
}

interface Review {
  id: string;
  rating: number;
  comment: string;
  fromUser: string;
  fromUserName: string;
  salaId: string;
  createdAt: string;
}

export function PerfilPublico() {
  const { userId } = useParams();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfile();
  }, [userId]);

  const loadProfile = async () => {
    try {
      // Obtener perfil del usuario
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-1c8a6aaa/user/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${publicAnonKey}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setProfile(data);
      }

      // TODO: Obtener reviews cuando se implemente el endpoint
      setReviews([]);
    } catch (error) {
      console.error('Error cargando perfil:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-[#00F2A6] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Usuario no encontrado</h2>
          <p className="text-zinc-400">El perfil que buscas no existe o ha sido eliminado.</p>
        </div>
      </div>
    );
  }

  const reputationColor =
    profile.reputation >= 90
      ? 'text-[#00F2A6]'
      : profile.reputation >= 70
      ? 'text-[#0EA5E9]'
      : profile.reputation >= 50
      ? 'text-yellow-500'
      : 'text-orange-500';

  return (
    <div className="min-h-screen bg-black">
      {/* Hero Section */}
      <div className="relative h-48 bg-gradient-to-br from-[#00F2A6]/20 to-[#0EA5E9]/20 border-b border-[#00F2A6]/30">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjMDBGMkE2IiBzdHJva2Utd2lkdGg9IjAuNSIgb3BhY2l0eT0iMC4xIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-30" />
      </div>

      <div className="max-w-6xl mx-auto px-6 -mt-20">
        {/* Card Principal */}
        <div className="bg-zinc-900 border-2 border-[#00F2A6]/30 rounded-3xl p-8 shadow-2xl shadow-[#00F2A6]/10">
          <div className="flex items-start gap-6">
            {/* Avatar */}
            <div className="relative">
              <div className="w-32 h-32 rounded-2xl bg-gradient-to-br from-[#00F2A6] to-[#0EA5E9] flex items-center justify-center text-5xl font-bold text-black shadow-lg shadow-[#00F2A6]/30">
                {profile.name.charAt(0).toUpperCase()}
              </div>
              {profile.verified && (
                <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-full bg-[#00F2A6] border-4 border-black flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-black" />
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-4xl font-bold text-white">{profile.name}</h1>
                <span
                  className={`px-4 py-1 rounded-full text-sm font-semibold ${
                    profile.userType === 'marca'
                      ? 'bg-[#0EA5E9]/20 text-[#0EA5E9] border border-[#0EA5E9]/30'
                      : 'bg-[#00F2A6]/20 text-[#00F2A6] border border-[#00F2A6]/30'
                  }`}
                >
                  {profile.userType === 'marca' ? '🏢 Marca' : '🤝 Socio'}
                </span>
              </div>

              {profile.bio && <p className="text-zinc-400 mb-4">{profile.bio}</p>}

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 mt-6">
                <div className="bg-black border border-[#00F2A6]/20 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Star className={`w-5 h-5 ${reputationColor}`} />
                    <span className="text-zinc-400 text-sm">Reputación</span>
                  </div>
                  <p className={`text-3xl font-bold ${reputationColor}`}>
                    {profile.reputation}/100
                  </p>
                </div>

                <div className="bg-black border border-[#00F2A6]/20 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-5 h-5 text-[#0EA5E9]" />
                    <span className="text-zinc-400 text-sm">Acuerdos</span>
                  </div>
                  <p className="text-3xl font-bold text-white">{profile.completedDeals}</p>
                </div>

                <div className="bg-black border border-[#00F2A6]/20 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Shield className="w-5 h-5 text-[#00F2A6]" />
                    <span className="text-zinc-400 text-sm">Antigüedad</span>
                  </div>
                  <p className="text-3xl font-bold text-white">
                    {Math.floor(
                      (Date.now() - new Date(profile.createdAt).getTime()) /
                        (1000 * 60 * 60 * 24 * 30)
                    )}
                    m
                  </p>
                </div>
              </div>

              {/* Skills */}
              {profile.skills && profile.skills.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-sm text-zinc-400 mb-2 flex items-center gap-2">
                    <Award className="w-4 h-4" />
                    Habilidades
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {profile.skills.map((skill, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 rounded-lg bg-black border border-[#00F2A6]/30 text-[#00F2A6] text-sm"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Reviews */}
        <div className="mt-8 mb-12">
          <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
            <Star className="w-6 h-6 text-[#00F2A6]" />
            Reseñas ({reviews.length})
          </h2>

          {reviews.length === 0 ? (
            <div className="bg-zinc-900 border border-[#00F2A6]/20 rounded-2xl p-8 text-center">
              <p className="text-zinc-400">Aún no hay reseñas para este usuario.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {reviews.map((review) => (
                <div
                  key={review.id}
                  className="bg-zinc-900 border border-[#00F2A6]/20 rounded-2xl p-6"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-semibold text-white">{review.fromUserName}</p>
                      <p className="text-sm text-zinc-500">
                        {new Date(review.createdAt).toLocaleDateString('es-ES')}
                      </p>
                    </div>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-4 h-4 ${
                            star <= review.rating
                              ? 'text-[#00F2A6] fill-[#00F2A6]'
                              : 'text-zinc-600'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-zinc-300">{review.comment}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
