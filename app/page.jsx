"use client";

import { useEffect, useState } from "react";
import {
  Moon,
  Sun,
  Coins,
  DollarSign,
  Users,
  Filter,
  Eye,
  EyeOff,
  Copy,
} from "lucide-react";

function formatNumber(num) {
  return num.toLocaleString("en-US");
}

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [darkMode, setDarkMode] = useState(false);
  const [showUnder1M, setShowUnder1M] = useState(false);
  const [visiblePasswords, setVisiblePasswords] = useState({});

  useEffect(() => {
    async function fetchUsers() {
      try {
        const res = await fetch("/api/users");
        const data = await res.json();

        // Sắp xếp giảm dần theo coins
        const sorted = (Array.isArray(data.data) ? data.data : []).sort(
          (a, b) => (b.coins || 0) - (a.coins || 0)
        );
        setUsers(sorted);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    }

    fetchUsers();
  }, []);

  // Tính tổng
  const { totalCoins, totalMoney, lowCoinsUsers, under1MUsers } = users.reduce(
    (acc, user) => {
      const coins = user.coins || 0;
      const money = user.money || 0;

      acc.totalCoins += coins;
      acc.totalMoney += money;
      if (coins < 200000) acc.lowCoinsUsers++;
      if (coins < 1000000) acc.under1MUsers++;

      return acc;
    },
    { totalCoins: 0, totalMoney: 0, lowCoinsUsers: 0, under1MUsers: 0 }
  );

  const totalCoinsMinus20 = Math.floor(totalCoins * 0.8);

  const displayedUsers = showUnder1M
    ? users.filter((u) => (u.coins || 0) < 1000000)
    : users;

  const togglePassword = (id) => {
    setVisiblePasswords((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div
      className={`min-h-screen p-8 transition-colors ${
        darkMode ? "dark bg-gray-950 text-gray-100" : "bg-gray-50 text-gray-900"
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight">
          📊 Dashboard Users
        </h1>
        <div className="flex gap-3">
          <button
            onClick={() => setShowUnder1M(!showUnder1M)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl shadow transition ${
              showUnder1M
                ? "bg-indigo-600 text-white hover:bg-indigo-500"
                : "bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-700"
            }`}
          >
            <Filter className="h-4 w-4" />
            {showUnder1M ? "Đang lọc <1M" : "Lọc acc <1M"}
          </button>

          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 rounded-full bg-gray-200 dark:bg-gray-800 hover:scale-110 transition-transform"
          >
            {darkMode ? (
              <Sun className="h-5 w-5 text-yellow-400" />
            ) : (
              <Moon className="h-5 w-5 text-gray-700" />
            )}
          </button>
        </div>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
        <StatCard
          icon={<Coins className="h-10 w-10 opacity-90" />}
          label="Tổng Coins (-20%)"
          value={formatNumber(totalCoinsMinus20)}
          gradient="from-amber-400 to-amber-600"
        />
        <StatCard
          icon={<DollarSign className="h-10 w-10 opacity-90" />}
          label="Tổng Money"
          value={formatNumber(totalMoney)}
          gradient="from-emerald-400 to-emerald-600"
        />
        <StatCard
          icon={<Users className="h-10 w-10 opacity-90" />}
          label="Số TK dưới 200k"
          value={lowCoinsUsers}
          gradient="from-rose-400 to-rose-600"
        />
        <StatCard
          icon={<Users className="h-10 w-10 opacity-90" />}
          label="Số TK dưới 1M"
          value={under1MUsers}
          gradient="from-indigo-400 to-indigo-600"
        />
      </div>

      {/* Table */}
      <div className="mt-10 bg-white dark:bg-gray-900 shadow-2xl rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-base">
            <thead className="sticky top-0 z-10 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 uppercase text-xs tracking-wider">
              <tr>
                {["#", "ID", "Tên", "Password", "Coins", "Money"].map(
                  (h, i) => (
                    <th
                      key={i}
                      className={`px-6 py-4 text-left font-semibold ${
                        h === "Coins" || h === "Money" ? "text-right" : ""
                      }`}
                    >
                      {h}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody>
              {displayedUsers.map((user, i) => (
                <tr
                  key={i}
                  className="group hover:bg-gradient-to-r hover:from-indigo-50 hover:to-indigo-100 dark:hover:from-gray-800 dark:hover:to-gray-700 transition-colors"
                >
                  <td className="px-6 py-4">{i + 1}</td>
                  <td className="px-6 py-4">{user.id}</td>
                  <td className="px-6 py-4 font-medium">{user.username}</td>
                  <td className="px-6 py-4 flex items-center gap-2">
                    <span className="font-mono">
                      {visiblePasswords[user.id]
                        ? user.password
                        : "•".repeat(user.password?.length || 8)}
                    </span>
                    <button
                      onClick={() => togglePassword(user.id)}
                      className="p-1 rounded-lg hover:bg-indigo-100 dark:hover:bg-gray-700 transition"
                    >
                      {visiblePasswords[user.id] ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                    <button
                      onClick={() =>
                        copyToClipboard(`${user.username} | ${user.password}`)
                      }
                      className="p-1 rounded-lg hover:bg-indigo-100 dark:hover:bg-gray-700 transition"
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                  </td>
                  <td className="px-6 py-4 text-right font-semibold text-indigo-600 dark:text-indigo-400">
                    {formatNumber(user.coins || 0)}
                  </td>
                  <td className="px-6 py-4 text-right font-semibold text-emerald-600 dark:text-emerald-400">
                    {formatNumber(user.money || 0)}
                  </td>
                </tr>
              ))}

              {displayedUsers.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="text-center py-12 text-gray-500 dark:text-gray-400"
                  >
                    Không có dữ liệu
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, gradient }) {
  return (
    <div
      className={`flex items-center gap-4 p-6 rounded-2xl shadow-lg bg-gradient-to-br ${gradient} text-white hover:scale-[1.03] transition-transform`}
    >
      {icon}
      <div>
        <p className="text-sm opacity-80">{label}</p>
        <p className="text-3xl font-extrabold">{value}</p>
      </div>
    </div>
  );
}
