import Link from 'next/link';
import {
  HardHat,
  Shield,
  BarChart3,
  CheckCircle2,
  Star,
  ArrowRight,
  Phone,
  Mail,
  MapPin,
  Users,
  FolderOpen,
  ThumbsUp,
  Facebook,
  Twitter,
  Linkedin,
} from 'lucide-react';
import { Navbar } from '@/components/layout/navbar';
import { Button } from '@/components/ui/button';

// ─── Static data ──────────────────────────────────────────────────────────────

const features = [
  {
    icon: HardHat,
    title: 'Matching BTP Intelligent',
    description:
      "Trouvez les meilleurs prestataires BTP certifiés pour vos projets de construction et rénovation à Cotonou et dans tout le Bénin.",
    color: 'bg-orange-100 text-orange-600',
  },
  {
    icon: Shield,
    title: 'Paiement Sécurisé',
    description:
      "Vos fonds sont protégés par notre système d'escrow. Le paiement n'est libéré que lorsque vous validez chaque étape des travaux.",
    color: 'bg-green-100 text-green-600',
  },
  {
    icon: BarChart3,
    title: 'Suivi en Temps Réel',
    description:
      'Suivez l\'avancement de vos projets, approuvez les jalons et communiquez directement avec vos prestataires depuis votre tableau de bord.',
    color: 'bg-blue-100 text-blue-600',
  },
];

const steps = [
  {
    number: '01',
    title: 'Publiez votre projet',
    description: 'Décrivez vos travaux, définissez votre budget et localisez votre chantier sur la carte.',
  },
  {
    number: '02',
    title: 'Recevez des devis',
    description: 'Les prestataires certifiés de votre zone vous envoient leurs propositions détaillées.',
  },
  {
    number: '03',
    title: 'Choisissez et payez',
    description: 'Comparez les devis, acceptez le meilleur et financez le projet en toute sécurité via Mobile Money.',
  },
  {
    number: '04',
    title: 'Validez et évaluez',
    description: 'Approuvez chaque étape, libérez les paiements et laissez votre avis sur le prestataire.',
  },
];

const testimonials = [
  {
    name: 'Adjoua Koffi',
    role: 'Propriétaire, Cotonou',
    content:
      "MHAO m'a permis de rénover ma maison sans stress. J'ai reçu 5 devis en 48h et le prestataire que j'ai choisi a fait un travail impeccable. Le système de paiement par étapes me donnait une vraie tranquillité d'esprit.",
    rating: 5,
    initials: 'AK',
  },
  {
    name: 'Moussa Traoré',
    role: 'Entrepreneur BTP, Porto-Novo',
    content:
      "Depuis que j'utilise MHAO, j'ai doublé mon carnet de commandes. La plateforme me connecte à des clients sérieux et les paiements sont toujours sécurisés. Je recommande vivement!",
    rating: 5,
    initials: 'MT',
  },
  {
    name: 'Isabelle Hounsou',
    role: 'Promotrice immobilière, Calavi',
    content:
      "Pour mes projets de promotions immobilières, MHAO est devenu indispensable. Je peux gérer plusieurs chantiers simultanément et le suivi des jalons me fait gagner un temps précieux.",
    rating: 5,
    initials: 'IH',
  },
];

const stats = [
  { value: '500+', label: 'Prestataires certifiés', icon: Users },
  { value: '1 200+', label: 'Projets réalisés', icon: FolderOpen },
  { value: '98%', label: 'Taux de satisfaction', icon: ThumbsUp },
];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* ── Hero ── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-orange-50 via-white to-amber-50">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, #f97316 1px, transparent 0)',
            backgroundSize: '32px 32px',
          }} />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24 lg:pt-32 lg:pb-36">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-primary-100 text-primary-700 rounded-full px-4 py-1.5 text-sm font-medium mb-6">
              <span className="h-2 w-2 bg-primary-500 rounded-full animate-pulse" />
              Disponible au Bénin - Lancement à Cotonou
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 leading-tight mb-6">
              Construisez vos rêves en{' '}
              <span className="text-primary-500">Afrique de l'Ouest</span>
            </h1>

            <p className="text-lg sm:text-xl text-gray-600 mb-10 max-w-2xl leading-relaxed">
              MHAO connecte les particuliers et promoteurs avec les meilleurs prestataires BTP
              certifiés au Bénin. Comparez les devis, payez en toute sécurité et suivez vos
              chantiers en temps réel.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" asChild>
                <Link href="/register">
                  Démarrer mon projet
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link href="/register?role=PROVIDER">Je suis prestataire</Link>
              </Button>
            </div>

            <div className="mt-10 flex flex-wrap items-center gap-6 text-sm text-gray-500">
              {['Inscription gratuite', 'Devis sous 48h', 'Paiement 100% sécurisé'].map((item) => (
                <div key={item} className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-secondary-500 flex-shrink-0" />
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Decorative shapes */}
        <div className="absolute right-0 top-0 h-full w-1/3 hidden lg:block">
          <div className="absolute right-0 top-1/2 -translate-y-1/2 -translate-x-8 h-80 w-80 bg-primary-500 rounded-full opacity-10 blur-3xl" />
          <div className="absolute right-24 bottom-16 h-48 w-48 bg-secondary-500 rounded-full opacity-10 blur-2xl" />
        </div>
      </section>

      {/* ── Stats ── */}
      <section className="bg-primary-500 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
            {stats.map((stat) => {
              const Icon = stat.icon;
              return (
                <div key={stat.label} className="text-white">
                  <Icon className="h-8 w-8 mx-auto mb-3 opacity-80" />
                  <div className="text-4xl font-extrabold mb-1">{stat.value}</div>
                  <div className="text-orange-100 text-sm">{stat.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" className="py-20 lg:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Tout ce dont vous avez besoin
            </h2>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto">
              Une plateforme complète pour gérer vos projets de construction de A à Z.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className="rounded-2xl border border-gray-100 p-8 hover:shadow-lg transition-shadow group"
                >
                  <div className={`inline-flex rounded-xl p-3 mb-5 ${feature.color}`}>
                    <Icon className="h-7 w-7" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                  <p className="text-gray-500 leading-relaxed">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section id="how-it-works" className="py-20 lg:py-28 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Comment ça marche?
            </h2>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto">
              Lancez votre projet en 4 étapes simples.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <div key={step.number} className="relative">
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-8 left-full w-full h-0.5 bg-primary-200 z-0" style={{ width: 'calc(100% - 3rem)', left: '3rem' }} />
                )}
                <div className="relative z-10">
                  <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-primary-500 text-white font-bold text-lg mb-4 shadow-lg shadow-primary-200">
                    {step.number}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{step.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section id="testimonials" className="py-20 lg:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Ils nous font confiance
            </h2>
            <p className="text-lg text-gray-500">
              Découvrez les témoignages de nos utilisateurs satisfaits.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial) => (
              <div
                key={testimonial.name}
                className="rounded-2xl border border-gray-100 p-8 hover:shadow-lg transition-shadow"
              >
                <div className="flex gap-1 mb-5">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-amber-400 fill-amber-400" />
                  ))}
                </div>
                <p className="text-gray-600 leading-relaxed mb-6 text-sm">
                  &ldquo;{testimonial.content}&rdquo;
                </p>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-semibold text-sm flex-shrink-0">
                    {testimonial.initials}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">{testimonial.name}</p>
                    <p className="text-xs text-gray-500">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section className="py-20 bg-gradient-to-r from-primary-500 to-orange-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Prêt à démarrer votre projet?
          </h2>
          <p className="text-orange-100 text-lg mb-8">
            Rejoignez des milliers de clients et prestataires qui font confiance à MHAO.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="bg-white text-primary-600 hover:bg-orange-50"
              asChild
            >
              <Link href="/register">
                Créer mon compte gratuitement
                <ArrowRight className="h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="bg-gray-900 text-gray-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            {/* Brand */}
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 font-bold text-xl text-white mb-4">
                <div className="bg-primary-500 rounded-lg p-1.5">
                  <HardHat className="h-5 w-5 text-white" />
                </div>
                MHAO
              </div>
              <p className="text-gray-400 text-sm leading-relaxed mb-6 max-w-sm">
                Marketplace Habitat Afrique de l&apos;Ouest — La plateforme de référence pour la
                construction et la rénovation au Bénin.
              </p>
              <div className="flex gap-3">
                {[Facebook, Twitter, Linkedin].map((Icon, i) => (
                  <a
                    key={i}
                    href="#"
                    className="h-9 w-9 rounded-lg bg-gray-800 flex items-center justify-center hover:bg-primary-500 transition-colors"
                  >
                    <Icon className="h-4 w-4" />
                  </a>
                ))}
              </div>
            </div>

            {/* Links */}
            <div>
              <h4 className="text-white font-semibold mb-4">Plateforme</h4>
              <ul className="space-y-2.5 text-sm">
                {[
                  ['Comment ça marche', '/#how-it-works'],
                  ['Prestataires', '/dashboard/providers'],
                  ['Tarifs', '/#pricing'],
                  ['Sécurité', '/#security'],
                ].map(([label, href]) => (
                  <li key={label}>
                    <Link href={href} className="hover:text-white transition-colors">
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="text-white font-semibold mb-4">Contact</h4>
              <ul className="space-y-3 text-sm">
                <li className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-primary-400 flex-shrink-0" />
                  Cotonou, Bénin
                </li>
                <li className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-primary-400 flex-shrink-0" />
                  +229 XX XX XX XX
                </li>
                <li className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-primary-400 flex-shrink-0" />
                  contact@mhao.africa
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-gray-800 flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-gray-500">
            <p>© 2024 MHAO. Tous droits réservés.</p>
            <div className="flex gap-6">
              <Link href="#" className="hover:text-gray-300 transition-colors">Confidentialité</Link>
              <Link href="#" className="hover:text-gray-300 transition-colors">CGU</Link>
              <Link href="#" className="hover:text-gray-300 transition-colors">Cookies</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
