import "dotenv/config";
import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function main() {
  const client = await pool.connect();
  try {
    console.log('Starting raw SQL seed...');

    // Utility to generate CUID-like strings for IDs
    const newId = () => Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

    // 1. Create Admin
    const adminId = newId();
    await client.query(`
      INSERT INTO "User" (id, name, email, role)
      VALUES ($1, 'Admin User', 'admin@example.com', 'ADMIN')
      ON CONFLICT (email) DO NOTHING
    `, [adminId]);

    // 2. Create Teachers
    const t1Id = newId();
    const t2Id = newId();
    
    const t1Res = await client.query(`
      INSERT INTO "User" (id, name, email, role)
      VALUES ($1, 'John Doe', 'john.doe@example.com', 'TEACHER')
      ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name
      RETURNING id
    `, [t1Id]);
    
    const t2Res = await client.query(`
      INSERT INTO "User" (id, name, email, role)
      VALUES ($1, 'Jane Smith', 'jane.smith@example.com', 'TEACHER')
      ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name
      RETURNING id
    `, [t2Id]);

    const actualT1Id = t1Res.rows[0].id;
    const actualT2Id = t2Res.rows[0].id;

    // Create Teacher Profiles
    const tp1Id = newId();
    const tp2Id = newId();
    await client.query(`INSERT INTO "TeacherProfile" (id, "userId") VALUES ($1, $2) ON CONFLICT ("userId") DO NOTHING`, [tp1Id, actualT1Id]);
    await client.query(`INSERT INTO "TeacherProfile" (id, "userId") VALUES ($1, $2) ON CONFLICT ("userId") DO NOTHING`, [tp2Id, actualT2Id]);

    const tProfile1Res = await client.query(`SELECT id FROM "TeacherProfile" WHERE "userId" = $1`, [actualT1Id]);
    const tProfile2Res = await client.query(`SELECT id FROM "TeacherProfile" WHERE "userId" = $1`, [actualT2Id]);
    const tp1 = tProfile1Res.rows[0].id;
    const tp2 = tProfile2Res.rows[0].id;

    // 3. Create Sections
    const s1Id = newId();
    const s2Id = newId();
    await client.query(`INSERT INTO "Section" (id, name) VALUES ($1, 'Grade 10-A') ON CONFLICT (name) DO NOTHING`, [s1Id]);
    await client.query(`INSERT INTO "Section" (id, name) VALUES ($1, 'Grade 10-B') ON CONFLICT (name) DO NOTHING`, [s2Id]);

    const actualS1Id = (await client.query(`SELECT id FROM "Section" WHERE name = 'Grade 10-A'`)).rows[0].id;
    const actualS2Id = (await client.query(`SELECT id FROM "Section" WHERE name = 'Grade 10-B'`)).rows[0].id;

    // 4. Create Topics & Parts
    const mathId = newId();
    const sciId = newId();
    await client.query(`INSERT INTO "Topic" (id, name) VALUES ($1, 'Mathematics') ON CONFLICT DO NOTHING`, [mathId]);
    const actualMathId = (await client.query(`SELECT id FROM "Topic" WHERE name = 'Mathematics' LIMIT 1`)).rows[0].id;

    await client.query(`INSERT INTO "TopicPart" (id, name, "topicId") VALUES ($1, 'Part 1 - Algebra', $2) ON CONFLICT DO NOTHING`, [newId(), actualMathId]);
    await client.query(`INSERT INTO "TopicPart" (id, name, "topicId") VALUES ($1, 'Part 2 - Geometry', $2) ON CONFLICT DO NOTHING`, [newId(), actualMathId]);

    const mathParts = (await client.query(`SELECT id FROM "TopicPart" WHERE "topicId" = $1`, [actualMathId])).rows;

    await client.query(`INSERT INTO "Topic" (id, name) VALUES ($1, 'Science') ON CONFLICT DO NOTHING`, [sciId]);
    const actualSciId = (await client.query(`SELECT id FROM "Topic" WHERE name = 'Science' LIMIT 1`)).rows[0].id;

    // 5. Schedules (Next Week)
    const today = new Date();
    const nextMonday = new Date();
    nextMonday.setDate(today.getDate() + ((1 + 7 - today.getDay()) % 7 || 7));
    const dateStr = nextMonday.toISOString().split('T')[0];
    
    const nextTuesday = new Date(nextMonday);
    nextTuesday.setDate(nextMonday.getDate() + 1);
    const tuesdayStr = nextTuesday.toISOString().split('T')[0];

    console.log('Inserting schedules...');
    
    // Schedule 1: Monday Math
    await client.query(`
      INSERT INTO "Schedule" (id, date, "startTime", "endTime", "roomNumber", "sectionId", "topicId", "topicPartId", "teacherId", "syncStatus", "updatedAt")
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'SYNCED', NOW())
      ON CONFLICT DO NOTHING
    `, [newId(), dateStr, `${dateStr}T08:00:00.000Z`, `${dateStr}T09:30:00.000Z`, 'Rm 101', actualS1Id, actualMathId, mathParts[0]?.id || null, tp1]);

    // Schedule 2: Monday Science
    await client.query(`
      INSERT INTO "Schedule" (id, date, "startTime", "endTime", "roomNumber", "sectionId", "topicId", "topicPartId", "teacherId", "syncStatus", "updatedAt")
      VALUES ($1, $2, $3, $4, $5, $6, $7, null, $8, 'PENDING', NOW())
      ON CONFLICT DO NOTHING
    `, [newId(), dateStr, `${dateStr}T10:00:00.000Z`, `${dateStr}T11:30:00.000Z`, 'Lab 1', actualS2Id, actualSciId, tp1]);

    // Schedule 3: Tuesday Math
    await client.query(`
      INSERT INTO "Schedule" (id, date, "startTime", "endTime", "roomNumber", "sectionId", "topicId", "topicPartId", "teacherId", "syncStatus", "updatedAt")
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'FAILED', NOW())
      ON CONFLICT DO NOTHING
    `, [newId(), tuesdayStr, `${tuesdayStr}T08:00:00.000Z`, `${tuesdayStr}T09:30:00.000Z`, 'Rm 102', actualS2Id, actualMathId, mathParts[1]?.id || null, tp2]);

    console.log('Database seeded successfully!');
    console.log('Test Accounts:');
    console.log(' - admin@example.com (Admin)');
    console.log(' - john.doe@example.com (Teacher 1)');
    console.log(' - jane.smith@example.com (Teacher 2)');

  } catch (e: any) {
    console.error("SEED_ERROR:", e.message);
  } finally {
    client.release();
    pool.end();
  }
}

main();
