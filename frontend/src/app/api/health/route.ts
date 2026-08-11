import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

/**
 * GET /api/health
 *
 * Health check endpoint for monitoring and uptime checks.
 * Tests database connectivity and returns system status.
 *
 * @returns Health status object with timestamp and component status
 */
export async function GET() {
  const startTime = Date.now();

  try {
    const supabase = await createClient();

    // Test database connection
    const { error: dbError, data } = await supabase
      .from("clinics")
      .select("id")
      .limit(1);

    const responseTime = Date.now() - startTime;

    if (dbError) {
      return NextResponse.json(
        {
          status: "unhealthy",
          timestamp: new Date().toISOString(),
          components: {
            database: "disconnected",
            api: "healthy",
          },
          error: dbError.message,
          responseTime: `${responseTime}ms`,
        },
        { status: 503 },
      );
    }

    return NextResponse.json({
      status: "healthy",
      timestamp: new Date().toISOString(),
      components: {
        database: "connected",
        api: "healthy",
      },
      responseTime: `${responseTime}ms`,
      version: "1.0.0",
    });
  } catch (error) {
    const responseTime = Date.now() - startTime;

    return NextResponse.json(
      {
        status: "unhealthy",
        timestamp: new Date().toISOString(),
        components: {
          database: "unknown",
          api: "degraded",
        },
        error: error instanceof Error ? error.message : "Unknown error",
        responseTime: `${responseTime}ms`,
      },
      { status: 503 },
    );
  }
}
