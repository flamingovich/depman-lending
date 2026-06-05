import { NextResponse } from "next/server";
import { z } from "zod";

function isPrismaUniqueError(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "P2002"
  );
}

export function partnerApiErrorResponse(error: unknown) {
  if (error instanceof Error && error.message === "UNAUTHORIZED") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (error instanceof z.ZodError) {
    const first = error.issues[0];
    const field = first?.path.join(".") || "данные";
    return NextResponse.json(
      { error: `Некорректное поле: ${field}` },
      { status: 400 },
    );
  }

  if (isPrismaUniqueError(error)) {
    return NextResponse.json(
      { error: "Проект с таким slug уже существует. Выберите другой slug или отредактируйте существующий проект." },
      { status: 409 },
    );
  }

  if (error instanceof Error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ error: "Invalid data" }, { status: 400 });
}
