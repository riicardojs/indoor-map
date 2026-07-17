import { NextResponse } from "next/server";
import { getMallData } from "@/lib/mall-data";

export const revalidate = 3600;

export async function GET() {
  try {
    const data = await getMallData();
    return NextResponse.json(data);
  } catch (err) {
    console.error("Erro ao carregar dados do shopping:", err);
    return NextResponse.json(
      { error: "Falha ao carregar dados do shopping" },
      { status: 500 }
    );
  }
}
