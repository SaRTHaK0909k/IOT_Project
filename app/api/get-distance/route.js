import { redis } from "@/lib/redis";
import { NextResponse } from "next/server";


export async function GET()
{
    const distance = await redis.get("distance");
    console.log("Distance:", distance);

    return NextResponse.json({ distance });
}