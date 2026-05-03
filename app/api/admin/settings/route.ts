import { getActiveSchoolYear } from '@/lib/school-year'
import { getSupabaseAdmin } from '@/lib/supabaseAdmin'
import { NextResponse } from "next/server"

const DEFAULT_SETTINGS: Record<string, string> = {
  schoolName: "Sto Niño de Praga Academy",
  automaticBackup: "true",
  rfidIntegration: "true",
  emailNotifications: "true",
  studentPortal: "true",
  teacherPortal: "true",
  phone: "(02) 123-4567",
  contactEmail: "info@stonino-praga.edu.ph",
  address: "123 Education Street, Manila, Philippines",
  officeHours: "Monday – Friday, 7:00 AM – 5:00 PM",
}

export async function GET() {
  try {
    const supabase = getSupabaseAdmin()
    const { data, error } = await supabase
      .from("system_settings")
      .select("setting_key, setting_value")

    if (error) {
      console.error("Error fetching settings:", error)
      return NextResponse.json({ success: true, settings: parseSettings({}) })
    }

    const dbSettings: Record<string, string> = {}
    for (const row of data || []) {
      dbSettings[row.setting_key] = row.setting_value || ''
    }

    return NextResponse.json({ success: true, settings: parseSettings(dbSettings) })
  } catch (error: any) {
    console.error("Error fetching settings:", error)
    return NextResponse.json({ success: true, settings: parseSettings({}) })
  }
}

export async function POST(request: Request) {
  try {
    const supabase = getSupabaseAdmin()
    const body = await request.json()

    const settingsToSave: Record<string, string> = {
      schoolName:         body.schoolName         || DEFAULT_SETTINGS.schoolName,
      automaticBackup:    String(body.automaticBackup    ?? true),
      rfidIntegration:    String(body.rfidIntegration    ?? true),
      emailNotifications: String(body.emailNotifications ?? true),
      studentPortal:      String(body.studentPortal      ?? true),
      teacherPortal:      String(body.teacherPortal      ?? true),
      phone:        body.phone        || DEFAULT_SETTINGS.phone,
      contactEmail: body.contactEmail || DEFAULT_SETTINGS.contactEmail,
      address:      body.address      || DEFAULT_SETTINGS.address,
      officeHours:  body.officeHours  || DEFAULT_SETTINGS.officeHours,
    }

    for (const [key, value] of Object.entries(settingsToSave)) {
      const { data: existing } = await supabase
        .from("system_settings")
        .select("id")
        .eq("setting_key", key)
        .limit(1)

      let error
      if (existing && existing.length > 0) {
        const result = await supabase
          .from("system_settings")
          .update({ setting_value: value, updated_at: new Date().toISOString() })
          .eq("id", existing[0].id)
        error = result.error
      } else {
        const result = await supabase
          .from("system_settings")
          .insert({ setting_key: key, setting_value: value, updated_at: new Date().toISOString() })
        error = result.error
      }

      if (error) console.error(`Error saving setting ${key}:`, error)
    }

    return NextResponse.json({
      success: true,
      settings: parseSettings(settingsToSave),
      message: "Settings saved successfully",
    })
  } catch (error: any) {
    console.error("Error saving settings:", error)
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to save settings" },
      { status: 500 }
    )
  }
}

function parseSettings(db: Record<string, string>) {
  return {
    schoolName:         db.schoolName         || DEFAULT_SETTINGS.schoolName,
    academicYear:       getActiveSchoolYear(),
    automaticBackup:    (db.automaticBackup    || DEFAULT_SETTINGS.automaticBackup)    === "true",
    rfidIntegration:    (db.rfidIntegration    || DEFAULT_SETTINGS.rfidIntegration)    === "true",
    emailNotifications: (db.emailNotifications || DEFAULT_SETTINGS.emailNotifications) === "true",
    studentPortal:      (db.studentPortal      || DEFAULT_SETTINGS.studentPortal)      === "true",
    teacherPortal:      (db.teacherPortal      || DEFAULT_SETTINGS.teacherPortal)      === "true",
    phone:        db.phone        || DEFAULT_SETTINGS.phone,
    contactEmail: db.contactEmail || DEFAULT_SETTINGS.contactEmail,
    address:      db.address      || DEFAULT_SETTINGS.address,
    officeHours:  db.officeHours  || DEFAULT_SETTINGS.officeHours,
  }
}
