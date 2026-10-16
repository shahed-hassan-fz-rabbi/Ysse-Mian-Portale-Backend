import supabase from "../config/supabase.js"

interface AuditAction {
  adminId: string
  action: string
  entityType: string
  entityId?: string
  details?: Record<string, unknown>
}

/**
 * Records an administrative action in admin_audit_logs.
 * Never pass passwords, access tokens or resume contents here.
 */
export async function logAdminAction(audit: AuditAction, ipAddress?: string | string[]) {
  try {
    const ip = Array.isArray(ipAddress) ? ipAddress[0] : ipAddress
    const { error } = await supabase.from("admin_audit_logs").insert({
      admin_id: audit.adminId,
      action: audit.action,
      entity_type: audit.entityType,
      entity_id: audit.entityId || null,
      details: audit.details || null,
      ip_address: ip || null,
    })
    if (error) {
      console.error("[Audit Log] Failed to record action:", error.message)
    }
  } catch (err) {
    console.error("[Audit Log] Failed to record action:", err)
  }
}
