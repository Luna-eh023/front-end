import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";

// READ: Mengambil semua data mahasiswa
export async function GET() {
  try {
    const students = await prisma.student.findMany({
      orderBy: {
        nim: "asc",
      },
    });

    return NextResponse.json(students);
  } catch {
    return NextResponse.json(
      { message: "Failed to fetch students" },
      { status: 500 }
    );
  }
}


// CREATE: Menambahkan mahasiswa baru
export async function POST(request: Request) {
  try {
    const body = await request.json();

    const { name, nim, major, semester } = body;

    if (
      !name?.trim() ||
      !nim?.trim() ||
      !major?.trim() ||
      !Number.isInteger(Number(semester)) ||
      Number(semester) < 1
    ) {
      return NextResponse.json(
        { message: "Invalid student data" },
        { status: 400 }
      );
    }

    const student = await prisma.student.create({
      data: {
        name: name.trim(),
        nim: nim.trim(),
        major: major.trim(),
        semester: Number(semester),
      },
    });

    return NextResponse.json(student, {
      status: 201,
    });
  } catch (error) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "P2002"
    ) {
      return NextResponse.json(
        { message: "NIM already exists" },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { message: "Failed to create student" },
      { status: 500 }
    );
  }
}
