import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";

/**
 * WebSocket handler for real-time agent and sandbox updates
 * Note: Next.js 16 requires upgrading the connection manually
 */
export async function GET(request: NextRequest) {
  // Check for WebSocket upgrade header
  if (request.headers.get("upgrade") !== "websocket" || !request.headers.get("sec-websocket-key")) {
    return NextResponse.json({ error: "WebSocket upgrade required" }, { status: 400 });
  }

  try {
    // For Next.js 16 with Node.js runtime
    // In a real implementation, you would handle WebSocket connections here
    // This is a placeholder that shows the structure

    // Response headers for WebSocket upgrade
    const responseHeaders = {
      Upgrade: "websocket",
      Connection: "Upgrade",
      "Sec-WebSocket-Accept": generateWebSocketAccept(
        request.headers.get("sec-websocket-key") || "",
      ),
      "Sec-WebSocket-Version": "13",
    };

    return new NextResponse(null, {
      status: 101,
      statusText: "Switching Protocols",
      headers: responseHeaders,
    });
  } catch (error) {
    console.error("[v0] WebSocket error:", error);
    return NextResponse.json(
      { error: "Failed to establish WebSocket connection" },
      { status: 500 },
    );
  }
}

/**
 * Generate WebSocket accept header value
 */
function generateWebSocketAccept(key: string): string {
  const guid = "258EAFA5-E914-47DA-95CA-C5AB0DC85B11";
  const sha1 = crypto
    .createHash("sha1")
    .update(key + guid)
    .digest("base64");
  return sha1;
}
