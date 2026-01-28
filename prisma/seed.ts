import { PrismaClient } from '../src/generated/prisma/client'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'
import Database from 'better-sqlite3'
import bcrypt from 'bcryptjs'

// Get database path from env or default
const dbUrl = process.env.DATABASE_URL || 'file:./dev.db'
const dbPath = dbUrl.replace(/^file:/, '')
const sqlite = new Database(dbPath)
const adapter = new PrismaBetterSqlite3(sqlite)
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('🌱 Starting database seed...')

  // Clear existing data (in reverse dependency order)
  console.log('🧹 Clearing existing data...')
  await prisma.activity.deleteMany()
  await prisma.comment.deleteMany()
  await prisma.like.deleteMany()
  await prisma.workoutExercise.deleteMany()
  await prisma.workoutLog.deleteMany()
  await prisma.programSession.deleteMany()
  await prisma.program.deleteMany()
  await prisma.sessionExercise.deleteMany()
  await prisma.session.deleteMany()
  await prisma.exercise.deleteMany()
  await prisma.follow.deleteMany()
  await prisma.account.deleteMany()
  await prisma.authSession.deleteMany()
  await prisma.user.deleteMany()

  // Create users
  console.log('👥 Creating users...')
  const passwordHash = await bcrypt.hash('password123', 12)

  const users = await Promise.all([
    prisma.user.create({
      data: {
        email: 'alice@example.com',
        name: 'Alice Martin',
        passwordHash,
        bio: 'Coureuse passionnée, je m\'entraîne pour mon premier marathon.',
        location: 'Paris, France',
        isPublic: true,
      },
    }),
    prisma.user.create({
      data: {
        email: 'bob@example.com',
        name: 'Bob Dupont',
        passwordHash,
        bio: 'Coach de musculation avec 10 ans d\'expérience.',
        location: 'Lyon, France',
        isPublic: true,
      },
    }),
    prisma.user.create({
      data: {
        email: 'charlie@example.com',
        name: 'Charlie Bernard',
        passwordHash,
        bio: 'Nageur amateur, je prépare une compétition de triathlon.',
        location: 'Marseille, France',
        isPublic: true,
      },
    }),
    prisma.user.create({
      data: {
        email: 'diana@example.com',
        name: 'Diana Leroy',
        passwordHash,
        bio: 'Cycliste passionnée, j\'adore les sorties en montagne.',
        location: 'Grenoble, France',
        isPublic: true,
      },
    }),
    prisma.user.create({
      data: {
        email: 'test@example.com',
        name: 'Test User',
        passwordHash,
        bio: 'Compte de test pour explorer SportPlan.',
        isPublic: true,
      },
    }),
  ])

  const [alice, bob, charlie, diana, testUser] = users
  console.log(`✅ Created ${users.length} users`)

  // Create exercises
  console.log('💪 Creating exercises...')
  const exercises = await Promise.all([
    // Running exercises
    prisma.exercise.create({
      data: {
        name: 'Course continue',
        description: 'Course à rythme constant',
        sport: 'running',
      },
    }),
    prisma.exercise.create({
      data: {
        name: 'Fractionné 30/30',
        description: '30 secondes rapide, 30 secondes récupération',
        sport: 'running',
      },
    }),
    prisma.exercise.create({
      data: {
        name: 'Montées',
        description: 'Course en côte pour renforcer les jambes',
        sport: 'running',
      },
    }),
    // Strength exercises
    prisma.exercise.create({
      data: {
        name: 'Squats',
        description: 'Flexion des jambes avec charge',
        sport: 'strength',
      },
    }),
    prisma.exercise.create({
      data: {
        name: 'Développé couché',
        description: 'Développé couché avec barre',
        sport: 'strength',
      },
    }),
    prisma.exercise.create({
      data: {
        name: 'Tractions',
        description: 'Tractions à la barre fixe',
        sport: 'strength',
      },
    }),
    prisma.exercise.create({
      data: {
        name: 'Fentes',
        description: 'Fentes alternées',
        sport: 'strength',
      },
    }),
    // Swimming exercises
    prisma.exercise.create({
      data: {
        name: 'Crawl',
        description: 'Nage crawl',
        sport: 'swimming',
      },
    }),
    prisma.exercise.create({
      data: {
        name: 'Brasse',
        description: 'Nage brasse',
        sport: 'swimming',
      },
    }),
    prisma.exercise.create({
      data: {
        name: 'Papillon',
        description: 'Nage papillon',
        sport: 'swimming',
      },
    }),
    // Cycling exercises
    prisma.exercise.create({
      data: {
        name: 'Sortie route',
        description: 'Sortie vélo de route',
        sport: 'cycling',
      },
    }),
    prisma.exercise.create({
      data: {
        name: 'Montée',
        description: 'Montée en vélo',
        sport: 'cycling',
      },
    }),
  ])

  const [
    courseContinue,
    fractionne,
    montees,
    squats,
    developpe,
    tractions,
    fentes,
    crawl,
    brasse,
    papillon,
    sortieRoute,
    monteeVelo,
  ] = exercises
  console.log(`✅ Created ${exercises.length} exercises`)

  // Create sessions
  console.log('📋 Creating sessions...')
  const sessions = await Promise.all([
    // Alice's running sessions
    prisma.session.create({
      data: {
        name: 'Échauffement course',
        description: 'Échauffement progressif avant une séance',
        sport: 'running',
        estimatedDuration: 15,
        authorId: alice.id,
        exercises: {
          create: [
            {
              exerciseId: courseContinue.id,
              order: 0,
              duration: 600, // 10 min
              intensity: 'easy',
            },
          ],
        },
      },
    }),
    prisma.session.create({
      data: {
        name: 'Séance fractionné',
        description: 'Séance de fractionné pour améliorer la vitesse',
        sport: 'running',
        estimatedDuration: 30,
        authorId: alice.id,
        isPublic: true,
        exercises: {
          create: [
            {
              exerciseId: courseContinue.id,
              order: 0,
              duration: 600,
              intensity: 'easy',
              notes: 'Échauffement',
            },
            {
              exerciseId: fractionne.id,
              order: 1,
              duration: 1200,
              intensity: 'hard',
              notes: '8x30/30',
            },
            {
              exerciseId: courseContinue.id,
              order: 2,
              duration: 300,
              intensity: 'easy',
              notes: 'Retour au calme',
            },
          ],
        },
      },
    }),
    // Bob's strength sessions
    prisma.session.create({
      data: {
        name: 'Full body',
        description: 'Séance complète du corps',
        sport: 'strength',
        estimatedDuration: 60,
        authorId: bob.id,
        isPublic: true,
        exercises: {
          create: [
            {
              exerciseId: squats.id,
              order: 0,
              sets: 4,
              reps: 12,
            },
            {
              exerciseId: developpe.id,
              order: 1,
              sets: 4,
              reps: 10,
            },
            {
              exerciseId: tractions.id,
              order: 2,
              sets: 3,
              reps: 8,
            },
            {
              exerciseId: fentes.id,
              order: 3,
              sets: 3,
              reps: 12,
            },
          ],
        },
      },
    }),
    prisma.session.create({
      data: {
        name: 'Haut du corps',
        description: 'Séance focus haut du corps',
        sport: 'strength',
        estimatedDuration: 45,
        authorId: bob.id,
        isPublic: true,
        exercises: {
          create: [
            {
              exerciseId: developpe.id,
              order: 0,
              sets: 4,
              reps: 10,
            },
            {
              exerciseId: tractions.id,
              order: 1,
              sets: 4,
              reps: 8,
            },
          ],
        },
      },
    }),
    // Charlie's swimming sessions
    prisma.session.create({
      data: {
        name: 'Séance crawl',
        description: 'Séance technique crawl',
        sport: 'swimming',
        estimatedDuration: 45,
        authorId: charlie.id,
        isPublic: true,
        exercises: {
          create: [
            {
              exerciseId: crawl.id,
              order: 0,
              distance: 400,
              intensity: 'easy',
              notes: 'Échauffement',
            },
            {
              exerciseId: crawl.id,
              order: 1,
              distance: 800,
              intensity: 'moderate',
              notes: 'Série principale',
            },
          ],
        },
      },
    }),
    // Diana's cycling sessions
    prisma.session.create({
      data: {
        name: 'Sortie route',
        description: 'Sortie vélo de route longue distance',
        sport: 'cycling',
        estimatedDuration: 120,
        authorId: diana.id,
        isPublic: true,
        exercises: {
          create: [
            {
              exerciseId: sortieRoute.id,
              order: 0,
              distance: 50000, // 50km
              intensity: 'moderate',
            },
          ],
        },
      },
    }),
  ])

  const [
    echauffementCourse,
    fractionneSession,
    fullBody,
    hautCorps,
    seanceCrawl,
    sortieRouteSession,
  ] = sessions
  console.log(`✅ Created ${sessions.length} sessions`)

  // Create programs
  console.log('📅 Creating programs...')
  const programs = await Promise.all([
    prisma.program.create({
      data: {
        name: 'Préparation Marathon 12 semaines',
        description: 'Programme complet de préparation pour un premier marathon',
        sport: 'running',
        durationWeeks: 12,
        difficulty: 'intermediaire',
        isPublic: true,
        authorId: alice.id,
        programSessions: {
          create: [
            {
              sessionId: echauffementCourse.id,
              weekNumber: 1,
              dayOfWeek: 1,
              order: 0,
            },
            {
              sessionId: fractionneSession.id,
              weekNumber: 1,
              dayOfWeek: 3,
              order: 0,
            },
            {
              sessionId: echauffementCourse.id,
              weekNumber: 1,
              dayOfWeek: 5,
              order: 0,
            },
          ],
        },
      },
    }),
    prisma.program.create({
      data: {
        name: 'Musculation Débutant 8 semaines',
        description: 'Programme de musculation pour débutants',
        sport: 'strength',
        durationWeeks: 8,
        difficulty: 'debutant',
        isPublic: true,
        authorId: bob.id,
        programSessions: {
          create: [
            {
              sessionId: fullBody.id,
              weekNumber: 1,
              dayOfWeek: 1,
              order: 0,
            },
            {
              sessionId: fullBody.id,
              weekNumber: 1,
              dayOfWeek: 3,
              order: 0,
            },
            {
              sessionId: fullBody.id,
              weekNumber: 1,
              dayOfWeek: 5,
              order: 0,
            },
          ],
        },
      },
    }),
    prisma.program.create({
      data: {
        name: 'Triathlon Sprint',
        description: 'Programme d\'entraînement pour triathlon sprint',
        sport: 'other',
        durationWeeks: 10,
        difficulty: 'avance',
        isPublic: true,
        authorId: charlie.id,
        programSessions: {
          create: [
            {
              sessionId: seanceCrawl.id,
              weekNumber: 1,
              dayOfWeek: 1,
              order: 0,
            },
            {
              sessionId: sortieRouteSession.id,
              weekNumber: 1,
              dayOfWeek: 3,
              order: 0,
            },
            {
              sessionId: fractionneSession.id,
              weekNumber: 1,
              dayOfWeek: 5,
              order: 0,
            },
          ],
        },
      },
    }),
  ])

  const [marathonProgram, muscuProgram, triathlonProgram] = programs
  console.log(`✅ Created ${programs.length} programs`)

  // Create follows
  console.log('👥 Creating follows...')
  await Promise.all([
    prisma.follow.create({
      data: {
        followerId: testUser.id,
        followingId: alice.id,
      },
    }),
    prisma.follow.create({
      data: {
        followerId: testUser.id,
        followingId: bob.id,
      },
    }),
    prisma.follow.create({
      data: {
        followerId: alice.id,
        followingId: bob.id,
      },
    }),
    prisma.follow.create({
      data: {
        followerId: charlie.id,
        followingId: alice.id,
      },
    }),
  ])
  console.log('✅ Created follows')

  // Create workout logs
  console.log('📊 Creating workout logs...')
  const workoutLogs = await Promise.all([
    prisma.workoutLog.create({
      data: {
        userId: alice.id,
        sessionId: fractionneSession.id,
        name: 'Séance fractionné',
        sport: 'running',
        duration: 32,
        rating: 4,
        notes: 'Bonne séance, j\'ai tenu le rythme',
        completedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        exercises: {
          create: [
            {
              exerciseId: fractionne.id,
              order: 0,
              plannedSets: 8,
              actualSets: 8,
              duration: 1200,
            },
          ],
        },
      },
    }),
    prisma.workoutLog.create({
      data: {
        userId: bob.id,
        sessionId: fullBody.id,
        name: 'Full body',
        sport: 'strength',
        duration: 65,
        rating: 5,
        notes: 'Excellent entraînement',
        completedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
        exercises: {
          create: [
            {
              exerciseId: squats.id,
              order: 0,
              plannedSets: 4,
              plannedReps: 12,
              actualSets: 4,
              actualReps: '[12,12,11,10]',
              weight: 60,
            },
            {
              exerciseId: developpe.id,
              order: 1,
              plannedSets: 4,
              plannedReps: 10,
              actualSets: 4,
              actualReps: '[10,10,9,8]',
              weight: 80,
            },
          ],
        },
      },
    }),
    prisma.workoutLog.create({
      data: {
        userId: alice.id,
        name: 'Course matinale',
        sport: 'running',
        duration: 25,
        rating: 3,
        completedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
        exercises: {
          create: [
            {
              exerciseId: courseContinue.id,
              order: 0,
              duration: 1500,
              distance: 5000,
            },
          ],
        },
      },
    }),
    prisma.workoutLog.create({
      data: {
        userId: alice.id,
        name: 'Course continue',
        sport: 'running',
        duration: 30,
        rating: 4,
        completedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
        exercises: {
          create: [
            {
              exerciseId: courseContinue.id,
              order: 0,
              duration: 1800,
              distance: 6000,
            },
          ],
        },
      },
    }),
    prisma.workoutLog.create({
      data: {
        userId: bob.id,
        name: 'Haut du corps',
        sport: 'strength',
        duration: 50,
        rating: 4,
        completedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
        exercises: {
          create: [
            {
              exerciseId: developpe.id,
              order: 0,
              plannedSets: 4,
              plannedReps: 10,
              actualSets: 4,
              actualReps: '[10,9,8,7]',
              weight: 75,
            },
            {
              exerciseId: tractions.id,
              order: 1,
              plannedSets: 4,
              plannedReps: 8,
              actualSets: 4,
              actualReps: '[8,7,6,5]',
            },
          ],
        },
      },
    }),
  ])
  console.log(`✅ Created ${workoutLogs.length} workout logs`)

  // Create likes
  console.log('❤️ Creating likes...')
  await Promise.all([
    prisma.like.create({
      data: {
        userId: testUser.id,
        programId: marathonProgram.id,
      },
    }),
    prisma.like.create({
      data: {
        userId: testUser.id,
        programId: muscuProgram.id,
      },
    }),
    prisma.like.create({
      data: {
        userId: alice.id,
        sessionId: fullBody.id,
      },
    }),
    prisma.like.create({
      data: {
        userId: charlie.id,
        programId: marathonProgram.id,
      },
    }),
    prisma.like.create({
      data: {
        userId: diana.id,
        programId: muscuProgram.id,
      },
    }),
  ])
  console.log('✅ Created likes')

  // Create comments
  console.log('💬 Creating comments...')
  await Promise.all([
    prisma.comment.create({
      data: {
        userId: testUser.id,
        programId: marathonProgram.id,
        content: 'Super programme ! Je vais l\'essayer.',
      },
    }),
    prisma.comment.create({
      data: {
        userId: charlie.id,
        programId: marathonProgram.id,
        content: 'Merci pour ce programme, très bien structuré.',
      },
    }),
    prisma.comment.create({
      data: {
        userId: alice.id,
        sessionId: fullBody.id,
        content: 'Excellente séance, je l\'ai ajoutée à mon programme !',
      },
    }),
    prisma.comment.create({
      data: {
        userId: bob.id,
        programId: muscuProgram.id,
        content: 'Programme parfait pour débuter en musculation.',
      },
    }),
  ])
  console.log('✅ Created comments')

  // Create activities
  console.log('📱 Creating activities...')
  await Promise.all([
    prisma.activity.create({
      data: {
        type: 'create_program',
        userId: alice.id,
        programId: marathonProgram.id,
      },
    }),
    prisma.activity.create({
      data: {
        type: 'create_program',
        userId: bob.id,
        programId: muscuProgram.id,
      },
    }),
    prisma.activity.create({
      data: {
        type: 'create_program',
        userId: charlie.id,
        programId: triathlonProgram.id,
      },
    }),
    prisma.activity.create({
      data: {
        type: 'like_program',
        userId: testUser.id,
        programId: marathonProgram.id,
      },
    }),
    prisma.activity.create({
      data: {
        type: 'comment_program',
        userId: testUser.id,
        programId: marathonProgram.id,
      },
    }),
    prisma.activity.create({
      data: {
        type: 'follow',
        userId: testUser.id,
        targetUserId: alice.id,
      },
    }),
    prisma.activity.create({
      data: {
        type: 'follow',
        userId: testUser.id,
        targetUserId: bob.id,
      },
    }),
  ])
  console.log('✅ Created activities')

  console.log('\n✨ Seed completed successfully!')
  console.log('\n📝 Test accounts (password: password123):')
  console.log('  - alice@example.com')
  console.log('  - bob@example.com')
  console.log('  - charlie@example.com')
  console.log('  - diana@example.com')
  console.log('  - test@example.com')
  console.log('\n🎯 What was created:')
  console.log(`  - ${users.length} users`)
  console.log(`  - ${exercises.length} exercises`)
  console.log(`  - ${sessions.length} sessions`)
  console.log(`  - ${programs.length} programs`)
  console.log(`  - ${workoutLogs.length} workout logs`)
  console.log('  - Follows, likes, comments, and activities')
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })