// SQLite no soporta enums nativos: estos "enums" se guardan como String
// en la base y se validan/tipan aquí.

export const ROLES = ["TUTOR", "DOCENTE", "ADMIN", "DIRECCION", "RECEPCION"] as const;
export type Role = (typeof ROLES)[number];

export const DAILY_ENTRY_TYPES = ["COMIDA", "SIESTA", "PANIAL", "ACTIVIDAD", "OBSERVACION"] as const;
export type DailyEntryType = (typeof DAILY_ENTRY_TYPES)[number];

export const DAILY_ENTRY_TYPE_LABEL: Record<DailyEntryType, string> = {
  COMIDA: "Comida",
  SIESTA: "Siesta",
  PANIAL: "Pañal y baño",
  ACTIVIDAD: "Actividad",
  OBSERVACION: "Observación",
};

// clases tailwind (bg/texto/borde) por tipo, usando los tokens del tema
export const DAILY_ENTRY_TYPE_COLOR: Record<DailyEntryType, { bg50: string; text: string; solid: string }> = {
  COMIDA: { bg50: "bg-naranja-50", text: "text-naranja-text", solid: "bg-naranja" },
  SIESTA: { bg50: "bg-teal-50", text: "text-teal-text", solid: "bg-teal" },
  PANIAL: { bg50: "bg-morado-50", text: "text-morado-text", solid: "bg-morado" },
  ACTIVIDAD: { bg50: "bg-magenta-50", text: "text-magenta", solid: "bg-magenta" },
  OBSERVACION: { bg50: "bg-track", text: "text-texto-2", solid: "bg-texto-3" },
};

export const MEAL_PORTIONS = ["Todo", "Mitad", "Poco", "Nada"] as const;
export const DIAPER_STATES = ["Pipi", "Popo", "Accidente"] as const;

export const SUMMARY_STATUS = ["SIN_REGISTROS", "POR_REVISAR", "ENVIADO", "VISTO"] as const;
export type SummaryStatus = (typeof SUMMARY_STATUS)[number];

export const MOODS = ["Feliz", "Tranquila", "Inquieta", "Cansada", "Sensible"] as const;

export const NOTICE_RESPONSE_TYPES = ["LECTURA", "ENTERADO", "AUTORIZACION"] as const;
export type NoticeResponseType = (typeof NOTICE_RESPONSE_TYPES)[number];

export const NOTICE_RESPONSE_TYPE_LABEL: Record<NoticeResponseType, string> = {
  LECTURA: "Aviso",
  ENTERADO: "Confirma de enterado",
  AUTORIZACION: "Requiere tu autorización",
};

export const NOTICE_RESPONSES = ["PENDIENTE", "ENTERADO", "AUTORIZO", "NO_AUTORIZO"] as const;
export type NoticeResponse = (typeof NOTICE_RESPONSES)[number];

export const AUDIENCE_SCOPES = ["PLANTEL", "NIVEL", "GRUPO", "ALUMNO"] as const;
export type AudienceScope = (typeof AUDIENCE_SCOPES)[number];

export const EVENT_TYPES = ["ESCUELA", "GRUPO", "MATERIAL"] as const;
export type EventType = (typeof EVENT_TYPES)[number];

export const EVENT_TYPE_COLOR: Record<EventType, { solid: string; bg50: string; text: string }> = {
  ESCUELA: { solid: "bg-teal", bg50: "bg-teal-50", text: "text-teal-text" },
  GRUPO: { solid: "bg-magenta", bg50: "bg-magenta-50", text: "text-magenta" },
  MATERIAL: { solid: "bg-naranja", bg50: "bg-naranja-50", text: "text-naranja-text" },
};

export const ATTENDANCE_STATUS = ["PRESENTE", "AUSENTE"] as const;
export type AttendanceStatus = (typeof ATTENDANCE_STATUS)[number];

export const CHARGE_STATUS = ["PENDIENTE", "VALIDACION", "PAGADO", "CANCELADO"] as const;
export type ChargeStatus = (typeof CHARGE_STATUS)[number];

export const PAYMENT_METHODS = ["TARJETA", "SPEI", "EFECTIVO"] as const;
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

export const PAYMENT_METHOD_LABEL: Record<PaymentMethod, string> = {
  TARJETA: "Tarjeta",
  SPEI: "SPEI",
  EFECTIVO: "Efectivo",
};

export const PAYMENT_STATUS = ["VALIDACION", "CONFIRMADO", "RECHAZADO"] as const;
export type PaymentStatus = (typeof PAYMENT_STATUS)[number];
