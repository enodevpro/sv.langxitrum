// app/api/hello/route.ts
import db from "@/app/db/drizzle";
import { usersTable } from "@/app/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET() {
  const data = await db.select().from(usersTable);

  let coins = 0;
  data.forEach((item) => {
    coins += item.coins;
  });

  const discounted = Math.floor(coins * 0.8); // trừ 20%

  return NextResponse.json({
    total: coins.toLocaleString("en-US"), // có dấu phẩy
    afterDiscount: discounted.toLocaleString("en-US"), // có dấu phẩy
    message: `Total coins after -20%: ${discounted.toLocaleString("en-US")}`,
  });
}
export async function POST(req: Request) {
  try {
    const body = await req.text(); // ví dụ: "john|123456|100"
    const data = body.split("|");

    if (data.length < 3) {
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
        .set({ coins: user.coins })
        .where(eq(usersTable.username, user.username))
        .returning(); // trả về record đã update
    } else {
      await db.insert(usersTable).values(user);
    }

    console.log("Inserted:", user);
    return NextResponse.json({ message: "User created", user });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
