import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState, useMemo } from 'react';
import PropTypes from 'prop-types';

const AcademicHeatmap = ({ heavyDays }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const daysInMonth = (date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = (date) => new Date(date.getFullYear(), date.getMonth(), 1).getDay();

  const currentYear = currentMonth.getFullYear();
  const currentMonthNum = currentMonth.getMonth();
  const monthName = new Date(currentYear, currentMonthNum).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const totalDays = daysInMonth(currentMonth);
  const startingDayOfWeek = firstDayOfMonth(currentMonth);

  const heavyDaysMap = useMemo(() => {
    const map = {};
    if (heavyDays) {
      heavyDays.forEach((day) => {
        map[day.date] = day.hours;
      });
    }
    return map;
  }, [heavyDays]);

  const getHeatColor = (hours) => {
    if (!hours) return 'bg-slate-50 border-slate-200';
    if (hours <= 5) return 'bg-slate-100 border-slate-300';
    if (hours <= 10) return 'bg-slate-200 border-slate-300';
    if (hours <= 15) return 'bg-slate-300 border-slate-400';
    return 'bg-slate-400 border-slate-500 text-white';
  };

  const getHeatLabel = (hours) => {
    if (!hours) return 'No tasks';
    if (hours <= 5) return 'Light';
    if (hours <= 10) return 'Moderate';
    if (hours <= 15) return 'Heavy';
    return 'Very Heavy';
  };

  const calendarDays = [];
  for (let i = 0; i < startingDayOfWeek; i++) {
    calendarDays.push(null);
  }
  for (let i = 1; i <= totalDays; i++) {
    calendarDays.push(i);
  }

  const prevMonth = () => setCurrentMonth(new Date(currentYear, currentMonthNum - 1));
  const nextMonth = () => setCurrentMonth(new Date(currentYear, currentMonthNum + 1));

  return (
    <div className="surface-card p-6">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
          <CalendarIcon className="h-5 w-5" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-slate-900">Academic Workload Calendar</h3>
          <p className="text-sm text-slate-500">Visual representation of your workload</p>
        </div>
      </div>

      <div className="mb-6 flex items-center justify-between px-2">
        <button onClick={prevMonth} className="rounded-lg p-2 transition hover:bg-slate-100">
          <ChevronLeft className="h-5 w-5 text-slate-500" />
        </button>
        <h4 className="text-lg font-semibold text-slate-900">{monthName}</h4>
        <button onClick={nextMonth} className="rounded-lg p-2 transition hover:bg-slate-100">
          <ChevronRight className="h-5 w-5 text-slate-500" />
        </button>
      </div>

      <div className="mb-2 grid grid-cols-7 gap-2">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <div key={day} className="py-2 text-center text-xs font-semibold text-slate-500">
            {day}
          </div>
        ))}
      </div>

      <div className="mb-6 grid grid-cols-7 gap-2">
        {calendarDays.map((day, index) => {
          if (day === null) return <div key={`empty-${index}`} className="aspect-square"></div>;

          const dateStr = `${currentYear}-${String(currentMonthNum + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          const hours = heavyDaysMap[dateStr];
          const heatColor = getHeatColor(hours);
          const heatLabel = getHeatLabel(hours);

          return (
            <div
              key={day}
              className={`group relative aspect-square cursor-pointer rounded-lg border p-1 transition-all ${heatColor} flex flex-col items-center justify-center`}
            >
              <span className="text-sm font-semibold">{day}</span>
              {hours && <span className="text-xs font-medium">{hours}h</span>}

              <div className="absolute bottom-full z-10 mb-2 hidden whitespace-nowrap rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs text-slate-600 shadow-sm group-hover:block">
                {heatLabel}
                {hours && ` - ${hours} hours`}
              </div>
            </div>
          );
        })}
      </div>

      <div className="soft-card p-4">
        <p className="mb-3 text-sm font-semibold text-slate-700">Workload Intensity</p>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {[
            ['Light (1-5h)', 'bg-slate-100'],
            ['Moderate (6-10h)', 'bg-slate-200'],
            ['Heavy (11-15h)', 'bg-slate-300'],
            ['Very Heavy (15h+)', 'bg-slate-400'],
          ].map(([label, color]) => (
            <div key={label} className="flex items-center gap-2">
              <div className={`h-4 w-4 rounded-full ${color}`}></div>
              <span className="text-xs text-slate-500">{label}</span>
            </div>
          ))}
        </div>
      </div>

      <p className="mt-4 text-center text-xs text-slate-500">Darker blocks indicate heavier study load for the day.</p>
    </div>
  );
};

AcademicHeatmap.propTypes = {
  heavyDays: PropTypes.arrayOf(
    PropTypes.shape({
      date: PropTypes.string,
      hours: PropTypes.number,
    })
  ),
};

export default AcademicHeatmap;
