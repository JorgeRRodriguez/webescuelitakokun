import { PrismaClient } from "../src/generated/prisma";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// Fecha de referencia del demo: martes 6 de octubre de 2026.
// Todas las fechas se construyen en UTC (ver src/lib/dates.ts) para que el
// demo no se desfase según la zona horaria de la máquina que lo corre.
const TODAY = new Date(Date.UTC(2026, 9, 6));
function at(hm: string, dayOffset = 0) {
  const [h, m] = hm.split(":").map(Number);
  const d = new Date(TODAY);
  d.setUTCDate(d.getUTCDate() + dayOffset);
  d.setUTCHours(h, m, 0, 0);
  return d;
}
function onDay(dayOffset: number) {
  const d = new Date(TODAY);
  d.setUTCDate(d.getUTCDate() + dayOffset);
  return d;
}

const DEMO_PASSWORD = "kokun2026";

async function reset() {
  await prisma.auditLog.deleteMany();
  await prisma.paymentAllocation.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.charge.deleteMany();
  await prisma.concept.deleteMany();
  await prisma.eventGuardian.deleteMany();
  await prisma.event.deleteMany();
  await prisma.noticeRecipient.deleteMany();
  await prisma.notice.deleteMany();
  await prisma.dailySummary.deleteMany();
  await prisma.dailyEntry.deleteMany();
  await prisma.attendance.deleteMany();
  await prisma.childGuardian.deleteMany();
  await prisma.emergencyContact.deleteMany();
  await prisma.child.deleteMany();
  await prisma.staffAssignment.deleteMany();
  await prisma.groupRoutineItem.deleteMany();
  await prisma.group.deleteMany();
  await prisma.level.deleteMany();
  await prisma.school.deleteMany();
  await prisma.guardian.deleteMany();
  await prisma.staff.deleteMany();
}

async function main() {
  await reset();
  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);

  // --- Escuela / niveles / grupos -----------------------------------------
  const school = await prisma.school.create({
    data: { name: "Kokun Daycare & Preschool", cycle: "2026-2027" },
  });

  const daycareLevel = await prisma.level.create({
    data: { schoolId: school.id, name: "Daycare" },
  });
  const kinder = await prisma.level.create({
    data: { schoolId: school.id, name: "Kínder" },
  });

  const daycare = await prisma.group.create({
    data: {
      levelId: daycareLevel.id,
      name: "Daycare",
      room: "Salón 2",
      schedule: "8:00 a 14:00",
      project: "Exploradores de colores",
      routine: {
        create: [
          { time: "8:00", activity: "Llegada y juego libre", order: 1 },
          { time: "9:00", activity: "Desayuno", order: 2 },
          { time: "9:30", activity: "Actividad dirigida", order: 3 },
          { time: "10:30", activity: "Patio", order: 4 },
          { time: "11:00", activity: "Aseo y cambio", order: 5 },
          { time: "11:30", activity: "Comida", order: 6 },
          { time: "12:00", activity: "Siesta", order: 7 },
          { time: "13:30", activity: "Despertar y meriendita", order: 8 },
        ],
      },
    },
  });

  const kinderRoutine = [
    { time: "8:00", activity: "Llegada y círculo de bienvenida", order: 1 },
    { time: "9:00", activity: "Desayuno", order: 2 },
    { time: "9:30", activity: "Proyecto de ciencias", order: 3 },
    { time: "10:30", activity: "Patio", order: 4 },
    { time: "11:30", activity: "Comida", order: 5 },
    { time: "12:15", activity: "Descanso", order: 6 },
    { time: "13:30", activity: "Lectura y cierre", order: 7 },
  ];
  const kinder1 = await prisma.group.create({
    data: {
      levelId: kinder.id,
      name: "Kinder 1",
      room: "Salón 4",
      schedule: "8:00 a 14:30",
      project: "Pequeños científicos",
      routine: { create: kinderRoutine },
    },
  });
  const kinder2 = await prisma.group.create({
    data: {
      levelId: kinder.id,
      name: "Kinder 2",
      room: "Salón 5",
      schedule: "8:00 a 14:30",
      project: "Pequeños científicos",
      routine: { create: kinderRoutine },
    },
  });
  const kinder3 = await prisma.group.create({
    data: {
      levelId: kinder.id,
      name: "Kinder 3",
      room: "Salón 6",
      schedule: "8:00 a 14:30",
      project: "Pequeños científicos",
      routine: { create: kinderRoutine },
    },
  });

  // --- Personal -------------------------------------------------------------
  const anaLucia = await prisma.staff.create({
    data: {
      name: "Ana Lucía Torres",
      email: "ana.torres@kokun.mx",
      passwordHash,
      role: "DOCENTE",
      bio: "Educadora especializada en primera infancia, 8 años con grupos de maternal.",
      attentionHours: "Lun a vie, 14:00–15:00",
      avatarInitials: "AL",
      avatarColor: "#B3166F",
      assignments: { create: [{ groupId: daycare.id, roleLabel: "Titular" }] },
    },
  });
  const karla = await prisma.staff.create({
    data: {
      name: "Karla Méndez",
      email: "karla.mendez@kokun.mx",
      passwordHash,
      role: "DOCENTE",
      bio: "Auxiliar de grupo, apoya en rutinas de cuidado y alimentación.",
      attentionHours: "Lun a vie, 14:00–15:00",
      avatarInitials: "KM",
      avatarColor: "#1E92B5",
      assignments: { create: [{ groupId: daycare.id, roleLabel: "Auxiliar" }] },
    },
  });
  const paola = await prisma.staff.create({
    data: {
      name: "Paola Jiménez",
      email: "paola.jimenez@kokun.mx",
      passwordHash,
      role: "DOCENTE",
      bio: "Titular de Kínder (grupos 1, 2 y 3), enfocada en proyectos de ciencia y autonomía.",
      attentionHours: "Lun a vie, 14:30–15:30",
      avatarInitials: "PJ",
      avatarColor: "#5E9E1F",
      assignments: {
        create: [
          { groupId: kinder1.id, roleLabel: "Titular" },
          { groupId: kinder2.id, roleLabel: "Titular" },
          { groupId: kinder3.id, roleLabel: "Titular" },
        ],
      },
    },
  });
  await prisma.staff.create({
    data: {
      name: "Renata Solís",
      email: "renata.solis@kokun.mx",
      passwordHash,
      role: "DOCENTE",
      bio: "Auxiliar de Kínder (grupos 1, 2 y 3).",
      attentionHours: "Lun a vie, 14:30–15:30",
      avatarInitials: "RS",
      avatarColor: "#F28C28",
      assignments: {
        create: [
          { groupId: kinder1.id, roleLabel: "Auxiliar" },
          { groupId: kinder2.id, roleLabel: "Auxiliar" },
          { groupId: kinder3.id, roleLabel: "Auxiliar" },
        ],
      },
    },
  });
  await prisma.staff.create({
    data: {
      name: "Diego Pérez",
      email: "diego.perez@kokun.mx",
      passwordHash,
      role: "DOCENTE",
      bio: "Profesor de música para daycare y kínder.",
      attentionHours: "Mar y jue, 10:00–12:00",
      avatarInitials: "DP",
      avatarColor: "#7B4BA8",
      assignments: { create: [{ roleLabel: "Música" }] },
    },
  });
  await prisma.staff.create({
    data: {
      name: "Fernanda Ríos",
      email: "fernanda.rios@kokun.mx",
      passwordHash,
      role: "DOCENTE",
      bio: "Profesora de psicomotricidad.",
      attentionHours: "Lun y mié, 10:00–12:00",
      avatarInitials: "FR",
      avatarColor: "#E5332A",
      assignments: { create: [{ roleLabel: "Psicomotricidad" }] },
    },
  });
  const gabriel = await prisma.staff.create({
    data: {
      name: "Gabriel Soto",
      email: "administracion@kokun.mx",
      passwordHash,
      role: "ADMIN",
      bio: "Dirección y administración del plantel.",
      avatarInitials: "GS",
      avatarColor: "#3A2440",
    },
  });

  // --- Familia demo -----------------------------------------------------
  const mariana = await prisma.guardian.create({
    data: {
      name: "Mariana López",
      email: "mariana.lopez@example.com",
      phone: "55 1234 5678",
      passwordHash,
      relationshipLabel: "Mamá",
    },
  });
  const jorge = await prisma.guardian.create({
    data: {
      name: "Jorge Ramírez",
      email: "jorge.ramirez@example.com",
      phone: "55 2345 6789",
      passwordHash,
      relationshipLabel: "Papá",
    },
  });
  const rosa = await prisma.guardian.create({
    data: {
      name: "Rosa López",
      email: "rosa.lopez@example.com",
      phone: "55 3456 7890",
      passwordHash,
      relationshipLabel: "Abuela",
    },
  });
  const luisa = await prisma.guardian.create({
    data: {
      name: "Luisa Fernández",
      email: "luisa.fernandez@example.com",
      phone: "55 4567 8901",
      passwordHash,
      relationshipLabel: "Niñera",
    },
  });

  // --- Alumnos Daycare --------------------------------------------------
  const sofia = await prisma.child.create({
    data: {
      firstName: "Sofía",
      lastName: "Ramírez",
      groupId: daycare.id,
      birthDate: new Date("2023-11-02"),
      allergySevere: true,
      allergyDetail: "Alergia severa al cacahuate. Lleva EpiPen en su mochila.",
      feedingNotes: "Come bien, prefiere fruta a verdura. Sin alergias además del cacahuate.",
      sleepNotes: "Duerme siesta de 45 a 60 min, necesita su manta para dormir.",
      likes: "Pintar, los cuentos de animales, bailar.",
      adaptationNotes: "Adaptación completa desde septiembre 2026.",
      photoVisibility: true,
      avatarColor: "#B3166F",
      emergencyContacts: {
        create: [
          { name: "Jorge Ramírez", relationship: "Papá", phone: "55 2345 6789" },
          { name: "Rosa López", relationship: "Abuela", phone: "55 3456 7890" },
        ],
      },
      guardians: {
        create: [
          { guardianId: mariana.id, receivesComms: true, canPickUp: true, canPay: true, isPrimary: true },
          { guardianId: jorge.id, receivesComms: true, canPickUp: true, canPay: true, isPrimary: false },
          { guardianId: rosa.id, receivesComms: false, canPickUp: true, canPay: false, isPrimary: false },
          { guardianId: luisa.id, receivesComms: false, canPickUp: true, canPay: false, isPrimary: false },
        ],
      },
    },
  });

  const joaquin = await prisma.child.create({
    data: {
      firstName: "Joaquín",
      lastName: "Ramírez",
      groupId: kinder1.id,
      birthDate: new Date("2021-04-18"),
      allergySevere: false,
      feedingNotes: "Sin restricciones alimentarias.",
      sleepNotes: "Ya no duerme siesta en la escuela.",
      likes: "Dinosaurios, armar rompecabezas, el área de ciencias.",
      adaptationNotes: "Segundo ciclo en la escuela, adaptación completa.",
      photoVisibility: true,
      avatarColor: "#5E9E1F",
      emergencyContacts: {
        create: [{ name: "Jorge Ramírez", relationship: "Papá", phone: "55 2345 6789" }],
      },
      guardians: {
        create: [
          { guardianId: mariana.id, receivesComms: true, canPickUp: true, canPay: true, isPrimary: true },
          { guardianId: jorge.id, receivesComms: true, canPickUp: true, canPay: true, isPrimary: false },
          { guardianId: rosa.id, receivesComms: false, canPickUp: true, canPay: false, isPrimary: false },
        ],
      },
    },
  });

  type ChildRow = typeof sofia;
  type ChildSeed = {
    firstName: string;
    lastName: string;
    avatarColor: string;
    allergyDetail?: string;
    parentFirstName: string;
    parentRelationship: "Mamá" | "Papá";
  };
  const otherDaycareKids: ChildSeed[] = [
    { firstName: "Mateo", lastName: "Herrera", avatarColor: "#1E92B5", parentFirstName: "Laura", parentRelationship: "Mamá" },
    { firstName: "Valentina", lastName: "Cruz", avatarColor: "#F28C28", parentFirstName: "Héctor", parentRelationship: "Papá" },
    { firstName: "Emiliano", lastName: "Vega", avatarColor: "#5E9E1F", parentFirstName: "Paulina", parentRelationship: "Mamá" },
    { firstName: "Regina", lastName: "Morales", avatarColor: "#E5332A", allergyDetail: "Intolerancia a la lactosa.", parentFirstName: "Iván", parentRelationship: "Papá" },
    { firstName: "Santiago", lastName: "Ortiz", avatarColor: "#7B4BA8", parentFirstName: "Daniela", parentRelationship: "Mamá" },
    { firstName: "Camila", lastName: "Navarro", avatarColor: "#C99700", parentFirstName: "Ricardo", parentRelationship: "Papá" },
    { firstName: "Leo", lastName: "Castillo", avatarColor: "#14806F", parentFirstName: "Andrea", parentRelationship: "Mamá" },
  ];

  const daycareChildren: ChildRow[] = [sofia];
  for (const c of otherDaycareKids) {
    const child = await prisma.child.create({
      data: {
        firstName: c.firstName,
        lastName: c.lastName,
        groupId: daycare.id,
        birthDate: new Date("2023-06-15"),
        allergySevere: false,
        allergyDetail: c.allergyDetail,
        feedingNotes: "Come bien en general.",
        sleepNotes: "Duerme siesta de 45 min aprox.",
        likes: "Juegos de construcción y canciones.",
        photoVisibility: true,
        avatarColor: c.avatarColor,
      },
    });
    await prisma.guardian.create({
      data: {
        name: `${c.parentFirstName} ${c.lastName}`,
        email: `${c.parentFirstName.toLowerCase()}.${c.lastName.toLowerCase()}@example.com`,
        phone: "55 0000 0000",
        passwordHash,
        relationshipLabel: c.parentRelationship,
        children: {
          create: { childId: child.id, receivesComms: true, canPickUp: true, canPay: true, isPrimary: true },
        },
      },
    });
    daycareChildren.push(child);
  }

  // Resto de Kínder, repartido 2 por grupo: Joaquín y Daniela en Kinder 1,
  // Ximena y Bruno en Kinder 2, Renata y Diego en Kinder 3.
  const otherKinderKids: (ChildSeed & { group: typeof kinder1 })[] = [
    { firstName: "Daniela", lastName: "Flores", avatarColor: "#B3166F", parentFirstName: "Marco", parentRelationship: "Papá", group: kinder1 },
    { firstName: "Ximena", lastName: "Castro", avatarColor: "#F28C28", parentFirstName: "Fernanda", parentRelationship: "Mamá", group: kinder2 },
    { firstName: "Bruno", lastName: "Delgado", avatarColor: "#1E92B5", parentFirstName: "Alejandro", parentRelationship: "Papá", group: kinder2 },
    { firstName: "Renata", lastName: "Paredes", avatarColor: "#7B4BA8", parentFirstName: "Gabriela", parentRelationship: "Mamá", group: kinder3 },
    { firstName: "Diego", lastName: "Luna", avatarColor: "#C99700", parentFirstName: "Sergio", parentRelationship: "Papá", group: kinder3 },
  ];
  const kinder1Children: ChildRow[] = [joaquin];
  const kinder2Children: ChildRow[] = [];
  const kinder3Children: ChildRow[] = [];
  for (const c of otherKinderKids) {
    const child = await prisma.child.create({
      data: {
        firstName: c.firstName,
        lastName: c.lastName,
        groupId: c.group.id,
        birthDate: new Date("2021-08-20"),
        allergySevere: false,
        feedingNotes: "Sin restricciones alimentarias.",
        likes: "Ciencia y rompecabezas.",
        photoVisibility: true,
        avatarColor: c.avatarColor,
      },
    });
    await prisma.guardian.create({
      data: {
        name: `${c.parentFirstName} ${c.lastName}`,
        email: `${c.parentFirstName.toLowerCase()}.${c.lastName.toLowerCase()}@example.com`,
        phone: "55 0000 0000",
        passwordHash,
        relationshipLabel: c.parentRelationship,
        children: {
          create: { childId: child.id, receivesComms: true, canPickUp: true, canPay: true, isPrimary: true },
        },
      },
    });
    if (c.group.id === kinder1.id) kinder1Children.push(child);
    else if (c.group.id === kinder2.id) kinder2Children.push(child);
    else kinder3Children.push(child);
  }

  // --- Asistencia de hoy (Daycare) --------------------------------------
  await prisma.attendance.create({
    data: {
      childId: sofia.id,
      date: onDay(0),
      status: "PRESENTE",
      checkInTime: at("8:05"),
      checkInBy: "Mariana (mamá)",
      registeredById: anaLucia.id,
    },
  });
  const daycarePresenceData = [
    { child: daycareChildren[1], time: "7:55", by: "Papá" },
    { child: daycareChildren[2], time: "8:10", by: "Mamá" },
    { child: daycareChildren[3], time: "8:02", by: "Mamá" },
    { child: daycareChildren[4], time: "8:20", by: "Abuela" },
  ];
  for (const p of daycarePresenceData) {
    await prisma.attendance.create({
      data: {
        childId: p.child.id,
        date: onDay(0),
        status: "PRESENTE",
        checkInTime: at(p.time),
        checkInBy: p.by,
        registeredById: anaLucia.id,
      },
    });
  }
  await prisma.attendance.create({
    data: {
      childId: daycareChildren[5].id, // Santiago ausente
      date: onDay(0),
      status: "AUSENTE",
      registeredById: anaLucia.id,
    },
  });
  // Camila y Leo sin registro aún (no se crea Attendance)

  // --- Captura del día (Daycare) ----------------------------------------
  const batch1 = "batch-desayuno-daycare";
  const presentChildren = [sofia, daycareChildren[1], daycareChildren[2], daycareChildren[3], daycareChildren[4]];
  for (const child of presentChildren) {
    await prisma.dailyEntry.create({
      data: {
        childId: child.id,
        date: onDay(0),
        type: "COMIDA",
        time: at("9:05"),
        title: "Desayuno",
        detail: "Quesadilla con fruta picada",
        exceptionValue: child.id === sofia.id ? "Todo" : "Todo",
        authorId: anaLucia.id,
        batchId: batch1,
      },
    });
  }
  const batch2 = "batch-pañal-daycare";
  for (const child of presentChildren) {
    await prisma.dailyEntry.create({
      data: {
        childId: child.id,
        date: onDay(0),
        type: "PANIAL",
        time: at("10:45"),
        title: "Cambio de pañal",
        exceptionValue: child.id === sofia.id ? "Pipi" : "Popo",
        authorId: anaLucia.id,
        batchId: batch2,
      },
    });
  }
  await prisma.dailyEntry.create({
    data: {
      childId: sofia.id,
      date: onDay(0),
      type: "SIESTA",
      time: at("12:05"),
      title: "Siesta",
      startTime: at("12:05"),
      endTime: at("13:10"),
      authorId: anaLucia.id,
      batchId: "batch-siesta-daycare",
    },
  });
  await prisma.dailyEntry.create({
    data: {
      childId: sofia.id,
      date: onDay(0),
      type: "ACTIVIDAD",
      time: at("9:35"),
      title: "Pintura con los dedos",
      detail: "Exploramos los colores primarios mezclándolos con las manos.",
      authorId: anaLucia.id,
      batchId: "batch-actividad-daycare",
    },
  });
  await prisma.dailyEntry.create({
    data: {
      childId: sofia.id,
      date: onDay(0),
      type: "OBSERVACION",
      time: at("11:00"),
      title: "Jugó en grupo",
      detail: "Compartió los crayones con sus compañeros sin que se le pidiera.",
      authorId: anaLucia.id,
      batchId: "batch-obs-sofia",
    },
  });

  // --- Resumen del día -----------------------------------------------------
  await prisma.dailySummary.create({
    data: {
      childId: sofia.id,
      date: onDay(0),
      mood: "Feliz",
      note: "Sofía tuvo un día muy activo, participó en todas las actividades y comió muy bien.",
      materialsForTomorrow: "Traer una foto familiar para la actividad de mañana.",
      status: "VISTO",
      authorId: anaLucia.id,
      sentAt: at("13:45"),
      readAt: at("14:20"),
    },
  });
  await prisma.dailySummary.create({
    data: {
      childId: daycareChildren[1].id,
      date: onDay(0),
      status: "POR_REVISAR",
    },
  });
  await prisma.dailySummary.create({
    data: {
      childId: daycareChildren[2].id,
      date: onDay(0),
      mood: "Tranquila",
      note: "Día tranquilo, durmió bien su siesta.",
      status: "ENVIADO",
      authorId: anaLucia.id,
      sentAt: at("13:50"),
    },
  });

  // --- Avisos y eventos ------------------------------------------------------
  const noticeAutorizacion = await prisma.notice.create({
    data: {
      title: "Salida al Parque Ecológico",
      body: "El viernes 16 de octubre saldremos con el grupo Daycare al Parque Ecológico de 9:00 a 12:00. Necesitamos tu autorización para que tu hija/o pueda participar.",
      audienceScope: "GRUPO",
      groupId: daycare.id,
      responseType: "AUTORIZACION",
      dueAt: onDay(7),
      createdAt: onDay(-1),
      authorId: gabriel.id,
      addToCalendar: true,
    },
  });
  await prisma.noticeRecipient.create({
    data: {
      noticeId: noticeAutorizacion.id,
      guardianId: mariana.id,
      childId: sofia.id,
      readAt: at("11:58"),
      response: "AUTORIZO",
      respondedAt: at("12:31"),
    },
  });
  for (const child of daycareChildren.slice(1)) {
    const guardianRecord = await prisma.childGuardian.findFirst({ where: { childId: child.id } });
    if (!guardianRecord) continue;
    await prisma.noticeRecipient.create({
      data: { noticeId: noticeAutorizacion.id, guardianId: guardianRecord.guardianId, childId: child.id },
    });
  }

  const noticeEnterado = await prisma.notice.create({
    data: {
      title: "Junta de inicio de ciclo",
      body: "Les compartimos la presentación de la junta de inicio de ciclo 2026-2027. Por favor confirma que la revisaste.",
      audienceScope: "NIVEL",
      responseType: "ENTERADO",
      dueAt: onDay(-2),
      createdAt: onDay(-8),
      authorId: gabriel.id,
    },
  });
  await prisma.noticeRecipient.create({
    data: {
      noticeId: noticeEnterado.id,
      guardianId: mariana.id,
      childId: sofia.id,
      readAt: at("8:15", -3),
      response: "ENTERADO",
      respondedAt: at("8:20", -3),
    },
  });
  await prisma.noticeRecipient.create({
    data: {
      noticeId: noticeEnterado.id,
      guardianId: mariana.id,
      childId: joaquin.id,
      readAt: at("8:15", -3),
      response: "ENTERADO",
      respondedAt: at("8:20", -3),
    },
  });

  const noticeInformativo = await prisma.notice.create({
    data: {
      title: "Recordatorio: no helados caseros",
      body: "Por seguridad alimentaria, favor de no enviar helados o postres preparados en casa para compartir en el salón.",
      audienceScope: "PLANTEL",
      responseType: "LECTURA",
      createdAt: onDay(-15),
      authorId: gabriel.id,
    },
  });
  await prisma.noticeRecipient.create({
    data: {
      noticeId: noticeInformativo.id,
      guardianId: mariana.id,
      childId: sofia.id,
      readAt: at("18:00", -14),
      response: "PENDIENTE",
    },
  });

  // --- Calendario (agenda de octubre 2026) ------------------------------------
  // TODAY = 6 de octubre de 2026, así que los offsets de onDay(...) se calculan
  // como "día del mes - 6" para anclar cada evento a su fecha real en el calendario.
  // Como el modelo Event no soporta un scope "por nivel" (solo PLANTEL o GRUPO),
  // los eventos que aplican a todo Kínder se crean una vez POR CADA uno de los
  // 3 grupos (groupIds con varios ids) para que las 3 familias los vean.
  type EventSeed = {
    title: string;
    description: string;
    type: "ESCUELA" | "GRUPO" | "MATERIAL";
    dayOffset: number;
    scope: "PLANTEL" | "GRUPO";
    groupIds?: string[];
    rsvpRequired?: boolean;
    // a quién de la familia demo (Mariana) le marcamos recordatorio/confirmación
    marianaChild?: "sofia" | "joaquin" | "ambos";
    reminder?: boolean;
    rsvp?: "ASISTIRE" | "NO_PODRE";
  };

  const allKinderGroupIds = [kinder1.id, kinder2.id, kinder3.id];

  const eventSeeds: EventSeed[] = [
    {
      title: "Playground — grupo A",
      description: "Sesión de juego dirigido para familias de Kínder, pensada para quienes están considerando inscribirse el próximo ciclo.",
      type: "GRUPO",
      dayOffset: 1 - 6,
      scope: "GRUPO",
      groupIds: allKinderGroupIds,
      rsvpRequired: true,
    },
    {
      title: "Playground — grupo B",
      description: "Segunda sesión de juego dirigido para familias de Kínder.",
      type: "GRUPO",
      dayOffset: 2 - 6,
      scope: "GRUPO",
      groupIds: allKinderGroupIds,
      rsvpRequired: true,
    },
    {
      title: "🎂 Cumpleaños de Regina Morales",
      description: "¡Festejamos a Regina! Puede traer un snack para compartir con el grupo (sin azúcares añadidos, por favor).",
      type: "GRUPO",
      dayOffset: 3 - 6,
      scope: "GRUPO",
      groupIds: [daycare.id],
    },
    {
      title: "🎂 Cumpleaños de Diego Luna",
      description: "¡Festejamos a Diego! Puede traer un snack para compartir con el grupo (sin azúcares añadidos, por favor).",
      type: "GRUPO",
      dayOffset: 4 - 6,
      scope: "GRUPO",
      groupIds: [kinder3.id],
    },
    {
      title: "Club de lectura LIFE — Capítulo 1",
      description: "Programa de educación socioemocional LIFE. Esta semana leemos el capítulo 1 en el salón; en casa pueden conversar sobre lo aprendido.",
      type: "GRUPO",
      dayOffset: 5 - 6,
      scope: "GRUPO",
      groupIds: allKinderGroupIds,
    },
    {
      title: "Conferencia para padres: Cuidado del cuerpo",
      description: "8:15–9:45 am en el auditorio. Tema dirigido a toda la comunidad escolar, impartido por nuestra psicóloga invitada.",
      type: "ESCUELA",
      dayOffset: 6 - 6,
      scope: "PLANTEL",
      rsvpRequired: true,
      marianaChild: "ambos",
      reminder: true,
      rsvp: "ASISTIRE",
    },
    {
      title: "Club de lectura LIFE — Capítulo 2",
      description: "Continuamos el programa LIFE con el capítulo 2.",
      type: "GRUPO",
      dayOffset: 12 - 6,
      scope: "GRUPO",
      groupIds: allKinderGroupIds,
    },
    {
      title: "Taller para padres: Cuidado del cuerpo",
      description: "9:00–11:30 am en el auditorio. Taller práctico, continuación de la conferencia del 6 de octubre.",
      type: "ESCUELA",
      dayOffset: 17 - 6,
      scope: "PLANTEL",
      rsvpRequired: true,
    },
    {
      title: "🎂 Cumpleaños de Valentina Cruz",
      description: "¡Festejamos a Valentina! Puede traer un snack para compartir con el grupo (sin azúcares añadidos, por favor).",
      type: "GRUPO",
      dayOffset: 19 - 6,
      scope: "GRUPO",
      groupIds: [daycare.id],
    },
    {
      title: "Club de lectura LIFE — Capítulos 3 y 4",
      description: "Cerramos la primera ronda del programa LIFE con los capítulos 3 y 4.",
      type: "GRUPO",
      dayOffset: 20 - 6,
      scope: "GRUPO",
      groupIds: allKinderGroupIds,
    },
    {
      title: "Plática Pre-first Kokun",
      description: "Información sobre el tránsito de Kínder a primaria, dirigida a familias de Kínder.",
      type: "GRUPO",
      dayOffset: 21 - 6,
      scope: "GRUPO",
      groupIds: allKinderGroupIds,
      rsvpRequired: true,
      marianaChild: "joaquin",
    },
    {
      title: "🎂 Cumpleaños de Mateo Herrera",
      description: "¡Festejamos a Mateo! Puede traer un snack para compartir con el grupo (sin azúcares añadidos, por favor).",
      type: "GRUPO",
      dayOffset: 23 - 6,
      scope: "GRUPO",
      groupIds: [daycare.id],
    },
    {
      title: "🎂 Cumpleaños de Ximena Castro",
      description: "¡Festejamos a Ximena! Puede traer un snack para compartir con el grupo (sin azúcares añadidos, por favor).",
      type: "GRUPO",
      dayOffset: 25 - 6,
      scope: "GRUPO",
      groupIds: [kinder2.id],
    },
    {
      title: "Traer objetos para la ofrenda",
      description: "Cada familia puede traer una foto, flor de cempasúchil o un objeto representativo para la ofrenda colectiva del plantel.",
      type: "MATERIAL",
      dayOffset: 28 - 6,
      scope: "PLANTEL",
      marianaChild: "ambos",
    },
    {
      title: "Crazy Friday",
      description: "Día de outfit loco: cada quien viene vestido como quiera (dentro del reglamento). ¡A divertirse!",
      type: "ESCUELA",
      dayOffset: 30 - 6,
      scope: "PLANTEL",
    },
    {
      title: "Celebración de Día de Muertos y Ofrenda",
      description: "Montamos la ofrenda colectiva y cerramos el mes con una celebración para toda la comunidad escolar.",
      type: "ESCUELA",
      dayOffset: 30 - 6,
      scope: "PLANTEL",
      rsvpRequired: true,
      marianaChild: "ambos",
    },
  ];

  for (const seed of eventSeeds) {
    const rowGroupIds: (string | null)[] = seed.scope === "GRUPO" ? seed.groupIds ?? [] : [null];

    for (const groupId of rowGroupIds) {
      const event = await prisma.event.create({
        data: {
          title: seed.title,
          description: seed.description,
          type: seed.type,
          date: onDay(seed.dayOffset),
          audienceScope: seed.scope,
          groupId,
          rsvpRequired: seed.rsvpRequired ?? false,
        },
      });

      // Solo se adjunta el recordatorio/RSVP demo de Mariana a la fila de
      // evento que corresponde al grupo real del hijo (relevante cuando el
      // evento se repitió para varios grupos de Kínder a la vez).
      const marianaChildIds =
        seed.marianaChild === "ambos"
          ? [sofia.id, joaquin.id]
          : seed.marianaChild === "sofia"
            ? groupId === null || groupId === sofia.groupId
              ? [sofia.id]
              : []
            : seed.marianaChild === "joaquin"
              ? groupId === null || groupId === joaquin.groupId
                ? [joaquin.id]
                : []
              : seed.scope === "GRUPO" && groupId === sofia.groupId
                ? [sofia.id]
                : seed.scope === "GRUPO" && groupId === joaquin.groupId
                  ? [joaquin.id]
                  : seed.scope === "PLANTEL"
                    ? [sofia.id, joaquin.id]
                    : [];

      for (const childId of marianaChildIds) {
        await prisma.eventGuardian.create({
          data: {
            eventId: event.id,
            guardianId: mariana.id,
            childId,
            reminder: seed.reminder ?? false,
            rsvp: seed.rsvp ?? null,
          },
        });
      }
    }
  }

  // --- Conceptos de cobro ------------------------------------------------------
  const conceptDefs = [
    { key: "INS", name: "Inscripción / reinscripción", amount: 3500, unit: "por alumno", periodicity: "Una vez por ciclo", dueRule: "Al inscribirse", calculation: "Importe fijo" },
    { key: "COL", name: "Colegiatura", amount: 4850, unit: "mensual", periodicity: "Mensual", dueRule: "Día 10 de cada mes", calculation: "Importe fijo según nivel" },
    { key: "COM", name: "Comedor", amount: 1200, unit: "mensual", periodicity: "Mensual", dueRule: "Día 10 de cada mes", calculation: "Tarifa fija" },
    { key: "HEX", name: "Horario extendido", amount: 1600, unit: "mensual", periodicity: "Mensual", dueRule: "Día 10 de cada mes", calculation: "Paquete contratado" },
    { key: "MAT", name: "Materiales", amount: 2200, unit: "por ciclo", periodicity: "Por ciclo", dueRule: "Al inicio del ciclo", calculation: "Paquete fijo" },
    { key: "EVT", name: "Evento especial", amount: 350, unit: "por evento", periodicity: "Por evento", dueRule: "Antes del evento", calculation: "Cargo a inscritos" },
    { key: "EXC", name: "Excursión", amount: 180, unit: "por excursión", periodicity: "Por evento", dueRule: "Antes de la excursión", calculation: "Cargo a autorizados" },
    { key: "TRA", name: "Transporte", amount: 1900, unit: "mensual", periodicity: "Mensual", dueRule: "Día 10 de cada mes", calculation: "Tarifa según ruta" },
  ];
  const concepts: Record<string, Awaited<ReturnType<typeof prisma.concept.create>>> = {};
  for (const c of conceptDefs) {
    concepts[c.key] = await prisma.concept.create({ data: c });
  }

  // --- Cargos y pagos --------------------------------------------------------
  const allChildren = [...daycareChildren, ...kinder1Children, ...kinder2Children, ...kinder3Children];
  for (const child of allChildren) {
    await prisma.charge.create({
      data: {
        childId: child.id,
        conceptId: concepts.COL.id,
        period: "Octubre 2026",
        generatedAt: onDay(-25),
        dueAt: onDay(4), // 10 oct
        amount: concepts.COL.amount,
        status: child.id === sofia.id ? "PENDIENTE" : Math.random() > 0.5 ? "PAGADO" : "PENDIENTE",
      },
    });
  }

  // Sofía: cargo vencido de septiembre (colegiatura), uno pendiente de octubre (comedor),
  // uno pagado (materiales) y uno en validación (horario extendido vía SPEI).
  const chargeSeptVencido = await prisma.charge.create({
    data: {
      childId: sofia.id,
      conceptId: concepts.COL.id,
      period: "Septiembre 2026",
      generatedAt: onDay(-56),
      dueAt: onDay(-26), // 10 sep, ya vencido
      amount: concepts.COL.amount,
      status: "PENDIENTE",
    },
  });
  await prisma.charge.create({
    data: {
      childId: sofia.id,
      conceptId: concepts.COM.id,
      period: "Octubre 2026",
      generatedAt: onDay(-25),
      dueAt: onDay(4),
      amount: concepts.COM.amount,
      status: "PENDIENTE",
    },
  });
  const chargeMateriales = await prisma.charge.create({
    data: {
      childId: sofia.id,
      conceptId: concepts.MAT.id,
      period: "Ciclo 2026-2027",
      generatedAt: onDay(-60),
      dueAt: onDay(-50),
      amount: concepts.MAT.amount,
      status: "PAGADO",
    },
  });
  const chargeHexValidacion = await prisma.charge.create({
    data: {
      childId: sofia.id,
      conceptId: concepts.HEX.id,
      period: "Octubre 2026",
      generatedAt: onDay(-25),
      dueAt: onDay(4),
      amount: concepts.HEX.amount,
      status: "VALIDACION",
    },
  });

  const paymentMateriales = await prisma.payment.create({
    data: {
      guardianId: mariana.id,
      method: "TARJETA",
      amount: concepts.MAT.amount,
      status: "CONFIRMADO",
      folio: "KK-100231",
      createdAt: onDay(-50),
    },
  });
  await prisma.paymentAllocation.create({
    data: { paymentId: paymentMateriales.id, chargeId: chargeMateriales.id, amount: concepts.MAT.amount },
  });

  await prisma.payment.create({
    data: {
      guardianId: mariana.id,
      method: "SPEI",
      reference: "012180012345678901",
      proofUrl: "/comprobantes/demo-spei-hex.png",
      amount: concepts.HEX.amount,
      status: "VALIDACION",
      createdAt: at("9:40"),
      allocations: { create: [{ chargeId: chargeHexValidacion.id, amount: concepts.HEX.amount }] },
    },
  });

  // otro padre con pago SPEI en validación para poblar Conciliación
  const otherChild = daycareChildren[2];
  const otherGuardianLink = await prisma.childGuardian.findFirst({ where: { childId: otherChild.id } });
  if (otherGuardianLink) {
    const chargeOtherCol = await prisma.charge.findFirst({
      where: { childId: otherChild.id, conceptId: concepts.COL.id },
    });
    if (chargeOtherCol && chargeOtherCol.status !== "PAGADO") {
      await prisma.charge.update({ where: { id: chargeOtherCol.id }, data: { status: "VALIDACION" } });
      const payment = await prisma.payment.create({
        data: {
          guardianId: otherGuardianLink.guardianId,
          method: "SPEI",
          reference: "012180098765432109",
          proofUrl: "/comprobantes/demo-spei-col.png",
          amount: concepts.COL.amount,
          status: "VALIDACION",
          createdAt: at("7:50"),
        },
      });
      await prisma.paymentAllocation.create({
        data: { paymentId: payment.id, chargeId: chargeOtherCol.id, amount: concepts.COL.amount },
      });
    }
  }

  console.log("Seed completado.");
  console.log(`Fecha de referencia del demo: ${onDay(0).toISOString().slice(0, 10)} (UTC)`);
  console.log("Contraseña de demo para todas las cuentas:", DEMO_PASSWORD);
  console.log("Docente: ana.torres@kokun.mx");
  console.log("Administración: administracion@kokun.mx");
  console.log("Tutora (varios hijos): mariana.lopez@example.com");
  void chargeSeptVencido;
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
