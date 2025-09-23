// app/api/hello/route.ts
import db from "@/app/db/drizzle";
import { usersTable } from "@/app/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET() {
  const data = await db.select().from(usersTable);

  return NextResponse.json({
    data: data,
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.text(); // ví dụ: "john|123456|100|500"
    const data = body.split("|");

    if (data.length < 4) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    const user = {
      username: data[0],
      password: data[1],
      coins: Number(data[2]),
      money: Number(data[3]),
    };

    const userExisting = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.username, user.username));

    if (userExisting.length > 0) {
      await db
        .update(usersTable)
        .set({ coins: user.coins, money: user.money })
        .where(eq(usersTable.username, user.username))
        .returning();
    } else {
      await db.insert(usersTable).values(user);
    }

    console.log("Inserted:", user);
    return NextResponse.json({ message: "User created/updated", user });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
