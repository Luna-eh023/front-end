import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";

type Params = {
  params: Promise<{ id: string }>;
};

// UPDATE: Mengubah data mahasiswa
export async function PUT(
  request: Request,
  { params }: Params
) {
  try {
    const { id } = await params;
    const studentId = Number(id);
    const body = await request.json();

    if (
      !Number.isInteger(studentId) ||
      studentId < 1 ||
      !body.name?.trim() ||
      !body.nim?.trim() ||
      !body.major?.trim() ||
      !Number.isInteger(Number(body.semester)) ||
      Number(body.semester) < 1
    ) {
      return NextResponse.json(
        { message: "Invalid student data" },
        { status: 400 }
      );
    }

    const student = await prisma.student.update({
      where: {
        id: studentId,
      },
      data: {
        name: body.name.trim(),
        nim: body.nim.trim(),
        major: body.major.trim(),
        semester: Number(body.semester),
      },
    });

    return NextResponse.json(student);
  } catch (error) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "P2025"
    ) {
      return NextResponse.json(
        { message: "Student not found" },
        { status: 404 }
      );
    }

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
      { message: "Failed to update student" },
      { status: 500 }
    );
  }
}

// DELETE: Menghapus mahasiswa
export async function DELETE(
  request: Request,
  { params }: Params
) {
  try {
    const { id } = await params;
    const studentId = Number(id);

    if (!Number.isInteger(studentId) || studentId < 1) {
      return NextResponse.json(
        { message: "Invalid student ID" },
        { status: 400 }
      );
    }

    await prisma.student.delete({
      where: {
        id: studentId,
      },
    });

    return NextResponse.json({
      message: "Student deleted successfully",
    });
  } catch (error) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "P2025"
    ) {
      return NextResponse.json(
        { message: "Student not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "Failed to delete student" },
      { status: 500 }
    );
  }
}
