import { NextResponse } from "next/server"
import { getSupabaseAdmin } from '@/lib/supabaseAdmin'

const DEFAULT_SETTINGS: Record<string, string> = {
  schoolName: "Sto Niño de Praga Academy",
  academicYear: "2024-2025",
  automaticBackup: "true",
  rfidIntegration: "true",
  emailNotifications: "true",
  studentPortal: "true",
  teacherPortal: "true",
}

// GET - Fetch settings from system_settings table
export async function GET() {
  try {
    const supabase = getSupabaseAdmin()
    const { data, error } = await supabase
      .from("system_settings")
      .select("setting_key, setting_value")

    if (error) {
      console.error("Error fetching settings:", error)
      return NextResponse.json({
        success: true,
        settings: parseSettings({}),
      })
    }

    const dbSettings: Record<string, string> = {}
    for (const row of data || []) {
      dbSettings[row.setting_key] = row.setting_value || ''
    }

    return NextResponse.json({
      success: true,
      settings: parseSettings(dbSettings),
    })
  } catch (error: any) {
    console.error("Error fetching settings:", error)
    return NextResponse.json({
      success: true,
      settings: parseSettings({}),
    })
  }
}

// POST - Save settings to system_settings table
export async function POST(request: Request) {
  try {
    const supabase = getSupabaseAdmin()
    const body = await request.json()

    const settingsToSave: Record<string, string> = {
      schoolName: body.schoolName || DEFAULT_SETTINGS.schoolName,
      academicYear: body.academicYear || DEFAULT_SETTINGS.academicYear,
      automaticBackup: String(body.automaticBackup ?? true),
      rfidIntegration: String(body.rfidIntegration ?? true),
      emailNotifications: String(body.emailNotifications ?? true),
      studentPortal: String(body.studentPortal ?? true),
      teacherPortal: String(body.teacherPortal ?? true),
    }

    // Save each setting as a key-value row (check exists then update or insert)
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

      if (error) {
        console.error(`Error saving setting ${key}:`, error)
      }
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

function parseSettings(dbSettings: Record<string, string>) {
  return {
    schoolName: dbSettings.schoolName || DEFAULT_SETTINGS.schoolName,
    academicYear: dbSettings.academicYear || DEFAULT_SETTINGS.academicYear,
    automaticBackup: (dbSettings.automaticBackup || DEFAULT_SETTINGS.automaticBackup) === "true",
    rfidIntegration: (dbSettings.rfidIntegration || DEFAULT_SETTINGS.rfidIntegration) === "true",
    emailNotifications: (dbSettings.emailNotifications || DEFAULT_SETTINGS.emailNotifications) === "true",
    studentPortal: (dbSettings.studentPortal || DEFAULT_SETTINGS.studentPortal) === "true",
    teacherPortal: (dbSettings.teacherPortal || DEFAULT_SETTINGS.teacherPortal) === "true",
  }
}
