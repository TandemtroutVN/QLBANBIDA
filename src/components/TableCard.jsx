import { useState, useEffect } from 'react';
import { formatCurrency, calculateHours, formatTime } from '../utils/format';

export default function TableCard({ table, onStart, onManage, onBill }) {
  const [elapsed, setElapsed] = useState('');

  useEffect(() => {
    if (!table.occupied) { setElapsed(''); return; }
    const tick = () => {
      const h = calculateHours(table.startTime);
      const hrs = Math.floor(h);
      const mins = Math.floor((h - hrs) * 60);
      const secs = Math.floor(((h - hrs) * 60 - mins) * 60);
      setElapsed(`${hrs}h${mins.toString().padStart(2, '0')}m${secs.toString().padStart(2, '0')}s`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [table.occupied, table.startTime]);

  return (
    <div className={`table-card ${table.occupied ? 'occupied' : 'free'}`}>
      <div className="table-header">
        <h3>{table.name}</h3>
        <span className="table-type">{table.type}</span>
      </div>
      <div className="table-rate">{formatCurrency(table.hourlyRate)}/giờ</div>
      {table.occupied ? (
        <div className="table-status">
          <div className="elapsed">{elapsed}</div>
          <div className="start-time">Bắt đầu: {formatTime(table.startTime)}</div>
          <div className="table-actions">
            <button className="btn btn-sm btn-primary" onClick={() => onManage(table.id)}>Thêm món</button>
            <button className="btn btn-sm btn-danger" onClick={() => onBill(table.id)}>Tính tiền</button>
          </div>
        </div>
      ) : (
        <button className="btn btn-success" onClick={() => onStart(table.id)}>Bắt đầu</button>
      )}
    </div>
  );
}
