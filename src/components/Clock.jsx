import React, { useState, useEffect } from "react";

const Clock = () => {
  const [time, setTime] = useState("00:00");
  const [date, setDate] = useState("");

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();

      // 格式化时间
      const hours = now.getHours().toString().padStart(2, "0");
      const minutes = now.getMinutes().toString().padStart(2, "0");
      setTime(`${hours}:${minutes}`);

      // 格式化日期
      const year = now.getFullYear();
      const month = now.getMonth() + 1;
      const day = now.getDate();
      const weekDays = ["日", "一", "二", "三", "四", "五", "六"];
      const weekDay = weekDays[now.getDay()];
      setDate(`${year}年${month}月${day}日 星期${weekDay}`);
    };

    updateClock();
    const intervalId = setInterval(updateClock, 60000);

    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className="text-center mb-8 text-white">
      <div id="time" className="text-6xl font-bold tracking-wide mb-1">
        {time}
      </div>
      <div id="date" className="text-xl opacity-90">
        {date}
      </div>
    </div>
  );
};

export default Clock;
