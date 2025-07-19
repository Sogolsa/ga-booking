"use client";

import { useState, JSX } from "react";

const startHour = 8;
const endHour = 20;
const interval = 30;

const daysOfWeek = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

function generateTimeSlots(): string[] {
  const slots: string[] = [];
  for (let h = startHour; h <= endHour; h++) {
    slots.push(`${String(h).padStart(2, "0")}:00`);
    if (h !== endHour) {
      slots.push(`${String(h).padStart(2, "0")}:30`);
    }
  }
  return slots;
}

const timeSlots = generateTimeSlots();

export default function WeeklyAvailabilityGrid(): JSX.Element {
  const [selectedSlots, setSelectedSlots] = useState<Record<string, boolean>>(
    {}
  );

  const handleToggle = (day: string, time: string): void => {
    const key = `${day}-${time}`;
    setSelectedSlots((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  return (
    <div className="overflow-auto border rounded-md">
      <table className="min-w-full border-collapse table-fixed text-sm">
        <thead>
          <tr>
            <th className="w-24 p-2 border text-left bg-gray-100">Time</th>
            {daysOfWeek.map((day) => (
              <th key={day} className="p-2 border bg-gray-100 text-center">
                {day}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {timeSlots.map((time) => (
            <tr key={time}>
              <td className="border px-2 py-1 text-right font-mono bg-gray-50">
                {time}
              </td>
              {daysOfWeek.map((day) => {
                const key = `${day}-${time}`;
                const isSelected = selectedSlots[key];
                return (
                  <td
                    key={key}
                    className={`border px-2 py-2 text-center cursor-pointer transition ${
                      isSelected ? "bg-yellow-300" : "hover:bg-gray-200"
                    }`}
                    onClick={() => handleToggle(day, time)}
                  >
                    {isSelected ? "✓" : ""}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
