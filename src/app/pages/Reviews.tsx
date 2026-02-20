import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { Star, MessageSquare, TrendingUp, Award, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { projectId, publicAnonKey } from '/utils/supabase/info';

interface Review {
  id: string;
  salaId: string;
  salaTitulo: string;
  fromUserId: string;
  fromUserName: string;
  fromUserType: 'marca' | 'socio';
  toUserId: string;
  toUserName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

interface PendingReview {
  salaId: string;
  salaTitulo: string;
  otherUserId: string;
  otherUserName: string;
  otherUserType: 'marca' | 'socio';
  completedAt: string;
}

export function Reviews() {
  const { user, userProfile } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [pendingReviews, setPendingReviews] = useState<PendingReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateReview, setShowCreateReview] = useState(false);
  const [selectedPending, setSelectedPending] = useState<PendingReview | null>(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadReviews();
  }, [user]);

  const loadReviews = async () => {
    if (!user) return;

    try {
      // Cargar reviews recibidas
      const reviewsResponse = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-1c8a6aaa/reviews/${user.id}`,
        {
          headers: {
            Authorization: `Bearer ${publicAnonKey}`,
          },
        }
      );

      if (reviewsResponse.ok) {
        const data = await reviewsResponse.json();
        setReviews(data);
      }

      // Cargar salas pendientes de review
      const pendingResponse = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-1c8a6aaa/pending-reviews/${user.id}`,
        {
          headers: {
            Authorization: `Bearer ${publicAnonKey}`,
          },
        }
      );

      if (pendingResponse.ok) {
        const data = await pendingResponse.json();
        setPendingReviews(data);
      }
    } catch (error) {
      console.error('Error cargando reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPending || !user) return;

    setSubmitting(true);

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-1c8a6aaa/reviews`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({
            salaId: selectedPending.salaId,
            fromUserId: user.id,
            fromUserName: userProfile?.name || user?.user_metadata?.name || 'Usuario',
            fromUserType: userProfile?.userType || user?.user_metadata?.userType || 'socio',
            toUserId: selectedPending.otherUserId,
            toUserName: selectedPending.otherUserName,
            rating,
            comment,
          }),
        }
      );

      if (response.ok) {
        setShowCreateReview(false);
        setSelectedPending(null);
        setRating(5);
        setComment('');
        loadReviews();
      }
    } catch (error) {
      console.error('Error enviando review:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const averageRating =
    reviews.length > 0
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
      : '0.0';

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-[#00F2A6] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black px-6 py-12">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-3 flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#00F2A6] to-[#0EA5E9] flex items-center justify-center">
              <Star className="w-7 h-7 text-black fill-black" />
            </div>
            Reseñas
          </h1>
          <p className="text-zinc-400 text-lg">
            Tu reputación se construye con cada acuerdo completado
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          {/* Stats */}
          <div className="bg-zinc-900 border border-[#00F2A6]/20 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <Star className="w-5 h-5 text-[#00F2A6]" />
              <span className="text-zinc-400 text-sm">Calificación Promedio</span>
            </div>
            <p className="text-4xl font-bold text-[#00F2A6]">{averageRating}</p>
            <div className="flex gap-1 mt-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-4 h-4 ${
                    star <= parseFloat(averageRating)
                      ? 'text-[#00F2A6] fill-[#00F2A6]'
                      : 'text-zinc-600'
                  }`}
                />
              ))}
            </div>
          </div>

          <div className="bg-zinc-900 border border-[#00F2A6]/20 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <MessageSquare className="w-5 h-5 text-[#0EA5E9]" />
              <span className="text-zinc-400 text-sm">Total Reseñas</span>
            </div>
            <p className="text-4xl font-bold text-white">{reviews.length}</p>
          </div>

          <div className="bg-zinc-900 border border-yellow-500/20 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <Award className="w-5 h-5 text-yellow-500" />
              <span className="text-zinc-400 text-sm">Pendientes</span>
            </div>
            <p className="text-4xl font-bold text-yellow-500">{pendingReviews.length}</p>
          </div>
        </div>

        {/* Pendientes de Reseña */}
        {pendingReviews.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-yellow-500" />
              Pendientes de Reseñar
            </h2>

            <div className="grid md:grid-cols-2 gap-4">
              {pendingReviews.map((pending) => (
                <div
                  key={pending.salaId}
                  className="bg-zinc-900 border border-yellow-500/30 rounded-xl p-6"
                >
                  <h3 className="text-lg font-bold text-white mb-2">{pending.salaTitulo}</h3>
                  <p className="text-zinc-400 text-sm mb-4">
                    Con{' '}
                    <Link
                      to={`/app/profile/${pending.otherUserId}`}
                      className="text-[#00F2A6] hover:text-[#0EA5E9]"
                    >
                      {pending.otherUserName}
                    </Link>{' '}
                    ({pending.otherUserType === 'marca' ? 'Marca' : 'Socio'})
                  </p>
                  <p className="text-xs text-zinc-500 mb-4">
                    Completado{' '}
                    {new Date(pending.completedAt).toLocaleDateString('es-ES', {
                      day: 'numeric',
                      month: 'long',
                    })}
                  </p>
                  <button
                    onClick={() => {
                      setSelectedPending(pending);
                      setShowCreateReview(true);
                    }}
                    className="w-full px-4 py-3 bg-gradient-to-r from-[#00F2A6] to-[#0EA5E9] text-black font-semibold rounded-xl hover:shadow-lg hover:shadow-[#00F2A6]/50 transition-all"
                  >
                    Dejar Reseña
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Modal Crear Reseña */}
        {showCreateReview && selectedPending && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-6">
            <div className="bg-zinc-900 border-2 border-[#00F2A6]/30 rounded-2xl p-8 max-w-2xl w-full">
              <h2 className="text-2xl font-bold text-white mb-2">
                Reseñar a {selectedPending.otherUserName}
              </h2>
              <p className="text-zinc-400 mb-6">Sala: {selectedPending.salaTitulo}</p>

              <form onSubmit={handleSubmitReview} className="space-y-6">
                {/* Rating */}
                <div>
                  <label className="block text-white font-semibold mb-3">Calificación</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        className="transition-transform hover:scale-110"
                      >
                        <Star
                          className={`w-12 h-12 ${
                            star <= rating
                              ? 'text-[#00F2A6] fill-[#00F2A6]'
                              : 'text-zinc-600 hover:text-zinc-500'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Comentario */}
                <div>
                  <label className="block text-white font-semibold mb-2">
                    Comentario (opcional)
                  </label>
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Comparte tu experiencia trabajando con este usuario..."
                    rows={5}
                    className="w-full bg-black border border-[#00F2A6]/30 rounded-lg px-4 py-3 text-white placeholder:text-zinc-600 focus:outline-none focus:border-[#00F2A6] focus:ring-2 focus:ring-[#00F2A6]/20 resize-none"
                  />
                </div>

                {/* Botones */}
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateReview(false);
                      setSelectedPending(null);
                      setRating(5);
                      setComment('');
                    }}
                    className="flex-1 px-6 py-3 bg-black border border-[#00F2A6]/30 rounded-xl text-white font-semibold hover:border-[#00F2A6] transition-all"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-[#00F2A6] to-[#0EA5E9] text-black font-semibold rounded-xl hover:shadow-lg hover:shadow-[#00F2A6]/50 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {submitting ? (
                      <>
                        <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                        Enviando...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-5 h-5" />
                        Enviar Reseña
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Reseñas Recibidas */}
        <div>
          <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
            <Star className="w-6 h-6 text-[#00F2A6]" />
            Reseñas Recibidas ({reviews.length})
          </h2>

          {reviews.length === 0 ? (
            <div className="bg-zinc-900 border border-[#00F2A6]/20 rounded-2xl p-12 text-center">
              <Star className="w-16 h-16 text-zinc-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">
                Aún no tienes reseñas
              </h3>
              <p className="text-zinc-400">
                Completa acuerdos en PARTH para recibir reseñas de tus socios y marcas.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {reviews.map((review) => (
                <div
                  key={review.id}
                  className="bg-zinc-900 border border-[#00F2A6]/20 rounded-2xl p-6"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#00F2A6] to-[#0EA5E9] flex items-center justify-center text-xl font-bold text-black">
                        {review.fromUserName.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <Link
                          to={`/app/profile/${review.fromUserId}`}
                          className="font-semibold text-white hover:text-[#00F2A6]"
                        >
                          {review.fromUserName}
                        </Link>
                        <p className="text-sm text-zinc-500">
                          {review.fromUserType === 'marca' ? 'Marca' : 'Socio'}
                        </p>
                      </div>
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

                  {review.comment && <p className="text-zinc-300 mb-3">{review.comment}</p>}

                  <div className="flex items-center justify-between text-sm text-zinc-500">
                    <Link
                      to={`/app/sala/${review.salaId}`}
                      className="hover:text-[#00F2A6] transition-colors"
                    >
                      Sala: {review.salaTitulo}
                    </Link>
                    <span>
                      {new Date(review.createdAt).toLocaleDateString('es-ES', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}