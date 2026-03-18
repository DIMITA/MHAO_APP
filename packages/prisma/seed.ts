import { PrismaClient, Role, KycStatus, ProjectStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, 12);
}

// ─── Seed Data ────────────────────────────────────────────────────────────────

async function main(): Promise<void> {
  console.log('Starting database seed...');

  // ── Admin User ──────────────────────────────────────────────────────────────
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@mhao.bj' },
    update: {},
    create: {
      email: 'admin@mhao.bj',
      phone: '+22997000001',
      passwordHash: await hashPassword('Admin@MHAO2024!'),
      firstName: 'Super',
      lastName: 'Admin',
      role: Role.ADMIN,
      kycStatus: KycStatus.VERIFIED,
      isActive: true,
    },
  });
  console.log(`Created admin: ${adminUser.email}`);

  // ── Client Users ────────────────────────────────────────────────────────────
  const client1 = await prisma.user.upsert({
    where: { email: 'kofi.mensah@gmail.com' },
    update: {},
    create: {
      email: 'kofi.mensah@gmail.com',
      phone: '+22997100001',
      passwordHash: await hashPassword('Client@1234!'),
      firstName: 'Kofi',
      lastName: 'Mensah',
      role: Role.CLIENT,
      kycStatus: KycStatus.VERIFIED,
      isActive: true,
    },
  });
  console.log(`Created client 1: ${client1.email}`);

  const client2 = await prisma.user.upsert({
    where: { email: 'ama.kone@yahoo.fr' },
    update: {},
    create: {
      email: 'ama.kone@yahoo.fr',
      phone: '+22997100002',
      passwordHash: await hashPassword('Client@1234!'),
      firstName: 'Ama',
      lastName: 'Koné',
      role: Role.CLIENT,
      kycStatus: KycStatus.PENDING,
      isActive: true,
    },
  });
  console.log(`Created client 2: ${client2.email}`);

  // ── Provider Users ──────────────────────────────────────────────────────────
  const provider1 = await prisma.user.upsert({
    where: { email: 'felix.hounsou@construbj.com' },
    update: {},
    create: {
      email: 'felix.hounsou@construbj.com',
      phone: '+22997200001',
      passwordHash: await hashPassword('Provider@1234!'),
      firstName: 'Félix',
      lastName: 'Hounsou',
      role: Role.PROVIDER,
      kycStatus: KycStatus.VERIFIED,
      isActive: true,
    },
  });
  console.log(`Created provider 1: ${provider1.email}`);

  const provider2 = await prisma.user.upsert({
    where: { email: 'akosua.diallo@artisanbj.com' },
    update: {},
    create: {
      email: 'akosua.diallo@artisanbj.com',
      phone: '+22997200002',
      passwordHash: await hashPassword('Provider@1234!'),
      firstName: 'Akosua',
      lastName: 'Diallo',
      role: Role.PROVIDER,
      kycStatus: KycStatus.VERIFIED,
      isActive: true,
    },
  });
  console.log(`Created provider 2: ${provider2.email}`);

  const provider3 = await prisma.user.upsert({
    where: { email: 'kwame.toure@elecbj.com' },
    update: {},
    create: {
      email: 'kwame.toure@elecbj.com',
      phone: '+22997200003',
      passwordHash: await hashPassword('Provider@1234!'),
      firstName: 'Kwame',
      lastName: 'Touré',
      role: Role.PROVIDER,
      kycStatus: KycStatus.VERIFIED,
      isActive: true,
    },
  });
  console.log(`Created provider 3: ${provider3.email}`);

  // ── Provider Profiles ───────────────────────────────────────────────────────
  const profile1 = await prisma.providerProfile.upsert({
    where: { userId: provider1.id },
    update: {},
    create: {
      userId: provider1.id,
      companyName: 'ConstruBJ SARL',
      description:
        'Entreprise générale de construction basée à Cotonou. Spécialisée dans la construction de maisons, villas et immeubles résidentiels avec plus de 10 ans d\'expérience au Bénin et en Afrique de l\'Ouest.',
      skills: ['Maçonnerie', 'Béton armé', 'Carrelage', 'Peinture', 'Étanchéité', 'Fondations'],
      zonesServed: ['Cotonou', 'Porto-Novo', 'Abomey-Calavi', 'Sèmè-Kpodji'],
      isVerified: true,
      ratingAvg: 4.7,
      ratingCount: 23,
      kycDocType: 'RCCM',
      kycDocRef: 'ENCRYPTED:rccm_construbj_2021_abc123',
    },
  });
  console.log(`Created provider profile 1 for: ${provider1.firstName} ${provider1.lastName}`);

  const profile2 = await prisma.providerProfile.upsert({
    where: { userId: provider2.id },
    update: {},
    create: {
      userId: provider2.id,
      companyName: 'Artisan Déco Bénin',
      description:
        'Artisane spécialisée en plomberie, climatisation et travaux de finition intérieure. Certifiée et expérimentée dans les installations sanitaires modernes adaptées au contexte béninois.',
      skills: ['Plomberie', 'Climatisation', 'Carrelage', 'Faïence', 'Pose de parquet'],
      zonesServed: ['Cotonou', 'Fidjrossè', 'Cadjehoun', 'Akpakpa'],
      isVerified: true,
      ratingAvg: 4.5,
      ratingCount: 17,
      kycDocType: 'CIP',
      kycDocRef: 'ENCRYPTED:cip_artisandeco_2022_xyz789',
    },
  });
  console.log(`Created provider profile 2 for: ${provider2.firstName} ${provider2.lastName}`);

  const profile3 = await prisma.providerProfile.upsert({
    where: { userId: provider3.id },
    update: {},
    create: {
      userId: provider3.id,
      companyName: 'Élec Bénin Pro',
      description:
        'Électricien professionnel certifié avec expertise en installations électriques résidentielles et commerciales, panneaux solaires et systèmes de sécurité pour l\'habitat.',
      skills: [
        'Électricité générale',
        'Énergie solaire',
        'Domotique',
        'Groupe électrogène',
        'Câblage réseau',
      ],
      zonesServed: ['Cotonou', 'Abomey-Calavi', 'Porto-Novo', 'Parakou'],
      isVerified: true,
      ratingAvg: 4.9,
      ratingCount: 31,
      kycDocType: 'RCCM',
      kycDocRef: 'ENCRYPTED:rccm_elecbj_2020_def456',
    },
  });
  console.log(`Created provider profile 3 for: ${provider3.firstName} ${provider3.lastName}`);

  // ── Sample Projects ─────────────────────────────────────────────────────────
  // Cotonou coordinates: lat 6.3676, lng 2.4252
  const project1 = await prisma.project.upsert({
    where: { id: 'seed-project-001-0000-0000-000000000001' },
    update: {},
    create: {
      id: 'seed-project-001-0000-0000-000000000001',
      clientId: client1.id,
      title: 'Construction villa R+1 à Fidjrossè',
      description:
        'Recherche entrepreneur qualifié pour la construction d\'une villa de type R+1 (rez-de-chaussée + 1 étage) à Fidjrossè, Cotonou. Surface habitable d\'environ 180m². Plans architecturaux disponibles. Fondations, gros œuvre, second œuvre et finitions inclus. Délai souhaité : 12 mois. Matériaux fournis par le prestataire.',
      category: 'construction',
      budgetMin: 15000000,
      budgetMax: 25000000,
      lat: 6.3580,
      lng: 2.3900,
      address: 'Lot 45, Quartier Fidjrossè, Cotonou, Bénin',
      city: 'Cotonou',
      country: 'Benin',
      status: ProjectStatus.OPEN,
      photos: [],
    },
  });
  console.log(`Created project 1: ${project1.title}`);

  const project2 = await prisma.project.upsert({
    where: { id: 'seed-project-002-0000-0000-000000000002' },
    update: {},
    create: {
      id: 'seed-project-002-0000-0000-000000000002',
      clientId: client2.id,
      title: 'Installation électrique complète appartement Akpakpa',
      description:
        'Installation électrique complète d\'un appartement de 3 chambres à Akpakpa. Travaux comprenant : tableau électrique, câblage de l\'ensemble des pièces, prises et interrupteurs, installation de climatiseurs (3 unités), éclairage LED, et mise aux normes de sécurité. Appartement en cours de rénovation, accès disponible immédiatement.',
      category: 'electricite',
      budgetMin: 800000,
      budgetMax: 1500000,
      lat: 6.3676,
      lng: 2.4252,
      address: 'Immeuble Bello, Rue des Palmiers, Akpakpa, Cotonou, Bénin',
      city: 'Cotonou',
      country: 'Benin',
      status: ProjectStatus.OPEN,
      photos: [],
    },
  });
  console.log(`Created project 2: ${project2.title}`);

  // ── Summary ─────────────────────────────────────────────────────────────────
  console.log('\n✅ Seed completed successfully!');
  console.log('───────────────────────────────');
  console.log(`Admin users    : 1`);
  console.log(`Client users   : 2`);
  console.log(`Provider users : 3  (all verified)`);
  console.log(`Projects       : 2  (OPEN status, Cotonou)`);
  console.log('───────────────────────────────');
  console.log(`Admin login    : admin@mhao.bj / Admin@MHAO2024!`);
  console.log(`Client login   : kofi.mensah@gmail.com / Client@1234!`);
  console.log(`Provider login : felix.hounsou@construbj.com / Provider@1234!`);

  void profile1;
  void profile2;
  void profile3;
  void adminUser;
}

// ─── Execute ──────────────────────────────────────────────────────────────────

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error: unknown) => {
    console.error('Seed failed:', error);
    await prisma.$disconnect();
    process.exit(1);
  });
