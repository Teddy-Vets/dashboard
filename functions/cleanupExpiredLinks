import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // בדיקת authentication - רק למשתמשי מערכת או CRON
    const cronSecret = Deno.env.get('CRON_SECRET');
    const providedSecret = req.headers.get('x-cron-secret') || new URL(req.url).searchParams.get('secret');
    
    if (providedSecret !== cronSecret) {
      const user = await base44.auth.me();
      if (!user || user.role !== 'admin') {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), { 
          status: 401, 
          headers: { "Content-Type": "application/json" }
        });
      }
    }

    const now = new Date();
    const cutoffTime = new Date(now.getTime() - (72 * 60 * 60 * 1000)); // 72 שעות
    
    console.log(`[cleanupExpiredLinks] Starting cleanup for links older than: ${cutoffTime.toISOString()}`);

    // מחיקת קישורים שפג תוקפם (יותר מ-72 שעות)
    const expiredLinks = await base44.asServiceRole.entities.FormLinks.filter({
      created_date: { $lt: cutoffTime.toISOString() }
    });

    let deletedCount = 0;
    let errors = 0;

    for (const link of expiredLinks) {
      try {
        await base44.asServiceRole.entities.FormLinks.delete(link.id);
        deletedCount++;
        console.log(`[cleanupExpiredLinks] Deleted expired link: ${link.id} (created: ${link.created_date})`);
      } catch (error) {
        console.error(`[cleanupExpiredLinks] Failed to delete link ${link.id}:`, error);
        errors++;
      }
    }

    // מחיקת קישורים שכבר נוצלו (יותר מ-24 שעות)
    const usedLinks = await base44.asServiceRole.entities.FormLinks.filter({
      used_at: { $exists: true, $ne: null }
    });

    for (const link of usedLinks) {
      try {
        const usedAt = new Date(link.used_at);
        const hoursSinceUsed = (now.getTime() - usedAt.getTime()) / (1000 * 60 * 60);
        
        if (hoursSinceUsed > 24) {
          await base44.asServiceRole.entities.FormLinks.delete(link.id);
          deletedCount++;
          console.log(`[cleanupExpiredLinks] Deleted used link: ${link.id} (used: ${link.used_at})`);
        }
      } catch (error) {
        console.error(`[cleanupExpiredLinks] Failed to delete used link ${link.id}:`, error);
        errors++;
      }
    }

    const summary = {
      success: true,
      deleted_count: deletedCount,
      errors: errors,
      cleanup_time: now.toISOString()
    };

    console.log(`[cleanupExpiredLinks] Cleanup completed:`, summary);

    return new Response(JSON.stringify(summary), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });

  } catch (error) {
    console.error('[cleanupExpiredLinks] Error:', error);
    return new Response(JSON.stringify({ 
      success: false,
      error: 'Cleanup failed', 
      details: error.message 
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
});